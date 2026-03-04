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
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                No assessment sessions yet. Start your first assessment to see your history here.
              </p>
              <Link href="/psych">
                <Button>Start an Assessment</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
