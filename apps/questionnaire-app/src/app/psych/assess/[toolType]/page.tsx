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
import { ChevronLeft, ChevronRight, CheckCircle2, Phone } from 'lucide-react';

interface ResponseState {
  [questionId: string]: { value: number; text: string };
}

const ENCOURAGEMENT = [
  'You\'re doing great — take your time.',
  'There are no right or wrong answers.',
  'Your honesty helps us give you the best insights.',
  'Almost there — you\'re making progress.',
  'Thank you for being open and honest.',
];

function getEncouragement(index: number, total: number): string {
  if (index === 0) return 'Take a moment to reflect before answering.';
  if (index === total - 1) return 'Last question — you\'re almost done.';
  const mid = Math.floor(total / 2);
  if (index === mid) return 'You\'re halfway through — great job!';
  return ENCOURAGEMENT[index % ENCOURAGEMENT.length];
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
  const answeredCount = Object.keys(responses).length;
  const progress = ((currentIndex + (responses[currentQuestion?.id] ? 1 : 0)) / totalQuestions) * 100;

  const handleSelectOption = async (value: number, text: string) => {
    const questionId = currentQuestion.id;
    const isNewAnswer = !responses[questionId];

    setResponses((prev) => ({
      ...prev,
      [questionId]: { value, text },
    }));

    // Check for crisis item in real-time
    let crisisTriggered = false;
    if (tool.crisisItems) {
      for (const crisisItem of tool.crisisItems) {
        if (questionId === crisisItem.questionId && value >= crisisItem.threshold) {
          setShowCrisis(true);
          crisisTriggered = true;
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

    // Auto-advance after a brief delay (only if it's a new answer and not the last question)
    if (isNewAnswer && currentIndex < totalQuestions - 1 && !crisisTriggered) {
      setTimeout(() => {
        setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1));
      }, 400);
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

  const allAnswered = answeredCount >= totalQuestions;
  const currentResponse = responses[currentQuestion?.id];

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">{tool.name}</h1>
            <p className="text-sm text-muted-foreground">{tool.fullName}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-foreground">{currentIndex + 1}</span>
            <span className="text-sm text-muted-foreground">/{totalQuestions}</span>
          </div>
        </div>
        <Progress
          value={progress}
          max={100}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Assessment progress: ${currentIndex + (currentResponse ? 1 : 0)} of ${totalQuestions} questions answered`}
        />
        {/* Encouragement message */}
        <p className="text-xs text-muted-foreground text-center italic">
          {getEncouragement(currentIndex, totalQuestions)}
        </p>
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
        <Alert variant="destructive" className="border-red-300 bg-red-50">
          <AlertTitle className="text-red-900 flex items-center gap-2">
            <Phone className="h-4 w-4" />
            You Are Not Alone
          </AlertTitle>
          <AlertDescription className="space-y-3 text-red-800">
            <p>
              Your response indicates you may be experiencing difficult thoughts.
              Help is available right now — please reach out.
            </p>
            <div className="space-y-1.5 rounded-lg bg-white/60 p-3">
              {CRISIS_RESOURCES_INDIA.map((resource) => (
                <p key={resource.name} className="text-sm">
                  <strong>{resource.name}:</strong>{' '}
                  <a href={`tel:${resource.phone}`} className="underline font-semibold">
                    {resource.phone}
                  </a>{' '}
                  <span className="text-red-600">({resource.availability})</span>
                </p>
              ))}
            </div>
            <p className="text-sm">
              You may continue the assessment when you are ready. There is no pressure to complete it now.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          {currentQuestion.subscale && (
            <Badge variant="secondary" className="w-fit mb-2 text-xs">
              {currentQuestion.subscale}
            </Badge>
          )}
          <CardTitle className="text-base font-medium leading-relaxed">
            {currentQuestion.text}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2" role="radiogroup" aria-label={currentQuestion.text}>
            {currentQuestion.options.map((option) => {
              const isSelected = currentResponse?.value === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSelectOption(option.value, option.label)}
                  role="radio"
                  aria-checked={isSelected}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                      : 'border-border hover:border-blue-200 hover:bg-blue-50/30 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{option.label}</span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          {currentIndex < totalQuestions - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!currentResponse}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!allAnswered || isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 gap-1"
            >
              {isSubmitting ? 'Scoring...' : 'Complete Assessment'}
              {!isSubmitting && <CheckCircle2 className="h-4 w-4" />}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Question dots navigator */}
      <div className="flex justify-center gap-1.5 flex-wrap">
        {questions.map((q, i) => {
          const isAnswered = !!responses[q.id];
          const isCurrent = i === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => setCurrentIndex(i)}
              className={`h-2 rounded-full transition-all ${
                isCurrent
                  ? 'w-6 bg-blue-600'
                  : isAnswered
                    ? 'w-2 bg-blue-300'
                    : 'w-2 bg-gray-200'
              }`}
              aria-label={`Question ${i + 1}${isAnswered ? ' (answered)' : ''}`}
            />
          );
        })}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Non-diagnostic disclaimer */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        This is a screening tool and does not provide a clinical diagnosis.
      </p>
    </div>
  );
}
