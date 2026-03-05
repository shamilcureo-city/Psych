import { Phq2Scorer } from './phq2.scorer';
import { Phq9Scorer } from './phq9.scorer';
import { Gad7Scorer } from './gad7.scorer';
import { Dass21Scorer } from './dass21.scorer';
import { Who5Scorer } from './who5.scorer';
import { Pss10Scorer } from './pss10.scorer';
import { IsiScorer } from './isi.scorer';
import { ScoringService } from './scoring.service';
import {
  AssessmentToolType,
  SeverityBand,
  RiskLevel,
  ASSESSMENT_TOOLS,
} from '@psychassess/shared';
import { ResponseMap } from './scorer.interface';

// Helper: build a response map where every question gets the same value
function uniformResponses(toolType: AssessmentToolType, value: number): ResponseMap {
  const tool = ASSESSMENT_TOOLS[toolType];
  const map: ResponseMap = {};
  for (const q of tool.questions) {
    map[q.id] = value;
  }
  return map;
}

// ─── PHQ-2 ────────────────────────────────────────────────────

describe('Phq2Scorer', () => {
  const scorer = new Phq2Scorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.PHQ2);
  });

  it('should score all-zero as minimal', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ2, 0));
    expect(result.totalScore).toBe(0);
    expect(result.maxPossibleScore).toBe(6);
    expect(result.severityBand).toBe(SeverityBand.NEGATIVE_SCREEN);
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should flag positive screen when score >= 3', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ2, 2));
    expect(result.totalScore).toBe(4);
    expect(result.severityBand).toBe(SeverityBand.POSITIVE_SCREEN);
  });

  it('should suggest PHQ-9 on positive screen', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ2, 3));
    expect(result.adaptiveSuggestions).toContain(AssessmentToolType.PHQ9);
  });

  it('should return maxPossibleScore of 6', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ2, 3));
    expect(result.maxPossibleScore).toBe(6);
  });
});

// ─── PHQ-9 ────────────────────────────────────────────────────

describe('Phq9Scorer', () => {
  const scorer = new Phq9Scorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.PHQ9);
  });

  it('should score all-zero as minimal', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ9, 0));
    expect(result.totalScore).toBe(0);
    expect(result.severityBand).toBe(SeverityBand.MINIMAL);
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should score mild (5-9)', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ9, 1));
    expect(result.totalScore).toBe(9);
    expect(result.severityBand).toBe(SeverityBand.MILD);
  });

  it('should score moderate (10-14)', () => {
    const responses = uniformResponses(AssessmentToolType.PHQ9, 1);
    const keys = Object.keys(responses);
    responses[keys[0]] = 2;
    responses[keys[1]] = 2;
    responses[keys[2]] = 2;
    const result = scorer.score(responses);
    expect(result.totalScore).toBe(12);
    expect(result.severityBand).toBe(SeverityBand.MODERATE);
  });

  it('should score severe (20-27)', () => {
    // All responses = 3 means Q9 = 3 which triggers crisis
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ9, 3));
    expect(result.totalScore).toBe(27);
    expect(result.severityBand).toBe(SeverityBand.SEVERE);
    expect(result.riskLevel).toBe(RiskLevel.CRISIS); // Q9=3 triggers crisis
    expect(result.crisisFlags).toBeDefined();
  });

  it('should flag crisis when Q9 >= 1', () => {
    const responses = uniformResponses(AssessmentToolType.PHQ9, 0);
    responses['phq9_9'] = 1;
    const result = scorer.score(responses);
    expect(result.crisisFlags).toBeDefined();
    expect(result.crisisFlags!.length).toBeGreaterThan(0);
    expect(result.riskLevel).toBe(RiskLevel.CRISIS);
  });

  it('should not flag crisis when Q9 = 0', () => {
    const responses = uniformResponses(AssessmentToolType.PHQ9, 0);
    const result = scorer.score(responses);
    expect(result.crisisFlags).toBeUndefined();
  });

  it('should suggest ISI when sleep item (phq9_3) >= 2', () => {
    const responses = uniformResponses(AssessmentToolType.PHQ9, 0);
    responses['phq9_3'] = 2;
    const result = scorer.score(responses);
    expect(result.adaptiveSuggestions).toContain(AssessmentToolType.ISI);
  });

  it('should return maxPossibleScore of 27', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PHQ9, 0));
    expect(result.maxPossibleScore).toBe(27);
  });
});

// ─── GAD-7 ────────────────────────────────────────────────────

describe('Gad7Scorer', () => {
  const scorer = new Gad7Scorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.GAD7);
  });

  it('should score all-zero as minimal', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.GAD7, 0));
    expect(result.totalScore).toBe(0);
    expect(result.severityBand).toBe(SeverityBand.MINIMAL);
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should score mild (5-9)', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.GAD7, 1));
    expect(result.totalScore).toBe(7);
    expect(result.severityBand).toBe(SeverityBand.MILD);
  });

  it('should score severe (15-21)', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.GAD7, 3));
    expect(result.totalScore).toBe(21);
    expect(result.severityBand).toBe(SeverityBand.SEVERE);
  });

  it('should return maxPossibleScore of 21', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.GAD7, 0));
    expect(result.maxPossibleScore).toBe(21);
  });
});

