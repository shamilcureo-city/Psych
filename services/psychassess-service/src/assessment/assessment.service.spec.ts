import { Test, TestingModule } from '@nestjs/testing';
import { AssessmentService } from './assessment.service';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './scoring/scoring.service';
import { CrisisService } from '../crisis/crisis.service';
import { AssessmentToolType, AssessmentStatus, ASSESSMENT_TOOLS } from '@psychassess/shared';

// Mock PrismaService
const mockPrisma = {
  assessmentSession: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
  },
  assessmentResponse: {
    upsert: jest.fn(),
    count: jest.fn(),
  },
  assessmentResult: {
    create: jest.fn(),
    findUnique: jest.fn(),
  },
  clientScoreHistory: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

// Mock CrisisService
const mockCrisisService = {
  flagCrisis: jest.fn(),
};

describe('AssessmentService', () => {
  let service: AssessmentService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssessmentService,
        ScoringService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: CrisisService, useValue: mockCrisisService },
      ],
    }).compile();

    service = module.get<AssessmentService>(AssessmentService);
  });

  describe('getAvailableTools', () => {
    it('should return all 7 assessment tools', async () => {
      const tools = await service.getAvailableTools();
      expect(tools).toHaveLength(7);
      expect(tools.map((t) => t.type)).toEqual(
        expect.arrayContaining(Object.values(AssessmentToolType)),
      );
    });

    it('should include required fields for each tool', async () => {
      const tools = await service.getAvailableTools();
      for (const tool of tools) {
        expect(tool).toHaveProperty('type');
        expect(tool).toHaveProperty('name');
        expect(tool).toHaveProperty('fullName');
        expect(tool).toHaveProperty('domain');
        expect(tool).toHaveProperty('description');
        expect(tool).toHaveProperty('itemCount');
      }
    });
  });

  describe('startAssessment', () => {
    it('should create a session for a valid tool', async () => {
      const sessionId = 'test-session-id';
      mockPrisma.assessmentSession.create.mockResolvedValue({
        id: sessionId,
        clientId: 'client-1',
        toolType: AssessmentToolType.PHQ9,
        status: AssessmentStatus.IN_PROGRESS,
      });

      const result = await service.startAssessment({
        clientId: 'client-1',
        toolType: AssessmentToolType.PHQ9,
      });

      expect(result.sessionId).toBe(sessionId);
      expect(result.toolType).toBe(AssessmentToolType.PHQ9);
      expect(result.totalQuestions).toBe(ASSESSMENT_TOOLS[AssessmentToolType.PHQ9].itemCount);
      expect(mockPrisma.assessmentSession.create).toHaveBeenCalledWith({
        data: {
          clientId: 'client-1',
          toolType: AssessmentToolType.PHQ9,
          status: AssessmentStatus.IN_PROGRESS,
        },
      });
    });

    it('should throw for invalid tool type', async () => {
      await expect(
        service.startAssessment({ clientId: 'client-1', toolType: 'INVALID' as AssessmentToolType }),
      ).rejects.toThrow('Unknown assessment tool');
    });
  });

  describe('submitResponse', () => {
    const sessionId = 'session-1';
    // Use actual question ID from PHQ-9 definition
    const firstQuestionId = ASSESSMENT_TOOLS[AssessmentToolType.PHQ9].questions[0].id;
    const crisisQuestionId = 'phq9_9';

    it('should upsert a response for a valid question', async () => {
      mockPrisma.assessmentSession.findUnique.mockResolvedValue({
        id: sessionId,
        clientId: 'client-1',
        toolType: AssessmentToolType.PHQ9,
        status: AssessmentStatus.IN_PROGRESS,
      });
      mockPrisma.assessmentResponse.upsert.mockResolvedValue({ id: 'resp-1' });
      mockPrisma.assessmentResponse.count.mockResolvedValue(1);

      const result = await service.submitResponse(sessionId, {
        questionId: firstQuestionId,
        responseValue: 2,
        responseText: 'More than half the days',
      });

      expect(result.responseId).toBe('resp-1');
      expect(result.answeredCount).toBe(1);
      expect(result.totalQuestions).toBe(9);
    });

    it('should throw if session not found', async () => {
      mockPrisma.assessmentSession.findUnique.mockResolvedValue(null);

      await expect(
        service.submitResponse('bad-session', {
          questionId: firstQuestionId,
          responseValue: 0,
          responseText: 'Not at all',
        }),
      ).rejects.toThrow('Session not found');
    });

    it('should throw if session already completed', async () => {
      mockPrisma.assessmentSession.findUnique.mockResolvedValue({
        id: sessionId,
        status: AssessmentStatus.COMPLETED,
      });

      await expect(
        service.submitResponse(sessionId, {
          questionId: firstQuestionId,
          responseValue: 0,
          responseText: 'Not at all',
        }),
      ).rejects.toThrow('already completed');
    });

    it('should flag crisis for PHQ-9 Q9 >= 1', async () => {
      mockPrisma.assessmentSession.findUnique.mockResolvedValue({
        id: sessionId,
        clientId: 'client-1',
        toolType: AssessmentToolType.PHQ9,
        status: AssessmentStatus.IN_PROGRESS,
      });
      mockPrisma.assessmentResponse.upsert.mockResolvedValue({ id: 'resp-1' });
      mockPrisma.assessmentResponse.count.mockResolvedValue(9);
      mockCrisisService.flagCrisis.mockResolvedValue({ crisisEventId: 'crisis-1' });

      await service.submitResponse(sessionId, {
        questionId: crisisQuestionId,
        responseValue: 1,
        responseText: 'Several days',
      });

      expect(mockCrisisService.flagCrisis).toHaveBeenCalledWith(
        expect.objectContaining({
          clientId: 'client-1',
          sessionId,
          severity: 'CRISIS',
        }),
      );
    });
  });

  describe('completeAssessment', () => {
    const sessionId = 'session-1';

    it('should score and store result for complete assessment', async () => {
      const tool = ASSESSMENT_TOOLS[AssessmentToolType.PHQ9];
      const responses = tool.questions.map((q) => ({
        id: `resp-${q.id}`,
        questionId: q.id,
        scoredValue: 0,
      }));

      mockPrisma.assessmentSession.findUnique.mockResolvedValue({
        id: sessionId,
        clientId: 'client-1',
        toolType: AssessmentToolType.PHQ9,
        status: AssessmentStatus.IN_PROGRESS,
        responses,
      });
      mockPrisma.assessmentResult.create.mockResolvedValue({ id: 'result-1' });
      mockPrisma.assessmentSession.update.mockResolvedValue({});
      mockPrisma.clientScoreHistory.create.mockResolvedValue({});

      const result = await service.completeAssessment(sessionId);

      expect(result.resultId).toBe('result-1');
      expect(result.totalScore).toBe(0);
      expect(result.toolType).toBe(AssessmentToolType.PHQ9);
      expect(mockPrisma.assessmentSession.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: AssessmentStatus.COMPLETED }),
        }),
      );
      expect(mockPrisma.clientScoreHistory.create).toHaveBeenCalled();
    });

    it('should throw if assessment is incomplete', async () => {
      const tool = ASSESSMENT_TOOLS[AssessmentToolType.PHQ9];
      mockPrisma.assessmentSession.findUnique.mockResolvedValue({
        id: sessionId,
        clientId: 'client-1',
        toolType: AssessmentToolType.PHQ9,
        status: AssessmentStatus.IN_PROGRESS,
        responses: [{ id: 'resp-1', questionId: tool.questions[0].id, scoredValue: 0 }],
      });

      await expect(service.completeAssessment(sessionId)).rejects.toThrow('Incomplete assessment');
    });
  });
});
