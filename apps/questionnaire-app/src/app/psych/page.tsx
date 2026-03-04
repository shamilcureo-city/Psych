'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ASSESSMENT_TOOLS, AssessmentToolType } from '@psychassess/shared';

const TOOL_ORDER: AssessmentToolType[] = [
  AssessmentToolType.PHQ2,
  AssessmentToolType.PHQ9,
  AssessmentToolType.GAD7,
  AssessmentToolType.DASS21,
  AssessmentToolType.WHO5,
  AssessmentToolType.PSS10,
  AssessmentToolType.ISI,
];

export default function PsychHome() {
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    setHasConsented(localStorage.getItem('psychassess_consent') === 'true');
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mental Health Assessments</h1>
        <p className="text-muted-foreground">
          Scientifically validated screening tools to help you understand your
          mental health. All assessments are based on internationally recognized
          clinical instruments.
        </p>
      </div>

      {!hasConsented && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 mb-3">
              Before taking any assessments, please review and accept the informed
              consent agreement.
            </p>
            <Link href="/psych/consent">
              <Button>Review Informed Consent</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {TOOL_ORDER.map((toolType) => {
          const tool = ASSESSMENT_TOOLS[toolType];
          return (
            <Card key={toolType} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tool.name}</CardTitle>
                  <Badge variant="secondary">{tool.itemCount} items</Badge>
                </div>
                <CardDescription>{tool.fullName}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                <div className="flex items-center justify-between">
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
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
