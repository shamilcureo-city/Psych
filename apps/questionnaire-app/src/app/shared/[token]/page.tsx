'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertCircle, Shield } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3029';

interface SharedResult {
  toolType: string;
  toolName: string;
  totalScore: number;
  maxScore: number;
  severityBand: string;
  interpretation: string;
  subscaleScores?: { name: string; score: number; maxScore: number; severity: string }[];
  completedAt: string;
  sharedBy?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  minimal: 'bg-emerald-100 text-emerald-800',
  mild: 'bg-yellow-100 text-yellow-800',
  moderate: 'bg-orange-100 text-orange-800',
  'moderately severe': 'bg-red-100 text-red-800',
  severe: 'bg-red-200 text-red-900',
  normal: 'bg-emerald-100 text-emerald-800',
  low: 'bg-emerald-100 text-emerald-800',
  high: 'bg-red-100 text-red-800',
};

function getSeverityColor(band: string): string {
  const lower = band.toLowerCase();
  return SEVERITY_COLORS[lower] || 'bg-gray-100 text-gray-800';
}

export default function SharedResultPage() {
  const params = useParams();
  const token = params.token as string;

  const [result, setResult] = useState<SharedResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/share/${token}`)
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ message: 'Link not found or expired' }));
          throw new Error(err.message || 'Failed to load shared result');
        }
        return res.json();
      })
      .then(setResult)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-sm text-muted-foreground">Loading shared result...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unable to Load Result</AlertTitle>
              <AlertDescription>{error || 'This share link may have expired or been deactivated.'}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  const scorePercent = result.maxScore > 0 ? (result.totalScore / result.maxScore) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">PsychAssess</span>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1.5">
            <Shield className="h-3.5 w-3.5" />
            Shared Assessment Result
          </p>
        </div>

        {/* Score Card */}
        <Card>
          <CardHeader className="text-center pb-3">
            <CardTitle className="text-xl">{result.toolName || result.toolType}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Completed {new Date(result.completedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Score */}
            <div className="text-center space-y-3">
              <div className="text-5xl font-bold text-foreground">
                {result.totalScore}
                <span className="text-lg text-muted-foreground font-normal">/{result.maxScore}</span>
              </div>
              <Badge className={`text-sm px-3 py-1 ${getSeverityColor(result.severityBand)}`}>
                {result.severityBand}
              </Badge>

              {/* Score bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-400 to-red-500 transition-all"
                  style={{ width: `${Math.min(scorePercent, 100)}%` }}
                />
              </div>
            </div>

            {/* Interpretation */}
            <div className="bg-secondary/50 rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-1">Clinical Interpretation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{result.interpretation}</p>
            </div>

            {/* Subscale Scores */}
            {result.subscaleScores && result.subscaleScores.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold mb-3">Subscale Scores</h3>
                <div className="space-y-2">
                  {result.subscaleScores.map((sub) => (
                    <div key={sub.name} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{sub.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {sub.score}/{sub.maxScore}
                        </span>
                        <Badge variant="outline" className={`text-xs ${getSeverityColor(sub.severity)}`}>
                          {sub.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground max-w-md mx-auto">
          This is a screening tool and does not provide a clinical diagnosis.
          Results should be interpreted by a qualified mental health professional.
        </p>
      </div>
    </div>
  );
}
