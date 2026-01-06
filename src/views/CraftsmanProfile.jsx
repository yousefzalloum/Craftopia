import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCraftsmanProfile, getArtisanAvailability } from '../services/craftsmanService';
import { createReservation } from '../services/customerService';
import { get } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import '../styles/CraftsmanProfile.css';

const CraftsmanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, role } = useAuth();
  const [craftsman, setCraftsman] = useState(location.state?.artisan || null);
  const [loading, setLoading] = useState(!location.state?.artisan);
  const [error, setError] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingData, setBookingData] = useState({
    description: '',
    start_date: '',
    total_price: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  useEffect(() => {
    // If we already have artisan data from navigation state, don't fetch
    if (location.state?.artisan) {
      console.log('✅ Using artisan data from navigation state:', location.state.artisan);
      return;
    }

    // Otherwise, fetch from API
    const fetchCraftsmanProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📋 Fetching craftsman profile for ID:', id);
        
        const data = await getCraftsmanProfile(id);
        console.log('✅ Craftsman profile fetched:', data);
        
        setCraftsman(data);
      } catch (err) {
        console.error('❌ Failed to fetch craftsman profile:', err);
        const errorMessage = err.message || 'Failed to load craftsman profile';
        console.log('📋 Error details - Status:', err.status, 'Message:', errorMessage);
        
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
      fetchCraftsmanProfile();
    }
  }, [id, location.state]);

  // Fetch reviews for this artisan
  useEffect(() => {
    const fetchReviews = async () => {
      if (!craftsman || !craftsman._id) return;
      
      try {
        setReviewsLoading(true);
        console.log('📝 Fetching reviews for artisan:', craftsman._id);
        const data = await get(`/reviews/artisan/${craftsman._id}`);
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

    if (craftsman) {
      fetchReviews();
    }
  }, [craftsman]);

  // Fetch availability for this artisan
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!craftsman || !craftsman._id) return;
      
      try {
        setAvailabilityLoading(true);
        console.log('📅 Fetching availability for artisan:', craftsman._id);
        const data = await getArtisanAvailability(craftsman._id);
        console.log('✅ Availability fetched:', data);
        
        if (Array.isArray(data)) {
          setAvailability(data);
        } else {
          setAvailability([]);
        }
      } catch (err) {
        console.error('❌ Failed to fetch availability:', err);
        setAvailability([]);
      } finally {
        setAvailabilityLoading(false);
      }
    };

    if (craftsman) {
      fetchAvailability();
    }
  }, [craftsman]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    setBookingError(null);

    try {
      // Check if user is authenticated
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const userRole = localStorage.getItem('role');
      
      console.log('🔐 Auth check:', { 
        hasToken: !!token, 
        userId, 
        role: userRole,
        isLoggedIn,
        componentRole: role 
      });
      
      if (!token) {
        setBookingError('You must be logged in to book a service');
        navigate('/login');
        return;
      }
      
      if (userRole !== 'customer') {
        setBookingError('Only customers can book services');
        setBookingLoading(false);
        return;
      }

      // Validate inputs
      if (!bookingData.description || !bookingData.start_date || !bookingData.total_price) {
        setBookingError('Please fill in all required fields');
        setBookingLoading(false);
        return;
      }

      // Ensure the date is valid and in the future
      const startDate = new Date(bookingData.start_date);
      if (isNaN(startDate.getTime())) {
        setBookingError('Invalid date format');
        setBookingLoading(false);
        return;
      }

      if (startDate < new Date()) {
        setBookingError('Start date must be in the future');
        setBookingLoading(false);
        return;
      }

      // Ensure price is a valid number
      const price = Number(bookingData.total_price);
      if (isNaN(price) || price <= 0) {
        setBookingError('Please enter a valid price');
        setBookingLoading(false);
        return;
      }

      const reservationPayload = {
        artisanId: id,
        description: bookingData.description.trim(),
        start_date: startDate.toISOString().split('T')[0],
        total_price: price
      };

      console.log('📋 Submitting reservation:', reservationPayload);
      console.log('📋 Artisan ID:', id);
      console.log('📋 Payload types:', {
        artisanId: typeof reservationPayload.artisanId,
        description: typeof reservationPayload.description,
        start_date: typeof reservationPayload.start_date,
        total_price: typeof reservationPayload.total_price
      });
      
      const response = await createReservation(reservationPayload);
      console.log('✅ Reservation created successfully:', response);
      
      setBookingSuccess(true);
      setTimeout(() => {
        setShowBookingModal(false);
        setBookingSuccess(false);
        setBookingData({ description: '', start_date: '', total_price: '' });
        navigate('/reservations');
      }, 2000);
    } catch (err) {
      console.error('❌ Booking error:', err);
      console.error('❌ Error details:', {
        message: err.message,
        status: err.status,
        data: err.data
      });
      
      // Show more user-friendly error messages
      let errorMessage = err.message || 'Failed to create reservation. Please try again.';
      
      // Check for specific error patterns
      if (errorMessage.includes('artisan')) {
        errorMessage = 'Invalid artisan. Please try again.';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('token')) {
        errorMessage = 'Please log in again to book a service.';
      } else if (errorMessage.includes('validation')) {
        errorMessage = 'Please check all fields and try again.';
      } else if (errorMessage === 'Booking failed') {
        errorMessage = 'Booking failed. The backend server returned an error. Please check if the backend is running properly on port 5000.';
      }
      
      setBookingError(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  const openBookingModal = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (role !== 'customer') {
      alert('Only customers can book services');
      return;
    }
    setShowBookingModal(true);
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingData({ description: '', start_date: '', total_price: '' });
    setBookingError(null);
    setBookingSuccess(false);
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

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="btn-back">
            <span>←</span> Back to Search
          </button>
          
          <div className="profile-hero-enhanced">
            <div className="hero-background"></div>
            <div className="hero-content">
              <div className="profile-image-container-enhanced">
                <div className="image-ring"></div>
                <img 
                  src={
                    craftsman.profilePicture
                      ? (craftsman.profilePicture.startsWith('http') 
                          ? craftsman.profilePicture 
                          : `http://localhost:5000${craftsman.profilePicture}`)
                      : craftsman.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(craftsman.name)}&background=667eea&color=fff&size=200`
                  }
                  alt={craftsman.name}
                  className="profile-image-enhanced"
                  onError={(e) => {
                    console.error('❌ Failed to load profile picture:', e.target.src);
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(craftsman.name)}&background=667eea&color=fff&size=200`;
                  }}
                />
                {craftsman.availability && (
                  <span className="availability-badge-pulse">
                    <span className="pulse-dot"></span>
                    Available Now
                  </span>
                )}
              </div>

              <div className="profile-info-enhanced">
                <div className="profile-title-section">
                  <h1 className="profile-name-enhanced">{craftsman.name}</h1>
                  <div className="profession-badge">
                    <span className="badge-icon">🔨</span>
                    {craftsman.craftType}
                  </div>
                </div>
                <p className="location-enhanced">
                  <span className="location-icon">📍</span>
                  {craftsman.location || 'City not specified'}
                </p>
              
              {/* Book Service Button - Only for logged in customers */}
              {isLoggedIn && role === 'customer' && (
                <button 
                  onClick={openBookingModal}
                  style={{
                    marginTop: '1rem',
                    padding: '0.75rem 2rem',
                    background: '#27ae60',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#229954'}
                  onMouseLeave={(e) => e.target.style.background = '#27ae60'}
                >
                  📅 Book Service
                </button>
              )}
              
              <div className="profile-stats-enhanced">
                <div className="stat-card">
                  <div className="stat-icon-enhanced rating">⭐</div>
                  <div className="stat-content">
                    <div className="stat-value">{craftsman.averageRating?.toFixed(1) || 'N/A'}</div>
                    <div className="stat-label">Rating</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-enhanced location">📍</div>
                  <div className="stat-content">
                    <div className="stat-value-small">{craftsman.location}</div>
                    <div className="stat-label">Location</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-enhanced email">📧</div>
                  <div className="stat-content">
                    <div className="stat-value-small">{craftsman.email}</div>
                    <div className="stat-label">Email</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-enhanced phone">📱</div>
                  <div className="stat-content">
                    <div className="stat-value-small">{craftsman.phone_number}</div>
                    <div className="stat-label">Phone</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon-enhanced calendar">📅</div>
                  <div className="stat-content">
                    <div className="stat-value">{new Date(craftsman.createdAt).getFullYear()}</div>
                    <div className="stat-label">Member Since</div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-section-enhanced">
          <div className="section-header-enhanced">
            <span className="section-icon">💬</span>
            <h2>About Me</h2>
          </div>
          <div className="about-content">
            <p className="bio-enhanced">{craftsman.description || 'No description available yet. This artisan will update their profile soon.'}</p>
          </div>
        </div>

        {/* Portfolio Section */}
        {craftsman.portfolioImages && craftsman.portfolioImages.length > 0 && (
          <div className="profile-section-enhanced">
            <div className="section-header-enhanced">
              <span className="section-icon">🎨</span>
              <h2>Portfolio</h2>
            </div>
            <div className="portfolio-grid-enhanced">
              {craftsman.portfolioImages.map((image, index) => (
                <div key={index} className="portfolio-item-enhanced">
                  <div className="portfolio-overlay">
                    <span className="portfolio-number">#{index + 1}</span>
                  </div>
                  <img 
                    src={
                      image.startsWith('http') 
                        ? image 
                        : `http://localhost:5000${image}`
                    }
                    alt={`Portfolio ${index + 1}`}
                    onError={(e) => {
                      console.error('❌ Failed to load portfolio image:', e.target.src);
                      e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className="profile-section-enhanced">
          <div className="section-header-enhanced">
            <span className="section-icon">⭐</span>
            <h2>Customer Reviews</h2>
            <span className="reviews-count">({reviews.length})</span>
          </div>
          {reviewsLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading reviews...</p>
            </div>
          ) : reviews.length > 0 ? (
            <>
              <div className="reviews-container">
                {(showAllReviews ? reviews : reviews.slice(-1)).map((review, index) => (
                  <div 
                    key={review._id} 
                    className="review-card-enhanced"
                    style={{ animationDelay: `${index * 0.1}s` }}
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
                  className="btn-show-more"
                >
                  {showAllReviews ? '← Show Less' : `Show More (${reviews.length - 1} more reviews) →`}
                </button>
              </div>
            )}
          </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem 1rem',
              background: '#f8f9fa',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>No reviews yet</h3>
              <p style={{ color: '#7f8c8d', margin: 0 }}>Be the first to review this artisan!</p>
            </div>
          )}
        </div>

        {/* Availability Section */}
        <div className="profile-section-enhanced">
          <div className="section-header-enhanced">
            <span className="section-icon">📅</span>
            <h2>Availability Schedule</h2>
          </div>
          {availabilityLoading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading availability...</p>
            </div>
          ) : availability.length > 0 ? (
            <div className="availability-grid-enhanced">
              {availability.map((slot, index) => (
                <div key={slot._id} className="availability-card-enhanced" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="card-shine"></div>
                  <div className="availability-header">
                    <span className="day-icon">🗓️</span>
                    <div className="availability-day-enhanced">{slot.day}</div>
                  </div>
                  <div className="availability-divider"></div>
                  <div className="availability-time-enhanced">
                    <span className="time-icon">⏰</span>
                    <div className="time-range">
                      <span className="time-start">{slot.start_time}</span>
                      <span className="time-separator">→</span>
                      <span className="time-end">{slot.end_time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state-enhanced">
              <div className="empty-icon-animated">📅</div>
              <h3>No availability set</h3>
              <p>This artisan hasn't set their working hours yet. Check back later!</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Book Service</h2>
              <button 
                onClick={closeBookingModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ×
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem',
                color: '#27ae60'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✓</div>
                <h3>Reservation Created Successfully!</h3>
                <p>Redirecting to your reservations...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Service Description *
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                    placeholder="Describe the service you need..."
                    required
                    rows="4"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Start Date *
                  </label>
                  <input
                    type="datetime-local"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                    required
                    min={new Date().toISOString().slice(0, 16)}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Total Price ($) *
                  </label>
                  <input
                    type="number"
                    value={bookingData.total_price}
                    onChange={(e) => setBookingData({ ...bookingData, total_price: e.target.value })}
                    placeholder="Enter price"
                    required
                    min="1"
                    step="0.01"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                {bookingError && (
                  <div style={{
                    padding: '0.75rem',
                    background: '#ffe5e5',
                    color: '#e74c3c',
                    borderRadius: '8px',
                    marginBottom: '1rem'
                  }}>
                    {bookingError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    type="button"
                    onClick={closeBookingModal}
                    disabled={bookingLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#95a5a6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      cursor: bookingLoading ? 'not-allowed' : 'pointer',
                      opacity: bookingLoading ? 0.6 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: '#27ae60',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      cursor: bookingLoading ? 'not-allowed' : 'pointer',
                      opacity: bookingLoading ? 0.6 : 1
                    }}
                  >
                    {bookingLoading ? 'Creating...' : 'Confirm Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CraftsmanProfile;
