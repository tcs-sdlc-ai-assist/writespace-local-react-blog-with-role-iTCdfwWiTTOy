import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import Avatar from './Avatar';
import { clearSession } from '../utils/session';

/**
 * Authenticated navigation bar component.
 * Displays role-based links, avatar chip with display name, logout dropdown,
 * mobile hamburger toggle, and active link highlighting.
 *
 * @param {{ session: { username: string, role: 'admin'|'user', displayName: string }, onLogout?: () => void }} props
 * @returns {JSX.Element}
 */
function Navbar({ session, onLogout }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const isAdmin = session && session.role === 'admin';

  const navLinks = [
    { to: '/blogs', label: 'All Blogs' },
    { to: '/blogs/new', label: 'Write' },
  ];

  if (isAdmin) {
    navLinks.push({ to: '/admin/users', label: 'Users' });
  }

  function isActive(path) {
    if (path === '/blogs') {
      return location.pathname === '/blogs';
    }
    return location.pathname.startsWith(path);
  }

  function handleLogout() {
    clearSession();
    setDropdownOpen(false);
    setMobileOpen(false);
    if (onLogout) {
      onLogout();
    }
    navigate('/');
  }

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              to="/blogs"
              className="text-xl font-bold bg-gradient-to-r from-ws-violet-600 to-ws-indigo-600 bg-clip-text text-transparent"
            >
              WriteSpace
            </Link>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-ws-indigo-50 text-ws-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop avatar + dropdown */}
          <div className="hidden md:flex items-center">
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 ${
                  isAdmin
                    ? 'border-ws-violet-200 bg-ws-violet-50 hover:bg-ws-violet-100'
                    : 'border-ws-indigo-200 bg-ws-indigo-50 hover:bg-ws-indigo-100'
                }`}
              >
                <Avatar role={session.role} />
                <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                  {session.displayName}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900 truncate">{session.displayName}</p>
                    <p className="text-xs text-gray-500 capitalize">{session.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-ws-indigo-500 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-ws-indigo-50 text-ws-indigo-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3 mb-3">
              <Avatar role={session.role} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 truncate">{session.displayName}</span>
                <span className="text-xs text-gray-500 capitalize">{session.role}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

Navbar.propTypes = {
  session: PropTypes.shape({
    username: PropTypes.string.isRequired,
    role: PropTypes.oneOf(['admin', 'user']).isRequired,
    displayName: PropTypes.string.isRequired,
  }).isRequired,
  onLogout: PropTypes.func,
};

Navbar.defaultProps = {
  onLogout: undefined,
};

export default Navbar;