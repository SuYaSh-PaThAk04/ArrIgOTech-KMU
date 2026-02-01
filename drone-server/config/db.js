const sessions = new Map();

/**
 * Session structure:
 * {
 *  sessionId,
 *  status,
 *  rawVideoKey,
 *  analysis,
 *  createdAt,
 *  endedAt
 * }
 */

export function createSession(session) {
  sessions.set(session.sessionId, session);
  return session;
}

export function getSession(sessionId) {
  return sessions.get(sessionId) || null;
}

export function updateSession(sessionId, updates) {
  const existing = sessions.get(sessionId);
  if (!existing) return null;

  const updated = { ...existing, ...updates };
  sessions.set(sessionId, updated);
  return updated;
}

export function listSessions() {
  return Array.from(sessions.values());
}
