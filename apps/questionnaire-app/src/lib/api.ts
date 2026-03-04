const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3029';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ─── Assessment API ────────────────────────────────────────────

export function getAvailableTools() {
  return request<any[]>('/assessments/tools');
}

export function startAssessment(clientId: string, toolType: string) {
  return request<any>('/assessments/start', {
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
  return request<any>(`/assessments/${sessionId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ questionId, responseValue, responseText }),
  });
}

export function completeAssessment(sessionId: string) {
  return request<any>(`/assessments/${sessionId}/complete`, {
    method: 'POST',
  });
}

export function getResult(sessionId: string) {
  return request<any>(`/assessments/${sessionId}/result`);
}

export function getClientHistory(clientId: string, toolType?: string) {
  const params = toolType ? `?toolType=${toolType}` : '';
  return request<any[]>(`/assessments/client/${clientId}/history${params}`);
}

export function getClientSessions(clientId: string) {
  return request<any[]>(`/assessments/client/${clientId}/sessions`);
}

// ─── Crisis API ────────────────────────────────────────────────

export function getCrisisResources() {
  return request<any[]>('/crisis/resources');
}

// ─── Mood API ──────────────────────────────────────────────────

export function logMood(clientId: string, moodScore: number, note?: string) {
  return request<any>(`/mood/${clientId}`, {
    method: 'POST',
    body: JSON.stringify({ moodScore, note }),
  });
}

export function getMoodHistory(clientId: string, days = 30) {
  return request<any[]>(`/mood/${clientId}?days=${days}`);
}

// ─── History API ───────────────────────────────────────────────

export function getScoreTimeline(clientId: string, toolType?: string) {
  const params = toolType ? `?toolType=${toolType}` : '';
  return request<any[]>(`/history/${clientId}/timeline${params}`);
}

export function getClientSummary(clientId: string) {
  return request<any>(`/history/${clientId}/summary`);
}
