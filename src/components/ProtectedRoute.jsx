import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getSession } from '../utils/session';
import Navbar from './Navbar';

/**
 * Route guard wrapper component.
 * Checks for valid session in localStorage.
 * Redirects unauthenticated users to /login.
 * Optionally checks for admin role and redirects non-admins to /blogs.
 * Wraps children with Navbar for authenticated layout.
 *
 * @param {{ children: JSX.Element, requireAdmin?: boolean }} props
 * @returns {JSX.Element}
 */
function ProtectedRoute({ children, requireAdmin }) {
  const location = useLocation();
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {
    const currentSession = getSession();
    setSession(currentSession);
  }, [location.pathname]);

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && session.role !== 'admin') {
    return <Navigate to="/blogs" replace />;
  }

  function handleLogout() {
    setSession(null);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar session={session} onLogout={handleLogout} />
      <main>{children}</main>
    </div>
  );
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requireAdmin: PropTypes.bool,
};

ProtectedRoute.defaultProps = {
  requireAdmin: false,
};

export default ProtectedRoute;