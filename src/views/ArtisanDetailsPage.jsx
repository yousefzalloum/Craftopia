import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCraftsmanProfile } from '../services/craftsmanService';
import { get } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/CraftsmanProfile.css';

const ArtisanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchArtisanDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📋 Fetching artisan details for ID:', id);
        
        const data = await getCraftsmanProfile(id);
        console.log('✅ Artisan details fetched:', data);
        
        setArtisan(data);
      } catch (err) {
        console.error('❌ Failed to fetch artisan details:', err);
        // More detailed error message
        const errorMessage = err.message || 'Failed to load artisan details';
        console.log('📋 Error details - Status:', err.status, 'Message:', errorMessage);
        
        // Provide helpful error messages based on status
        if (err.status === 404) {
          setError('Artisan not found. They may have been removed or the ID is invalid.');
        } else if (err.status === 0) {
          setError('Cannot connect to server. Please check if the backend is running.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtisanDetails();
    }
  }, [id]);

  // Fetch reviews for this artisan
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      
      try {
        setReviewsLoading(true);
        console.log('📋 Fetching reviews for artisan:', id);
        console.log('📋 Using endpoint: /reviews/artisan/' + id);
        const data = await get(`/reviews/artisan/${id}`);
        console.log('✅ Reviews fetched - RAW DATA:', data);
        console.log('✅ Is Array?', Array.isArray(data));
        console.log('✅ Data type:', typeof data);
        
        // Handle both array and object responses
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
        // Don't show error to user, just show empty reviews
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviews();
    }
  }, [id]);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="craftsman-profile-page">
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <h2>Error Loading Artisan</h2>
          <p className="error-message" style={{ color: '#e74c3c', background: '#ffe5e5', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            {error}
          </p>
          <button 
            onClick={() => navigate('/crafts')} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  if (!artisan) {
    return (
      <div className="craftsman-profile-page">
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <h2>Artisan not found</h2>
          <button 
            onClick={() => navigate('/crafts')} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Back to Search
          </button>
        </div>
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
          <button onClick={() => navigate('/crafts')} className="btn-back">
            ← Back to Search
          </button>
          
          <div className="profile-hero">
            <div className="profile-image-container">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&background=3498db&color=fff&size=200`}
                alt={artisan.name}
                className="profile-image"
              />
              <span className="availability-badge">Active</span>
            </div>

            <div className="profile-info">
              <h1>{artisan.name}</h1>
              <p className="profession">{artisan.craftType}</p>
              <p className="location">📍 {artisan.location}</p>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <strong>{artisan.averageRating.toFixed(1)}</strong>
                    <small>Rating</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📷</span>
                  <div>
                    <strong>{artisan.portfolioImages?.length || 0}</strong>
                    <small>Portfolio</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <div>
                    <strong>{formatDate(artisan.createdAt)}</strong>
                    <small>Member Since</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-section">
          <h2>📖 About</h2>
          <p className="bio">
            {artisan.description || 'No description provided yet.'}
          </p>
        </div>

        {/* Contact Section */}
        <div className="profile-section">
          <h2>📞 Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <strong>📧 Email:</strong>
              <span>{artisan.email}</span>
            </div>
            <div className="contact-item">
              <strong>📱 Phone:</strong>
              <span>{artisan.phone_number || 'Not provided'}</span>
            </div>
            <div className="contact-item">
              <strong>📍 Location:</strong>
              <span>{artisan.location}</span>
            </div>
            <div className="contact-item">
              <strong>🔨 Craft Type:</strong>
              <span>{artisan.craftType}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="profile-section">
          <h2>🎨 Portfolio</h2>
          {artisan.portfolioImages && artisan.portfolioImages.length > 0 ? (
            <div className="portfolio-grid">
              {artisan.portfolioImages.map((imageUrl, index) => (
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
              <p>This artisan hasn't added any work samples yet.</p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="profile-section" style={{ border: '3px solid red', minHeight: '200px' }}>
          <h2>⭐ Customer Reviews ({reviews.length})</h2>
          <p style={{ color: 'red', fontWeight: 'bold' }}>DEBUG: Reviews section is rendering. Reviews count: {reviews.length}</p>
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
              <p>This artisan hasn't received any reviews yet.</p>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="profile-section">
          <h2>ℹ️ Profile Details</h2>
          <div className="profile-details-grid">
            <div className="detail-card">
              <strong>Profile ID</strong>
              <span className="detail-value">{artisan._id}</span>
            </div>
            <div className="detail-card">
              <strong>Created At</strong>
              <span className="detail-value">{formatDate(artisan.createdAt)}</span>
            </div>
            <div className="detail-card">
              <strong>Last Updated</strong>
              <span className="detail-value">{formatDate(artisan.updatedAt)}</span>
            </div>
            <div className="detail-card">
              <strong>Average Rating</strong>
              <span className="detail-value">⭐ {artisan.averageRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDetailsPage;