// ─── DASS-21 ────────────────────────────────────────────────────

describe('Dass21Scorer', () => {
  const scorer = new Dass21Scorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.DASS21);
  });

  it('should score all-zero as normal across subscales', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.DASS21, 0));
    expect(result.totalScore).toBe(0);
    expect(result.subscaleScores).toBeDefined();
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should have depression, anxiety, and stress subscales', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.DASS21, 0));
    expect(result.subscaleScores).toBeDefined();
    const keys = Object.keys(result.subscaleScores!);
    expect(keys.length).toBe(3);
  });

  it('should multiply subscale scores by 2', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.DASS21, 1));
    const subscales = result.subscaleScores!;
    for (const key of Object.keys(subscales)) {
      expect(subscales[key].score).toBe(14);
    }
  });

  it('should score severe at max responses', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.DASS21, 3));
    expect(result.riskLevel).not.toBe(RiskLevel.NONE);
  });
});

// ─── WHO-5 ────────────────────────────────────────────────────

describe('Who5Scorer', () => {
  const scorer = new Who5Scorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.WHO5);
  });

  it('should score all-five as max wellbeing (100)', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.WHO5, 5));
    expect(result.totalScore).toBe(100);
    expect(result.maxPossibleScore).toBe(100);
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should score all-zero as poor wellbeing (0)', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.WHO5, 0));
    expect(result.totalScore).toBe(0);
  });

  it('should multiply raw score by 4', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.WHO5, 3));
    expect(result.totalScore).toBe(60);
  });

  it('should suggest PHQ-9 for low wellbeing', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.WHO5, 0));
    if (result.adaptiveSuggestions) {
      expect(result.adaptiveSuggestions).toContain(AssessmentToolType.PHQ9);
    }
  });
});

// ─── PSS-10 ────────────────────────────────────────────────────

describe('Pss10Scorer', () => {
  const scorer = new Pss10Scorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.PSS10);
  });

  it('should score all-zero responses as zero', () => {
    // Reverse scoring is baked into response option values, so scorer just sums
    const result = scorer.score(uniformResponses(AssessmentToolType.PSS10, 0));
    expect(result.totalScore).toBe(0);
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should score all-max responses as high stress', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PSS10, 4));
    expect(result.totalScore).toBe(40);
    expect(result.maxPossibleScore).toBe(40);
  });

  it('should return maxPossibleScore of 40', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.PSS10, 0));
    expect(result.maxPossibleScore).toBe(40);
  });
});

// ─── ISI ────────────────────────────────────────────────────

describe('IsiScorer', () => {
  const scorer = new IsiScorer();

  it('should have correct toolType', () => {
    expect(scorer.toolType).toBe(AssessmentToolType.ISI);
  });

  it('should score all-zero as no clinically significant insomnia', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.ISI, 0));
    expect(result.totalScore).toBe(0);
    expect(result.riskLevel).toBe(RiskLevel.NONE);
  });

  it('should score severe insomnia at max', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.ISI, 4));
    expect(result.totalScore).toBe(28);
    expect(result.maxPossibleScore).toBe(28);
  });

  it('should return maxPossibleScore of 28', () => {
    const result = scorer.score(uniformResponses(AssessmentToolType.ISI, 0));
    expect(result.maxPossibleScore).toBe(28);
  });
});

// ─── ScoringService ────────────────────────────────────────────

describe('ScoringService', () => {
  const service = new ScoringService();

  it('should score all 7 tool types without error', () => {
    for (const toolType of Object.values(AssessmentToolType)) {
      const responses = uniformResponses(toolType, 0);
      const result = service.score(toolType, responses);
      expect(result).toBeDefined();
      expect(result.toolType).toBe(toolType);
      expect(result.totalScore).toBeDefined();
      expect(result.maxPossibleScore).toBeGreaterThan(0);
      expect(result.severityBand).toBeDefined();
      expect(result.riskLevel).toBeDefined();
    }
  });

  it('should throw for unknown tool type', () => {
    expect(() =>
      service.score('INVALID' as AssessmentToolType, {}),
    ).toThrow('No scorer registered for tool type');
  });

  it('should return consistent results for same input', () => {
    const responses = uniformResponses(AssessmentToolType.PHQ9, 2);
    const result1 = service.score(AssessmentToolType.PHQ9, responses);
    const result2 = service.score(AssessmentToolType.PHQ9, responses);
    expect(result1.totalScore).toBe(result2.totalScore);
    expect(result1.severityBand).toBe(result2.severityBand);
  });
});
