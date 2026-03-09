// Auth helper — wraps the backend JWT-based auth into a client-friendly API
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3029';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
}

export interface AuthSession {
  accessToken: string;
  user: AuthUser;
}

async function authRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { ...options?.headers as Record<string, string> };
  if (options?.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `Auth error: ${res.status}`);
  }

  return res.json();
}

export async function register(email: string, password: string, name?: string): Promise<AuthSession> {
  return authRequest<AuthSession>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });
}

export async function login(email: string, password: string): Promise<AuthSession> {
  return authRequest<AuthSession>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile(token: string): Promise<AuthUser & { plan: string; subscriptionStatus: string; currentPeriodEnd?: string }> {
  return authRequest('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function migrateData(token: string, oldClientId: string): Promise<{ migrated: number }> {
  return authRequest('/auth/migrate', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ oldClientId }),
  });
}

// ─── Session management (localStorage-based) ─────────────────

const SESSION_KEY = 'psychassess_session';

export function getStoredSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setStoredSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  // Also set the client ID to the user's real ID
  localStorage.setItem('psychassess_client_id', session.user.id);
}

export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken(): string | null {
  return getStoredSession()?.accessToken || null;
}
