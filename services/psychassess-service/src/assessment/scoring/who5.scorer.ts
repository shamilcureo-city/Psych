import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  WHO5_DEFINITION,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class Who5Scorer implements AssessmentScorer {
  toolType = AssessmentToolType.WHO5;

  score(responses: ResponseMap): ScoredResult {
    const def = WHO5_DEFINITION;

    // Raw score 0-25, multiply by 4 for percentage scale 0-100
    const rawScore = def.questions.reduce(
      (sum, q) => sum + (responses[q.id] ?? 0),
      0,
    );
    const totalScore = rawScore * 4;

    const threshold = def.severityThresholds.find(
      (t) => totalScore >= t.min && totalScore <= t.max,
    )!;

    let riskLevel = RiskLevel.NONE;
    if (totalScore <= 28) riskLevel = RiskLevel.MODERATE;
    else if (totalScore < 52) riskLevel = RiskLevel.LOW;

    const plainLanguageMap: Record<string, string> = {
      'Poor Wellbeing — Possible Depression':
        'Your wellbeing score suggests you may be going through a difficult time. Your emotional health may benefit from further assessment and support. Consider completing a depression screening (PHQ-9).',
      'Low Wellbeing':
        'Your wellbeing score is below optimal. While not critically low, you may benefit from paying more attention to self-care, rest, and activities you enjoy.',
      'Adequate Wellbeing':
        'Your wellbeing score indicates you are doing well overall. Continue with the activities and habits that support your mental health.',
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
      adaptiveSuggestions:
        totalScore <= 28 ? [AssessmentToolType.PHQ9] : undefined,
    };
  }
}
