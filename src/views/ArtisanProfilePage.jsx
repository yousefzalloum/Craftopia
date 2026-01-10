import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import craftsmanService from '../services/craftsmanService';
import { get } from '../utils/api';
import '../styles/CraftsmanProfile.css';

const ArtisanProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [profileData, setProfileData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [portfolioComments, setPortfolioComments] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  // Edit profile states
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: '',
    craftType: '',
    description: ''
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  // Portfolio states
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState(null);
  const [portfolioPrice, setPortfolioPrice] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState('');
  const [portfolioSuccess, setPortfolioSuccess] = useState('');
  
  // Password states
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('🔍 Fetching artisan profile...');
        const data = await craftsmanService.getArtisanProfile();
        console.log('✅ Profile data received:', data);
        setProfileData(data);
        setFormData({
          name: data.name || '',
          phone: data.phone || '',
          location: data.location || '',
          craftType: data.craftType || '',
          description: data.description || ''
        });
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
        console.error('Error details:', error.response?.data || error.message);
        // Set loading to false even on error so the page doesn't stay white
        setLoading(false);
        alert('Failed to load profile. Please make sure you are logged in as an artisan.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!profileData || !profileData._id) return;
      
      try {
        setReviewsLoading(true);
        console.log('📋 Fetching reviews for artisan:', profileData._id);
        const data = await get(`/reviews/${profileData._id}`);
        console.log('✅ Reviews fetched:', data);
        
        if (Array.isArray(data)) {
          setReviews(data);
        } else if (data && Array.isArray(data.reviews)) {
          setReviews(data.reviews);
        } else {
          setReviews([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch reviews:', err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (profileData) {
      fetchReviews();
    }
  }, [profileData]);

  // Fetch portfolio comments
  useEffect(() => {
    const fetchAllPortfolioComments = async () => {
      if (!profileData?.portfolioImages || profileData.portfolioImages.length === 0) return;
      
      try {
        console.log('📝 Fetching comments for portfolio images...');
        const commentsData = {};
        
        for (let i = 0; i < profileData.portfolioImages.length; i++) {
          const item = profileData.portfolioImages[i];
          const imageUrl = typeof item === 'string' ? item : item.imageUrl;
          
          try {
            const comments = await get(`/portfolio/comments?imageUrl=${encodeURIComponent(imageUrl)}`);
            commentsData[i] = Array.isArray(comments) ? comments : [];
            console.log(`✅ Fetched ${commentsData[i].length} comments for image ${i}`);
          } catch (err) {
            console.error(`❌ Failed to fetch comments for image ${i}:`, err);
            commentsData[i] = [];
          }
        }
        
        setPortfolioComments(commentsData);
      } catch (err) {
        console.error('❌ Failed to fetch portfolio comments:', err);
      }
    };

    if (profileData) {
      fetchAllPortfolioComments();
    }
  }, [profileData]);

  // Handlers
  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setProfilePicturePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setSuccessMessage('');

    try {
      let updatedData = { ...formData };

      if (profilePicture) {
        const pictureFormData = new FormData();
        pictureFormData.append('profilePicture', profilePicture);
        const uploadResponse = await craftsmanService.uploadProfilePicture(pictureFormData);
        updatedData.profilePicture = uploadResponse.profilePicture;
      }

      const response = await craftsmanService.updateArtisanProfile(updatedData);
      setProfileData(response);
      setSuccessMessage('Profile updated successfully!');
      setSuccessBanner(true);
      
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSuccessBanner(false);
        setProfilePicture(null);
        setProfilePicturePreview(null);
      }, 2000);
    } catch (error) {
      setEditError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const handlePortfolioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPortfolioFile(file);
      setPortfolioPreview(URL.createObjectURL(file));
    }
  };

  const handlePortfolioUpload = async () => {
    if (!portfolioFile || !portfolioPrice || !portfolioDescription) {
      setPortfolioError('Please fill all fields');
      return;
    }

    setPortfolioLoading(true);
    setPortfolioError('');
    setPortfolioSuccess('');

    try {
      const formData = new FormData();
      formData.append('portfolioImage', portfolioFile);
      formData.append('price', portfolioPrice);
      formData.append('description', portfolioDescription);

      const response = await craftsmanService.uploadPortfolioImage(formData);
      setProfileData(response);
      setPortfolioSuccess('Portfolio image uploaded successfully!');
      
      setTimeout(() => {
        setIsPortfolioModalOpen(false);
        setPortfolioFile(null);
        setPortfolioPreview(null);
        setPortfolioPrice('');
        setPortfolioDescription('');
        setPortfolioSuccess('');
      }, 2000);
    } catch (error) {
      setPortfolioError(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setPortfolioLoading(false);
    }
  };

  const handleDeletePortfolioImage = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this portfolio image?')) return;

    try {
      const response = await craftsmanService.deletePortfolioImage({ imageUrl });
      setProfileData(response);
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 3000);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete image');
    }
  };

  const handlePasswordInputChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await craftsmanService.changeArtisanPassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setPasswordSuccess('');
      }, 2000);
    } catch (error) {
      setPasswordError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReviewDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(Math.round(rating));
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)'
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <h2>Loading Profile...</h2>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        color: 'white',
        padding: '20px'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
        <h2>Failed to Load Profile</h2>
        <p style={{ marginBottom: '20px' }}>Please make sure you are logged in as an artisan.</p>
        <button 
          onClick={() => navigate('/login')}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#2c3e50',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="artisan-profile-modern">
      <div className="artisan-container">
        {/* Back Button */}
        <button onClick={() => navigate('/craftsman-dashboard')} className="artisan-back-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to Dashboard
        </button>

        {/* Success Toast */}
        {successBanner && (
          <div className="artisan-success-toast">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <span>Changes saved successfully!</span>
          </div>
        )}

        {/* Hero Card */}
        <div className="artisan-hero-card">
          <div className="artisan-hero-bg">
            <div className="artisan-decoration-circle"></div>
          </div>

          {/* Profile Section */}
          <div className="artisan-profile-section">
            {/* Avatar */}
            <div className="artisan-avatar-wrapper">
              {profileData.profilePicture ? (
                <img
                  src={profileData.profilePicture.startsWith('http') 
                    ? profileData.profilePicture 
                    : `http://localhost:5000${profileData.profilePicture}`}
                  alt={profileData.name}
                  className="artisan-avatar-img"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=2c3e50&color=fff&size=160`;
                  }}
                />
              ) : (
                <div className="artisan-avatar-placeholder">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </div>
              )}
              
              {profileData.available && (
                <div className="artisan-status-badge">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10"></circle>
                  </svg>
                  Available
                </div>
              )}
            </div>

            {/* Info */}
            <div className="artisan-info">
              <h1 className="artisan-name">{profileData.name}</h1>
              
              <div className="artisan-craft-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
                {profileData.craftType}
              </div>
              
              <div className="artisan-location">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {profileData.location}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="artisan-actions">
              <button onClick={() => setIsEditModalOpen(true)} className="artisan-action-btn primary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
                Edit Profile
              </button>
              
              <button onClick={() => setIsPasswordModalOpen(true)} className="artisan-action-btn secondary">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                Change Password
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="artisan-stats-grid">
            <div className="artisan-stat-card">
              <div className="stat-icon rating">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Rating</div>
                <div className="stat-value">{profileData.averageRating ? profileData.averageRating.toFixed(1) : '0.0'}</div>
              </div>
            </div>

            <div className="artisan-stat-card">
              <div className="stat-icon portfolio">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Portfolio</div>
                <div className="stat-value">{profileData.portfolioImages?.length || 0}</div>
              </div>
            </div>

            <div className="artisan-stat-card">
              <div className="stat-icon reviews">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Reviews</div>
                <div className="stat-value">{reviews.length}</div>
              </div>
            </div>

            <div className="artisan-stat-card">
              <div className="stat-icon joined">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-label">Joined</div>
                <div className="stat-value-small">{formatDate(profileData.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        {profileData.description && (
          <div className="artisan-section-card">
            <div className="artisan-section-header">
              <div className="header-left">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <h2>About Me</h2>
              </div>
            </div>
            <p className="artisan-description">{profileData.description}</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="artisan-section-card">
          <div className="artisan-section-header">
            <div className="header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <h2>Contact Information</h2>
            </div>
          </div>
          
          <div className="artisan-contact-grid">
            <div className="contact-item">
              <div className="contact-icon email">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
              <div className="contact-details">
                <div className="contact-label">Email</div>
                <div className="contact-value">{profileData.email}</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon phone">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <div className="contact-details">
                <div className="contact-label">Phone</div>
                <div className="contact-value">{profileData.phone}</div>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon location">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
              </div>
              <div className="contact-details">
                <div className="contact-label">Location</div>
                <div className="contact-value">{profileData.location}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="artisan-section-card">
          <div className="artisan-section-header">
            <div className="header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              <h2>My Portfolio ({profileData.portfolioImages?.length || 0})</h2>
            </div>
            <button onClick={() => setIsPortfolioModalOpen(true)} className="artisan-add-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Work
            </button>
          </div>

          {profileData.portfolioImages && profileData.portfolioImages.length > 0 ? (
            <div className="artisan-portfolio-grid">
              {profileData.portfolioImages.map((item, index) => {
                const imageUrl = typeof item === 'string' ? item : item.imageUrl;
                const price = typeof item === 'object' ? item.price : null;
                const description = typeof item === 'object' ? item.description : null;

                return (
                  <div key={index} className="portfolio-card">
                    <div className="portfolio-image-wrapper">
                      <img
                        src={imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`}
                        alt={description || `Portfolio ${index + 1}`}
                        className="portfolio-img"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                        }}
                      />
                      <button
                        onClick={() => handleDeletePortfolioImage(imageUrl)}
                        className="portfolio-delete-btn"
                        title="Delete image"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>

                    <div className="portfolio-details">
                      {price && (
                        <div className="portfolio-price">${price}</div>
                      )}
                      {description && (
                        <p className="portfolio-description">{description}</p>
                      )}

                      {portfolioComments[index] && portfolioComments[index].length > 0 && (
                        <div className="portfolio-comments-section">
                          <div className="comments-header">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            Customer Comments ({portfolioComments[index].length})
                          </div>
                          {portfolioComments[index].map((comment) => (
                            <div key={comment._id} className="comment-item">
                              <div className="comment-avatar">
                                {comment.customer.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="comment-content">
                                <div className="comment-header">
                                  <span className="comment-author">{comment.customer.name}</span>
                                  <span className="comment-date">
                                    {new Date(comment.createdAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric'
                                    })}
                                  </span>
                                </div>
                                <p className="comment-text">{comment.comment}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-comments">No portfolio items yet. Add some work samples to showcase your skills!</div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="artisan-section-card">
          <div className="artisan-section-header">
            <div className="header-left">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <h2>Customer Reviews ({reviews.length})</h2>
            </div>
          </div>

          {reviewsLoading ? (
            <div className="no-comments">Loading reviews...</div>
          ) : reviews.length > 0 ? (
            <div className="artisan-reviews-list">
              {(showAllReviews ? reviews : reviews.slice(-1)).map((review) => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-author-section">
                      <div className="review-avatar">
                        {review.customer?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div className="review-author-info">
                        <div className="review-author-name">{review.customer?.name || 'Customer'}</div>
                        <div className="review-date">{formatReviewDate(review.review_date)}</div>
                      </div>
                    </div>
                    <div className="review-rating">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                      </svg>
                      {review.stars_number}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}

              {reviews.length > 1 && (
                <button
                  onClick={() => setShowAllReviews(!showAllReviews)}
                  className="reviews-show-more"
                >
                  {showAllReviews ? 'Show Less' : `Show All ${reviews.length} Reviews`}
                </button>
              )}
            </div>
          ) : (
            <div className="no-reviews">No reviews yet. You'll see customer feedback here.</div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="artisan-modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="artisan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="artisan-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </div>
                <h2>Edit Profile</h2>
              </div>
              <button onClick={() => setIsEditModalOpen(false)} className="modal-close-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitEdit}>
              <div className="artisan-modal-body">
                {editError && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontWeight: 600
                  }}>
                    {editError}
                  </div>
                )}

                {successMessage && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontWeight: 600
                  }}>
                    {successMessage}
                  </div>
                )}

                <div className="artisan-form-group">
                  <label htmlFor="profilePicture">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Profile Picture
                  </label>
                  <input
                    type="file"
                    id="profilePicture"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="artisan-form-file-input"
                  />
                  <label htmlFor="profilePicture" className="artisan-file-label">
                    <div className="file-icon">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div className="file-text">
                      <strong>Click to upload</strong> or drag and drop
                    </div>
                  </label>
                  {profilePicturePreview && (
                    <div className="image-preview">
                      <img src={profilePicturePreview} alt="Preview" className="preview-img" />
                      <button
                        type="button"
                        onClick={() => {
                          setProfilePicture(null);
                          setProfilePicturePreview(null);
                        }}
                        className="remove-preview-btn"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="name">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="artisan-form-input"
                    required
                  />
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="phone">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                    </svg>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="artisan-form-input"
                    required
                  />
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="location">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="artisan-form-input"
                    required
                  />
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="craftType">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                    </svg>
                    Craft Type
                  </label>
                  <input
                    type="text"
                    id="craftType"
                    name="craftType"
                    value={formData.craftType}
                    onChange={handleInputChange}
                    className="artisan-form-input"
                    required
                  />
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="description">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="artisan-form-textarea"
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div className="artisan-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="artisan-modal-btn cancel"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="artisan-modal-btn submit"
                  disabled={editLoading}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Portfolio Upload Modal */}
      {isPortfolioModalOpen && (
        <div className="artisan-modal-overlay" onClick={() => setIsPortfolioModalOpen(false)}>
          <div className="artisan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="artisan-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                </div>
                <h2>Add Portfolio Image</h2>
              </div>
              <button onClick={() => setIsPortfolioModalOpen(false)} className="modal-close-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div className="artisan-modal-body">
              {portfolioError && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontWeight: 600
                }}>
                  {portfolioError}
                </div>
              )}

              {portfolioSuccess && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  color: '#10b981',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontWeight: 600
                }}>
                  {portfolioSuccess}
                </div>
              )}

              <div className="artisan-form-group">
                <label htmlFor="portfolioImage">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                  </svg>
                  Select Image
                </label>
                <input
                  type="file"
                  id="portfolioImage"
                  accept="image/*"
                  onChange={handlePortfolioFileChange}
                  className="artisan-form-file-input"
                  disabled={portfolioLoading}
                />
                <label htmlFor="portfolioImage" className="artisan-file-label">
                  <div className="file-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </div>
                  <div className="file-text">
                    <strong>Click to upload</strong> portfolio image
                  </div>
                </label>
                {portfolioPreview && (
                  <div className="image-preview">
                    <img src={portfolioPreview} alt="Preview" className="preview-img" />
                  </div>
                )}
              </div>

              <div className="artisan-form-group">
                <label htmlFor="portfolioPrice">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  Price ($)
                </label>
                <input
                  type="number"
                  id="portfolioPrice"
                  min="0"
                  step="0.01"
                  value={portfolioPrice}
                  onChange={(e) => setPortfolioPrice(e.target.value)}
                  className="artisan-form-input"
                  placeholder="Enter price"
                  disabled={portfolioLoading}
                />
              </div>

              <div className="artisan-form-group">
                <label htmlFor="portfolioDescription">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                  Description
                </label>
                <textarea
                  id="portfolioDescription"
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  className="artisan-form-textarea"
                  placeholder="Describe your work..."
                  rows="4"
                  disabled={portfolioLoading}
                ></textarea>
              </div>
            </div>

            <div className="artisan-modal-footer">
              <button
                type="button"
                onClick={() => setIsPortfolioModalOpen(false)}
                className="artisan-modal-btn cancel"
                disabled={portfolioLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePortfolioUpload}
                className="artisan-modal-btn submit"
                disabled={portfolioLoading || !portfolioFile || !portfolioPrice || !portfolioDescription}
              >
                {portfolioLoading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="artisan-modal-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <div className="artisan-modal" onClick={(e) => e.stopPropagation()}>
            <div className="artisan-modal-header">
              <div className="modal-header-content">
                <div className="modal-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                </div>
                <h2>Change Password</h2>
              </div>
              <button onClick={() => setIsPasswordModalOpen(false)} className="modal-close-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmitPasswordChange}>
              <div className="artisan-modal-body">
                {passwordError && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    color: '#ef4444',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontWeight: 600
                  }}>
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    color: '#10b981',
                    borderRadius: '12px',
                    marginBottom: '20px',
                    fontWeight: 600
                  }}>
                    {passwordSuccess}
                  </div>
                )}

                <div className="artisan-form-group">
                  <label htmlFor="oldPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Current Password
                  </label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    className="artisan-form-input"
                    required
                    disabled={passwordLoading}
                  />
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="newPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    className="artisan-form-input"
                    required
                    minLength="6"
                    disabled={passwordLoading}
                  />
                </div>

                <div className="artisan-form-group">
                  <label htmlFor="confirmPassword">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="artisan-form-input"
                    required
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <div className="artisan-modal-footer">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="artisan-modal-btn cancel"
                  disabled={passwordLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="artisan-modal-btn submit"
                  disabled={passwordLoading}
                  style={{ background: passwordLoading ? '#94a3b8' : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanProfilePage;
