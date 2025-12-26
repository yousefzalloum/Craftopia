import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import '../styles/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  // Check if user is logged in
  useEffect(() => {
    const checkUser = () => {
      // Check for craftsman login first
      const craftsman = JSON.parse(localStorage.getItem('craftopia_craftsman') || 'null');
      if (craftsman) {
        setCurrentUser(craftsman);
        return;
      }
      
      // Then check for regular user login
      const user = JSON.parse(localStorage.getItem('craftopia_current_user') || 'null');
      setCurrentUser(user);
    };
    
    // Check on mount
    checkUser();
    
    // Listen for storage changes (login/logout from other tabs)
    window.addEventListener('storage', checkUser);
    
    // Custom event for same-tab login/logout
    window.addEventListener('userChanged', checkUser);
    
    return () => {
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userChanged', checkUser);
    };
  }, []);

  // Handle logout
  const handleLogout = () => {
    // Remove both types of sessions
    localStorage.removeItem('craftopia_current_user');
    localStorage.removeItem('craftopia_craftsman');
    setCurrentUser(null);
    window.dispatchEvent(new Event('userChanged'));
    navigate('/');
    alert('You have been logged out successfully!');
  };

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
          
          {/* Show different menus based on user type */}
          {currentUser?.type === 'craftsman' ? (
            // Craftsman Menu
            <>
              <li className="navbar-item">
                <Link to="/craftsman-dashboard" className="navbar-link navbar-link-primary">
                  🏪 My Dashboard
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link craftsman-name">
                  👤 {currentUser.name}
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-btn">
                  🚪 Logout
                </button>
              </li>
            </>
          ) : currentUser ? (
            // Customer Menu (logged in)
            <>
              <li className="navbar-item">
                <Link to="/crafts" className="navbar-link">Browse Crafts</Link>
              </li>
              <li className="navbar-item">
                <Link to="/book-maintenance" className="navbar-link">Book Maintenance</Link>
              </li>
              <li className="navbar-item">
                <Link to="/reservations" className="navbar-link navbar-link-primary">
                  My Reservations
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/profile" className="navbar-link">
                  {currentUser.name}
                </Link>
              </li>
              <li className="navbar-item">
                <button onClick={handleLogout} className="navbar-link navbar-btn">
                  Logout
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
                <Link to="/book-maintenance" className="navbar-link">Book Maintenance</Link>
              </li>
              <li className="navbar-item">
                <Link to="/login" className="navbar-link navbar-link-secondary">
                  Login
                </Link>
              </li>
              <li className="navbar-item">
                <Link to="/signup" className="navbar-link navbar-link-primary">
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
