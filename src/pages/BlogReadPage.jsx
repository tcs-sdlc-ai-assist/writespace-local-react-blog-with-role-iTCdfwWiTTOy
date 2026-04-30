import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession } from '../utils/session';
import { findBlog, deleteBlog } from '../utils/blogs';
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
      month: 'long',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr || '';
  }
}

/**
 * Blog read page component rendered at '/blogs/:id'.
 * Displays full post with title, author avatar, display name, date, and content.
 * Admin sees edit/delete on all posts; user only on own posts.
 * Delete uses ConfirmDialog and removes from localStorage.
 * Invalid/missing ID shows 'Post not found' message with back link.
 * @returns {JSX.Element}
 */
export default function BlogReadPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    try {
      const currentSession = getSession();
      setSession(currentSession);

      const blog = findBlog(id);
      setPost(blog);
    } catch (e) {
      console.error('Failed to load blog post:', e);
      setError('Failed to load blog post. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const canEdit =
    session &&
    post &&
    (session.role === 'admin' || session.username === post.author);

  function handleDelete() {
    setDeleteError('');
    try {
      deleteBlog(post.id, { username: session.username, role: session.role });
      navigate('/blogs', { replace: true });
    } catch (e) {
      console.error('Failed to delete blog post:', e);
      setDeleteError(e.message || 'Failed to delete blog post. Please try again.');
      setShowConfirm(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-500">Loading post…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="p-4 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{error}</p>
        </div>
        <div className="mt-6">
          <Link
            to="/blogs"
            className="text-sm font-medium text-ws-indigo-600 hover:text-ws-indigo-700 transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Post not found
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            The blog post you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors"
          >
            ← Back to all posts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Link
          to="/blogs"
          className="text-sm font-medium text-ws-indigo-600 hover:text-ws-indigo-700 transition-colors"
        >
          ← Back to all posts
        </Link>
      </div>

      {deleteError && (
        <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
          <p className="text-sm text-red-700">{deleteError}</p>
        </div>
      )}

      <article className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
        <header className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Avatar role={post.authorRole} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900">
                  {post.authorDisplay}
                </span>
                <time
                  dateTime={post.created}
                  className="text-xs text-gray-500"
                >
                  {formatDate(post.created)}
                  {post.updated && post.updated !== post.created && (
                    <span className="ml-1 text-gray-400">
                      (edited {formatDate(post.updated)})
                    </span>
                  )}
                </time>
              </div>
            </div>
            {canEdit && (
              <div className="flex items-center gap-2">
                <Link
                  to={`/blogs/${post.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-ws-indigo-700 bg-ws-indigo-50 rounded-md hover:bg-ws-indigo-100 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 transition-colors"
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
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
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
                  Delete
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="border-t border-gray-100 pt-6">
          <div className="prose prose-sm sm:prose max-w-none text-gray-700 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>
        </div>
      </article>

      {showConfirm && (
        <ConfirmDialog
          title="Delete Post"
          message={`Are you sure you want to delete "${post.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDelete}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}