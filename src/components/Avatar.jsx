import PropTypes from 'prop-types';

/**
 * Returns a JSX avatar element based on the user's role.
 * @param {'admin'|'user'} role - The role of the user.
 * @returns {JSX.Element} A styled avatar element.
 */
export function getAvatar(role) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ws-violet-200 text-ws-violet-800 text-sm font-semibold select-none">
        👑
      </span>
    );
  }

  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-ws-indigo-200 text-ws-indigo-800 text-sm font-semibold select-none">
      📖
    </span>
  );
}

/**
 * Avatar React component that renders a role-based avatar.
 * @param {{ role: 'admin'|'user', className?: string }} props
 * @returns {JSX.Element}
 */
function Avatar({ role, className }) {
  if (role === 'admin') {
    return (
      <span
        className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-ws-violet-200 text-ws-violet-800 text-sm font-semibold select-none${className ? ` ${className}` : ''}`}
      >
        👑
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-ws-indigo-200 text-ws-indigo-800 text-sm font-semibold select-none${className ? ` ${className}` : ''}`}
    >
      📖
    </span>
  );
}

Avatar.propTypes = {
  role: PropTypes.oneOf(['admin', 'user']).isRequired,
  className: PropTypes.string,
};

Avatar.defaultProps = {
  className: '',
};

export default Avatar;