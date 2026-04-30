import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getUsers, addUser, deleteUser, findUser } from './users';

describe('users utility', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('getUsers', () => {
    it('returns an empty array when no users exist in localStorage', () => {
      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an array of users when users exist in localStorage', () => {
      const usersData = [
        {
          username: 'jdoe',
          displayName: 'Jane Doe',
          password: 'pass1234',
          role: 'user',
          created: '2024-06-01T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(usersData));

      const users = getUsers();
      expect(users).toEqual(usersData);
      expect(users).toHaveLength(1);
    });

    it('returns an empty array when localStorage contains invalid JSON', () => {
      localStorage.setItem('writespace_users', 'not-valid-json{{{');

      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array when localStorage contains a non-array value', () => {
      localStorage.setItem('writespace_users', JSON.stringify({ foo: 'bar' }));

      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array when localStorage contains null', () => {
      localStorage.setItem('writespace_users', JSON.stringify(null));

      const users = getUsers();
      expect(users).toEqual([]);
    });

    it('returns an empty array and handles error when localStorage.getItem throws', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('localStorage unavailable');
      });

      const users = getUsers();
      expect(users).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });

  describe('findUser', () => {
    it('returns null when no users exist', () => {
      const user = findUser('jdoe');
      expect(user).toBeNull();
    });

    it('returns the user object when the username exists', () => {
      const usersData = [
        {
          username: 'jdoe',
          displayName: 'Jane Doe',
          password: 'pass1234',
          role: 'user',
          created: '2024-06-01T12:00:00Z',
        },
        {
          username: 'bsmith',
          displayName: 'Bob Smith',
          password: 'pass5678',
          role: 'user',
          created: '2024-06-02T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(usersData));

      const user = findUser('bsmith');
      expect(user).toEqual(usersData[1]);
    });

    it('returns null when the username does not exist', () => {
      const usersData = [
        {
          username: 'jdoe',
          displayName: 'Jane Doe',
          password: 'pass1234',
          role: 'user',
          created: '2024-06-01T12:00:00Z',
        },
      ];
      localStorage.setItem('writespace_users', JSON.stringify(usersData));

      const user = findUser('nonexistent');
      expect(user).toBeNull();
    });

    it('returns null when username is null', () => {
      const user = findUser(null);
      expect(user).toBeNull();
    });

    it('returns null when username is undefined', () => {
      const user = findUser(undefined);
      expect(user).toBeNull();
    });

    it('returns null when username is not a string', () => {
      const user = findUser(123);
      expect(user).toBeNull();
    });

    it('returns null when username is an empty string', () => {
      const user = findUser('');
      expect(user).toBeNull();
    });
  });

  describe('addUser', () => {
    it('adds a valid user to localStorage', () => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('jdoe');
      expect(users[0].displayName).toBe('Jane Doe');
      expect(users[0].password).toBe('pass1234');
      expect(users[0].role).toBe('user');
      expect(users[0].created).toBeDefined();
    });

    it('trims and lowercases the username', () => {
      addUser({
        username: '  JDoe  ',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      const users = getUsers();
      expect(users[0].username).toBe('jdoe');
    });

    it('trims the display name', () => {
      addUser({
        username: 'jdoe',
        displayName: '  Jane Doe  ',
        password: 'pass1234',
        role: 'user',
      });

      const users = getUsers();
      expect(users[0].displayName).toBe('Jane Doe');
    });

    it('adds multiple users to localStorage', () => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      addUser({
        username: 'bsmith',
        displayName: 'Bob Smith',
        password: 'pass5678',
        role: 'user',
      });

      const users = getUsers();
      expect(users).toHaveLength(2);
    });

    it('throws an error when username already exists', () => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      expect(() =>
        addUser({
          username: 'jdoe',
          displayName: 'John Doe',
          password: 'pass5678',
          role: 'user',
        })
      ).toThrow('Username already exists');
    });

    it('throws an error when username is "admin"', () => {
      expect(() =>
        addUser({
          username: 'admin',
          displayName: 'Admin User',
          password: 'pass1234',
          role: 'admin',
        })
      ).toThrow('Username "admin" is reserved');
    });

    it('throws an error when username is "Admin" (case-insensitive)', () => {
      expect(() =>
        addUser({
          username: 'Admin',
          displayName: 'Admin User',
          password: 'pass1234',
          role: 'admin',
        })
      ).toThrow('Username "admin" is reserved');
    });

    it('throws an error when user object is null', () => {
      expect(() => addUser(null)).toThrow('Invalid user object');
    });

    it('throws an error when user object is undefined', () => {
      expect(() => addUser(undefined)).toThrow('Invalid user object');
    });

    it('throws an error when username is missing', () => {
      expect(() =>
        addUser({
          displayName: 'Jane Doe',
          password: 'pass1234',
          role: 'user',
        })
      ).toThrow('Username is required and must be at least 3 characters');
    });

    it('throws an error when username is too short', () => {
      expect(() =>
        addUser({
          username: 'ab',
          displayName: 'Jane Doe',
          password: 'pass1234',
          role: 'user',
        })
      ).toThrow('Username is required and must be at least 3 characters');
    });

    it('throws an error when displayName is missing', () => {
      expect(() =>
        addUser({
          username: 'jdoe',
          password: 'pass1234',
          role: 'user',
        })
      ).toThrow('Display name is required and must be at least 2 characters');
    });

    it('throws an error when displayName is too short', () => {
      expect(() =>
        addUser({
          username: 'jdoe',
          displayName: 'J',
          password: 'pass1234',
          role: 'user',
        })
      ).toThrow('Display name is required and must be at least 2 characters');
    });

    it('throws an error when password is missing', () => {
      expect(() =>
        addUser({
          username: 'jdoe',
          displayName: 'Jane Doe',
          role: 'user',
        })
      ).toThrow('Password is required and must be at least 4 characters');
    });

    it('throws an error when password is too short', () => {
      expect(() =>
        addUser({
          username: 'jdoe',
          displayName: 'Jane Doe',
          password: 'abc',
          role: 'user',
        })
      ).toThrow('Password is required and must be at least 4 characters');
    });

    it('throws an error when role is missing', () => {
      expect(() =>
        addUser({
          username: 'jdoe',
          displayName: 'Jane Doe',
          password: 'pass1234',
        })
      ).toThrow('Role is required');
    });

    it('throws an error when localStorage.setItem fails', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() =>
        addUser({
          username: 'jdoe',
          displayName: 'Jane Doe',
          password: 'pass1234',
          role: 'user',
        })
      ).toThrow('Failed to save user');
    });

    it('sets a created timestamp on the new user', () => {
      const before = new Date().toISOString();

      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      const after = new Date().toISOString();
      const users = getUsers();
      expect(users[0].created).toBeDefined();
      expect(users[0].created >= before).toBe(true);
      expect(users[0].created <= after).toBe(true);
    });
  });

  describe('deleteUser', () => {
    beforeEach(() => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });
      addUser({
        username: 'bsmith',
        displayName: 'Bob Smith',
        password: 'pass5678',
        role: 'user',
      });
    });

    it('deletes an existing user from localStorage', () => {
      deleteUser('jdoe', 'admin');

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('bsmith');
    });

    it('throws an error when trying to delete the admin user', () => {
      expect(() => deleteUser('admin', 'admin')).toThrow('Cannot delete the admin user');
    });

    it('throws an error when trying to delete your own account', () => {
      expect(() => deleteUser('jdoe', 'jdoe')).toThrow('Cannot delete your own account');
    });

    it('throws an error when the user is not found', () => {
      expect(() => deleteUser('nonexistent', 'admin')).toThrow('User not found');
    });

    it('throws an error when username is null', () => {
      expect(() => deleteUser(null, 'admin')).toThrow('Username is required');
    });

    it('throws an error when username is undefined', () => {
      expect(() => deleteUser(undefined, 'admin')).toThrow('Username is required');
    });

    it('throws an error when username is not a string', () => {
      expect(() => deleteUser(123, 'admin')).toThrow('Username is required');
    });

    it('throws an error when localStorage.setItem fails during delete', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => deleteUser('jdoe', 'admin')).toThrow('Failed to delete user');
    });

    it('does not affect other users when deleting one user', () => {
      deleteUser('jdoe', 'admin');

      const users = getUsers();
      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('bsmith');
      expect(users[0].displayName).toBe('Bob Smith');
    });
  });

  describe('round-trip', () => {
    it('addUser followed by findUser returns the created user', () => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      const user = findUser('jdoe');
      expect(user).not.toBeNull();
      expect(user.username).toBe('jdoe');
      expect(user.displayName).toBe('Jane Doe');
      expect(user.password).toBe('pass1234');
      expect(user.role).toBe('user');
    });

    it('addUser followed by deleteUser followed by findUser returns null', () => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      deleteUser('jdoe', 'admin');

      const user = findUser('jdoe');
      expect(user).toBeNull();
    });

    it('addUser followed by deleteUser followed by getUsers returns empty array', () => {
      addUser({
        username: 'jdoe',
        displayName: 'Jane Doe',
        password: 'pass1234',
        role: 'user',
      });

      deleteUser('jdoe', 'admin');

      const users = getUsers();
      expect(users).toEqual([]);
    });
  });
});