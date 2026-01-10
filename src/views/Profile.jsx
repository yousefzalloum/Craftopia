import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile, updateCustomerProfile, uploadCustomerProfilePicture, changePassword } from '../services/customerService';
import Loading from '../components/Loading';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit profile states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [imageRefreshKey, setImageRefreshKey] = useState(Date.now());
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location: ''
  });
  
  // Change password states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      console.log('❌ Not logged in');
      navigate('/login');
      return;
    }

    // Only allow customers (or if role is undefined during login transition)
    if (role && role !== 'customer') {
      console.log('❌ Not a customer, redirecting to dashboard');
      navigate('/craftsman-dashboard');
      return;
    }

    // Fetch customer profile from API
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📋 Fetching customer profile...');
        
        const data = await getCustomerProfile();
        console.log('✅ Profile data received:', data);
        console.log('📸 Avatar field:', data.avatar);
        console.log('📸 ProfilePicture field:', data.profilePicture);
        
        // Format data for display
        const userData = {
          id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone_number || 'Not specified',
          location: data.location || 'Not specified',
          profilePicture: data.avatar || data.profilePicture,
          registerDate: data.register_date,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        console.log('📸 Profile picture loaded:', data.profilePicture);
        setUser(userData);
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, role, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 20px 20px' }}>
          <h2>Error Loading Profile</h2>
          <p className="error-message" style={{ color: '#e74c3c', background: '#ffe5e5', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            {error}
          </p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 20px 20px', textAlign: 'center' }}>
          <h2>Profile not found</h2>
          <button 
            onClick={() => navigate(-1)} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Open edit modal and pre-fill form with current data
  const handleOpenEditModal = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone_number: user.phone || '',
        location: user.location === 'Not specified' ? '' : (user.location || '')
      });
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setIsEditModalOpen(true);
      setEditError(null);
      setSuccessMessage(null);
    }
  };

  // Open password change modal
  const handleOpenPasswordModal = () => {
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setIsPasswordModalOpen(true);
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  // Close password change modal
  const handleClosePasswordModal = () => {
    setIsPasswordModalOpen(false);
    setPasswordError(null);
    setPasswordSuccess(null);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  // Handle password input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle password change submission
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    
    // Validate passwords
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);
      
      await changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully!');
      
      // Close modal after 2 seconds
      setTimeout(() => {
        handleClosePasswordModal();
      }, 2000);
    } catch (err) {
      console.error('❌ Failed to change password:', err);
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
    setSuccessMessage(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture file selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditError('Image size must be less than 5MB');
        return;
      }
      
      console.log('📸 Profile picture selected:', file.name);
      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setEditError(null);
    }
  };

  // Handle form submission
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      setEditLoading(true);
      setEditError(null);
      setSuccessMessage(null);
      
      console.log('📝 Submitting profile update:', formData);
      
      // Upload profile picture first if selected
      if (profilePictureFile) {
        console.log('📸 Uploading profile picture...');
        try {
          await uploadCustomerProfilePicture(profilePictureFile);
          console.log('✅ Profile picture uploaded');
        } catch (uploadError) {
          console.warn('⚠️ Profile picture upload failed:', uploadError.message);
          // Continue with other updates even if image upload fails
        }
      }
      
      // Send update request - backend uses Bearer token to identify customer
      await updateCustomerProfile(formData);
      
      console.log('✅ Profile update request successful');
      
      // Refetch the complete profile to ensure all fields are present
      const refreshedProfile = await getCustomerProfile();
      console.log('✅ Refreshed profile data:', refreshedProfile);
      console.log('📸 Profile picture field:', refreshedProfile.profilePicture);
      
      // Update local user data with complete data
      const userData = {
        id: refreshedProfile._id,
        name: refreshedProfile.name,
        email: refreshedProfile.email,
        phone: refreshedProfile.phone_number || 'Not specified',
        location: refreshedProfile.location || 'Not specified',
        profilePicture: refreshedProfile.avatar || refreshedProfile.profilePicture,
        registerDate: refreshedProfile.register_date,
        createdAt: refreshedProfile.createdAt,
        updatedAt: refreshedProfile.updatedAt
      };
      setUser(userData);
      
      // Force image refresh by updating the key
      setImageRefreshKey(Date.now());
      
      // Clear file input
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSuccessMessage(null);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="profile-page">
      <div className="profile-container-modern">
        {/* Back Navigation */}
        <button onClick={() => navigate(-1)} className="profile-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span>Back</span>
        </button>

        {/* Success Message */}
        {successMessage && (
          <div className="profile-success-message">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
              <path d="M8 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="profile-main-card">
          {/* Header Section with User Avatar and Info */}
          <div className="profile-header-section">
            <div className="profile-decoration-circle"></div>
            <div className="profile-avatar-container">
              {user.profilePicture ? (
                <img
                  key={imageRefreshKey}
                  src={
                    user.profilePicture.startsWith('http') 
                      ? `${user.profilePicture}?t=${imageRefreshKey}`
                      : `http://localhost:5000${user.profilePicture}?t=${imageRefreshKey}`
                  }
                  alt={user.name}
                  className="profile-avatar-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="profile-avatar-placeholder"
                style={{ display: user.profilePicture ? 'none' : 'flex' }}
              >
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div className="profile-status-badge">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="#10b981">
                  <circle cx="6" cy="6" r="6"/>
                </svg>
              </div>
            </div>
            
            <div className="profile-header-info">
              <h1 className="profile-name">{user.name}</h1>
              <p className="profile-role">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                Customer Account
              </p>
            </div>

            {/* Action Buttons */}
            <div className="profile-actions">
              <button onClick={handleOpenEditModal} className="profile-action-btn primary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit Profile
              </button>
              <button onClick={handleOpenPasswordModal} className="profile-action-btn secondary">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Change Password
              </button>
            </div>
          </div>

          {/* Contact Information Section */}
          <div className="profile-section">
            <div className="profile-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <h2>Contact Information</h2>
            </div>
            
            <div className="profile-info-grid">
              <div className="profile-info-card">
                <div className="info-icon email">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <div className="info-content">
                  <span className="info-label">Email Address</span>
                  <span className="info-value">{user.email}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon phone">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </div>
                <div className="info-content">
                  <span className="info-label">Phone Number</span>
                  <span className="info-value">{user.phone}</span>
                </div>
              </div>

              <div className="profile-info-card">
                <div className="info-icon location">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <div className="info-content">
                  <span className="info-label">Location</span>
                  <span className="info-value">{user.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Account Details Section */}
          <div className="profile-section">
            <div className="profile-section-header">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <h2>Account Details</h2>
            </div>
            
            <div className="profile-details-grid">
              <div className="profile-detail-item">
                <div className="detail-icon-wrapper blue">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">User ID</span>
                  <span className="detail-value">{user.id}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="detail-icon-wrapper green">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/>
                    <line x1="8" y1="2" x2="8" y2="6"/>
                    <line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">Registration Date</span>
                  <span className="detail-value">{formatDate(user.registerDate)}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="detail-icon-wrapper orange">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">Account Created</span>
                  <span className="detail-value">{formatDate(user.createdAt)}</span>
                </div>
              </div>

              <div className="profile-detail-item">
                <div className="detail-icon-wrapper purple">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
                  </svg>
                </div>
                <div className="detail-content">
                  <span className="detail-label">Last Updated</span>
                  <span className="detail-value">{formatDate(user.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="profile-modal-overlay" onClick={handleCloseEditModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon-circle">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <h2>Edit Your Profile</h2>
              </div>
              <button onClick={handleCloseEditModal} className="profile-modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit} className="profile-modal-form">
              {editError && (
                <div className="profile-alert error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{editError}</span>
                </div>
              )}

              {successMessage && (
                <div className="profile-alert success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>{successMessage}</span>
                </div>
              )}

              <div className="profile-form-group">
                <label htmlFor="profilePicture" className="profile-file-upload">
                  <div className="file-upload-preview">
                    {profilePicturePreview ? (
                      <img src={profilePicturePreview} alt="Preview" className="upload-preview-img" />
                    ) : (
                      <div className="upload-placeholder">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                        <span>Upload Profile Picture</span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    style={{ display: 'none' }}
                  />
                </label>
                <p className="profile-input-hint">Max size: 5MB | Formats: JPG, PNG, GIF</p>
              </div>

              <div className="profile-form-group">
                <label htmlFor="name" className="profile-input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your full name"
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="phone_number" className="profile-input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your phone number"
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="location" className="profile-input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter your location"
                  className="profile-input"
                />
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={editLoading}
                  className="profile-btn secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="profile-btn primary"
                >
                  {editLoading ? (
                    <>
                      <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/>
                        <polyline points="7 3 7 8 15 8"/>
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="profile-modal-overlay" onClick={handleClosePasswordModal}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-header">
              <div className="modal-title-wrapper">
                <div className="modal-icon-circle password">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <h2>Change Password</h2>
              </div>
              <button onClick={handleClosePasswordModal} className="profile-modal-close">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPasswordChange} className="profile-modal-form">
              {passwordError && (
                <div className="profile-alert error">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="profile-alert success">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="profile-form-group">
                <label htmlFor="currentPassword" className="profile-input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordInputChange}
                  required
                  placeholder="Enter your current password"
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="newPassword" className="profile-input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordInputChange}
                  required
                  placeholder="Enter new password (min 6 characters)"
                  minLength="6"
                  className="profile-input"
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="confirmPassword" className="profile-input-label">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordInputChange}
                  required
                  placeholder="Confirm your new password"
                  className="profile-input"
                />
              </div>

              <div className="profile-modal-actions">
                <button
                  type="button"
                  onClick={handleClosePasswordModal}
                  disabled={passwordLoading}
                  className="profile-btn secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="profile-btn primary danger"
                >
                  {passwordLoading ? (
                    <>
                      <svg className="spinner-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                      </svg>
                      Changing...
                    </>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      Update Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
