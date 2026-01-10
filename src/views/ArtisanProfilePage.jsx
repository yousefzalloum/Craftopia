import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArtisanProfile, updateArtisanProfile, uploadProfilePicture, uploadPortfolioImage, deletePortfolioImage, changeArtisanPassword } from '../services/craftsmanService';
import { get } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/CraftsmanProfile.css';

/**
 * ArtisanProfilePage - Displays the logged-in artisan's own profile
 * Fetches data from GET /artisans/profile endpoint with bearer token authentication
 */
const ArtisanProfilePage = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  
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
    phone: '',
    location: '',
    craftType: '',
    description: ''
  });
  
  // Portfolio upload states
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState(null);
  const [portfolioPrice, setPortfolioPrice] = useState('');
  const [portfolioDescription, setPortfolioDescription] = useState('');
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState(null);
  const [portfolioSuccess, setPortfolioSuccess] = useState(null);
  const [portfolioComments, setPortfolioComments] = useState({});

  // Change password states
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState(null);
  const [passwordSuccess, setPasswordSuccess] = useState(null);
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn || role !== 'artisan') {
      console.log('❌ Not authenticated as artisan');
      alert('Please login as an artisan to view this page');
      navigate('/login');
      return;
    }

    // Fetch artisan profile
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📋 Fetching artisan profile...');
        
        const data = await getArtisanProfile();
        console.log('✅ Profile data received:', data);
        console.log('📱 Phone field:', data.phone);
        console.log('📋 All data fields:', Object.keys(data));
        
        setProfileData(data);
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, role, navigate]);

  // Fetch reviews for this artisan
  useEffect(() => {
    const fetchReviews = async () => {
      if (!profileData || !profileData._id) return;
      
      try {
        setReviewsLoading(true);
        console.log('📋 Fetching reviews for artisan:', profileData._id);
        console.log('📋 Using endpoint: /reviews/' + profileData._id);
        const data = await get(`/reviews/${profileData._id}`);
        console.log('✅ Reviews fetched - RAW DATA:', data);
        console.log('✅ Is Array?', Array.isArray(data));
        console.log('✅ Data type:', typeof data);
        
        if (Array.isArray(data)) {
          console.log('✅ Setting reviews array with length:', data.length);
          setReviews(data);
        } else if (data && Array.isArray(data.reviews)) {
          console.log('✅ Setting reviews from data.reviews with length:', data.reviews.length);
          setReviews(data.reviews);
        } else {
          console.log('⚠️ No valid reviews found, data structure:', data);
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

  // Fetch comments for portfolio images
  useEffect(() => {
    const fetchAllPortfolioComments = async () => {
      if (!profileData || !profileData.portfolioImages || profileData.portfolioImages.length === 0) return;
      
      try {
        console.log('📝 Fetching comments for portfolio images...');
        const commentsData = {};
        
        for (let i = 0; i < profileData.portfolioImages.length; i++) {
          const imageUrl = profileData.portfolioImages[i];
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

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h2>Error Loading Profile</h2>
        <p className="error-message">{error}</p>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h2>Profile not found</h2>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatReviewDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem', fontSize: '1.2rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} style={{ color: star <= rating ? '#f39c12' : '#ddd' }}>
            ★
          </span>
        ))}
      </div>
    );
  };

  // Open edit modal and pre-fill form with current data
  const handleOpenEditModal = () => {
    if (profileData) {
      setFormData({
        name: profileData.name || '',
        phone: profileData.phone || '',
        location: profileData.location || '',
        craftType: profileData.craftType || '',
        description: profileData.description || ''
      });
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setIsEditModalOpen(true);
      setEditError(null);
      setSuccessMessage(null);
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
      console.log('📱 Phone being sent:', formData.phone);
      
      // Upload profile picture first if selected
      if (profilePictureFile) {
        console.log('📸 Uploading profile picture...');
        try {
          const uploadResponse = await uploadProfilePicture(profilePictureFile);
          console.log('✅ Profile picture uploaded:', uploadResponse);
          console.log('📸 New profile picture path:', uploadResponse.profilePicture);
        } catch (uploadError) {
          console.warn('⚠️ Profile picture upload failed:', uploadError.message);
          // Continue with other updates even if image upload fails
        }
      }
      
      // Send update request - backend uses Bearer token to identify artisan
      await updateArtisanProfile(formData);
      
      console.log('✅ Profile update request successful');
      
      // Wait a moment for backend to process the image
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch the complete profile to ensure all fields are present
      const refreshedProfile = await getArtisanProfile();
      console.log('✅ Refreshed profile data:', refreshedProfile);
      console.log('📸 Profile picture field:', refreshedProfile.profilePicture);
      console.log('� Phone number after refresh:', refreshedProfile.phone_number);
      console.log('�📸 Profile picture field:', refreshedProfile.profilePicture);
      console.log('📸 Full image URL will be:', refreshedProfile.profilePicture ? `${window.location.origin}${refreshedProfile.profilePicture}` : 'No profile picture');
      
      // Update local profile data with complete data
      setProfileData(refreshedProfile);
      
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

  // Open portfolio upload modal
  const handleOpenPortfolioModal = () => {
    setIsPortfolioModalOpen(true);
    setPortfolioFile(null);
    setPortfolioPreview(null);
    setPortfolioPrice('');
    setPortfolioDescription('');
    setPortfolioError(null);
    setPortfolioSuccess(null);
  };

  // Close portfolio upload modal
  const handleClosePortfolioModal = () => {
    setIsPortfolioModalOpen(false);
    setPortfolioFile(null);
    setPortfolioPreview(null);
    setPortfolioPrice('');
    setPortfolioDescription('');
    setPortfolioError(null);
    setPortfolioSuccess(null);
  };

  // Handle portfolio file selection
  const handlePortfolioFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setPortfolioError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setPortfolioError('Image size must be less than 5MB');
        return;
      }
      
      console.log('🎨 Portfolio image selected:', file.name);
      setPortfolioFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setPortfolioError(null);
    }
  };

  // Handle portfolio upload
  const handlePortfolioUpload = async () => {
    if (!portfolioFile) {
      setPortfolioError('Please select an image first');
      return;
    }
    
    if (!portfolioPrice || portfolioPrice <= 0) {
      setPortfolioError('Please enter a valid price');
      return;
    }
    
    if (!portfolioDescription.trim()) {
      setPortfolioError('Please enter a description');
      return;
    }

    try {
      setPortfolioLoading(true);
      setPortfolioError(null);
      
      console.log('🎨 Uploading portfolio image with price and description...');
      const response = await uploadPortfolioImage(portfolioFile, portfolioPrice, portfolioDescription);
      
      console.log('✅ Portfolio upload successful:', response);
      
      // Update profile data with new portfolio from response
      if (response.portfolio) {
        setProfileData(prev => ({
          ...prev,
          portfolioImages: response.portfolio
        }));
      } else {
        // Fallback: refresh profile to get updated portfolio
        const refreshedProfile = await getArtisanProfile();
        setProfileData(refreshedProfile);
      }
      
      setPortfolioSuccess('Portfolio image added successfully!');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        handleClosePortfolioModal();
      }, 1500);
      
    } catch (err) {
      console.error('❌ Failed to upload portfolio image:', err);
      setPortfolioError(err.message || 'Failed to upload portfolio image');
    } finally {
      setPortfolioLoading(false);
    }
  };

  // Handle portfolio image deletion
  const handleDeletePortfolioImage = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this portfolio image?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting portfolio image:', imageUrl);
      const response = await deletePortfolioImage(imageUrl);
      
      console.log('✅ Portfolio image deleted:', response);
      
      // Update profile data with new portfolio images
      setProfileData(prev => ({
        ...prev,
        portfolioImages: response.portfolioImages
      }));
      
    } catch (err) {
      console.error('❌ Failed to delete portfolio image:', err);
      alert(err.message || 'Failed to delete portfolio image');
    }
  };

  // Open password change modal
  const handleOpenPasswordModal = () => {
    setPasswordData({
      oldPassword: '',
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
      oldPassword: '',
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
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
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
      
      await changeArtisanPassword({
        oldPassword: passwordData.oldPassword,
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

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => navigate('/craftsman-dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleOpenPasswordModal} className="btn-change-password" style={{ background: '#e74c3c' }}>
                🔒 Change Password
              </button>
              <button onClick={handleOpenEditModal} className="btn-edit-profile">
                ✏️ Edit Profile
              </button>
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="success-banner">
              ✅ {successMessage}
            </div>
          )}
          
          <div className="profile-hero">
            <div className="profile-image-container">
              <img 
                key={imageRefreshKey}
                src={
                  (profileData.avatar || profileData.profilePicture)
                    ? ((profileData.avatar || profileData.profilePicture).startsWith('http') 
                        ? `${profileData.avatar || profileData.profilePicture}?t=${imageRefreshKey}`
                        : `http://localhost:5000${profileData.avatar || profileData.profilePicture}?t=${imageRefreshKey}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3498db&color=fff&size=200`
                }
                alt={profileData.name}
                className="profile-image"
                onError={(e) => {
                  console.error('❌ Failed to load profile picture:', e.target.src);
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3498db&color=fff&size=200`;
                }}
              />
              <span className="availability-badge">Active</span>
            </div>

            <div className="profile-info">
              <h1>{profileData.name}</h1>
              <p className="profession">{profileData.craftType}</p>
              <p className="location">📍 {profileData.location}</p>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <strong>{profileData.averageRating ? profileData.averageRating.toFixed(1) : '0.0'}</strong>
                    <small>Rating</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📷</span>
                  <div>
                    <strong>{profileData.portfolioImages?.length || 0}</strong>
                    <small>Portfolio</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <div>
                    <strong>{formatDate(profileData.createdAt)}</strong>
                    <small>Member Since</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-section">
          <h2>📖 About Me</h2>
          <p className="bio">
            {profileData.description || 'No description provided yet.'}
          </p>
        </div>

        {/* Contact Section */}
        <div className="profile-section">
          <h2>📞 Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <strong>📧 Email:</strong>
              <span>{profileData.email}</span>
            </div>
            <div className="contact-item">
              <strong>📱 Phone:</strong>
              <span>{profileData.phone || 'Not provided'}</span>
            </div>
            <div className="contact-item">
              <strong>📍 Location:</strong>
              <span>{profileData.location}</span>
            </div>
            <div className="contact-item">
              <strong>🔨 Craft Type:</strong>
              <span>{profileData.craftType}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="profile-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2>🎨 Portfolio</h2>
            <button 
              onClick={handleOpenPortfolioModal}
              style={{
                padding: '0.5rem 1rem',
                background: '#27ae60',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              + Add Image
            </button>
          </div>
          {profileData.portfolioImages && profileData.portfolioImages.length > 0 ? (
            <div className="portfolio-grid">
              {profileData.portfolioImages.map((item, index) => {
                // Handle both old format (just URL string) and new format (object with imageUrl, price, description)
                const imageUrl = typeof item === 'string' ? item : item.imageUrl;
                const price = typeof item === 'object' ? item.price : null;
                const description = typeof item === 'object' ? item.description : null;
                const itemId = typeof item === 'object' ? item._id : null;
                
                return (
                  <div key={itemId || index} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="portfolio-item">
                      <div className="portfolio-image" style={{ position: 'relative' }}>
                        <img 
                          src={
                            imageUrl.startsWith('http') 
                              ? imageUrl 
                              : `http://localhost:5000${imageUrl}`
                          }
                          alt={description || `Portfolio ${index + 1}`}
                          onError={(e) => {
                            console.error('❌ Failed to load portfolio image:', e.target.src);
                            e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                          }}
                        />
                      <button
                        onClick={() => handleDeletePortfolioImage(imageUrl)}
                        style={{
                          position: 'absolute',
                          top: '0.5rem',
                          right: '0.5rem',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#c0392b';
                          e.target.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#e74c3c';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Delete image"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Display price and description if available */}
                    {(price || description) && (
                      <div style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e1e8ed' }}>
                        {price && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <strong style={{ color: '#27ae60', fontSize: '1.2rem' }}>
                              ${price}
                            </strong>
                          </div>
                        )}
                        {description && (
                          <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.9rem', lineHeight: '1.5' }}>
                            {description}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Display customer comments */}
                  {portfolioComments[index] && portfolioComments[index].length > 0 && (
                    <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#2c3e50' }}>
                        💬 Customer Comments ({portfolioComments[index].length})
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {portfolioComments[index].map((comment) => (
                          <div 
                            key={comment._id} 
                            style={{
                              padding: '0.75rem',
                              background: 'white',
                              border: '1px solid #e1e8ed',
                              borderRadius: '8px'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                              <img 
                                src={
                                  comment.customer.profilePicture?.startsWith('http') 
                                    ? comment.customer.profilePicture
                                    : `http://localhost:5000${comment.customer.profilePicture}`
                                }
                                alt={comment.customer.name}
                                style={{
                                  width: '32px',
                                  height: '32px',
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.customer.name)}&background=3498db&color=fff&size=32`;
                                }}
                              />
                              <div style={{ flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: 'bold', fontSize: '0.9rem', color: '#2c3e50' }}>
                                  {comment.customer.name}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#7f8c8d' }}>
                                  {new Date(comment.createdAt).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#34495e', lineHeight: '1.5' }}>
                              {comment.comment}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🖼️</div>
              <h3>No portfolio items yet</h3>
              <p>Add some work samples to showcase your skills!</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="profile-section">
          <h2>⭐ Customer Reviews ({reviews.length})</h2>
          {reviewsLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {(showAllReviews ? reviews : reviews.slice(-1)).map((review) => (
                  <div 
                    key={review._id} 
                    style={{
                      background: '#f8f9fa',
                      padding: '1.5rem',
                      borderRadius: '12px',
                      border: '1px solid #dee2e6'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1.1rem', color: '#2c3e50' }}>
                            {review.customer?.name || 'Customer'}
                          </strong>
                          {renderStars(review.stars_number)}
                        </div>
                        <p style={{ color: '#7f8c8d', fontSize: '0.9rem', margin: 0 }}>
                          {formatReviewDate(review.review_date)}
                        </p>
                      </div>
                    </div>
                    <p style={{ 
                      color: '#2c3e50', 
                      lineHeight: '1.6', 
                      margin: 0,
                      fontSize: '1rem'
                    }}>
                      {review.comment}
                    </p>
                  </div>
                ))}
              </div>
              {reviews.length > 1 && (
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                  <button 
                    onClick={() => setShowAllReviews(!showAllReviews)}
                    style={{
                      padding: '0.75rem 2rem',
                      background: '#3498db',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'background 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                    onMouseLeave={(e) => e.target.style.background = '#3498db'}
                  >
                    {showAllReviews ? '← Show Less' : `Show More (${reviews.length - 1} more reviews) →`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <h3>No reviews yet</h3>
              <p>You haven't received any customer reviews yet.</p>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="profile-section">
          <h2>ℹ️ Profile Details</h2>
          <div className="profile-details-grid">
            <div className="detail-card">
              <strong>Profile ID</strong>
              <span className="detail-value">{profileData._id}</span>
            </div>
            <div className="detail-card">
              <strong>Created At</strong>
              <span className="detail-value">{formatDate(profileData.createdAt)}</span>
            </div>
            <div className="detail-card">
              <strong>Last Updated</strong>
              <span className="detail-value">{formatDate(profileData.updatedAt)}</span>
            </div>
            <div className="detail-card">
              <strong>Average Rating</strong>
              <span className="detail-value">⭐ {profileData.averageRating ? profileData.averageRating.toFixed(1) : '0.0'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={handleCloseEditModal}>
          <div className="modal-content edit-profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✏️ Edit Profile</h2>
              <button onClick={handleCloseEditModal} className="btn-close-modal">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit} className="edit-profile-form">
              {editError && (
                <div className="error-message">
                  ❌ {editError}
                </div>
              )}
              
              {successMessage && (
                <div className="success-message">
                  ✅ {successMessage}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture</label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
                {profilePicturePreview && (
                  <div style={{ marginTop: '1rem' }}>
                    <img 
                      src={profilePicturePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '50%',
                        border: '3px solid #667eea'
                      }} 
                    />
                  </div>
                )}
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                  Upload an image file (max 5MB)
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Your phone number"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="location">Location *</label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="Your city or location"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="craftType">Craft Type *</label>
                <input
                  type="text"
                  id="craftType"
                  name="craftType"
                  value={formData.craftType}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Electrician, Plumber, Carpenter"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  placeholder="Tell customers about your skills and experience"
                ></textarea>
              </div>
              
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  className="btn-cancel"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-save"
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
        <div className="modal-overlay" onClick={handleClosePortfolioModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>🎨 Add Portfolio Image</h2>
              <button onClick={handleClosePortfolioModal} className="btn-close-modal">
                ✕
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {portfolioError && (
                <div className="error-message" style={{ marginBottom: '1rem' }}>
                  ❌ {portfolioError}
                </div>
              )}
              
              {portfolioSuccess && (
                <div className="success-message" style={{ marginBottom: '1rem' }}>
                  ✅ {portfolioSuccess}
                </div>
              )}
              
              <div className="form-group">
                <label htmlFor="portfolioImage">Select Image *</label>
                <input
                  type="file"
                  id="portfolioImage"
                  accept="image/*"
                  onChange={handlePortfolioFileChange}
                  disabled={portfolioLoading}
                />
                {portfolioPreview && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <img 
                      src={portfolioPreview} 
                      alt="Preview" 
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '300px',
                        borderRadius: '8px',
                        border: '2px solid #667eea'
                      }} 
                    />
                  </div>
                )}
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                  Upload an image file (max 5MB)
                </small>
              </div>
              
              <div className="form-group">
                <label htmlFor="portfolioPrice">Price ($) *</label>
                <input
                  type="number"
                  id="portfolioPrice"
                  min="0"
                  step="0.01"
                  value={portfolioPrice}
                  onChange={(e) => setPortfolioPrice(e.target.value)}
                  placeholder="Enter price"
                  disabled={portfolioLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="portfolioDescription">Description *</label>
                <textarea
                  id="portfolioDescription"
                  value={portfolioDescription}
                  onChange={(e) => setPortfolioDescription(e.target.value)}
                  placeholder="Describe your work..."
                  rows="3"
                  disabled={portfolioLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                ></textarea>
              </div>
              
              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={handleClosePortfolioModal}
                  className="btn-cancel"
                  disabled={portfolioLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePortfolioUpload}
                  className="btn-save"
                  disabled={portfolioLoading || !portfolioFile || !portfolioPrice || !portfolioDescription}
                  style={{
                    opacity: (!portfolioFile || portfolioLoading || !portfolioPrice || !portfolioDescription) ? 0.6 : 1,
                    cursor: (!portfolioFile || portfolioLoading || !portfolioPrice || !portfolioDescription) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {portfolioLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="modal-overlay" onClick={handleClosePasswordModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h2>🔒 Change Password</h2>
              <button onClick={handleClosePasswordModal} className="btn-close-modal">
                ✕
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              <form onSubmit={handleSubmitPasswordChange}>
                {passwordError && (
                  <div className="error-message" style={{ marginBottom: '1rem' }}>
                    ❌ {passwordError}
                  </div>
                )}
                
                {passwordSuccess && (
                  <div className="success-message" style={{ marginBottom: '1rem' }}>
                    ✅ {passwordSuccess}
                  </div>
                )}
                
                <div className="form-group">
                  <label htmlFor="oldPassword">Current Password *</label>
                  <input
                    type="password"
                    id="oldPassword"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    required
                    placeholder="Enter current password"
                    disabled={passwordLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="newPassword">New Password *</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    placeholder="Enter new password (min 6 characters)"
                    minLength="6"
                    disabled={passwordLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password *</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    placeholder="Confirm new password"
                    disabled={passwordLoading}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                  <button
                    type="button"
                    onClick={handleClosePasswordModal}
                    className="btn-cancel"
                    disabled={passwordLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-save"
                    disabled={passwordLoading}
                    style={{
                      background: '#e74c3c',
                      opacity: passwordLoading ? 0.6 : 1,
                      cursor: passwordLoading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {passwordLoading ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanProfilePage;
