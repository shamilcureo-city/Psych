'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getSeverityColor } from '@/lib/utils';
import {
  getScoreTimeline,
  getClientSummary,
  type ClientSummary,
  type ScoreHistoryEntry,
  type MoodLogEntry,
} from '@/lib/api';
import { AssessmentToolType, ASSESSMENT_TOOLS } from '@psychassess/shared';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const TOOL_COLORS: Record<string, string> = {
  PHQ9: '#3b82f6',
  GAD7: '#8b5cf6',
  DASS21: '#ef4444',
  WHO5: '#22c55e',
  PSS10: '#f97316',
  ISI: '#06b6d4',
  PHQ2: '#6366f1',
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<ClientSummary | null>(null);
  const [timeline, setTimeline] = useState<ScoreHistoryEntry[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clientId = useMemo(() => {
    if (typeof window === 'undefined') return 'demo-client';
    return localStorage.getItem('psychassess_client_id') || 'demo-client';
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getClientSummary(clientId).catch(() => null),
      getScoreTimeline(clientId, selectedTool || undefined).catch(() => []),
    ])
      .then(([sum, tl]) => {
        setSummary(sum);
        setTimeline(tl);
      })
      .catch(() => setError('Failed to load dashboard data'))
      .finally(() => setLoading(false));
  }, [clientId, selectedTool]);

  // Format timeline data for Recharts — group by date with per-tool score keys
  const chartData = useMemo(() => {
    if (selectedTool) {
      // Single tool mode — simple
      return timeline.map((entry) => ({
        date: new Date(entry.assessedAt).toLocaleDateString(),
        [entry.toolType]: entry.score,
      }));
    }

    // All tools mode — pivot by date, one key per tool
    const byDate: Record<string, Record<string, number | string>> = {};
    for (const entry of timeline) {
      const date = new Date(entry.assessedAt).toLocaleDateString();
      if (!byDate[date]) byDate[date] = { date };
      byDate[date][entry.toolType] = entry.score;
    }
    return Object.values(byDate);
  }, [timeline, selectedTool]);

  // Determine which tool types are present in the timeline
  const activeToolTypes = useMemo(() => {
    const types = new Set(timeline.map((e) => e.toolType));
    return Array.from(types);
  }, [timeline]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-secondary rounded animate-pulse" />
          <div className="h-4 w-96 bg-secondary rounded animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                <div className="h-8 w-16 bg-secondary rounded animate-pulse mt-2" />
              </CardHeader>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="h-[300px] bg-secondary/30 rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mental Health Dashboard</h1>
        <p className="text-muted-foreground">
          Track your assessment scores over time and monitor your progress.
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Assessments</CardDescription>
              <CardTitle className="text-3xl">{summary.totalSessions}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Tools Assessed</CardDescription>
              <CardTitle className="text-3xl">
                {summary.latestScores?.length || 0}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Alerts</CardDescription>
              <CardTitle
                className="text-3xl"
                style={{
                  color: summary.activeCrisisEvents > 0 ? '#ef4444' : '#22c55e',
                }}
              >
                {summary.activeCrisisEvents}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Latest Scores */}
      {summary?.latestScores && summary.latestScores.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Latest Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {summary.latestScores.map((score) => {
                const tool = ASSESSMENT_TOOLS[score.toolType as AssessmentToolType];
                return (
                  <div
                    key={score.id}
                    className="flex items-center justify-between p-3 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium text-sm">{tool?.name || score.toolType}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(score.assessedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold" style={{ color: getSeverityColor(score.severityBand) }}>
                        {score.score}
                      </p>
                      <Badge
                        variant="outline"
                        style={{
                          fontSize: '0.65rem',
                          color: getSeverityColor(score.severityBand),
                        }}
                      >
                        {score.severityBand}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Trend Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Score Trends</CardTitle>
            <div className="flex gap-1 flex-wrap" role="group" aria-label="Filter by assessment tool">
              <Button
                size="sm"
                variant={selectedTool === null ? 'default' : 'outline'}
                onClick={() => setSelectedTool(null)}
                aria-pressed={selectedTool === null}
              >
                All
              </Button>
              {Object.values(AssessmentToolType).map((tt) => (
                <Button
                  key={tt}
                  size="sm"
                  variant={selectedTool === tt ? 'default' : 'outline'}
                  onClick={() => setSelectedTool(tt)}
                  aria-pressed={selectedTool === tt}
                >
                  {ASSESSMENT_TOOLS[tt]?.name || tt}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300} aria-label="Score trends chart">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {selectedTool ? (
                  <Line
                    type="monotone"
                    dataKey={selectedTool}
                    name={ASSESSMENT_TOOLS[selectedTool as AssessmentToolType]?.name || selectedTool}
                    stroke={TOOL_COLORS[selectedTool] || '#3b82f6'}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                ) : (
                  activeToolTypes.map((tt) => (
                    <Line
                      key={tt}
                      type="monotone"
                      dataKey={tt}
                      name={ASSESSMENT_TOOLS[tt as AssessmentToolType]?.name || tt}
                      stroke={TOOL_COLORS[tt] || '#6b7280'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                      connectNulls
                    />
                  ))
                )}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-muted-foreground">
              <p>No assessment data yet. Complete an assessment to see your trends.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Mood Logs */}
      {summary?.recentMoodLogs && summary.recentMoodLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Mood</CardTitle>
            <CardDescription>Your last 7 mood entries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-24">
              {summary.recentMoodLogs
                .slice()
                .reverse()
                .map((log: MoodLogEntry) => {
                  const height = (log.moodScore / 5) * 100;
                  const colors = ['', '#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];
                  return (
                    <div key={log.id} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t transition-all"
                        style={{
                          height: `${height}%`,
                          backgroundColor: colors[log.moodScore] || '#6b7280',
                          minHeight: '4px',
                        }}
                        title={`${log.moodScore}/5${log.note ? ` — ${log.note}` : ''}`}
                      />
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(log.logDate).toLocaleDateString(undefined, { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No data state */}
      {!summary && timeline.length === 0 && !error && (
        <Alert variant="info">
          <AlertTitle>No Data Yet</AlertTitle>
          <AlertDescription>
            Complete your first assessment to start tracking your mental health over time.
            Your scores will appear here as a longitudinal trend.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
