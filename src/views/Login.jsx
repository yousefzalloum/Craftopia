import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginCustomer } from '../services/customerService';
import { loginCraftsman } from '../services/craftsmanService';
import { loginAdmin } from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
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
  
  // Password reset states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: email, 2: OTP + new password
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [isResetLoading, setIsResetLoading] = useState(false);

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

  // Password reset handlers
  const handleForgotPassword = () => {
    setShowResetModal(true);
    setResetStep(1);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  const handleCloseResetModal = () => {
    setShowResetModal(false);
    setResetStep(1);
    setResetEmail('');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetError('');
    setResetSuccess('');
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    setIsResetLoading(true);

    try {
      let response = null;
      
      // Try customer forgot password first
      try {
        response = await apiRequest('/customers/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email: resetEmail })
        });
        console.log('✅ OTP sent to customer email');
      } catch (customerError) {
        console.log('Customer forgot-password failed, trying artisan...');
        
        // If customer failed, try artisan
        try {
          response = await apiRequest('/artisans/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email: resetEmail })
          });
          console.log('✅ OTP sent to artisan email');
        } catch (artisanError) {
          // Both failed
          throw new Error('Email not found. Please check your email address.');
        }
      }

      setResetSuccess(response.message || 'OTP sent to your email');
      setResetStep(2);
    } catch (err) {
      setResetError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsResetLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setResetError('Passwords do not match');
      return;
    }

    // Validate password length
    if (newPassword.length < 6) {
      setResetError('Password must be at least 6 characters long');
      return;
    }

    setIsResetLoading(true);

    try {
      let response = null;
      
      // Try customer reset password first
      try {
        response = await apiRequest('/customers/reset-password', {
          method: 'POST',
          body: JSON.stringify({
            email: resetEmail,
            otp: resetOtp,
            newPassword: newPassword
          })
        });
        console.log('✅ Customer password reset successfully');
      } catch (customerError) {
        console.log('Customer reset-password failed, trying artisan...');
        
        // If customer failed, try artisan
        try {
          response = await apiRequest('/artisans/reset-password', {
            method: 'POST',
            body: JSON.stringify({
              email: resetEmail,
              otp: resetOtp,
              newPassword: newPassword
            })
          });
          console.log('✅ Artisan password reset successfully');
        } catch (artisanError) {
          // Both failed
          throw new Error('Invalid OTP or email. Please try again.');
        }
      }

      setResetSuccess(response.message || 'Password reset successfully!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleCloseResetModal();
      }, 2000);
    } catch (err) {
      setResetError(err.message || 'Failed to reset password. Please check your OTP and try again.');
    } finally {
      setIsResetLoading(false);
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

                <div className="forgot-password-wrapper">
                  <button 
                    type="button" 
                    className="forgot-password-link"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
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
                  <span>Quality Guaranteed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="reset-modal-overlay" onClick={handleCloseResetModal}>
          <div className="reset-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseResetModal}>×</button>
            
            <div className="modal-header">
              <h2>Reset Password</h2>
              <p>
                {resetStep === 1 
                  ? 'Enter your email to receive a verification code' 
                  : 'Enter the OTP sent to your email and your new password'}
              </p>
            </div>

            {resetError && (
              <div className="reset-error-message">
                <span className="error-icon">⚠️</span>
                <span>{resetError}</span>
              </div>
            )}

            {resetSuccess && (
              <div className="reset-success-message">
                <span className="success-icon">✓</span>
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetStep === 1 ? (
              <form onSubmit={handleSendOtp} className="reset-form">
                <div className="form-group">
                  <label htmlFor="reset-email">
                    <span className="label-icon">📧</span>
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="reset-email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="your@email.com"
                    disabled={isResetLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={isResetLoading}
                >
                  {isResetLoading ? (
                    <>
                      <span className="button-spinner"></span>
                      Sending OTP...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="reset-form">
                <div className="form-group">
                  <label htmlFor="reset-otp">
                    <span className="label-icon">🔑</span>
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    id="reset-otp"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    disabled={isResetLoading}
                    maxLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="new-password">
                    <span className="label-icon">🔒</span>
                    New Password
                  </label>
                  <input
                    type="password"
                    id="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    placeholder="Enter new password"
                    disabled={isResetLoading}
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirm-password">
                    <span className="label-icon">🔒</span>
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirm-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Confirm new password"
                    disabled={isResetLoading}
                    minLength={6}
                  />
                </div>

                <div className="reset-form-actions">
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setResetStep(1)}
                    disabled={isResetLoading}
                  >
                    Back
                  </button>
                  <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={isResetLoading}
                  >
                    {isResetLoading ? (
                      <>
                        <span className="button-spinner"></span>
                        Resetting...
                      </>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Login;
