const STORAGE_KEY = 'writespace_users';

/**
 * Retrieves all users from localStorage.
 * @returns {Array<{ username: string, displayName: string, password: string, role: string, created: string }>} Array of user objects.
 */
export function getUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const users = JSON.parse(raw);
    if (!Array.isArray(users)) {
      return [];
    }
    return users;
  } catch (e) {
    console.error('Failed to read users from localStorage:', e);
    return [];
  }
}

/**
 * Finds a user by username.
 * @param {string} username - The username to search for.
 * @returns {{ username: string, displayName: string, password: string, role: string, created: string } | null} The user object or null if not found.
 */
export function findUser(username) {
  if (!username || typeof username !== 'string') {
    return null;
  }
  const users = getUsers();
  const user = users.find((u) => u.username === username);
  return user || null;
}

/**
 * Adds a new user to localStorage.
 * @param {{ username: string, displayName: string, password: string, role: string }} user - The user to add.
 * @throws {Error} If validation fails, username already exists, or localStorage write fails.
 */
export function addUser(user) {
  if (!user || typeof user !== 'object') {
    throw new Error('Invalid user object');
  }

  const { username, displayName, password, role } = user;

  if (!username || typeof username !== 'string' || username.trim().length < 3) {
    throw new Error('Username is required and must be at least 3 characters');
  }

  if (!displayName || typeof displayName !== 'string' || displayName.trim().length < 2) {
    throw new Error('Display name is required and must be at least 2 characters');
  }

  if (!password || typeof password !== 'string' || password.length < 4) {
    throw new Error('Password is required and must be at least 4 characters');
  }

  if (!role || typeof role !== 'string') {
    throw new Error('Role is required');
  }

  const trimmedUsername = username.trim().toLowerCase();

  if (trimmedUsername === 'admin') {
    throw new Error('Username "admin" is reserved');
  }

  const users = getUsers();

  if (users.some((u) => u.username === trimmedUsername)) {
    throw new Error('Username already exists');
  }

  const newUser = {
    username: trimmedUsername,
    displayName: displayName.trim(),
    password: password,
    role: role,
    created: new Date().toISOString(),
  };

  users.push(newUser);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to write users to localStorage:', e);
    throw new Error('Failed to save user. localStorage may be full or unavailable.');
  }
}

/**
 * Deletes a user by username.
 * @param {string} username - The username of the user to delete.
 * @param {string} currentUsername - The username of the currently logged-in user.
 * @throws {Error} If the user is admin, is the current user, is not found, or localStorage write fails.
 */
export function deleteUser(username, currentUsername) {
  if (!username || typeof username !== 'string') {
    throw new Error('Username is required');
  }

  if (username === 'admin') {
    throw new Error('Cannot delete the admin user');
  }

  if (username === currentUsername) {
    throw new Error('Cannot delete your own account');
  }

  const users = getUsers();
  const index = users.findIndex((u) => u.username === username);

  if (index === -1) {
    throw new Error('User not found');
  }

  users.splice(index, 1);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to write users to localStorage:', e);
    throw new Error('Failed to delete user. localStorage may be full or unavailable.');
  }
}