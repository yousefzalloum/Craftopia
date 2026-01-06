import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationController from '../controllers/NotificationController';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, profile, role, logout } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread count when user is logged in
  useEffect(() => {
    // Don't fetch notifications for admin users
    if (isLoggedIn && role !== 'admin') {
      fetchUnreadCount();
      // Poll every 30 seconds for new notifications
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, role]);

  const fetchUnreadCount = async () => {
    try {
      const count = await NotificationController.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      // Silently fail - don't log to avoid console spam
      // Backend might be down, just keep count at 0
      setUnreadCount(0);
    }
  };

  // Handle logout
  const handleLogout = () => {
    console.log('🚪 Logging out from Navbar');
    logout();
    navigate('/');
  };

  // Get display name - prefer profile data if available
  const displayName = profile?.name || user?.name || 'Profile';
  const displayEmail = profile?.email || user?.email;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🔨</span>
          Craftopia
        </Link>

        <ul className="navbar-menu">
          {isLoggedIn && role !== 'admin' && (
            <li className="navbar-item">
              <Link to="/" className="navbar-link">Home</Link>
            </li>
          )}
          
          {isLoggedIn && role === 'admin' ? (
            // Admin Menu (logged in)
            <>
              <li className="navbar-item">
                <Link to="/admin-dashboard" className="navbar-link navbar-link-primary">
                  🔨 Admin Dashboard
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-btn">
                  🚪 Logout
                </button>
              </li>
            </>
          ) : isLoggedIn && role === 'artisan' ? (
            // Artisan Menu (logged in)
            <>
              <li className="navbar-item">
                <Link to="/craftsman-dashboard" className="navbar-link navbar-link-primary">
                  🏪 Dashboard
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/jobs" className="navbar-link">
                  📋 Jobs
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/notifications" className="navbar-link notification-link">
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/artisan-profile" className="navbar-link" title={displayEmail}>
                  👤 {displayName}
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-btn">
                  🚪 Logout
                </button>
              </li>
            </>
          ) : isLoggedIn && role === 'customer' ? (
            // Customer Menu (logged in)
            <>
              <li className="navbar-item">
                <Link to="/crafts" className="navbar-link">Browse Crafts</Link>
              </li>
              <li className="navbar-item">
                <Link to="/reservations" className="navbar-link navbar-link-primary">
                  My Reservations
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/notifications" className="navbar-link notification-link">
                  🔔 Notifications
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link" title={displayEmail}>
                  👤 {displayName}
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-btn">
                  🚪 Logout
                </button>
              </li>
            </>
          ) : (
            // Guest Menu (not logged in)
            <>
              <li className="navbar-item">
                <Link to="/crafts" className="navbar-link">Browse Crafts</Link>
              </li>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link navbar-link-secondary">
                  Sign In
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/role-selection" className="navbar-link navbar-link-primary">
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="navbar-mobile-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
