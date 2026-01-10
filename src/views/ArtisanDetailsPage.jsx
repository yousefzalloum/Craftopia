import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCraftsmanProfile, getArtisanAvailability } from '../services/craftsmanService';
import { deletePortfolioImage } from '../services/adminService';
import { ReservationController } from '../controllers/ReservationController';
import { get } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/ArtisanDetailsPage.css';

const ArtisanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role, isLoggedIn } = useAuth();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [calculatedRating, setCalculatedRating] = useState(0);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [deletingImage, setDeletingImage] = useState(null);
  
  // Order modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDescription, setOrderDescription] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

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
        console.log('📋 Using endpoint: /reviews/' + id);
        const data = await get(`/reviews/${id}`);
        console.log('✅ Reviews fetched - RAW DATA:', data);
        console.log('✅ Is Array?', Array.isArray(data));
        console.log('✅ Data type:', typeof data);
        
        // Handle array response directly
        if (Array.isArray(data)) {
          console.log('✅ Setting reviews array with length:', data.length);
          setReviews(data);
          // Calculate average rating
          if (data.length > 0) {
            const total = data.reduce((sum, review) => sum + (review.stars_number || 0), 0);
            const average = total / data.length;
            setCalculatedRating(average);
            console.log('⭐ Calculated average rating:', average.toFixed(1));
          }
        } else if (data && Array.isArray(data.reviews)) {
          console.log('✅ Setting reviews from data.reviews with length:', data.reviews.length);
          setReviews(data.reviews);
          // Calculate average rating
          if (data.reviews.length > 0) {
            const total = data.reviews.reduce((sum, review) => sum + (review.stars_number || 0), 0);
            const average = total / data.reviews.length;
            setCalculatedRating(average);
            console.log('⭐ Calculated average rating:', average.toFixed(1));
          }
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

  // Fetch availability for this artisan
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!id) return;
      
      try {
        setAvailabilityLoading(true);
        console.log('📅 Fetching availability for artisan:', id);
        const data = await getArtisanAvailability(id);
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

    if (id) {
      fetchAvailability();
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
            onClick={() => navigate(role === 'admin' ? '/admin-dashboard' : '/crafts')} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {role === 'admin' ? '← Back to Dashboard' : '← Back to Search'}
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
            onClick={() => navigate(role === 'admin' ? '/admin-dashboard' : '/crafts')} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            {role === 'admin' ? '← Back to Dashboard' : '← Back to Search'}
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

  const handleDeletePortfolio = async (imageUrl) => {
    if (!window.confirm('Are you sure you want to delete this portfolio image?')) {
      return;
    }

    try {
      setDeletingImage(imageUrl);
      await deletePortfolioImage(id, imageUrl);
      
      // Update local state to remove the image
      setArtisan(prev => ({
        ...prev,
        portfolioImages: prev.portfolioImages.filter(img => img !== imageUrl)
      }));
      
      alert('Portfolio image deleted successfully!');
    } catch (err) {
      console.error('Failed to delete portfolio image:', err);
      alert('Failed to delete portfolio image: ' + err.message);
    } finally {
      setDeletingImage(null);
    }
  };

  // Handle opening order modal
  const handleOpenOrderModal = (portfolioItem, index) => {
    if (!isLoggedIn) {
      alert('You must login first to place an order');
      navigate('/login');
      return;
    }
    
    if (role === 'artisan') {
      alert('Artisans cannot place orders. Please login as a customer.');
      return;
    }
    
    setSelectedPortfolioItem({
      ...portfolioItem,
      index
    });
    setOrderQuantity(1);
    setOrderDescription('');
    setOrderError(null);
    setOrderSuccess(null);
    setIsOrderModalOpen(true);
  };

  // Handle closing order modal
  const handleCloseOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedPortfolioItem(null);
    setOrderQuantity(1);
    setOrderDescription('');
    setOrderError(null);
    setOrderSuccess(null);
  };

  // Handle placing order
  const handlePlaceOrder = async () => {
    if (!selectedPortfolioItem) return;
    
    if (!orderDescription.trim()) {
      setOrderError('Please provide a description for your order');
      return;
    }
    
    if (orderQuantity < 1) {
      setOrderError('Quantity must be at least 1');
      return;
    }
    
    try {
      setOrderLoading(true);
      setOrderError(null);
      
      const imageUrl = typeof selectedPortfolioItem === 'string' 
        ? selectedPortfolioItem 
        : selectedPortfolioItem.imageUrl;
      
      const title = selectedPortfolioItem.description || `Portfolio Item ${selectedPortfolioItem.index + 1}`;
      const itemPrice = selectedPortfolioItem.price || 0;
      
      const result = await ReservationController.createPortfolioOrder(
        id, // artisanId
        title,
        imageUrl,
        orderQuantity,
        orderDescription,
        itemPrice
      );
      
      if (result.success) {
        setOrderSuccess(result.message);
        setTimeout(() => {
          handleCloseOrderModal();
          alert('Order placed successfully! You can track it in your reservations.');
          navigate('/reservations');
        }, 1500);
      } else {
        setOrderError(result.message);
      }
    } catch (err) {
      console.error('Failed to place order:', err);
      setOrderError(err.message || 'Failed to place order');
    } finally {
      setOrderLoading(false);
    }
  };

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <button onClick={() => navigate(role === 'admin' ? '/admin-dashboard' : '/crafts')} className="btn-back">
            {role === 'admin' ? '← Back to Dashboard' : '← Back to Search'}
          </button>
          
          <div className="profile-hero">
            <div className="profile-image-container">
              <img 
                src={
                  artisan.profilePicture 
                    ? (artisan.profilePicture.startsWith('http') 
                        ? artisan.profilePicture 
                        : `http://localhost:5000${artisan.profilePicture}`)
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&background=e67e22&color=fff&size=200`
                }
                alt={artisan.name}
                className="profile-image"
                onError={(e) => {
                  console.error('❌ Failed to load profile image:', e.target.src);
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&background=e67e22&color=fff&size=200`;
                }}
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
                    <strong>{calculatedRating > 0 ? calculatedRating.toFixed(1) : (artisan.averageRating ? artisan.averageRating.toFixed(1) : '0.0')}</strong>
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
              <span>{artisan.phone || 'Not provided'}</span>
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

        {/* Availability Section */}
        <div className="profile-section">
          <h2>📅 Availability Schedule</h2>
          {availabilityLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading availability...</p>
            </div>
          ) : availability.length > 0 ? (
            <div className="availability-grid">
              {availability.map((slot) => (
                <div key={slot._id} className="availability-card">
                  <div className="availability-day">{slot.day}</div>
                  <div className="availability-time">
                    <span className="time-label">⏰</span>
                    <span>{slot.start_time} - {slot.end_time}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3>No availability set</h3>
              <p>This artisan hasn't set their working hours yet.</p>
            </div>
          )}
        </div>

        {/* Portfolio Section */}
        <div className="profile-section">
          <h2>🎨 Portfolio</h2>
          {artisan.portfolioImages && artisan.portfolioImages.length > 0 ? (
            <div className="portfolio-grid">
              {artisan.portfolioImages.map((item, index) => {
                // Handle both old format (just URL string) and new format (object with imageUrl, price, description)
                const imageUrl = typeof item === 'string' ? item : item.imageUrl;
                const price = typeof item === 'object' ? item.price : null;
                const description = typeof item === 'object' ? item.description : null;
                
                return (
                  <div key={index} className="portfolio-item" style={{ position: 'relative' }}>
                    {role === 'admin' && (
                      <button
                        onClick={() => handleDeletePortfolio(imageUrl)}
                        disabled={deletingImage === imageUrl}
                        style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '32px',
                          height: '32px',
                          cursor: deletingImage === imageUrl ? 'not-allowed' : 'pointer',
                          fontSize: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 10,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                          transition: 'all 0.3s ease',
                          opacity: deletingImage === imageUrl ? 0.6 : 1
                        }}
                        onMouseEnter={(e) => {
                          if (deletingImage !== imageUrl) {
                            e.target.style.background = '#c0392b';
                            e.target.style.transform = 'scale(1.1)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#e74c3c';
                          e.target.style.transform = 'scale(1)';
                        }}
                        title="Delete portfolio image"
                      >
                        {deletingImage === imageUrl ? '⏳' : '🗑️'}
                      </button>
                    )}
                    <div className="portfolio-image">
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
                    </div>
                    
                    {/* Portfolio Item Details and Order Button */}
                    <div style={{ padding: '0.75rem', background: 'white', borderRadius: '8px', border: '1px solid #e1e8ed', marginTop: '0.5rem' }}>
                      {/* Display price if available */}
                      {price && (
                        <div style={{ marginBottom: '0.5rem' }}>
                          <strong style={{ color: '#27ae60', fontSize: '1.2rem' }}>
                            ${price}
                          </strong>
                        </div>
                      )}
                      
                      {/* Display description if available */}
                      {description && (
                        <p style={{ margin: 0, color: '#2c3e50', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '0.75rem' }}>
                          {description}
                        </p>
                      )}
                      
                      {/* Order Button - ALWAYS VISIBLE */}
                      <button
                        onClick={() => handleOpenOrderModal(item, index)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: '#3498db',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '1rem',
                          fontWeight: 'bold',
                          cursor: 'pointer',
                          transition: 'background 0.3s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          marginTop: (price || description) ? '0.75rem' : '0'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                        onMouseLeave={(e) => e.target.style.background = '#3498db'}
                      >
                        🛒 Order This Item
                      </button>
                    </div>
                  </div>
                );
              })}
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
              <span className="detail-value">⭐ {calculatedRating > 0 ? calculatedRating.toFixed(1) : (artisan.averageRating ? artisan.averageRating.toFixed(1) : '0.0')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Order Modal */}
      {isOrderModalOpen && selectedPortfolioItem && (
        <div className="modal-overlay" onClick={handleCloseOrderModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>🛒 Place Order</h2>
              <button onClick={handleCloseOrderModal} className="btn-close-modal">
                ✕
              </button>
            </div>
            
            <div style={{ padding: '1.5rem' }}>
              {orderError && (
                <div className="error-message" style={{ marginBottom: '1rem', background: '#ffe5e5', color: '#e74c3c', padding: '1rem', borderRadius: '8px' }}>
                  ❌ {orderError}
                </div>
              )}
              
              {orderSuccess && (
                <div className="success-message" style={{ marginBottom: '1rem', background: '#d4edda', color: '#155724', padding: '1rem', borderRadius: '8px' }}>
                  ✅ {orderSuccess}
                </div>
              )}
              
              {/* Portfolio Item Preview */}
              <div style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                <img 
                  src={
                    (typeof selectedPortfolioItem === 'string' ? selectedPortfolioItem : selectedPortfolioItem.imageUrl).startsWith('http')
                      ? (typeof selectedPortfolioItem === 'string' ? selectedPortfolioItem : selectedPortfolioItem.imageUrl)
                      : `http://localhost:5000${typeof selectedPortfolioItem === 'string' ? selectedPortfolioItem : selectedPortfolioItem.imageUrl}`
                  }
                  alt="Portfolio item"
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '8px',
                    border: '2px solid #667eea'
                  }}
                />
                {selectedPortfolioItem.price && (
                  <div style={{ marginTop: '1rem' }}>
                    <strong style={{ color: '#27ae60', fontSize: '1.5rem' }}>
                      ${selectedPortfolioItem.price} per item
                    </strong>
                  </div>
                )}
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="orderQuantity" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  Quantity *
                </label>
                <input
                  type="number"
                  id="orderQuantity"
                  min="1"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value) || 1)}
                  disabled={orderLoading}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem'
                  }}
                />
              </div>
              
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label htmlFor="orderDescription" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  Order Details / Special Instructions *
                </label>
                <textarea
                  id="orderDescription"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  placeholder="Describe your requirements, delivery location, or any special instructions..."
                  rows="4"
                  disabled={orderLoading}
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
              
              {selectedPortfolioItem.price && (
                <div style={{ 
                  background: '#f8f9fa', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '1.5rem',
                  border: '1px solid #dee2e6'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Price per item:</span>
                    <strong>${selectedPortfolioItem.price}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Quantity:</span>
                    <strong>{orderQuantity}</strong>
                  </div>
                  <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid #dee2e6' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem' }}>
                    <strong>Estimated Total:</strong>
                    <strong style={{ color: '#27ae60' }}>
                      ${(selectedPortfolioItem.price * orderQuantity).toFixed(2)}
                    </strong>
                  </div>
                  <small style={{ color: '#666', display: 'block', marginTop: '0.5rem' }}>
                    * Final price will be agreed upon with the artisan
                  </small>
                </div>
              )}
              
              <div className="modal-actions" style={{ display: 'flex', gap: '1rem' }}>
                <button
                  type="button"
                  onClick={handleCloseOrderModal}
                  className="btn-cancel"
                  disabled={orderLoading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: orderLoading ? 'not-allowed' : 'pointer',
                    opacity: orderLoading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  className="btn-save"
                  disabled={orderLoading || !orderDescription.trim()}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: orderLoading || !orderDescription.trim() ? '#95a5a6' : '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: (orderLoading || !orderDescription.trim()) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {orderLoading ? 'Placing Order...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArtisanDetailsPage;
