import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  GAD7_DEFINITION,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class Gad7Scorer implements AssessmentScorer {
  toolType = AssessmentToolType.GAD7;

  score(responses: ResponseMap): ScoredResult {
    const def = GAD7_DEFINITION;
    const totalScore = def.questions.reduce(
      (sum: number, q: { id: string }) => sum + (responses[q.id] ?? 0),
      0,
    );

    const threshold = def.severityThresholds.find(
      (t: { min: number; max: number }) => totalScore >= t.min && totalScore <= t.max,
    );

    if (!threshold) {
      throw new Error(`No severity threshold found for GAD-7 score: ${totalScore}`);
    }

    let riskLevel = RiskLevel.NONE;
    if (totalScore >= 15) riskLevel = RiskLevel.HIGH;
    else if (totalScore >= 10) riskLevel = RiskLevel.MODERATE;
    else if (totalScore >= 5) riskLevel = RiskLevel.LOW;

    const plainLanguageMap: Record<string, string> = {
      'Minimal Anxiety':
        'Your responses suggest minimal or no symptoms of anxiety. You appear to be managing well.',
      'Mild Anxiety':
        'Your responses suggest mild anxiety symptoms. Some worry or nervousness is present but is not significantly impacting your daily life.',
      'Moderate Anxiety':
        'Your responses suggest moderate anxiety symptoms. You may be experiencing persistent worry that is beginning to affect your daily activities. Consider speaking with a professional.',
      'Severe Anxiety':
        'Your responses suggest severe anxiety symptoms. These are likely having a significant impact on your daily life. We strongly recommend connecting with a mental health professional.',
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
