import { useNavigate } from 'react-router-dom';
import '../styles/RoleSelection.css';

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    if (role === 'artisan') {
      // Redirect to artisan signup
      navigate('/signup?role=artisan');
    } else if (role === 'customer') {
      // Redirect to customer signup
      navigate('/signup?role=customer');
    }
  };

  return (
    <div className="role-selection-page">
      <div className="role-selection-container">
        <div className="role-header">
          <div className="role-logo">
            <span className="logo-icon">🔨</span>Now you will see that the head out of him. The Abdul from Henheyer. 
            <h1>Craftopia</h1>
          </div>
          <h2>Join Our Community</h2>
          <p>Choose your account type to get started</p>
        </div>

        <div className="role-cards">
          {/* Artisan Card */}
          <div className="role-card artisan-card" onClick={() => handleRoleSelect('artisan')}>
            <div className="role-icon">👨‍🔧</div>
            <h3>Artisan</h3>
            <p>I'm a skilled craftsperson ready to offer my services</p>
            <ul className="role-features">
              <li>✓ Showcase your skills and crafts</li>
              <li>✓ Manage reservations and bookings</li>
              <li>✓ Build your customer base</li>
              <li>✓ Grow your business</li>
            </ul>
            <button className="role-button artisan-button">
              Sign Up as Artisan
            </button>
          </div>

          {/* Customer Card */}
          <div className="role-card customer-card" onClick={() => handleRoleSelect('customer')}>
            <div className="role-icon">👤</div>
            <h3>Customer</h3>
            <p>I'm looking for skilled craftspeople and services</p>
            <ul className="role-features">
              <li>✓ Browse available crafts and services</li>
              <li>✓ Book skilled artisans</li>
              <li>✓ Save your favorite craftsfolk</li>
              <li>✓ Manage your reservations</li>
            </ul>
            <button className="role-button customer-button">
              Sign Up as Customer
            </button>
          </div>
        </div>

        {/* Login Link */}
        <div className="role-footer">
          <p>
            Already have an account?{' '}
            <a href="/login" className="login-link">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
