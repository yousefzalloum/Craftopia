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

  // List of locations in Jordan
  const locations = [
    'Amman',
    'Zarqa',
    'Irbid',
    'Aqaba',
    'Madaba',
    'Salt',
    'Jerash',
    'Karak',
    'Mafraq',
    'Ajloun'
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
      <div className="auth-container">
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
  );
};

export default Signup;

