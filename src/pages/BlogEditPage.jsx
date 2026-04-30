import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getSession } from '../utils/session';
import { findBlog, addBlog, updateBlog } from '../utils/blogs';

const TITLE_MAX = 100;
const CONTENT_MAX = 2000;

/**
 * Blog post create/edit form page.
 * '/blogs/new' for create mode, '/blogs/:id/edit' for edit mode.
 * Fields for title and content with validation and character counters.
 * Create mode generates UUID, sets author info from session, saves to localStorage.
 * Edit mode pre-fills form, updates record, enforces ownership.
 * Cancel button routes back without saving.
 * @returns {JSX.Element}
 */
export default function BlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(isEditMode);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    if (!currentSession) {
      navigate('/login', { replace: true });
      return;
    }

    if (isEditMode) {
      try {
        const blog = findBlog(id);

        if (!blog) {
          setError('Blog post not found');
          setPageLoading(false);
          return;
        }

        if (currentSession.role !== 'admin' && blog.author !== currentSession.username) {
          setError('You are not authorized to edit this post');
          setPageLoading(false);
          return;
        }

        setTitle(blog.title);
        setContent(blog.content);
      } catch (e) {
        console.error('Failed to load blog post for editing:', e);
        setError('Failed to load blog post. Please try again.');
      } finally {
        setPageLoading(false);
      }
    }
  }, [id, isEditMode, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();

    if (!trimmedTitle) {
      setError('Title is required');
      setLoading(false);
      return;
    }

    if (trimmedTitle.length > TITLE_MAX) {
      setError(`Title must be at most ${TITLE_MAX} characters`);
      setLoading(false);
      return;
    }

    if (!trimmedContent) {
      setError('Content is required');
      setLoading(false);
      return;
    }

    if (trimmedContent.length > CONTENT_MAX) {
      setError(`Content must be at most ${CONTENT_MAX} characters`);
      setLoading(false);
      return;
    }

    try {
      if (isEditMode) {
        updateBlog(
          id,
          { title: trimmedTitle, content: trimmedContent },
          { username: session.username, role: session.role }
        );
        navigate(`/blogs/${id}`, { replace: true });
      } else {
        addBlog({
          title: trimmedTitle,
          content: trimmedContent,
          author: session.username,
          authorDisplay: session.displayName,
          authorRole: session.role,
        });
        navigate('/blogs', { replace: true });
      }
    } catch (err) {
      console.error('Failed to save blog post:', err);
      setError(err.message || 'Failed to save blog post. Please try again.');
      setLoading(false);
    }
  }

  if (pageLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-500">Loading…</p>
        </div>
      </div>
    );
  }

  if (error && (error === 'Blog post not found' || error === 'You are not authorized to edit this post')) {
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
            {error}
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            {error === 'Blog post not found'
              ? "The blog post you're trying to edit doesn't exist or may have been removed."
              : "You don't have permission to edit this blog post."}
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
          to={isEditMode ? `/blogs/${id}` : '/blogs'}
          className="text-sm font-medium text-ws-indigo-600 hover:text-ws-indigo-700 transition-colors"
        >
          ← {isEditMode ? 'Back to post' : 'Back to all posts'}
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEditMode ? 'Edit Post' : 'Write a New Post'}
        </h1>

        {error && error !== 'Blog post not found' && error !== 'You are not authorized to edit this post' && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Title
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors"
              placeholder="Enter your post title"
              maxLength={TITLE_MAX}
            />
            <div className="mt-1 flex justify-end">
              <span
                className={`text-xs ${
                  title.trim().length > TITLE_MAX ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                {title.trim().length}/{TITLE_MAX}
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Content
            </label>
            <textarea
              id="content"
              name="content"
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:border-ws-indigo-500 transition-colors resize-y"
              placeholder="Write your blog post content here…"
              maxLength={CONTENT_MAX}
            />
            <div className="mt-1 flex justify-end">
              <span
                className={`text-xs ${
                  content.trim().length > CONTENT_MAX ? 'text-red-600' : 'text-gray-400'
                }`}
              >
                {content.trim().length}/{CONTENT_MAX}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to={isEditMode ? `/blogs/${id}` : '/blogs'}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading
                ? isEditMode
                  ? 'Saving…'
                  : 'Publishing…'
                : isEditMode
                  ? 'Save Changes'
                  : 'Publish Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}