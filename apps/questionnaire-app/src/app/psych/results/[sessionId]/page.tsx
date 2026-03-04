'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
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
} from '@psychassess/shared';
import { getResult } from '@/lib/api';

// Simple client-side scoring for demo mode
function scoreLocally(toolType: AssessmentToolType, responses: Record<string, { value: number }>): any {
  const tool = ASSESSMENT_TOOLS[toolType];
  const totalScore = tool.questions.reduce(
    (sum, q) => sum + (responses[q.id]?.value ?? 0),
    0,
  );

  // For WHO-5, multiply raw by 4
  const adjustedScore = toolType === AssessmentToolType.WHO5 ? totalScore * 4 : totalScore;

  const threshold = tool.severityThresholds.find(
    (t) => adjustedScore >= t.min && adjustedScore <= t.max,
  );

  let riskLevel = RiskLevel.NONE;
  if (adjustedScore >= tool.scoreRange.max * 0.75) riskLevel = RiskLevel.HIGH;
  else if (adjustedScore >= tool.scoreRange.max * 0.5) riskLevel = RiskLevel.MODERATE;
  else if (adjustedScore >= tool.scoreRange.max * 0.25) riskLevel = RiskLevel.LOW;

  // Check crisis
  const crisisFlags: any[] = [];
  if (tool.crisisItems) {
    for (const ci of tool.crisisItems) {
      const val = responses[ci.questionId]?.value ?? 0;
      if (val >= ci.threshold) {
        crisisFlags.push({ questionId: ci.questionId, score: val, action: ci.action });
        riskLevel = RiskLevel.CRISIS;
      }
    }
  }

  return {
    toolType,
    totalScore: adjustedScore,
    maxPossibleScore: tool.scoreRange.max,
    severityBand: threshold?.band || 'UNKNOWN',
    severityLabel: threshold?.label || 'Unknown',
    clinicalInterpretation: threshold?.clinicalInterpretation || '',
    plainLanguageInterpretation: threshold?.clinicalInterpretation || '',
    recommendation: threshold?.recommendation || '',
    riskLevel,
    crisisFlags: crisisFlags.length > 0 ? crisisFlags : undefined,
  };
}

export default function ResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to fetch from backend
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
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <p className="text-muted-foreground">Loading results...</p>
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
            <div className="h-4 bg-secondary rounded-full overflow-hidden">
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
              {Object.entries(result.subscaleScores).map(([name, data]: [string, any]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="capitalize">{name}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{data.score}</span>
                    <Badge
                      variant="outline"
                      style={{
                        backgroundColor: getSeverityColor(data.severityBand) + '20',
                        color: getSeverityColor(data.severityBand),
                        fontSize: '0.7rem',
                      }}
                    >
                      {data.label}
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
