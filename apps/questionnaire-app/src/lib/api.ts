import {
  AssessmentToolType,
  ScoredResult,
} from '@psychassess/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3029';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Types ────────────────────────────────────────────────────

export interface StartAssessmentResponse {
  sessionId: string;
  toolType: AssessmentToolType;
  toolName: string;
  fullName: string;
  domain: string;
  description: string;
  totalQuestions: number;
}

export interface SubmitResponseResult {
  responseId: string;
  questionId: string;
  answeredCount: number;
  totalQuestions: number;
  isComplete: boolean;
}

export interface AssessmentResultResponse extends ScoredResult {
  resultId: string;
}

export interface ScoreHistoryEntry {
  id: string;
  clientId: string;
  toolType: string;
  score: number;
  severityBand: string;
  assessedAt: string;
  sessionId?: string;
}

export interface MoodLogEntry {
  id: string;
  clientId: string;
  logDate: string;
  moodScore: number;
  note?: string;
  tags: string[];
}

export interface ClientSummary {
  totalSessions: number;
  latestScores: ScoreHistoryEntry[];
  recentMoodLogs: MoodLogEntry[];
  activeCrisisEvents: number;
}

export interface SessionEntry {
  id: string;
  clientId: string;
  toolType: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  result?: AssessmentResultResponse;
}

export interface ToolInfo {
  type: AssessmentToolType;
  name: string;
  fullName: string;
  domain: string;
  description: string;
  itemCount: number;
  guideline: string;
}

// ─── Assessment API ────────────────────────────────────────────

export function getAvailableTools() {
  return request<ToolInfo[]>('/assessments/tools');
}

export function startAssessment(clientId: string, toolType: string) {
  return request<StartAssessmentResponse>('/assessments/start', {
    method: 'POST',
    body: JSON.stringify({ clientId, toolType }),
  });
}

export function submitResponse(
  sessionId: string,
  questionId: string,
  responseValue: number,
  responseText: string,
) {
  return request<SubmitResponseResult>(`/assessments/${sessionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ questionId, responseValue, responseText }),
  });
}

export function completeAssessment(sessionId: string) {
  return request<AssessmentResultResponse>(`/assessments/${sessionId}/complete`, {
    method: 'POST',
  });
}

export function getResult(sessionId: string) {
  return request<AssessmentResultResponse>(`/assessments/${sessionId}/result`);
}

export function getClientHistory(clientId: string, toolType?: string) {
  const params = toolType ? `?toolType=${toolType}` : '';
  return request<ScoreHistoryEntry[]>(`/assessments/client/${clientId}/history${params}`);
}

export function getClientSessions(clientId: string) {
  return request<SessionEntry[]>(`/assessments/client/${clientId}/sessions`);
}

// ─── Crisis API ────────────────────────────────────────────────

export function getCrisisResources() {
  return request<{ name: string; phone: string; availability: string }[]>('/crisis/resources');
}

// ─── Mood API ──────────────────────────────────────────────────

export function logMood(clientId: string, moodScore: number, note?: string, tags?: string[]) {
  return request<MoodLogEntry>(`/mood/${clientId}`, {
    method: 'POST',
    body: JSON.stringify({ moodScore, note, tags }),
  });
}

export function getMoodHistory(clientId: string, days = 30) {
  return request<MoodLogEntry[]>(`/mood/${clientId}?days=${days}`);
}

// ─── History API ───────────────────────────────────────────────

export function getScoreTimeline(clientId: string, toolType?: string) {
  const params = toolType ? `?toolType=${toolType}` : '';
  return request<ScoreHistoryEntry[]>(`/history/${clientId}/timeline${params}`);
}

export function getClientSummary(clientId: string) {
  return request<ClientSummary>(`/history/${clientId}/summary`);
}
