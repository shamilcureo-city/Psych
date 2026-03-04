import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  ISI_DEFINITION,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class IsiScorer implements AssessmentScorer {
  toolType = AssessmentToolType.ISI;

  score(responses: ResponseMap): ScoredResult {
    const def = ISI_DEFINITION;
    const totalScore = def.questions.reduce(
      (sum, q) => sum + (responses[q.id] ?? 0),
      0,
    );

    const threshold = def.severityThresholds.find(
      (t) => totalScore >= t.min && totalScore <= t.max,
    )!;

    let riskLevel = RiskLevel.NONE;
    if (totalScore >= 22) riskLevel = RiskLevel.HIGH;
    else if (totalScore >= 15) riskLevel = RiskLevel.MODERATE;
    else if (totalScore >= 8) riskLevel = RiskLevel.LOW;

    const plainLanguageMap: Record<string, string> = {
      'No Clinically Significant Insomnia':
        'Your responses suggest your sleep is within normal range. No significant sleep difficulties detected.',
      'Subthreshold Insomnia':
        'Your responses suggest some mild sleep difficulties. Good sleep habits (consistent bedtime, limiting screens before sleep, comfortable environment) may help.',
      'Moderate Clinical Insomnia':
        'Your responses suggest moderate insomnia that is likely affecting your daytime functioning. Cognitive Behavioral Therapy for Insomnia (CBT-I) is the recommended first-line treatment.',
      'Severe Clinical Insomnia':
        'Your responses suggest severe insomnia. This is likely significantly impacting your quality of life. We strongly recommend consulting a sleep specialist or mental health professional.',
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
