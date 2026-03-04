'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getSeverityColor, getRiskColor } from '@/lib/utils';
import {
  ASSESSMENT_TOOLS,
  AssessmentToolType,
  CRISIS_RESOURCES_INDIA,
  NON_DIAGNOSTIC_DISCLAIMER,
  RiskLevel,
  ScoredResult,
  SeverityBand,
} from '@psychassess/shared';
import { getResult, type AssessmentResultResponse } from '@/lib/api';

// Client-side scoring for demo mode using actual clinical thresholds
function scoreLocally(
  toolType: AssessmentToolType,
  responses: Record<string, { value: number }>,
): ScoredResult {
  const tool = ASSESSMENT_TOOLS[toolType];
  const rawScore = tool.questions.reduce(
    (sum: number, q: { id: string }) => sum + (responses[q.id]?.value ?? 0),
    0,
  );

  // For WHO-5, multiply raw by 4
  const totalScore = toolType === AssessmentToolType.WHO5 ? rawScore * 4 : rawScore;

  // For DASS-21, handle subscales
  if (toolType === AssessmentToolType.DASS21 && tool.subscales) {
    const subscaleScores: Record<string, { score: number; severityBand: SeverityBand; label: string }> = {};
    for (const subscale of tool.subscales) {
      const subRaw = subscale.questionIds.reduce(
        (sum: number, qId: string) => sum + (responses[qId]?.value ?? 0),
        0,
      );
      const subScore = subRaw * (subscale.multiplier ?? 1);
      const subThreshold = subscale.severityThresholds.find(
        (t: { min: number; max: number }) => subScore >= t.min && subScore <= t.max,
      );
      subscaleScores[subscale.name.toLowerCase()] = {
        score: subScore,
        severityBand: subThreshold?.band ?? SeverityBand.NORMAL,
        label: subThreshold?.label ?? 'Normal',
      };
    }

    const worstBand = Object.values(subscaleScores).reduce(
      (worst, s) => {
        const order = [SeverityBand.NORMAL, SeverityBand.MILD, SeverityBand.MODERATE, SeverityBand.SEVERE, SeverityBand.EXTREMELY_SEVERE];
        return order.indexOf(s.severityBand) > order.indexOf(worst) ? s.severityBand : worst;
      },
      SeverityBand.NORMAL,
    );

    return {
      toolType,
      totalScore,
      maxPossibleScore: tool.scoreRange.max,
      severityBand: worstBand,
      severityLabel: Object.values(subscaleScores).find((s) => s.severityBand === worstBand)?.label ?? 'Normal',
      clinicalInterpretation: `DASS-21 subscale analysis: ${Object.entries(subscaleScores).map(([n, d]) => `${n}: ${d.label}`).join(', ')}`,
      plainLanguageInterpretation: 'Your DASS-21 results have been scored. See subscale details below.',
      recommendation: worstBand === SeverityBand.NORMAL
        ? 'No intervention needed. Maintain current wellbeing practices.'
        : 'Consider speaking with a mental health professional.',
      riskLevel: worstBand === SeverityBand.EXTREMELY_SEVERE ? RiskLevel.HIGH
        : worstBand === SeverityBand.SEVERE ? RiskLevel.MODERATE
        : RiskLevel.NONE,
      subscaleScores,
    };
  }

  // Use actual severity thresholds from the tool definition
  const threshold = tool.severityThresholds.find(
    (t: { min: number; max: number }) => totalScore >= t.min && totalScore <= t.max,
  );

  // Check crisis items
  const crisisFlags: { questionId: string; score: number; action: string }[] = [];
  let riskLevel = RiskLevel.NONE;

  if (tool.crisisItems) {
    for (const ci of tool.crisisItems) {
      const val = responses[ci.questionId]?.value ?? 0;
      if (val >= ci.threshold) {
        crisisFlags.push({ questionId: ci.questionId, score: val, action: ci.action });
        riskLevel = RiskLevel.CRISIS;
      }
    }
  }

  // Determine risk from score if no crisis
  if (riskLevel === RiskLevel.NONE) {
    // WHO-5: lower is worse (inverted)
    if (toolType === AssessmentToolType.WHO5) {
      if (totalScore <= 28) riskLevel = RiskLevel.MODERATE;
      else if (totalScore < 52) riskLevel = RiskLevel.LOW;
    } else {
      // Standard tools: higher is worse
      const ratio = totalScore / tool.scoreRange.max;
      if (ratio >= 0.75) riskLevel = RiskLevel.HIGH;
      else if (ratio >= 0.5) riskLevel = RiskLevel.MODERATE;
      else if (ratio >= 0.25) riskLevel = RiskLevel.LOW;
    }
  }

  // Adaptive suggestions
  const adaptiveSuggestions: AssessmentToolType[] = [];
  if (tool.adaptiveTriggers) {
    for (const trigger of tool.adaptiveTriggers) {
      adaptiveSuggestions.push(trigger.triggeredTool);
    }
  }

  return {
    toolType,
    totalScore,
    maxPossibleScore: tool.scoreRange.max,
    severityBand: threshold?.band ?? SeverityBand.NORMAL,
    severityLabel: threshold?.label ?? 'Unknown',
    clinicalInterpretation: threshold?.clinicalInterpretation ?? '',
    plainLanguageInterpretation: threshold?.clinicalInterpretation ?? '',
    recommendation: threshold?.recommendation ?? '',
    riskLevel,
    crisisFlags: crisisFlags.length > 0 ? crisisFlags : undefined,
    adaptiveSuggestions: adaptiveSuggestions.length > 0 ? adaptiveSuggestions : undefined,
  };
}

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [result, setResult] = useState<ScoredResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getResult(sessionId)
      .then(setResult)
      .catch(() => {
        // Demo mode: try to load from localStorage
        const stored = localStorage.getItem(`psychassess_result_${sessionId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          const scored = scoreLocally(parsed.toolType, parsed.responses);
          setResult(scored);
        }
      })
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-64 bg-secondary rounded animate-pulse mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-8 w-24 bg-secondary rounded animate-pulse" />
            <div className="h-4 w-full bg-secondary rounded animate-pulse" />
            <div className="h-4 w-3/4 bg-secondary rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Results Not Found</AlertTitle>
          <AlertDescription>
            Could not find results for this session. The assessment may not have been completed.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const tool = ASSESSMENT_TOOLS[result.toolType as AssessmentToolType];
  const isCrisis = result.riskLevel === RiskLevel.CRISIS || result.riskLevel === RiskLevel.HIGH;
  const scorePercentage = (result.totalScore / result.maxPossibleScore) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Crisis Alert — always on top */}
      {result.crisisFlags && result.crisisFlags.length > 0 && (
        <Alert variant="destructive">
          <AlertTitle>Important — Support Is Available</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Your responses indicate you may be experiencing significant distress.
              Please reach out to one of these resources — they are here to help.
            </p>
            <div className="space-y-1">
              {CRISIS_RESOURCES_INDIA.map((resource) => (
                <p key={resource.name} className="text-sm">
                  <strong>{resource.name}:</strong>{' '}
                  <a href={`tel:${resource.phone}`} className="underline">
                    {resource.phone}
                  </a>{' '}
                  ({resource.availability})
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Score Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{tool?.name || result.toolType} Results</CardTitle>
              <CardDescription>{tool?.fullName}</CardDescription>
            </div>
            <div
              className="text-3xl font-bold"
              style={{ color: getSeverityColor(result.severityBand) }}
            >
              {result.totalScore}
              <span className="text-sm font-normal text-muted-foreground">
                /{result.maxPossibleScore}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Severity Badge */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Severity:</span>
            <Badge
              style={{
                backgroundColor: getSeverityColor(result.severityBand) + '20',
                color: getSeverityColor(result.severityBand),
                borderColor: getSeverityColor(result.severityBand),
              }}
              variant="outline"
            >
              {result.severityLabel}
            </Badge>
          </div>

          {/* Risk Level */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Risk Level:</span>
            <Badge
              style={{
                backgroundColor: getRiskColor(result.riskLevel) + '20',
                color: getRiskColor(result.riskLevel),
                borderColor: getRiskColor(result.riskLevel),
              }}
              variant="outline"
            >
              {result.riskLevel}
            </Badge>
          </div>

          {/* Score Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{result.maxPossibleScore}</span>
            </div>
            <div
              className="h-4 bg-secondary rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={result.totalScore}
              aria-valuemin={0}
              aria-valuemax={result.maxPossibleScore}
              aria-label={`Score: ${result.totalScore} out of ${result.maxPossibleScore}`}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${scorePercentage}%`,
                  backgroundColor: getSeverityColor(result.severityBand),
                }}
              />
            </div>
          </div>

          {/* Subscale scores (DASS-21) */}
          {result.subscaleScores && (
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-medium">Subscale Scores</h4>
              {Object.entries(result.subscaleScores).map(([name, data]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{(data as { score: number; severityBand: string; label: string }).score}</span>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getSeverityColor((data as { severityBand: string }).severityBand) + '20',
                        color: getSeverityColor((data as { severityBand: string }).severityBand),
                        fontSize: '0.7rem',
                      }}
                    >
                      {(data as { label: string }).label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Interpretation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What This Means</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-relaxed">
            {result.plainLanguageInterpretation}
          </p>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium">Recommendation</h4>
            <p className="text-sm text-muted-foreground">{result.recommendation}</p>
          </div>

          <details className="text-sm">
            <summary className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
              Clinical interpretation (for healthcare providers)
            </summary>
            <p className="mt-2 text-muted-foreground pl-4 border-l-2">
              {result.clinicalInterpretation}
            </p>
          </details>
        </CardContent>
      </Card>

      {/* Adaptive Suggestions */}
      {result.adaptiveSuggestions && result.adaptiveSuggestions.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Recommended Follow-up</CardTitle>
            <CardDescription>
              Based on your responses, we recommend the following additional assessments.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.adaptiveSuggestions.map((suggestedTool) => {
                const suggested = ASSESSMENT_TOOLS[suggestedTool];
                return (
                  <div key={suggestedTool} className="flex items-center justify-between p-3 rounded-lg border bg-white">
                    <div>
                      <p className="font-medium text-sm">{suggested?.name || suggestedTool}</p>
                      <p className="text-xs text-muted-foreground">{suggested?.description}</p>
                    </div>
                    <Link href={`/psych/assess/${suggestedTool}`}>
                      <Button size="sm">Start</Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Non-diagnostic disclaimer */}
      <Alert variant="info">
        <AlertTitle>Screening Tool Disclaimer</AlertTitle>
        <AlertDescription className="text-xs">
          {NON_DIAGNOSTIC_DISCLAIMER}
        </AlertDescription>
      </Alert>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <Link href="/psych">
          <Button variant="outline">Take Another Assessment</Button>
        </Link>
        <Link href="/psych/dashboard">
          <Button>View Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
