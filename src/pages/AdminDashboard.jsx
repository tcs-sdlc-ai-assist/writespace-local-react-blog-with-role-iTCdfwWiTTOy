import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../utils/session';
import { getBlogs, deleteBlog } from '../utils/blogs';
import { getUsers } from '../utils/users';
import Avatar from '../components/Avatar';
import StatCard from '../components/StatCard';
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
 * Truncates content to a specified max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} The truncated text.
 */
function truncate(text, maxLength = 100) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength).trimEnd() + '…';
}

/**
 * Admin-only dashboard page rendered at '/admin'.
 * Displays gradient banner, stat cards, quick-action buttons,
 * and a recent posts section with edit/delete controls.
 * Non-admins are redirected to '/blogs'.
 * @returns {JSX.Element}
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      const allBlogs = getBlogs();
      setPosts(allBlogs);

      const allUsers = getUsers();
      setUsers(allUsers);
    } catch (e) {
      console.error('Failed to load admin dashboard data:', e);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const totalPosts = posts.length;
  const totalUsers = users.length + 1; // +1 for hardcoded admin
  const totalAdmins = users.filter((u) => u.role === 'admin').length + 1; // +1 for hardcoded admin
  const totalRegularUsers = users.filter((u) => u.role === 'user').length;
  const recentPosts = posts.slice(0, 5);

  function handleDeleteClick(post) {
    setDeleteTarget(post);
    setDeleteError('');
  }

  function handleDeleteConfirm() {
    if (!deleteTarget || !session) {
      return;
    }

    try {
      deleteBlog(deleteTarget.id, { username: session.username, role: session.role });
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
      setDeleteError('');
    } catch (e) {
      console.error('Failed to delete blog post:', e);
      setDeleteError(e.message || 'Failed to delete blog post. Please try again.');
      setDeleteTarget(null);
    }
  }

  function handleDeleteCancel() {
    setDeleteTarget(null);
    setDeleteError('');
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-500">Loading dashboard…</p>
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
      {/* Gradient Banner */}
      <div className="rounded-xl bg-gradient-to-r from-ws-violet-600 via-ws-indigo-600 to-ws-indigo-700 p-6 sm:p-8 mb-8 shadow-md">
        <div className="flex items-center gap-4">
          <Avatar role="admin" className="w-12 h-12 text-lg" />
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-indigo-100">
              Welcome back, {session ? session.displayName : 'Admin'}. Here&apos;s an overview of your platform.
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total Posts"
          value={totalPosts}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Users"
          value={totalUsers}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          }
        />
        <StatCard
          label="Total Admins"
          value={totalAdmins}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          }
        />
        <StatCard
          label="Regular Users"
          value={totalRegularUsers}
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Link
          to="/blogs/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Write New Post
        </Link>
        <Link
          to="/admin/users"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-ws-indigo-700 bg-ws-indigo-50 border border-ws-indigo-200 rounded-md hover:bg-ws-indigo-100 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors"
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
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
          Manage Users
        </Link>
      </div>

      {/* Delete Error */}
      {deleteError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      {/* Recent Posts */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Posts</h2>
          <Link
            to="/blogs"
            className="text-sm font-medium text-ws-indigo-600 hover:text-ws-indigo-700 transition-colors"
          >
            View All →
          </Link>
        </div>

        {recentPosts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </div>
            <p className="text-sm text-gray-500 mb-4">No posts yet. Create the first one!</p>
            <Link
              to="/blogs/new"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Write Your First Post
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <Avatar role={post.authorRole} />
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/blogs/${post.id}`}
                      className="text-sm font-medium text-gray-900 hover:text-ws-indigo-700 transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {post.authorDisplay} · {formatDate(post.created)}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {truncate(post.content, 100)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <Link
                    to={`/blogs/${post.id}/edit`}
                    className="p-1.5 text-gray-400 hover:text-ws-indigo-600 rounded-md hover:bg-ws-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ws-indigo-500"
                    title="Edit post"
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
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDeleteClick(post)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                    title="Delete post"
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirm Dialog */}
      {deleteTarget && (
        <ConfirmDialog
          title="Delete Post"
          message={`Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}
    </div>
  );
}