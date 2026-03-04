'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { logMood, getMoodHistory, type MoodLogEntry } from '@/lib/api';

const MOOD_OPTIONS = [
  { value: 1, label: 'Very Low', emoji: '😞', color: '#ef4444' },
  { value: 2, label: 'Low', emoji: '😔', color: '#f97316' },
  { value: 3, label: 'Okay', emoji: '😐', color: '#eab308' },
  { value: 4, label: 'Good', emoji: '🙂', color: '#84cc16' },
  { value: 5, label: 'Great', emoji: '😊', color: '#22c55e' },
];

export default function MoodPage() {
  const [history, setHistory] = useState<MoodLogEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = useMemo(() => {
    if (typeof window === 'undefined') return 'demo-client';
    return localStorage.getItem('psychassess_client_id') || 'demo-client';
  }, []);

  useEffect(() => {
    getMoodHistory(clientId, 30)
      .then(setHistory)
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [clientId, submitted]);

  const handleSubmit = async () => {
    if (!selectedMood) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await logMood(clientId, selectedMood, note || undefined);
      setSubmitted(true);
      setSelectedMood(null);
      setNote('');
      // Refresh history
      setTimeout(() => setSubmitted(false), 3000);
    } catch {
      setError('Failed to log mood. The backend may not be available.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mood Tracker</h1>
        <p className="text-muted-foreground">
          Log how you&apos;re feeling each day to track patterns over time.
        </p>
      </div>

      {/* Log Mood Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How are you feeling today?</CardTitle>
          <CardDescription>Select the option that best describes your mood right now.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 justify-center" role="radiogroup" aria-label="Mood selection">
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedMood(option.value)}
                role="radio"
                aria-checked={selectedMood === option.value}
                aria-label={`${option.label} mood`}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all flex-1 ${
                  selectedMood === option.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20 scale-105'
                    : 'border-border hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none'
                }`}
              >
                <span className="text-2xl">{option.emoji}</span>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label htmlFor="mood-note" className="text-sm font-medium block mb-1">
              Note (optional)
            </label>
            <textarea
              id="mood-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full rounded-lg border border-border p-3 text-sm resize-none h-20 bg-background focus:ring-2 focus:ring-primary/40 focus:outline-none"
              maxLength={500}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {submitted && (
            <Alert variant="info">
              <AlertDescription>Mood logged successfully!</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!selectedMood || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Saving...' : 'Log Mood'}
          </Button>
        </CardContent>
      </Card>

      {/* Mood History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Mood History</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-32 bg-secondary/30 rounded animate-pulse" />
          ) : history.length > 0 ? (
            <div className="space-y-4">
              {/* Mini chart */}
              <div className="flex items-end gap-1 h-24">
                {history.map((log) => {
                  const height = (log.moodScore / 5) * 100;
                  const moodOption = MOOD_OPTIONS[log.moodScore - 1];
                  return (
                    <div
                      key={log.id}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`${moodOption?.label ?? log.moodScore}/5 — ${new Date(log.logDate).toLocaleDateString()}${log.note ? `: ${log.note}` : ''}`}
                    >
                      <div
                        className="w-full rounded-t transition-all min-w-[4px]"
                        style={{
                          height: `${height}%`,
                          backgroundColor: moodOption?.color ?? '#6b7280',
                          minHeight: '4px',
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Recent entries list */}
              <div className="space-y-2">
                {history.slice(-7).reverse().map((log) => {
                  const moodOption = MOOD_OPTIONS[log.moodScore - 1];
                  return (
                    <div key={log.id} className="flex items-center justify-between p-2 rounded border text-sm">
                      <div className="flex items-center gap-2">
                        <span>{moodOption?.emoji}</span>
                        <span className="text-muted-foreground">
                          {new Date(log.logDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {log.note && (
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {log.note}
                          </span>
                        )}
                        <Badge variant="outline" style={{ color: moodOption?.color }}>
                          {moodOption?.label}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No mood entries yet. Start tracking by logging your mood above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
