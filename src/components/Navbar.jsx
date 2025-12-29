import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, profile, role, logout } = useAuth();

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
          <li className="navbar-item">
            <Link to="/" className="navbar-link">Home</Link>
          </li>
          
          {isLoggedIn && role === 'artisan' ? (
            // Artisan Menu (logged in)
            <>
              <li className="navbar-item">
                <Link to="/craftsman-dashboard" className="navbar-link navbar-link-primary">
                  🏪 Dashboard
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
