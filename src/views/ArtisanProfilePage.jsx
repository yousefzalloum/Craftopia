import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArtisanProfile } from '../services/craftsmanService';
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

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <button onClick={() => navigate('/craftsman-dashboard')} className="btn-back">
            ← Back to Dashboard
          </button>
          
          <div className="profile-hero">
            <div className="profile-image-container">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=3498db&color=fff&size=200`}
                alt={profileData.name}
                className="profile-image"
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
          <h2>🎨 Portfolio</h2>
          {profileData.portfolioImages && profileData.portfolioImages.length > 0 ? (
            <div className="portfolio-grid">
              {profileData.portfolioImages.map((imageUrl, index) => (
                <div key={index} className="portfolio-item">
                  <div className="portfolio-image">
                    <img 
                      src={imageUrl} 
                      alt={`Portfolio ${index + 1}`}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'}
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
    </div>
  );
};

export default ArtisanProfilePage;
