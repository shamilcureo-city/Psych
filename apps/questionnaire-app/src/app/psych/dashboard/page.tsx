'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { getSeverityColor } from '@/lib/utils';
import { getScoreTimeline, getClientSummary } from '@/lib/api';
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
  const [summary, setSummary] = useState<any>(null);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const clientId =
    typeof window !== 'undefined'
      ? localStorage.getItem('psychassess_client_id') || 'demo-client'
      : 'demo-client';

  useEffect(() => {
    Promise.all([
      getClientSummary(clientId).catch(() => null),
      getScoreTimeline(clientId, selectedTool || undefined).catch(() => []),
    ])
      .then(([sum, tl]) => {
        setSummary(sum);
        setTimeline(tl);
      })
      .finally(() => setLoading(false));
  }, [clientId, selectedTool]);

  // Format timeline data for Recharts
  const chartData = timeline.map((entry: any) => ({
    date: new Date(entry.assessedAt).toLocaleDateString(),
    score: entry.score,
    tool: entry.toolType,
    band: entry.severityBand,
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mental Health Dashboard</h1>
        <p className="text-muted-foreground">
          Track your assessment scores over time and monitor your progress.
        </p>
      </div>

      {loading ? (
        <p className="text-muted-foreground text-center py-10">Loading dashboard...</p>
      ) : (
        <>
          {/* Summary Cards */}
          {summary && (
            <div className="grid gap-4 md:grid-cols-3">
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
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {summary.latestScores.map((score: any) => {
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Score Trends</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  <Button
                    size="sm"
                    variant={selectedTool === null ? 'default' : 'outline'}
                    onClick={() => setSelectedTool(null)}
                  >
                    All
                  </Button>
                  {Object.values(AssessmentToolType).map((tt) => (
                    <Button
                      key={tt}
                      size="sm"
                      variant={selectedTool === tt ? 'default' : 'outline'}
                      onClick={() => setSelectedTool(tt)}
                    >
                      {ASSESSMENT_TOOLS[tt]?.name || tt}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke={selectedTool ? TOOL_COLORS[selectedTool] || '#3b82f6' : '#3b82f6'}
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[200px] text-muted-foreground">
                  <p>No assessment data yet. Complete an assessment to see your trends.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* No data state */}
          {!summary && timeline.length === 0 && (
            <Alert variant="info">
              <AlertTitle>No Data Yet</AlertTitle>
              <AlertDescription>
                Complete your first assessment to start tracking your mental health over time.
                Your scores will appear here as a longitudinal trend.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
