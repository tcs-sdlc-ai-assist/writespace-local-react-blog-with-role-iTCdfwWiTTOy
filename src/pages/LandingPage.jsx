import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getSession } from '../utils/session';
import { clearSession } from '../utils/session';
import { getBlogs } from '../utils/blogs';
import Avatar from '../components/Avatar';

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
function truncate(text, maxLength = 120) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength).trimEnd() + '…';
}

const FEATURES = [
  {
    title: 'Distraction-Free Writing',
    description: 'Focus on your words with a clean, minimal editor. No clutter, no distractions — just you and your thoughts.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    title: 'Instant Publishing',
    description: 'Write and publish your blog posts instantly. Share your ideas with the community in seconds.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: 'Role-Based Access',
    description: 'Admins manage users and all content. Writers own their posts. Everyone has the right level of control.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

/**
 * Public landing page component rendered at '/'.
 * Shows adaptive navbar, hero section, features grid, latest posts preview, and footer.
 * @returns {JSX.Element}
 */
export default function LandingPage() {
  const [session, setSession] = useState(() => getSession());
  const [latestPosts, setLatestPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);

    try {
      const blogs = getBlogs();
      setLatestPosts(blogs.slice(0, 3));
    } catch (e) {
      console.error('Failed to load latest posts:', e);
      setLatestPosts([]);
    }
  }, []);

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  function handlePostClick(e, postId) {
    e.preventDefault();
    if (session) {
      navigate(`/blogs/${postId}`);
    } else {
      navigate('/login');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              to="/"
              className="text-xl font-bold bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 bg-clip-text text-transparent"
            >
              WriteSpace
            </Link>
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <Link
                    to="/blogs"
                    className="px-4 py-2 text-sm font-medium text-ws-indigo-700 hover:text-ws-indigo-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <div className="flex items-center gap-2">
                    <Avatar role={session.role} />
                    <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
                      {session.displayName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-1.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-ws-violet-600 via-ws-indigo-600 to-ws-indigo-700">
        <div className="absolute inset-0 bg-black bg-opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight">
            Your Space to{' '}
            <span className="text-ws-violet-200">Write</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-indigo-100">
            A distraction-free platform for sharing your ideas, stories, and knowledge with the world. Start writing today.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {session ? (
              <Link
                to="/blogs"
                className="px-8 py-3 text-base font-semibold text-ws-indigo-700 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 text-base font-semibold text-ws-indigo-700 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
                >
                  Get Started — It&apos;s Free
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 text-base font-semibold text-white border-2 border-white border-opacity-40 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why WriteSpace?
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to write, publish, and manage your blog — nothing you don&apos;t.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="flex flex-col items-center text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-ws-indigo-50 text-ws-indigo-600 mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Posts Preview */}
      {latestPosts.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">
                Latest Posts
              </h2>
              <p className="mt-3 text-lg text-gray-600">
                See what the community has been writing about.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {latestPosts.map((post) => (
                <a
                  key={post.id}
                  href={`/blogs/${post.id}`}
                  onClick={(e) => handlePostClick(e, post.id)}
                  className="flex flex-col bg-white border-l-4 border-ws-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-ws-indigo-500"
                >
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-600 flex-1 mb-4">
                    {truncate(post.content, 120)}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <Avatar role={post.authorRole} />
                      <span className="text-sm font-medium text-gray-700">
                        {post.authorDisplay}
                      </span>
                    </div>
                    <time
                      dateTime={post.created}
                      className="text-xs text-gray-500"
                    >
                      {formatDate(post.created)}
                    </time>
                  </div>
                </a>
              ))}
            </div>
            <div className="text-center mt-10">
              {session ? (
                <Link
                  to="/blogs"
                  className="inline-block px-6 py-2.5 text-sm font-medium text-ws-indigo-700 bg-ws-indigo-50 rounded-md hover:bg-ws-indigo-100 transition-colors"
                >
                  View All Posts →
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="inline-block px-6 py-2.5 text-sm font-medium text-ws-indigo-700 bg-ws-indigo-50 rounded-md hover:bg-ws-indigo-100 transition-colors"
                >
                  Sign in to read more →
                </Link>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="mt-auto bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-lg font-bold bg-gradient-to-r from-ws-violet-400 to-ws-indigo-400 bg-clip-text text-transparent">
                WriteSpace
              </span>
              <p className="mt-1 text-sm text-gray-500">
                A distraction-free writing platform.
              </p>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link
                to="/"
                className="hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                to="/login"
                className="hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="hover:text-white transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-gray-800 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} WriteSpace. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}