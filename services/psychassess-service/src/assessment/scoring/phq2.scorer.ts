import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  PHQ2_DEFINITION,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class Phq2Scorer implements AssessmentScorer {
  toolType = AssessmentToolType.PHQ2;

  score(responses: ResponseMap): ScoredResult {
    const def = PHQ2_DEFINITION;
    const totalScore = def.questions.reduce(
      (sum, q) => sum + (responses[q.id] ?? 0),
      0,
    );

    const threshold = def.severityThresholds.find(
      (t) => totalScore >= t.min && totalScore <= t.max,
    )!;

    const isPositiveScreen = totalScore >= 3;

    return {
      toolType: this.toolType,
      totalScore,
      maxPossibleScore: def.scoreRange.max,
      severityBand: threshold.band,
      severityLabel: threshold.label,
      clinicalInterpretation: threshold.clinicalInterpretation,
      plainLanguageInterpretation: isPositiveScreen
        ? 'Your responses suggest you may be experiencing symptoms of depression. A more detailed assessment (PHQ-9) is recommended to better understand your experience.'
        : 'Your responses do not indicate significant symptoms of depression at this time.',
      recommendation: threshold.recommendation,
      riskLevel: RiskLevel.NONE,
      adaptiveSuggestions: isPositiveScreen ? [AssessmentToolType.PHQ9] : [],
    };
  }
}
