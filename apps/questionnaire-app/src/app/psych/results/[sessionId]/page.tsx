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
import { getResult } from '@/lib/api';
import {
  ArrowRight,
  Download,
  Share2,
  TrendingUp,
  Phone,
  Lock,
  Sparkles,
  BarChart3,
  Calendar,
} from 'lucide-react';

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
    if (toolType === AssessmentToolType.WHO5) {
      if (totalScore <= 28) riskLevel = RiskLevel.MODERATE;
      else if (totalScore < 52) riskLevel = RiskLevel.LOW;
    } else {
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
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTitle className="text-red-900 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Important — Support Is Available
          </AlertTitle>
          <AlertDescription className="space-y-3 text-red-800">
            <p>
              Your responses indicate you may be experiencing significant distress.
              Please reach out to one of these resources — they are here to help.
            </p>
            <div className="space-y-1.5 rounded-lg bg-white/60 p-3">
              {CRISIS_RESOURCES_INDIA.map((resource) => (
                <p key={resource.name} className="text-sm">
                  <strong>{resource.name}:</strong>{' '}
                  <a href={`tel:${resource.phone}`} className="underline font-semibold">
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
      <Card className="overflow-hidden">
        <div
          className="h-2"
          style={{ backgroundColor: getSeverityColor(result.severityBand) }}
        />
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{tool?.name || result.toolType} Results</CardTitle>
              <CardDescription>{tool?.fullName}</CardDescription>
            </div>
            <div className="text-right">
              <div
                className="text-4xl font-bold"
                style={{ color: getSeverityColor(result.severityBand) }}
              >
                {result.totalScore}
              </div>
              <span className="text-sm text-muted-foreground">
                out of {result.maxPossibleScore}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Severity & Risk badges */}
          <div className="flex flex-wrap gap-2">
            <Badge
              className="text-sm px-3 py-1"
              style={{
                backgroundColor: getSeverityColor(result.severityBand) + '20',
                color: getSeverityColor(result.severityBand),
                borderColor: getSeverityColor(result.severityBand),
              }}
              variant="outline"
            >
              {result.severityLabel}
            </Badge>
            <Badge
              className="text-sm px-3 py-1"
              style={{
                backgroundColor: getRiskColor(result.riskLevel) + '20',
                color: getRiskColor(result.riskLevel),
                borderColor: getRiskColor(result.riskLevel),
              }}
              variant="outline"
            >
              Risk: {result.riskLevel}
            </Badge>
          </div>

          {/* Score Bar */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0</span>
              <span>{result.maxPossibleScore}</span>
            </div>
            <div
              className="h-3 bg-secondary rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={result.totalScore}
              aria-valuemin={0}
              aria-valuemax={result.maxPossibleScore}
              aria-label={`Score: ${result.totalScore} out of ${result.maxPossibleScore}`}
            >
              <div
                className="h-full rounded-full transition-all duration-1000"
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

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-2">
            <h4 className="text-sm font-medium text-blue-900">Recommendation</h4>
            <p className="text-sm text-blue-800">{result.recommendation}</p>
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
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Recommended Follow-up
            </CardTitle>
            <CardDescription>
              Based on your responses, we recommend these additional assessments.
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
                      <Button size="sm">
                        Start
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upgrade Prompt */}
      <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="text-center space-y-3">
            <h3 className="font-semibold text-foreground">Get More from Your Results</h3>
            <p className="text-sm text-muted-foreground">
              Upgrade to track your scores over time, export PDF reports for your therapist, and get reassessment reminders.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Download className="h-3.5 w-3.5 text-blue-600" />
                PDF Reports
              </span>
              <span className="flex items-center gap-1.5">
                <Share2 className="h-3.5 w-3.5 text-blue-600" />
                Share with Therapist
              </span>
              <span className="flex items-center gap-1.5">
                <BarChart3 className="h-3.5 w-3.5 text-blue-600" />
                Trend Analysis
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                Reassessment Reminders
              </span>
            </div>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
              <Lock className="mr-2 h-4 w-4" />
              Upgrade to Wellness — &#8377;299/mo
            </Button>
            <p className="text-xs text-muted-foreground">7-day free trial. Cancel anytime.</p>
          </div>
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
      <div className="flex gap-3 justify-center pb-4">
        <Link href="/psych">
          <Button variant="outline">Take Another Assessment</Button>
        </Link>
        <Link href="/psych/dashboard">
          <Button>
            <TrendingUp className="mr-2 h-4 w-4" />
            View Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
