'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getSeverityColor } from '@/lib/utils';
import { getClientSessions, type SessionEntry } from '@/lib/api';
import { ASSESSMENT_TOOLS, AssessmentToolType } from '@psychassess/shared';

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: '#22c55e',
  IN_PROGRESS: '#3b82f6',
  ABANDONED: '#6b7280',
  NOT_STARTED: '#9ca3af',
};

export default function HistoryPage() {
  const [sessions, setSessions] = useState<SessionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = useMemo(() => {
    if (typeof window === 'undefined') return 'demo-client';
    return localStorage.getItem('psychassess_client_id') || 'demo-client';
  }, []);

  useEffect(() => {
    getClientSessions(clientId)
      .then(setSessions)
      .catch(() => setError('Failed to load session history. The backend may not be available.'))
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-56 bg-secondary rounded animate-pulse" />
          <div className="h-4 w-80 bg-secondary rounded animate-pulse" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="h-16 bg-secondary/30 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Assessment History</h1>
        <p className="text-muted-foreground">
          View all your past assessment sessions and results.
        </p>
      </div>

      {error && (
        <Alert variant="warning">
          <AlertTitle>Unable to Load</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {sessions.length > 0 ? (
        <div className="space-y-3">
          {sessions.map((session) => {
            const tool = ASSESSMENT_TOOLS[session.toolType as AssessmentToolType];
            const isCompleted = session.status === 'COMPLETED';
            return (
              <Card key={session.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{tool?.name || session.toolType}</p>
                        <Badge
                          variant="outline"
                          style={{
                            color: STATUS_COLORS[session.status] || '#6b7280',
                            borderColor: STATUS_COLORS[session.status] || '#6b7280',
                          }}
                        >
                          {session.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.startedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {isCompleted && session.result && (
                        <div className="text-right">
                          <p
                            className="text-xl font-bold"
                            style={{ color: getSeverityColor(session.result.severityBand) }}
                          >
                            {session.result.totalScore}
                          </p>
                          <Badge
                            variant="outline"
                            style={{
                              fontSize: '0.65rem',
                              color: getSeverityColor(session.result.severityBand),
                            }}
                          >
                            {session.result.severityLabel}
                          </Badge>
                        </div>
                      )}
                      {isCompleted && (
                        <Link href={`/psych/results/${session.id}`}>
                          <Button size="sm" variant="outline">View</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : !error ? (
        <Card className="border-dashed border-2">
          <CardContent className="pt-8 pb-8">
            <div className="text-center space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
                <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">No Sessions Yet</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                  Your completed assessments will appear here with scores, dates, and severity bands.
                  Start building your mental health history today.
                </p>
              </div>
              <Link href="/psych">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                  Start Your First Assessment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
