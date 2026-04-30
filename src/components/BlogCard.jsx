import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from './Avatar';

/**
 * Truncates content to a specified max length, appending ellipsis if needed.
 * @param {string} text - The text to truncate.
 * @param {number} maxLength - Maximum character length.
 * @returns {string} The truncated text.
 */
function truncate(text, maxLength = 150) {
  if (!text || text.length <= maxLength) {
    return text || '';
  }
  return text.slice(0, maxLength).trimEnd() + '…';
}

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
 * Blog post summary card component for the blog list grid.
 * Displays title, excerpt, date, author avatar/name, and an edit icon if the current user can edit.
 *
 * @param {{ post: { id: string, title: string, content: string, author: string, authorDisplay: string, authorRole: string, created: string, updated: string }, currentUser: { username: string, role: string } | null }} props
 * @returns {JSX.Element}
 */
function BlogCard({ post, currentUser }) {
  const canEdit =
    currentUser &&
    (currentUser.role === 'admin' || currentUser.username === post.author);

  return (
    <div className="relative flex flex-col bg-white border-l-4 border-ws-indigo-500 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <Link
        to={`/blogs/${post.id}`}
        className="flex flex-col flex-1 p-5 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 rounded-lg"
      >
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2">
          {post.title}
        </h3>
        <p className="text-sm text-gray-600 flex-1 mb-4">
          {truncate(post.content, 150)}
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
      </Link>
      {canEdit && (
        <Link
          to={`/blogs/${post.id}/edit`}
          className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-ws-indigo-600 rounded-md hover:bg-ws-indigo-50 transition-colors focus:outline-none focus:ring-2 focus:ring-ws-indigo-500"
          title="Edit post"
          onClick={(e) => e.stopPropagation()}
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
      )}
    </div>
  );
}

BlogCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    authorDisplay: PropTypes.string.isRequired,
    authorRole: PropTypes.oneOf(['admin', 'user']).isRequired,
    created: PropTypes.string.isRequired,
    updated: PropTypes.string.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
  }),
};

BlogCard.defaultProps = {
  currentUser: null,
};

export default BlogCard;