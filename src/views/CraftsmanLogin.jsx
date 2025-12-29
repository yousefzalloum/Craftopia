import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCraftsman } from '../services/craftsmanService';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const CraftsmanLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    console.log("ARTISAN LOGIN SUBMIT TRIGGERED");
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await loginCraftsman(formData);
      
      console.log('✅ Artisan login successful, updating auth context...');
      
      // Update global auth state with artisan data
      login(response);
      
      // Redirect to artisan dashboard after successful login
      navigate('/craftsman-dashboard');
    } catch (err) {
      console.error('❌ Artisan login error caught in component:', err.message);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1>🔨 Craftsman Portal</h1>
            <p>Login to manage your business</p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@craftopia.com"
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn-submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Login as Craftsman'}
            </button>
          </form>

          <div className="login-footer">
            <p>Are you a customer? <a href="/login">Customer Login</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanLogin;
