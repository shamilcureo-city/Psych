import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ScoringService } from './scoring/scoring.service';
import { CrisisService } from '../crisis/crisis.service';
import {
  AssessmentToolType,
  AssessmentStatus,
  ASSESSMENT_TOOLS,
  ScoredResult,
} from '@psychassess/shared';
import { StartAssessmentDto } from './dto/start-assessment.dto';
import { SubmitResponseDto } from './dto/submit-response.dto';
import { ResponseMap } from './scoring/scorer.interface';

@Injectable()
export class AssessmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly scoringService: ScoringService,
    private readonly crisisService: CrisisService,
  ) {}

  async startAssessment(dto: StartAssessmentDto) {
    const toolDef = ASSESSMENT_TOOLS[dto.toolType];
    if (!toolDef) {
      throw new BadRequestException(`Unknown assessment tool: ${dto.toolType}`);
    }

    const session = await this.prisma.assessmentSession.create({
      data: {
        clientId: dto.clientId,
        toolType: dto.toolType,
        status: AssessmentStatus.IN_PROGRESS,
      },
    });

    return {
      sessionId: session.id,
      toolType: dto.toolType,
      toolName: toolDef.name,
      fullName: toolDef.fullName,
      domain: toolDef.domain,
      description: toolDef.description,
      totalQuestions: toolDef.itemCount,
      questions: toolDef.questions,
    };
  }

  async submitResponse(sessionId: string, dto: SubmitResponseDto) {
    const session = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    if (session.status === AssessmentStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed');
    }

    const toolDef = ASSESSMENT_TOOLS[session.toolType as AssessmentToolType];
    if (!toolDef) {
      throw new BadRequestException(`Unknown assessment tool: ${session.toolType}`);
    }

    const question = toolDef.questions.find((q: { id: string }) => q.id === dto.questionId);

    if (!question) {
      throw new BadRequestException(`Unknown question: ${dto.questionId}`);
    }

    const response = await this.prisma.assessmentResponse.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId: dto.questionId,
        },
      },
      update: {
        responseValue: dto.responseValue,
        responseText: dto.responseText,
        scoredValue: dto.responseValue,
      },
      create: {
        sessionId,
        questionId: dto.questionId,
        questionText: question.text,
        responseValue: dto.responseValue,
        responseText: dto.responseText,
        scoredValue: dto.responseValue,
      },
    });

    // Check for crisis items in real-time
    if (toolDef.crisisItems) {
      for (const crisisItem of toolDef.crisisItems) {
        if (
          dto.questionId === crisisItem.questionId &&
          dto.responseValue >= crisisItem.threshold
        ) {
          await this.crisisService.flagCrisis({
            clientId: session.clientId,
            sessionId,
            flagType: `${session.toolType}_${crisisItem.questionId}`,
            severity: 'CRISIS',
            description: `${crisisItem.questionId} scored ${dto.responseValue} (threshold: ${crisisItem.threshold})`,
          });
        }
      }
    }

    // Get count of answered questions
    const answeredCount = await this.prisma.assessmentResponse.count({
      where: { sessionId },
    });

    return {
      responseId: response.id,
      questionId: dto.questionId,
      answeredCount,
      totalQuestions: toolDef.itemCount,
      isComplete: answeredCount >= toolDef.itemCount,
    };
  }

  async completeAssessment(sessionId: string) {
    const session = await this.prisma.assessmentSession.findUnique({
      where: { id: sessionId },
      include: { responses: true },
    });

    if (!session) {
      throw new NotFoundException(`Session not found: ${sessionId}`);
    }

    if (session.status === AssessmentStatus.COMPLETED) {
      throw new BadRequestException('Session is already completed');
    }

    const toolType = session.toolType as AssessmentToolType;
    const toolDef = ASSESSMENT_TOOLS[toolType];

    if (session.responses.length < toolDef.itemCount) {
      throw new BadRequestException(
        `Incomplete assessment: ${session.responses.length}/${toolDef.itemCount} questions answered`,
      );
    }

    // Build response map for scoring
    const responseMap: ResponseMap = {};
    for (const resp of session.responses) {
      responseMap[resp.questionId] = resp.scoredValue;
    }

    // Score the assessment
    const result: ScoredResult = this.scoringService.score(toolType, responseMap);

    // Store result
    const savedResult = await this.prisma.assessmentResult.create({
      data: {
        sessionId,
        clientId: session.clientId,
        toolType: session.toolType,
        totalScore: result.totalScore,
        maxPossibleScore: result.maxPossibleScore,
        subscaleScores: result.subscaleScores ?? undefined,
        severityBand: result.severityBand,
        severityLabel: result.severityLabel,
        clinicalInterpretation: result.clinicalInterpretation,
        plainLanguageInterpretation: result.plainLanguageInterpretation,
        recommendation: result.recommendation,
        riskLevel: result.riskLevel,
        crisisFlags: result.crisisFlags ?? undefined,
        adaptiveSuggestions: result.adaptiveSuggestions ?? [],
      },
    });

    // Update session status
    await this.prisma.assessmentSession.update({
      where: { id: sessionId },
      data: {
        status: AssessmentStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Store in longitudinal history
    await this.prisma.clientScoreHistory.create({
      data: {
        clientId: session.clientId,
        toolType: session.toolType,
        score: result.totalScore,
        severityBand: result.severityBand,
        sessionId,
      },
    });

    return {
      resultId: savedResult.id,
      ...result,
    };
  }

  async getResult(sessionId: string) {
    const result = await this.prisma.assessmentResult.findUnique({
      where: { sessionId },
    });

    if (!result) {
      throw new NotFoundException(`Result not found for session: ${sessionId}`);
    }

    return result;
  }

  async getClientHistory(clientId: string, toolType?: AssessmentToolType) {
    const where: { clientId: string; toolType?: string } = { clientId };
    if (toolType) where.toolType = toolType;

    const history = await this.prisma.clientScoreHistory.findMany({
      where,
      orderBy: { assessedAt: 'asc' },
    });

    return history;
  }

  async getClientSessions(clientId: string) {
    return this.prisma.assessmentSession.findMany({
      where: { clientId },
      include: { result: true },
      orderBy: { startedAt: 'desc' },
    });
  }

  async getAvailableTools() {
    return Object.values(ASSESSMENT_TOOLS).map((tool) => ({
      type: tool.type,
      name: tool.name,
      fullName: tool.fullName,
      domain: tool.domain,
      description: tool.description,
      itemCount: tool.itemCount,
      guideline: tool.guideline,
    }));
  }
}
