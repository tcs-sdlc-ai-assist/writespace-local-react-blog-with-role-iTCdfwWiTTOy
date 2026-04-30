import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSession } from '../utils/session';
import { getUsers, addUser, deleteUser } from '../utils/users';
import Avatar from '../components/Avatar';
import ConfirmDialog from '../components/ConfirmDialog';

/**
 * Formats an ISO date string to a human-readable format.
 * @param {string} dateStr - ISO date string.
 * @returns {string} Formatted date string.
 */
function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr || '';
  }
}

/**
 * Admin-only user management page rendered at '/admin/users'.
 * Displays a responsive table/card list of all users with avatar, display name,
 * username, role badge, created date, and delete button.
 * Includes a create user form with display name, username, password, and role fields.
 * Hardcoded admin user is shown but cannot be deleted.
 * Logged-in admin cannot delete their own account.
 * Non-admins are redirected to '/blogs'.
 * @returns {JSX.Element}
 */
export default function UserManagement() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState('');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }

    if (currentSession.role !== 'admin') {
      navigate('/blogs', { replace: true });
      return;
    }

    setSession(currentSession);

    try {
      const allUsers = getUsers();
      setUsers(allUsers);
    } catch (e) {
      console.error('Failed to load users:', e);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  function handleCreateUser(e) {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');
    setFormLoading(true);

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password;

    if (!trimmedDisplayName) {
      setFormError('Display name is required');
      setFormLoading(false);
      return;
    }

    if (trimmedDisplayName.length < 2) {
      setFormError('Display name must be at least 2 characters');
      setFormLoading(false);
      return;
    }

    if (!trimmedUsername) {
      setFormError('Username is required');
      setFormLoading(false);
      return;
    }

    if (trimmedUsername.length < 3) {
      setFormError('Username must be at least 3 characters');
      setFormLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setFormError('Password is required');
      setFormLoading(false);
      return;
    }

    if (trimmedPassword.length < 4) {
      setFormError('Password must be at least 4 characters');
      setFormLoading(false);
      return;
    }

    try {
      addUser({
        username: trimmedUsername,
        displayName: trimmedDisplayName,
        password: trimmedPassword,
        role: role,
      });

      const updatedUsers = getUsers();
      setUsers(updatedUsers);

      setDisplayName('');
      setUsername('');
      setPassword('');
      setRole('user');
      setFormSuccess(`User "${trimmedDisplayName}" created successfully.`);
    } catch (err) {
      console.error('Failed to create user:', err);
      setFormError(err.message || 'Failed to create user. Please try again.');
    } finally {
      setFormLoading(false);
    }
  }

  function handleDeleteClick(user) {
    setDeleteTarget(user);
    setDeleteError('');
  }

  function handleDeleteConfirm() {
    if (!deleteTarget || !session) {
      return;
    }

    try {
      deleteUser(deleteTarget.username, session.username);
      const updatedUsers = getUsers();
      setUsers(updatedUsers);
      setDeleteTarget(null);
      setDeleteError('');
    } catch (err) {
      console.error('Failed to delete user:', err);
      setDeleteError(err.message || 'Failed to delete user. Please try again.');
      setDeleteTarget(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteTarget(null);
    setDeleteError('');
  }

  // Build the full user list including the hardcoded admin
  const hardcodedAdmin = {
    username: 'admin',
    displayName: 'Admin',
    role: 'admin',
    created: '',
  };

  const allUsersWithAdmin = [hardcodedAdmin, ...users];

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-500">Loading users…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage platform users. Create new accounts or remove existing ones.
        </p>
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                All Users ({allUsersWithAdmin.length})
              </h2>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {allUsersWithAdmin.map((user) => {
                    const isHardcodedAdmin = user.username === 'admin' && !user.password;
                    const isSelf = session && user.username === session.username;
                    const canDelete = !isHardcodedAdmin && !isSelf;

                    return (
                      <tr
                        key={user.username}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <Avatar role={user.role} />
                            <span className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-600">
                            {user.username}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              user.role === 'admin'
                                ? 'bg-ws-violet-100 text-ws-violet-800'
                                : 'bg-ws-indigo-100 text-ws-indigo-800'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-500">
                            {user.created ? formatDate(user.created) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {canDelete ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(user)}
                              className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                              title="Delete user"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {allUsersWithAdmin.map((user) => {
                const isHardcodedAdmin = user.username === 'admin' && !user.password;
                const isSelf = session && user.username === session.username;
                const canDelete = !isHardcodedAdmin && !isSelf;

                return (
                  <div
                    key={user.username}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar role={user.role} />
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-gray-900">
                            {user.displayName}
                          </span>
                          <span className="text-xs text-gray-500">
                            @{user.username}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            user.role === 'admin'
                              ? 'bg-ws-violet-100 text-ws-violet-800'
                              : 'bg-ws-indigo-100 text-ws-indigo-800'
                          }`}
                        >
                          {user.role}
                        </span>
                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(user)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Delete user"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                    {user.created && (
                      <p className="mt-2 text-xs text-gray-400 ml-11">
                        Joined {formatDate(user.created)}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create User Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Create New User
            </h2>

            {formError && (
              <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
                <p className="text-sm text-red-700">{formError}</p>
              </div>
            )}

            {formSuccess && (
              <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200">
                <p className="text-sm text-green-700">{formSuccess}</p>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label
                  htmlFor="newDisplayName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Display Name
                </label>
                <input
                  id="newDisplayName"
                  name="newDisplayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                  placeholder="Enter display name"
                />
              </div>

              <div>
                <label
                  htmlFor="newUsername"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <input
                  id="newUsername"
                  name="newUsername"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                  placeholder="Choose a username"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label
                  htmlFor="newRole"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <select
                  id="newRole"
                  name="newRole"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {formLoading ? 'Creating…' : 'Create User'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirm Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete User"
          message={`Are you sure you want to delete user "${deleteTarget.displayName}" (@${deleteTarget.username})? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}