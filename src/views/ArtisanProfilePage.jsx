import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArtisanProfile, updateArtisanProfile, uploadProfilePicture, uploadPortfolioImage } from '../services/craftsmanService';
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
  
  // Edit profile states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    location: '',
    craftType: '',
    description: ''
  });
  
  // Portfolio upload states
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [portfolioFile, setPortfolioFile] = useState(null);
  const [portfolioPreview, setPortfolioPreview] = useState(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState(null);
  const [portfolioSuccess, setPortfolioSuccess] = useState(null);

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
        console.log('📋 Using endpoint: /reviews/artisan/' + profileData._id);
        const data = await get(`/reviews/artisan/${profileData._id}`);
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
        phone_number: profileData.phone_number || '',
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
      
      // Upload profile picture first if selected
      if (profilePictureFile) {
        console.log('📸 Uploading profile picture...');
        try {
          await uploadProfilePicture(profilePictureFile);
          console.log('✅ Profile picture uploaded');
        } catch (uploadError) {
          console.warn('⚠️ Profile picture upload failed:', uploadError.message);
          // Continue with other updates even if image upload fails
        }
      }
      
      // Send update request - backend uses Bearer token to identify artisan
      await updateArtisanProfile(formData);
      
      console.log('✅ Profile update request successful');
      
      // Refetch the complete profile to ensure all fields are present
      const refreshedProfile = await getArtisanProfile();
      console.log('✅ Refreshed profile data:', refreshedProfile);
      console.log('📸 Profile picture field:', refreshedProfile.profilePicture);
      console.log('📸 Full image URL will be:', refreshedProfile.profilePicture ? `${window.location.origin}${refreshedProfile.profilePicture}` : 'No profile picture');
      
      // Update local profile data with complete data
      setProfileData(refreshedProfile);
      
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
    setPortfolioError(null);
    setPortfolioSuccess(null);
  };

  // Close portfolio upload modal
  const handleClosePortfolioModal = () => {
    setIsPortfolioModalOpen(false);
    setPortfolioFile(null);
    setPortfolioPreview(null);
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

    try {
      setPortfolioLoading(true);
      setPortfolioError(null);
      
      console.log('🎨 Uploading portfolio image...');
      const response = await uploadPortfolioImage(portfolioFile);
      
      console.log('✅ Portfolio upload successful:', response);
      
      // Refresh profile to get updated portfolio
      const refreshedProfile = await getArtisanProfile();
      setProfileData(refreshedProfile);
      
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

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => navigate('/craftsman-dashboard')} className="btn-back">
              ← Back to Dashboard
            </button>
            <button onClick={handleOpenEditModal} className="btn-edit-profile">
              ✏️ Edit Profile
            </button>
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
                src={
                  profileData.profilePicture
                    ? (profileData.profilePicture.startsWith('http') 
                        ? profileData.profilePicture 
                        : `http://localhost:5000${profileData.profilePicture}`)
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
                    <strong>{profileData.averageRating.toFixed(1)}</strong>
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
              <span>{profileData.phone_number || 'Not provided'}</span>
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
              {profileData.portfolioImages.map((imageUrl, index) => (
                <div key={index} className="portfolio-item">
                  <div className="portfolio-image">
                    <img 
                      src={
                        imageUrl.startsWith('http') 
                          ? imageUrl 
                          : `http://localhost:5000${imageUrl}`
                      }
                      alt={`Portfolio ${index + 1}`}
                      onError={(e) => {
                        console.error('❌ Failed to load portfolio image:', e.target.src);
                        e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                      }}
                    />
                  </div>
                </div>
              ))}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {reviews.map((review) => (
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
              <span className="detail-value">⭐ {profileData.averageRating.toFixed(1)}</span>
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
                <label htmlFor="phone_number">Phone Number *</label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
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
                <label htmlFor="portfolioImage">Select Image</label>
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
                  disabled={portfolioLoading || !portfolioFile}
                  style={{
                    opacity: (!portfolioFile || portfolioLoading) ? 0.6 : 1,
                    cursor: (!portfolioFile || portfolioLoading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {portfolioLoading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanProfilePage;
