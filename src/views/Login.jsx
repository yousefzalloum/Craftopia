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
    <div className="login-creative-container">
      {/* Full Background with Overlay */}
      <div className="login-background-wrapper">
        <div className="background-image"></div>
        <div className="background-overlay"></div>
        <div className="animated-particles">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
      </div>

      {/* Content Container */}
      <div className="login-content-wrapper">
        {/* Top Brand Section */}
        <div className="brand-showcase">
          <div className="brand-badge">
            <span className="badge-icon">🔨</span>
            <span className="badge-text">Craftopia</span>
          </div>
          <h1 className="hero-title">
            Connect with <span className="highlight-text">Master Artisans</span>
          </h1>
          <p className="hero-subtitle">
            Discover skilled craftspeople and bring your creative projects to life
          </p>
        </div>

        {/* Floating Login Card with Features */}
        <div className="floating-login-card">
          <div className="card-inner">
            {/* Login Form Section */}
            <div className="login-form-area">
              <div className="form-header">
                <h2>Welcome Back</h2>
                <p>Sign in to continue your journey</p>
              </div>

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password">
                    <span className="label-icon">🔒</span>
                    Password
                  </label>
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
                  {isLoading ? (
                    <>
                      <span className="button-spinner"></span>
                      Signing in...
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <span className="btn-arrow">→</span>
                    </>
                  )}
                </button>
              </form>

              <div className="form-footer">
                <p>Don't have an account? <Link to="/role-selection" className="signup-link">Sign up free</Link></p>
              </div>
            </div>

            {/* Features Sidebar */}
            <div className="features-sidebar">
              <h3 className="sidebar-title">Why Choose Us?</h3>
              
              <div className="feature-list">
                <div className="feature-mini-card">
                  <div className="feature-icon">👨‍🔧</div>
                  <div className="feature-content">
                    <h4>500+ Expert Artisans</h4>
                    <p>Verified craftspeople ready to help</p>
                  </div>
                </div>

                <div className="feature-mini-card">
                  <div className="feature-icon">🎨</div>
                  <div className="feature-content">
                    <h4>Custom Creations</h4>
                    <p>Unique pieces crafted just for you</p>
                  </div>
                </div>

                <div className="feature-mini-card">
                  <div className="feature-icon">⭐</div>
                  <div className="feature-content">
                    <h4>4.9 Star Rating</h4>
                    <p>Trusted by thousands of customers</p>
                  </div>
                </div>

                <div className="feature-mini-card">
                  <div className="feature-icon">🔥</div>
                  <div className="feature-content">
                    <h4>2,000+ Projects</h4>
                    <p>Successfully completed</p>
                  </div>
                </div>
              </div>

              <div className="trust-badges">
                <div className="badge-item">
                  <span className="badge-check">✓</span>
                  <span>Verified Profiles</span>
                </div>
                <div className="badge-item">
                  <span className="badge-check">✓</span>
                  <span>Secure Payments</span>
                </div>
                <div className="badge-item">
                  <span className="badge-check">✓</span>
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
