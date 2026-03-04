import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  PSS10_DEFINITION,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class Pss10Scorer implements AssessmentScorer {
  toolType = AssessmentToolType.PSS10;

  score(responses: ResponseMap): ScoredResult {
    const def = PSS10_DEFINITION;

    // PSS-10: Items 4, 5, 7, 8 are reverse-scored
    // The reverse scoring is already baked into the response options
    // (PSS_REVERSE_OPTIONS has reversed values), so we just sum directly
    const totalScore = def.questions.reduce(
      (sum, q) => sum + (responses[q.id] ?? 0),
      0,
    );

    const threshold = def.severityThresholds.find(
      (t) => totalScore >= t.min && totalScore <= t.max,
    )!;

    let riskLevel = RiskLevel.NONE;
    if (totalScore >= 27) riskLevel = RiskLevel.MODERATE;
    else if (totalScore >= 14) riskLevel = RiskLevel.LOW;

    const plainLanguageMap: Record<string, string> = {
      'Low Perceived Stress':
        'Your responses suggest low levels of perceived stress. You appear to be managing life demands well with effective coping strategies.',
      'Moderate Perceived Stress':
        'Your responses suggest moderate levels of stress. While some stress is normal, you may benefit from stress management techniques like mindfulness, exercise, or talking to someone you trust.',
      'High Perceived Stress':
        'Your responses suggest high levels of perceived stress. This level of stress can affect your physical and mental health. We recommend exploring professional support and stress reduction strategies.',
    };

    return {
      toolType: this.toolType,
      totalScore,
      maxPossibleScore: def.scoreRange.max,
      severityBand: threshold.band,
      severityLabel: threshold.label,
      clinicalInterpretation: threshold.clinicalInterpretation,
      plainLanguageInterpretation:
        plainLanguageMap[threshold.label] || threshold.clinicalInterpretation,
      recommendation: threshold.recommendation,
      riskLevel,
    };
  }
}
