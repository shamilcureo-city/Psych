'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  ASSESSMENT_TOOLS,
  AssessmentToolType,
  CRISIS_RESOURCES_INDIA,
} from '@psychassess/shared';
import { startAssessment, submitResponse, completeAssessment } from '@/lib/api';

interface ResponseState {
  [questionId: string]: { value: number; text: string };
}

export default function AssessPage() {
  const params = useParams();
  const router = useRouter();
  const toolType = params.toolType as AssessmentToolType;
  const tool = ASSESSMENT_TOOLS[toolType];

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<ResponseState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCrisis, setShowCrisis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  const clientId = typeof window !== 'undefined'
    ? localStorage.getItem('psychassess_client_id') || 'demo-client'
    : 'demo-client';

  useEffect(() => {
    if (!tool) return;
    startAssessment(clientId, toolType)
      .then((res) => setSessionId(res.sessionId))
      .catch(() => {
        setSessionId('demo-session');
        setIsDemo(true);
      });
  }, [toolType, clientId]);

  if (!tool) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTitle>Unknown Assessment</AlertTitle>
          <AlertDescription>
            Assessment tool &quot;{toolType}&quot; is not recognized.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const questions = tool.questions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + (responses[currentQuestion?.id] ? 1 : 0)) / totalQuestions) * 100;

  const handleSelectOption = async (value: number, text: string) => {
    const questionId = currentQuestion.id;
    setResponses((prev) => ({
      ...prev,
      [questionId]: { value, text },
    }));

    // Check for crisis item in real-time — generic for any tool
    if (tool.crisisItems) {
      for (const crisisItem of tool.crisisItems) {
        if (questionId === crisisItem.questionId && value >= crisisItem.threshold) {
          setShowCrisis(true);
          break;
        }
      }
    }

    // Submit to backend if available
    if (sessionId && sessionId !== 'demo-session') {
      try {
        await submitResponse(sessionId, questionId, value, text);
      } catch {
        // Continue in offline mode
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setShowCrisis(false);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (sessionId && sessionId !== 'demo-session') {
        await completeAssessment(sessionId);
        router.push(`/psych/results/${sessionId}`);
      } else {
        // Demo mode: store responses locally and navigate
        const demoId = `demo-${Date.now()}`;
        localStorage.setItem(
          `psychassess_result_${demoId}`,
          JSON.stringify({ toolType, responses, completedAt: new Date().toISOString() }),
        );
        router.push(`/psych/results/${demoId}`);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to complete assessment';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allAnswered = Object.keys(responses).length >= totalQuestions;
  const currentResponse = responses[currentQuestion?.id];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{tool.name}</h1>
          <Badge variant="outline">
            {currentIndex + 1} / {totalQuestions}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">{tool.fullName}</p>
        <Progress
          value={progress}
          max={100}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Assessment progress: ${currentIndex + (currentResponse ? 1 : 0)} of ${totalQuestions} questions answered`}
        />
      </div>

      {/* Demo mode notice */}
      {isDemo && (
        <Alert variant="warning">
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            The backend is not available. Your responses will be scored locally and will not be saved to the server.
          </AlertDescription>
        </Alert>
      )}

      {/* Crisis Alert */}
      {showCrisis && (
        <Alert variant="destructive">
          <AlertTitle>You Are Not Alone</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>
              Your response indicates you may be experiencing thoughts of
              self-harm. Help is available right now.
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
            <p className="text-sm mt-2">
              You may continue the assessment when you are ready. There is no
              pressure to complete it now.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
          {currentQuestion.subscale && (
            <Badge variant="secondary" className="w-fit">
              {currentQuestion.subscale}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2" role="radiogroup" aria-label={currentQuestion.text}>
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectOption(option.value, option.label)}
                role="radio"
                aria-checked={currentResponse?.value === option.value}
                className={`w-full text-left p-4 rounded-lg border transition-colors ${
                  currentResponse?.value === option.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                }`}
              >
                <span className="text-sm">{option.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentIndex === 0}
          >
            Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!currentResponse}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!allAnswered || isSubmitting}
            >
              {isSubmitting ? 'Scoring...' : 'Complete Assessment'}
            </Button>
          )}
        </CardFooter>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Non-diagnostic disclaimer */}
      <p className="text-xs text-muted-foreground text-center">
        This is a screening tool and does not provide a clinical diagnosis.
      </p>
    </div>
  );
}
