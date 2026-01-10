import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginCraftsman } from '../services/craftsmanService';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../utils/api';
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
      const response = await apiRequest('/artisans/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail })
      });

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
      const response = await apiRequest('/artisans/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          email: resetEmail,
          otp: resetOtp,
          newPassword: newPassword
        })
      });

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

            <div className="forgot-password-wrapper">
              <button 
                type="button" 
                className="forgot-password-link"
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </button>
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
