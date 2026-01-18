import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { registerCraftsman } from '../services/craftsmanService';
import { registerCustomer } from '../services/customerService';
import '../styles/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role');
  
  // Determine role - default to artisan if not specified
  const [role, setRole] = useState(roleFromUrl || 'artisan');
  
  // Form state management - matching backend fields exactly
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone_number: '',
    craftType: '',
    description: '',
    location: ''
  });
  
  // Error and loading states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  // List of locations in Palestine
  const locations = [
    'Hebron',
    'Ramallah',
    'Nablus',
    'Bethlehem',
    'Jerusalem',
    'Jenin',
    'Tulkarm',
    'Qalqilya',
    'Salfit',
    'Tubas',
    'Jericho',
    'Gaza City',
    'Rafah',
    'Khan Yunis',
    'Deir al-Balah',
    'Beit Lahia',
    'Beit Hanoun'
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear API error when user starts typing
    if (apiError) {
      setApiError('');
    }
  };

  // Email validation helper
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate form fields
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone number validation
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    }

    // Artisan-specific validations
    if (role === 'artisan') {
      // Craft type validation
      if (!formData.craftType) {
        newErrors.craftType = 'Please select your craft type';
      }

      // Description validation
      if (!formData.description.trim()) {
        newErrors.description = 'Description is required';
      } else if (formData.description.trim().length < 10) {
        newErrors.description = 'Description must be at least 10 characters';
      }

      // Location validation (only for artisans)
      if (!formData.location) {
        newErrors.location = 'Please select your location';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for backend (only required fields)
      const registrationData = {
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone_number: formData.phone_number.trim()
      };

      // Add artisan-specific fields
      if (role === 'artisan') {
        registrationData.craftType = formData.craftType;
        registrationData.description = formData.description.trim();
        registrationData.location = formData.location;
      }

      console.log('📝 Sending registration data:', { ...registrationData, password: '***' });

      // Call appropriate API service based on role
      let response;
      if (role === 'artisan') {
        response = await registerCraftsman(registrationData);
      } else {
        response = await registerCustomer(registrationData);
      }

      console.log('✅ Registration successful:', response);

      // Success! Show message and redirect
      setTimeout(() => {
        if (role === 'artisan') {
          navigate('/craftsman-dashboard');
        } else {
          navigate('/');
        }
      }, 1000);

    } catch (error) {
      console.error('❌ Signup error:', error);
      setApiError(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-split-container">
        {/* Left Side - Image Section */}
        <div className="auth-image-section">
          <div className="image-overlay">
            <div className="overlay-content">
              <h2 className="overlay-title">
                {role === 'artisan' ? 'Share Your Craft' : 'Find Your Expert'}
              </h2>
              <p className="overlay-text">
                {role === 'artisan' 
                  ? 'Join thousands of skilled artisans connecting with customers who value quality craftsmanship'
                  : 'Connect with skilled professionals for all your home and industrial needs'
                }
              </p>
              <div className="overlay-features">
                {role === 'artisan' ? (
                  <>
                    <div className="feature-item">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                      </svg>
                      <span>Build your reputation</span>
                    </div>
                    <div className="feature-item">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <span>Grow your client base</span>
                    </div>
                    <div className="feature-item">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                      <span>Manage bookings easily</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="feature-item">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                      </svg>
                      <span>Find local artisans</span>
                    </div>
                    <div className="feature-item">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                      </svg>
                      <span>Read verified reviews</span>
                    </div>
                    <div className="feature-item">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                        <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                      </svg>
                      <span>Book instantly</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="decorative-shapes">
            <div className="shape shape-1"></div>
            <div className="shape shape-2"></div>
            <div className="shape shape-3"></div>
          </div>
        </div>

        {/* Right Side - Form Section */}
        <div className="auth-form-section">
          <div className="auth-card signup-card">
            {/* Logo and Title */}
            <div className="auth-header">
              <div className="auth-logo">
                <span className="logo-icon">🔨</span>
                <h1>Craftopia</h1>
              </div>
              <h2>{role === 'artisan' ? 'Artisan Registration' : 'Customer Registration'}</h2>
              <p>{role === 'artisan' ? 'Join our community of skilled craftspeople' : 'Sign up to find skilled craftspeople'}</p>
            </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="auth-form">
            {/* Global Error Message */}
            {apiError && (
              <div className="error-message-box">
                <span className="error-icon">⚠️</span>
                {apiError}
              </div>
            )}

            {/* Full Name */}
            <div className="form-group">
              <label htmlFor="name">
                Full Name
                <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={errors.name ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">
                Email Address
                <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your.email@example.com"
                className={errors.email ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label htmlFor="phone_number">
                Phone Number
                <span className="required">*</span>
              </label>
              <input
                type="tel"
                id="phone_number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="e.g., 0599123456"
                className={errors.phone_number ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
            </div>

            {/* Artisan-only fields */}
            {role === 'artisan' && (
              <>
                {/* Craft Type */}
                <div className="form-group">
                  <label htmlFor="craftType">
                    Craft Type
                    <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="craftType"
                    name="craftType"
                    value={formData.craftType}
                    onChange={handleChange}
                    placeholder="e.g., Tailoring, Carpentry, Welding, Plumbing"
                    className={errors.craftType ? 'error' : ''}
                    disabled={isSubmitting}
                  />
                  {errors.craftType && <span className="error-message">{errors.craftType}</span>}
                  <span className="input-hint">Enter your craft or trade specialty</span>
                </div>

                {/* Description */}
                <div className="form-group">
                  <label htmlFor="description">
                    Professional Description
                    <span className="required">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your experience and expertise..."
                    className={errors.description ? 'error' : ''}
                    disabled={isSubmitting}
                    rows="4"
                  />
                  {errors.description && <span className="error-message">{errors.description}</span>}
                  <span className="input-hint">Minimum 10 characters</span>
                </div>

                {/* Location */}
                <div className="form-group">
                  <label htmlFor="location">
                    Location
                    <span className="required">*</span>
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className={errors.location ? 'error' : ''}
                    disabled={isSubmitting}
                  >
                    <option value="">Select your city</option>
                    {locations.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  {errors.location && <span className="error-message">{errors.location}</span>}
                </div>
              </>
            )}

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password">
                Password
                <span className="required">*</span>
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className={errors.password ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Confirm Password
                <span className="required">*</span>
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
                className={errors.confirmPassword ? 'error' : ''}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="auth-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="button-spinner"></span>
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            {/* Login Link */}
            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/craftsman-login" className="auth-link">
                  Login here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Signup;

