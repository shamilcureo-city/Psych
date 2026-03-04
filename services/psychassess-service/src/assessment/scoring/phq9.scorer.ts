import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  PHQ9_DEFINITION,
  CRISIS_THRESHOLDS,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class Phq9Scorer implements AssessmentScorer {
  toolType = AssessmentToolType.PHQ9;

  score(responses: ResponseMap): ScoredResult {
    const def = PHQ9_DEFINITION;
    const totalScore = def.questions.reduce(
      (sum, q) => sum + (responses[q.id] ?? 0),
      0,
    );

    const threshold = def.severityThresholds.find(
      (t) => totalScore >= t.min && totalScore <= t.max,
    )!;

    // Crisis check: PHQ-9 Q9 (suicidal ideation)
    const q9Score = responses[CRISIS_THRESHOLDS.PHQ9_Q9_QUESTION_ID] ?? 0;
    const crisisFlags =
      q9Score >= CRISIS_THRESHOLDS.PHQ9_Q9_THRESHOLD
        ? [
            {
              questionId: CRISIS_THRESHOLDS.PHQ9_Q9_QUESTION_ID,
              score: q9Score,
              action: def.crisisItems![0].action,
            },
          ]
        : [];

    // Determine risk level
    let riskLevel = RiskLevel.NONE;
    if (crisisFlags.length > 0) {
      riskLevel = RiskLevel.CRISIS;
    } else if (totalScore >= 20) {
      riskLevel = RiskLevel.HIGH;
    } else if (totalScore >= 15) {
      riskLevel = RiskLevel.MODERATE;
    } else if (totalScore >= 10) {
      riskLevel = RiskLevel.LOW;
    }

    // Adaptive: sleep disturbance item (phq9_3) score >= 2 triggers ISI
    const sleepScore = responses['phq9_3'] ?? 0;
    const adaptiveSuggestions: AssessmentToolType[] = [];
    if (sleepScore >= 2) {
      adaptiveSuggestions.push(AssessmentToolType.ISI);
    }

    // Plain language interpretation
    const plainLanguageMap: Record<string, string> = {
      'Minimal Depression':
        'Your responses suggest minimal or no symptoms of depression. You appear to be doing well in this area.',
      'Mild Depression':
        'Your responses suggest mild symptoms of depression. You may be experiencing some low mood or reduced interest, but these are not at a clinical level yet.',
      'Moderate Depression':
        'Your responses suggest moderate symptoms of depression. You may be experiencing noticeable changes in mood, energy, or daily functioning. Speaking with a mental health professional could be helpful.',
      'Moderately Severe Depression':
        'Your responses suggest moderately severe symptoms of depression. These symptoms are likely affecting your daily life significantly. We recommend connecting with a mental health professional.',
      'Severe Depression':
        'Your responses suggest severe symptoms of depression. It is important to seek support from a mental health professional as soon as possible. You do not have to go through this alone.',
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
      crisisFlags: crisisFlags.length > 0 ? crisisFlags : undefined,
      adaptiveSuggestions:
        adaptiveSuggestions.length > 0 ? adaptiveSuggestions : undefined,
    };
  }
}
