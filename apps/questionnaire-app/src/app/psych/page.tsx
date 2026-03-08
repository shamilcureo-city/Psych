'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ASSESSMENT_TOOLS, AssessmentToolType } from '@psychassess/shared';
import {
  ArrowRight,
  Brain,
  HeartPulse,
  Activity,
  Sparkles,
  Gauge,
  Moon,
  Zap,
  Shield,
  Clock,
} from 'lucide-react';

const TOOL_META: Record<string, { icon: typeof Brain; color: string; bg: string }> = {
  [AssessmentToolType.PHQ2]: { icon: Zap, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  [AssessmentToolType.PHQ9]: { icon: HeartPulse, color: 'text-blue-600', bg: 'bg-blue-50' },
  [AssessmentToolType.GAD7]: { icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
  [AssessmentToolType.DASS21]: { icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
  [AssessmentToolType.WHO5]: { icon: Sparkles, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  [AssessmentToolType.PSS10]: { icon: Gauge, color: 'text-rose-600', bg: 'bg-rose-50' },
  [AssessmentToolType.ISI]: { icon: Moon, color: 'text-sky-600', bg: 'bg-sky-50' },
};

const FULL_TOOLS: AssessmentToolType[] = [
  AssessmentToolType.PHQ9,
  AssessmentToolType.GAD7,
  AssessmentToolType.DASS21,
  AssessmentToolType.WHO5,
  AssessmentToolType.PSS10,
  AssessmentToolType.ISI,
];

function getRecommendedTools(intake: { primaryConcern?: string } | null): AssessmentToolType[] {
  if (!intake?.primaryConcern) return [];
  const concern = intake.primaryConcern.toLowerCase();
  if (concern.includes('depress') || concern.includes('low mood')) return [AssessmentToolType.PHQ9];
  if (concern.includes('anxiety') || concern.includes('worry')) return [AssessmentToolType.GAD7];
  if (concern.includes('stress')) return [AssessmentToolType.PSS10, AssessmentToolType.DASS21];
  if (concern.includes('sleep')) return [AssessmentToolType.ISI];
  if (concern.includes('wellbeing') || concern.includes('general')) return [AssessmentToolType.WHO5];
  if (concern.includes('work') || concern.includes('academic')) return [AssessmentToolType.PSS10, AssessmentToolType.GAD7];
  if (concern.includes('grief') || concern.includes('relationship')) return [AssessmentToolType.PHQ9, AssessmentToolType.GAD7];
  return [];
}

export default function PsychHome() {
  const [hasConsented, setHasConsented] = useState(false);
  const [intake, setIntake] = useState<{ primaryConcern?: string } | null>(null);
  const [recommended, setRecommended] = useState<AssessmentToolType[]>([]);

  useEffect(() => {
    setHasConsented(localStorage.getItem('psychassess_consent') === 'true');
    const intakeData = localStorage.getItem('psychassess_intake');
    if (intakeData) {
      const parsed = JSON.parse(intakeData);
      setIntake(parsed);
      setRecommended(getRecommendedTools(parsed));
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mental Health Assessments</h1>
        <p className="text-muted-foreground">
          Scientifically validated screening tools used by healthcare professionals worldwide.
        </p>
      </div>

      {/* Consent gate */}
      {!hasConsented && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">Before you begin</h3>
                <p className="text-sm text-blue-800 mb-3">
                  Please review our informed consent to understand how this screening tool works and how your data is handled.
                </p>
                <Link href="/psych/consent">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Review Informed Consent
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommended Start: PHQ-2 Quick Screen */}
      {hasConsented && (
        <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600">
                <Zap className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">Recommended Start</Badge>
                  <Badge variant="outline" className="text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" /> 2 minutes
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">PHQ-2 Quick Depression Screen</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Not sure where to begin? Start here. This 2-question screening takes under 2 minutes and will automatically
                  recommend deeper assessments based on your answers.
                </p>
                <Link href={`/psych/assess/${AssessmentToolType.PHQ2}`}>
                  <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    Start Quick Screen
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Recommendations */}
      {hasConsented && recommended.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            Recommended for You
          </h2>
          <p className="text-sm text-muted-foreground -mt-1">
            Based on your intake responses ({intake?.primaryConcern})
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {recommended.map((toolType) => {
              const tool = ASSESSMENT_TOOLS[toolType];
              const meta = TOOL_META[toolType];
              const Icon = meta.icon;
              return (
                <Card key={toolType} className="border-amber-200/60 bg-amber-50/30 hover:shadow-md transition-shadow">
                  <CardContent className="pt-5 pb-5">
                    <div className="flex items-start gap-3">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                        <Icon className={`h-4.5 w-4.5 ${meta.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold text-sm">{tool.name}</h3>
                          <Badge variant="secondary" className="text-xs shrink-0">{tool.itemCount} items</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{tool.domain}</p>
                        <Link href={`/psych/assess/${toolType}`} className="mt-2 block">
                          <Button size="sm" variant="outline" className="w-full">
                            Start Assessment
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* All Assessments */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">All Assessments</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {FULL_TOOLS.map((toolType) => {
            const tool = ASSESSMENT_TOOLS[toolType];
            const meta = TOOL_META[toolType];
            const Icon = meta.icon;
            return (
              <Card key={toolType} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${meta.bg}`}>
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <h3 className="font-semibold">{tool.name}</h3>
                          <p className="text-xs text-muted-foreground">{tool.fullName}</p>
                        </div>
                        <Badge variant="secondary">{tool.itemCount} items</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">{tool.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs text-muted-foreground">
                          {tool.domain} &middot; {tool.guideline}
                        </span>
                        {hasConsented ? (
                          <Link href={`/psych/assess/${toolType}`}>
                            <Button size="sm">Start</Button>
                          </Link>
                        ) : (
                          <Button size="sm" disabled>
                            Consent Required
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
