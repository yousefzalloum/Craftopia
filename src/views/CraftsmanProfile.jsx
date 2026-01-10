import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCraftsmanProfile, getArtisanAvailability } from '../services/craftsmanService';
import { createReservation } from '../services/customerService';
import { ReservationController } from '../controllers/ReservationController';
import { get, post } from '../utils/api';
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
    title: '',
    description: '',
    start_date: ''
  });
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [calculatedRating, setCalculatedRating] = useState(null);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [portfolioComments, setPortfolioComments] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [commentLoading, setCommentLoading] = useState({});
  
  // Order modal states
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [orderDescription, setOrderDescription] = useState('');
  const [orderLoading, setOrderLoading] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [orderSuccess, setOrderSuccess] = useState(null);

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
        console.log('🖼️ Portfolio images structure:', data.portfolioImages);
        
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
        const data = await get(`/reviews/${craftsman._id}`);
        console.log('✅ Reviews fetched:', data);
        
        let reviewsArray = [];
        if (Array.isArray(data)) {
          reviewsArray = data;
        } else if (data && Array.isArray(data.reviews)) {
          reviewsArray = data.reviews;
        }
        
        setReviews(reviewsArray);
        
        // Calculate average rating from reviews
        console.log('📊 Reviews array for rating calculation:', reviewsArray);
        console.log('📊 First review structure:', reviewsArray[0]);
        if (reviewsArray.length > 0) {
          console.log('📊 Review stars_number:', reviewsArray.map(r => r.stars_number));
          const totalRating = reviewsArray.reduce((sum, review) => sum + (review.stars_number || 0), 0);
          const avgRating = totalRating / reviewsArray.length;
          console.log('⭐ Total rating:', totalRating, 'Count:', reviewsArray.length, 'Average:', avgRating);
          setCalculatedRating(avgRating);
        } else {
          console.log('⚠️ No reviews found, setting rating to null');
          setCalculatedRating(null);
        }
      } catch (err) {
        console.error('❌ Failed to fetch reviews:', err);
        setReviews([]);
        setCalculatedRating(null);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (craftsman?._id) {
      fetchReviews();
    }
  }, [craftsman?._id]);

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

    if (craftsman?._id) {
      fetchAvailability();
    }
  }, [craftsman?._id]);

  // Fetch comments for portfolio images
  useEffect(() => {
    const fetchAllPortfolioComments = async () => {
      if (!craftsman || !craftsman.portfolioImages || craftsman.portfolioImages.length === 0) return;
      
      try {
        console.log('📝 Fetching comments for portfolio images...');
        const commentsData = {};
        
        for (let i = 0; i < craftsman.portfolioImages.length; i++) {
          const item = craftsman.portfolioImages[i];
          // Handle both old format (string) and new format (object)
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

    if (craftsman) {
      fetchAllPortfolioComments();
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

      // Validate inputs for custom request
      if (!bookingData.title || !bookingData.description || !bookingData.start_date) {
        setBookingError('Please fill in all required fields');
        setBookingLoading(false);
        return;
      }

      // Ensure the date is valid and in the future
      const deadline = new Date(bookingData.start_date);
      if (isNaN(deadline.getTime())) {
        setBookingError('Invalid date format');
        setBookingLoading(false);
        return;
      }

      if (deadline < new Date()) {
        setBookingError('Deadline must be in the future');
        setBookingLoading(false);
        return;
      }

      // Format deadline as YYYY-MM-DD
      const deadlineFormatted = deadline.toISOString().split('T')[0];

      console.log('📋 Submitting custom request:', {
        artisanId: id,
        title: bookingData.title,
        description: bookingData.description,
        deadline: deadlineFormatted
      });
      
      const result = await ReservationController.createCustomRequest(
        id, // artisanId
        bookingData.title.trim(),
        bookingData.description.trim(),
        deadlineFormatted
      );
      
      if (result.success) {
        console.log('✅ Custom request created successfully:', result);
        setBookingSuccess(true);
        setTimeout(() => {
          setShowBookingModal(false);
          setBookingSuccess(false);
          setBookingData({ title: '', description: '', start_date: '' });
          navigate('/reservations');
        }, 2000);
      } else {
        setBookingError(result.message);
      }
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
      setShowLoginPrompt(true);
      return;
    }
    if (role !== 'customer') {
      alert('Only customers can book services');
      return;
    }
    setShowBookingModal(true);
  };

  // Handle opening order modal
  const handleOpenOrderModal = (portfolioItem, index) => {
    if (!isLoggedIn) {
      alert('Please login to place an order');
      navigate('/login');
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
      
      console.log('🛒 Creating order with:', {
        selectedPortfolioItem,
        itemPrice,
        quantity: orderQuantity,
        totalPrice: itemPrice * orderQuantity
      });
      
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

  const handlePortfolioComment = async (imageUrl, index) => {
    const comment = commentInputs[index];
    
    if (!comment || !comment.trim()) {
      return;
    }

    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    if (role !== 'customer') {
      alert('Only customers can comment on portfolio images');
      return;
    }

    try {
      setCommentLoading({ ...commentLoading, [index]: true });
      
      const payload = {
        artisanId: id,
        imageUrl: imageUrl,
        comment: comment.trim()
      };

      console.log('📝 Submitting portfolio comment:', payload);
      await post('/portfolio/comment', payload);
      
      // Refetch comments for this image
      const updatedComments = await get(`/portfolio/comments?imageUrl=${encodeURIComponent(imageUrl)}`);
      setPortfolioComments({ 
        ...portfolioComments, 
        [index]: Array.isArray(updatedComments) ? updatedComments : []
      });
      
      // Clear the input
      setCommentInputs({ ...commentInputs, [index]: '' });
      
      console.log('✅ Comment submitted successfully');
    } catch (err) {
      console.error('❌ Failed to submit comment:', err);
      alert(err.message || 'Failed to submit comment. Please try again.');
    } finally {
      setCommentLoading({ ...commentLoading, [index]: false });
    }
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    setBookingData({ title: '', description: '', start_date: '' });
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
                    craftsman.avatar
                      ? (craftsman.avatar.startsWith('http') 
                          ? craftsman.avatar 
                          : `http://localhost:5000${craftsman.avatar}`)
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(craftsman.name)}&background=667eea&color=fff&size=200`
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
              
              {/* Book Service Button - Visible to everyone */}
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
                � Custom Service
              </button>
              
              {/* Login Prompt - Shows when non-logged-in users try to book */}
              {showLoginPrompt && (
                <div style={{
                  marginTop: '1rem',
                  padding: '1.5rem',
                  background: '#fff3cd',
                  border: '1px solid #ffc107',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <p style={{ margin: '0 0 1rem 0', color: '#856404', fontSize: '1.1rem', fontWeight: 'bold' }}>
                    🔒 You need to login to book this service
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <button 
                      onClick={() => navigate('/login', { state: { from: `/craftsman/${id}` } })}
                      style={{ 
                        padding: '0.75rem 2rem', 
                        background: '#3498db', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                      }}
                    >
                      Login
                    </button>
                    <button 
                      onClick={() => setShowLoginPrompt(false)}
                      style={{ 
                        padding: '0.75rem 2rem', 
                        background: '#95a5a6', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: 'bold', 
                        cursor: 'pointer' 
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="profile-stats-enhanced">
                <div className="stat-card">
                  <div className="stat-icon-enhanced rating">⭐</div>
                  <div className="stat-content">
                    <div className="stat-value">{calculatedRating ? calculatedRating.toFixed(1) : (craftsman.averageRating?.toFixed(1) || 'N/A')}</div>
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
                    <div className="stat-value-small">{craftsman.phone || 'Not provided'}</div>
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
              {craftsman.portfolioImages.map((item, index) => {
                // Handle both old format (just URL string) and new format (object with imageUrl, price, description)
                const imageUrl = typeof item === 'string' ? item : item.imageUrl;
                const price = typeof item === 'object' ? item.price : null;
                const description = typeof item === 'object' ? item.description : null;
                
                return (
                  <div key={index} className="portfolio-item-enhanced" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                      <div className="portfolio-overlay">
                        <span className="portfolio-number">#{index + 1}</span>
                      </div>
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
                    
                    {/* ORDER BUTTON - ALWAYS VISIBLE */}
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
                        marginTop: '0.5rem'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#2980b9'}
                      onMouseLeave={(e) => e.target.style.background = '#3498db'}
                    >
                      🛒 Order This Item
                    </button>
                  
                  {/* Comment Section for Customers */}
                  {isLoggedIn && role === 'customer' && (
                    <div style={{ padding: '0.75rem', background: '#f8f9fa', borderRadius: '8px' }}>
                      <textarea
                        placeholder="Add a comment about this work..."
                        value={commentInputs[index] || ''}
                        onChange={(e) => setCommentInputs({ ...commentInputs, [index]: e.target.value })}
                        rows="2"
                        style={{
                          width: '100%',
                          padding: '0.5rem',
                          border: '1px solid #dee2e6',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          resize: 'vertical',
                          marginBottom: '0.5rem'
                        }}
                      />
                      <button
                        onClick={() => handlePortfolioComment(imageUrl, index)}
                        disabled={!commentInputs[index]?.trim() || commentLoading[index]}
                        style={{
                          padding: '0.5rem 1rem',
                          background: commentInputs[index]?.trim() ? '#3498db' : '#95a5a6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          cursor: commentInputs[index]?.trim() ? 'pointer' : 'not-allowed',
                          fontWeight: 'bold'
                        }}
                      >
                        {commentLoading[index] ? 'Posting...' : '💬 Comment'}
                      </button>
                    </div>
                  )}
                  
                  {/* Show login prompt for non-logged-in users */}
                  {!isLoggedIn && (
                    <div style={{ padding: '0.75rem', background: '#fff3cd', borderRadius: '8px', textAlign: 'center' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                        <a href="/login" style={{ color: '#3498db', textDecoration: 'underline' }}>Login</a> to comment
                      </p>
                    </div>
                  )}
                  
                  {/* Display existing comments */}
                  {portfolioComments[index] && portfolioComments[index].length > 0 && (
                    <div style={{ marginTop: '0.5rem' }}>
                      <h4 style={{ fontSize: '0.95rem', marginBottom: '0.75rem', color: '#2c3e50' }}>
                        💬 Comments ({portfolioComments[index].length})
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
              <h2 style={{ margin: 0 }}>Custom Service Request</h2>
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
                <h3>Custom Request Created Successfully!</h3>
                <p>Redirecting to your reservations...</p>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Service Title *
                  </label>
                  <input
                    type="text"
                    value={bookingData.title || ''}
                    onChange={(e) => setBookingData({ ...bookingData, title: e.target.value })}
                    placeholder="e.g., Custom Guitar Table"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Service Description *
                  </label>
                  <textarea
                    value={bookingData.description}
                    onChange={(e) => setBookingData({ ...bookingData, description: e.target.value })}
                    placeholder="Describe the custom service you need in detail..."
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

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({ ...bookingData, start_date: e.target.value })}
                    required
                    min={new Date().toISOString().split('T')[0]}
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

export default CraftsmanProfile;
