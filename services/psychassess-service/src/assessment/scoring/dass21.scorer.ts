import {
  AssessmentToolType,
  ScoredResult,
  RiskLevel,
  SeverityBand,
  DASS21_DEFINITION,
} from '@psychassess/shared';
import { AssessmentScorer, ResponseMap } from './scorer.interface';

export class Dass21Scorer implements AssessmentScorer {
  toolType = AssessmentToolType.DASS21;

  score(responses: ResponseMap): ScoredResult {
    const def = DASS21_DEFINITION;

    // Calculate subscale scores (multiply by 2 per DASS-21 scoring rules)
    const subscaleScores: Record<string, { score: number; severityBand: SeverityBand; label: string }> = {};

    for (const subscale of def.subscales!) {
      const rawScore = subscale.questionIds.reduce(
        (sum, qId) => sum + (responses[qId] ?? 0),
        0,
      );
      const multipliedScore = rawScore * (subscale.multiplier ?? 1);

      const threshold = subscale.severityThresholds.find(
        (t) => multipliedScore >= t.min && multipliedScore <= t.max,
      )!;

      subscaleScores[subscale.name.toLowerCase()] = {
        score: multipliedScore,
        severityBand: threshold.band,
        label: threshold.label,
      };
    }

    // Total score is sum of all subscale multiplied scores
    const totalScore = Object.values(subscaleScores).reduce(
      (sum, s) => sum + s.score,
      0,
    );

    // Overall severity based on worst subscale
    const severityOrder = [
      SeverityBand.NORMAL,
      SeverityBand.MILD,
      SeverityBand.MODERATE,
      SeverityBand.SEVERE,
      SeverityBand.EXTREMELY_SEVERE,
    ];

    const worstBand = Object.values(subscaleScores).reduce(
      (worst, s) => {
        const currentIdx = severityOrder.indexOf(s.severityBand);
        const worstIdx = severityOrder.indexOf(worst);
        return currentIdx > worstIdx ? s.severityBand : worst;
      },
      SeverityBand.NORMAL,
    );

    // Risk level from worst subscale
    let riskLevel = RiskLevel.NONE;
    if (worstBand === SeverityBand.EXTREMELY_SEVERE) riskLevel = RiskLevel.HIGH;
    else if (worstBand === SeverityBand.SEVERE) riskLevel = RiskLevel.MODERATE;
    else if (worstBand === SeverityBand.MODERATE) riskLevel = RiskLevel.LOW;

    const worstLabel = Object.values(subscaleScores).find(
      (s) => s.severityBand === worstBand,
    )?.label ?? 'Normal';

    // Build plain language interpretation
    const parts: string[] = [];
    for (const [name, data] of Object.entries(subscaleScores)) {
      const capitalName = name.charAt(0).toUpperCase() + name.slice(1);
      parts.push(`${capitalName}: ${data.label} (score: ${data.score})`);
    }

    const plainLanguage = `Your DASS-21 results across three areas: ${parts.join(', ')}. ` +
      (worstBand === SeverityBand.NORMAL
        ? 'All subscale scores are within the normal range.'
        : worstBand === SeverityBand.MILD
        ? 'Some mild symptoms were detected. Consider self-care strategies and monitoring.'
        : 'Elevated scores were detected. We recommend speaking with a mental health professional.');

    return {
      toolType: this.toolType,
      totalScore,
      maxPossibleScore: def.scoreRange.max,
      severityBand: worstBand,
      severityLabel: worstLabel,
      clinicalInterpretation: `DASS-21 subscale analysis: Depression (${subscaleScores.depression.label}), Anxiety (${subscaleScores.anxiety.label}), Stress (${subscaleScores.stress.label}). Overall severity determined by the most elevated subscale.`,
      plainLanguageInterpretation: plainLanguage,
      recommendation:
        riskLevel === RiskLevel.HIGH
          ? 'Urgent referral to mental health professional recommended.'
          : riskLevel === RiskLevel.MODERATE
          ? 'Professional support recommended. Consider counseling or psychotherapy.'
          : riskLevel === RiskLevel.LOW
          ? 'Monitor symptoms. Consider self-help strategies and reassess in 2–4 weeks.'
          : 'No intervention needed. Maintain current wellbeing practices.',
      riskLevel,
      subscaleScores,
    };
  }
}
