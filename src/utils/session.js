const STORAGE_KEY = 'writespace_session';

/**
 * Retrieves the current session from localStorage.
 * @returns {{ username: string, role: 'admin'|'user', displayName: string } | null} The session object or null if not found/invalid.
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const session = JSON.parse(raw);
    if (
      session &&
      typeof session.username === 'string' &&
      typeof session.role === 'string' &&
      typeof session.displayName === 'string'
    ) {
      return session;
    }
    return null;
  } catch (e) {
    console.error('Failed to read session from localStorage:', e);
    return null;
  }
}

/**
 * Saves a session object to localStorage.
 * @param {{ username: string, role: string, displayName: string }} sessionObj - The session to persist.
 * @throws {Error} If sessionObj is invalid or localStorage write fails.
 */
export function setSession(sessionObj) {
  if (
    !sessionObj ||
    typeof sessionObj.username !== 'string' ||
    typeof sessionObj.role !== 'string' ||
    typeof sessionObj.displayName !== 'string'
  ) {
    throw new Error('Invalid session object: must include username, role, and displayName');
  }
  try {
    const data = {
      username: sessionObj.username,
      role: sessionObj.role,
      displayName: sessionObj.displayName,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write session to localStorage:', e);
    throw new Error('Failed to save session. localStorage may be full or unavailable.');
  }
}

/**
 * Clears the current session from localStorage.
 */
export function clearSession() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear session from localStorage:', e);
  }
}