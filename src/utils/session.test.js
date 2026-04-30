import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getSession, setSession, clearSession } from './session';

describe('session utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getSession', () => {
    it('returns null when no session exists in localStorage', () => {
      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns a valid session object when one exists in localStorage', () => {
      const sessionData = {
        username: 'jdoe',
        role: 'user',
        displayName: 'Jane Doe',
      };
      localStorage.setItem('writespace_session', JSON.stringify(sessionData));

      const session = getSession();
      expect(session).toEqual(sessionData);
      expect(session.username).toBe('jdoe');
      expect(session.role).toBe('user');
      expect(session.displayName).toBe('Jane Doe');
    });

    it('returns an admin session correctly', () => {
      const sessionData = {
        username: 'admin',
        role: 'admin',
        displayName: 'Admin',
      };
      localStorage.setItem('writespace_session', JSON.stringify(sessionData));

      const session = getSession();
      expect(session).toEqual(sessionData);
      expect(session.role).toBe('admin');
    });

    it('returns null when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_session', 'not-valid-json{{{');

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session object is missing username', () => {
      const sessionData = {
        role: 'user',
        displayName: 'Jane Doe',
      };
      localStorage.setItem('writespace_session', JSON.stringify(sessionData));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session object is missing role', () => {
      const sessionData = {
        username: 'jdoe',
        displayName: 'Jane Doe',
      };
      localStorage.setItem('writespace_session', JSON.stringify(sessionData));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when session object is missing displayName', () => {
      const sessionData = {
        username: 'jdoe',
        role: 'user',
      };
      localStorage.setItem('writespace_session', JSON.stringify(sessionData));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains a non-object value', () => {
      localStorage.setItem('writespace_session', JSON.stringify('just a string'));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null when localStorage contains null', () => {
      localStorage.setItem('writespace_session', JSON.stringify(null));

      const session = getSession();
      expect(session).toBeNull();
    });

    it('returns null and handles error when localStorage.getItem throws', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const session = getSession();
      expect(session).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('setSession', () => {
    it('saves a valid session object to localStorage', () => {
      const sessionData = {
        username: 'jdoe',
        role: 'user',
        displayName: 'Jane Doe',
      };

      setSession(sessionData);

      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual(sessionData);
    });

    it('saves an admin session to localStorage', () => {
      const sessionData = {
        username: 'admin',
        role: 'admin',
        displayName: 'Admin',
      };

      setSession(sessionData);

      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual(sessionData);
    });

    it('only stores username, role, and displayName fields', () => {
      const sessionData = {
        username: 'jdoe',
        role: 'user',
        displayName: 'Jane Doe',
        extraField: 'should not be stored',
      };

      setSession(sessionData);

      const stored = JSON.parse(localStorage.getItem('writespace_session'));
      expect(stored).toEqual({
        username: 'jdoe',
        role: 'user',
        displayName: 'Jane Doe',
      });
      expect(stored.extraField).toBeUndefined();
    });

    it('throws an error when session object is null', () => {
      expect(() => setSession(null)).toThrow('Invalid session object');
    });

    it('throws an error when session object is undefined', () => {
      expect(() => setSession(undefined)).toThrow('Invalid session object');
    });

    it('throws an error when username is missing', () => {
      expect(() =>
        setSession({ role: 'user', displayName: 'Jane' })
      ).toThrow('Invalid session object');
    });

    it('throws an error when role is missing', () => {
      expect(() =>
        setSession({ username: 'jdoe', displayName: 'Jane' })
      ).toThrow('Invalid session object');
    });

    it('throws an error when displayName is missing', () => {
      expect(() =>
        setSession({ username: 'jdoe', role: 'user' })
      ).toThrow('Invalid session object');
    });

    it('throws an error when username is not a string', () => {
      expect(() =>
        setSession({ username: 123, role: 'user', displayName: 'Jane' })
      ).toThrow('Invalid session object');
    });

    it('throws an error when localStorage.setItem fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() =>
        setSession({ username: 'jdoe', role: 'user', displayName: 'Jane Doe' })
      ).toThrow('Failed to save session');
    });
  });

  describe('clearSession', () => {
    it('removes the session from localStorage', () => {
      localStorage.setItem(
        'writespace_session',
        JSON.stringify({ username: 'jdoe', role: 'user', displayName: 'Jane Doe' })
      );

      clearSession();

      expect(localStorage.getItem('writespace_session')).toBeNull();
    });

    it('does not throw when no session exists', () => {
      expect(() => clearSession()).not.toThrow();
    });

    it('handles localStorage.removeItem failure gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      expect(() => clearSession()).not.toThrow();
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('round-trip', () => {
    it('setSession followed by getSession returns the same data', () => {
      const sessionData = {
        username: 'testuser',
        role: 'user',
        displayName: 'Test User',
      };

      setSession(sessionData);
      const retrieved = getSession();

      expect(retrieved).toEqual(sessionData);
    });

    it('setSession followed by clearSession followed by getSession returns null', () => {
      setSession({ username: 'jdoe', role: 'user', displayName: 'Jane Doe' });
      clearSession();
      const session = getSession();

      expect(session).toBeNull();
    });
  });
});