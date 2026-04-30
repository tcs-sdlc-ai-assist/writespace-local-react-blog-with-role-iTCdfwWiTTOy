import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSession } from '../utils/session';
import { getBlogs } from '../utils/blogs';
import BlogCard from '../components/BlogCard';

/**
 * Authenticated blog list page rendered at '/blogs'.
 * Displays all posts in a responsive grid (1/2/3 columns).
 * Each card shows title, excerpt, date, author avatar.
 * Edit icon shown for admin on all posts, for user only on own posts.
 * Empty state with message and Write CTA when no posts exist.
 * Posts sorted newest first.
 * @returns {JSX.Element}
 */
export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    try {
      const currentSession = getSession();
      setSession(currentSession);

      const blogs = getBlogs();
      setPosts(blogs);
    } catch (e) {
      console.error('Failed to load blog posts:', e);
      setError('Failed to load blog posts. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-gray-500">Loading posts…</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Blog Posts</h1>
          <p className="mt-1 text-sm text-gray-600">
            {posts.length === 0
              ? 'No posts yet. Be the first to write something!'
              : `${posts.length} post${posts.length === 1 ? '' : 's'} published`}
          </p>
        </div>
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
          Write
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-ws-indigo-50 text-ws-indigo-600 mb-5">
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
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No posts yet
          </h2>
          <p className="text-sm text-gray-600 mb-6 max-w-md">
            It looks like no one has written anything yet. Be the first to share your thoughts with the community!
          </p>
          <Link
            to="/blogs/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 rounded-md shadow-sm hover:from-ws-violet-700 hover:to-ws-indigo-700 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Write Your First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              post={post}
              currentUser={session}
            />
          ))}
        </div>
      )}
    </div>
  );
}