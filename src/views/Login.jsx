import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginCustomer } from '../services/customerService';
import { loginCraftsman } from '../services/craftsmanService';
import { loginAdmin } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from || '/';
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
    console.log("LOGIN SUBMIT TRIGGERED");
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      let response = null;
      let loginRole = null;

      // Try customer login first
      try {
        console.log('Trying customer login...');
        response = await loginCustomer(formData);
        loginRole = 'customer';
        console.log('✅ Login succeeded as customer');
      } catch (customerError) {
        console.log('Customer login error status:', customerError.status);
        console.log('Customer login error message:', customerError.message);
        
        // If customer login failed with 401, try artisan login
        if (customerError.status === 401) {
          console.log('Customer login failed with 401, trying artisan login...');
          try {
            console.log('Trying artisan login...');
            response = await loginCraftsman(formData);
            loginRole = 'artisan';
            console.log('✅ Login succeeded as artisan');
          } catch (artisanError) {
            console.log('Artisan login error status:', artisanError.status);
            console.log('Artisan login error message:', artisanError.message);
            
            // If artisan login failed with 401, try admin login
            if (artisanError.status === 401) {
              console.log('Artisan login failed with 401, trying admin login...');
              try {
                console.log('Trying admin login...');
                response = await loginAdmin(formData);
                loginRole = 'admin';
                console.log('✅ Login succeeded as admin');
              } catch (adminError) {
                console.error('❌ All login attempts failed');
                throw new Error('Invalid email or password');
              }
            } else {
              // Other error (not 401), re-throw
              throw artisanError;
            }
          }
        } else {
          // Other error (not 401), re-throw
          throw customerError;
        }
      }

      // Update global auth state with successful response
      login(response);

      // Redirect based on response role
      if (response.role === 'artisan') {
        console.log('Redirecting to artisan dashboard...');
        navigate('/craftsman-dashboard');
      } else if (response.role === 'admin') {
        console.log('Redirecting to admin dashboard...');
        navigate('/admin-dashboard');
      } else {
        console.log('Redirecting to:', from);
        navigate(from);
      }
    } catch (err) {
      console.error('❌ Login error caught in component:', err.message);
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Welcome Back</h1>
        <p className="login-subtitle">Sign in to your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
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
              required
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/role-selection">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
