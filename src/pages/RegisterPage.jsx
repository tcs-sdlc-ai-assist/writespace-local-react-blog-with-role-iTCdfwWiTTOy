import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession, setSession } from '../utils/session';
import { addUser } from '../utils/users';

/**
 * Registration page component rendered at '/register'.
 * Gradient background with centered card UI.
 * Fields for display name, username, password, confirm password.
 * On success, writes user to localStorage, creates session, redirects to '/blogs'.
 * Authenticated users are redirected to their home.
 * @returns {JSX.Element}
 */
export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const session = getSession();
    if (session) {
      if (session.role === 'admin') {
        navigate('/admin/users', { replace: true });
      } else {
        navigate('/blogs', { replace: true });
      }
    }
  }, [navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedDisplayName = displayName.trim();
    const trimmedUsername = username.trim().toLowerCase();
    const trimmedPassword = password;
    const trimmedConfirmPassword = confirmPassword;

    if (!trimmedDisplayName) {
      setError('Display name is required');
      setLoading(false);
      return;
    }

    if (trimmedDisplayName.length < 2) {
      setError('Display name must be at least 2 characters');
      setLoading(false);
      return;
    }

    if (!trimmedUsername) {
      setError('Username is required');
      setLoading(false);
      return;
    }

    if (trimmedUsername.length < 3) {
      setError('Username must be at least 3 characters');
      setLoading(false);
      return;
    }

    if (!trimmedPassword) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (trimmedPassword.length < 4) {
      setError('Password must be at least 4 characters');
      setLoading(false);
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      addUser({
        username: trimmedUsername,
        displayName: trimmedDisplayName,
        password: trimmedPassword,
        role: 'user',
      });

      setSession({
        username: trimmedUsername,
        role: 'user',
        displayName: trimmedDisplayName,
      });

      navigate('/blogs', { replace: true });
    } catch (err) {
      setError(err.message || 'An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ws-violet-600 via-ws-indigo-600 to-ws-indigo-700 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-xl p-8">
          <div className="text-center mb-8">
            <Link
              to="/"
              className="text-2xl font-bold bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 bg-clip-text text-transparent"
            >
              WriteSpace
            </Link>
            <h1 className="mt-4 text-xl font-semibold text-gray-900">
              Create your account
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Join WriteSpace and start writing today
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Display Name
              </label>
              <input
                id="displayName"
                name="displayName"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                placeholder="Enter your display name"
              />
            </div>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
                placeholder="Confirm your password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2.5 px-4 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-ws-indigo-600 hover:text-ws-indigo-700 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}