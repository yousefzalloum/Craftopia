import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomerReservations, cancelReservation } from '../services/customerService';
import { post, put } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/Reservations.css';

const Reservations = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [cancellingId, setCancellingId] = useState(null);
  
  // Review state
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ stars_number: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedReservations, setReviewedReservations] = useState(new Set());
  const [reviewedArtisans, setReviewedArtisans] = useState(new Set());
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  
  // Price reply state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [replyType, setReplyType] = useState('accept');
  const [negotiationNote, setNegotiationNote] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);
  
  // Negotiation modal state
  const [negotiateModalOpen, setNegotiateModalOpen] = useState(false);
  const [selectedOrderForNegotiation, setSelectedOrderForNegotiation] = useState(null);
  const [negotiationMessage, setNegotiationMessage] = useState('');
  const [submittingNegotiation, setSubmittingNegotiation] = useState(false);
  
  // Expanded descriptions state
  const [expandedDescriptions, setExpandedDescriptions] = useState(new Set());
  
  // Success message state
  const [successMessage, setSuccessMessage] = useState(null);
  
  // Confirmation modal state
  const [confirmCancelModal, setConfirmCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState(null);

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (role !== 'customer') {
      alert('Only customers can view reservations');
      navigate('/');
      return;
    }

    // Fetch reservations
    const fetchReservations = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCustomerReservations();
        
        // Debug: Log the first reservation to see artisan data structure
        if (data && data.length > 0) {
          console.log('🔍 First reservation data:', data[0]);
          console.log('🔍 Artisan data:', data[0].artisan);
          console.log('🔍 Artisan fields:', data[0].artisan ? Object.keys(data[0].artisan) : 'No artisan');
        }
        
        // Show all reservations including "New" (pending) ones
        setReservations(data || []);
        
        // Track which reservations have reviews
        const reservationsWithReviews = (data || []).filter(res => res.hasReview);
        const reviewedIds = new Set(reservationsWithReviews.map(res => res._id));
        setReviewedReservations(reviewedIds);
        
        // Track which artisans have been reviewed by this customer
        const reviewedArtisanIds = new Set(reservationsWithReviews.map(res => res.artisan?._id).filter(Boolean));
        setReviewedArtisans(reviewedArtisanIds);
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
        setError(err.message || 'Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn, role, navigate]);



  const handleOpenReviewForm = (reservationId) => {
    setReviewingId(reservationId);
    setReviewForm({ stars_number: 5, comment: '' });
    setReviewError(null);
    setReviewSuccess(false);
  };

  const handleCloseReviewForm = () => {
    setReviewingId(null);
    setReviewForm({ stars_number: 5, comment: '' });
  };

  const handleSubmitReview = async (reservation) => {
    if (!reviewForm.comment.trim()) {
      setReviewError('Please add a comment to your review');
      return;
    }

    try {
      setSubmittingReview(true);
      setReviewError(null);
      
      const reviewData = {
        artisanId: reservation.artisan._id,
        reservationId: reservation._id,
        stars_number: reviewForm.stars_number,
        comment: reviewForm.comment.trim()
      };

      await post('/reviews', reviewData);
      
      // Mark this specific reservation as reviewed
      setReviewedReservations(prev => new Set([...prev, reservation._id]));
      
      // Mark this artisan as reviewed
      setReviewedArtisans(prev => new Set([...prev, reservation.artisan._id]));
      
      // Show success message
      setReviewSuccess(true);
      
      // Close the form after 2 seconds
      setTimeout(() => {
        handleCloseReviewForm();
      }, 2000);
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleOpenReplyModal = (reservation) => {
    setSelectedReservation(reservation);
    setReplyType('accept');
    setNegotiationNote('');
    setReplyModalOpen(true);
  };

  const handleCloseReplyModal = () => {
    setReplyModalOpen(false);
    setSelectedReservation(null);
    setReplyType('accept');
    setNegotiationNote('');
  };

  const handleSubmitReply = async () => {
    if (!selectedReservation) return;

    if (replyType === 'negotiate' && !negotiationNote.trim()) {
      alert('Please enter a negotiation note');
      return;
    }

    try {
      setSubmittingReply(true);

      const replyData = {
        response: replyType
      };

      if (replyType === 'negotiate' && negotiationNote.trim()) {
        replyData.note = negotiationNote.trim();
      }

      console.log('📤 Sending reply to:', `/orders/${selectedReservation._id}/reply`);
      console.log('📦 Reply data:', replyData);

      await put(`/orders/${selectedReservation._id}/reply`, replyData);

      alert(`Price ${replyType === 'accept' ? 'accepted' : replyType === 'reject' ? 'rejected' : 'negotiation sent'} successfully!`);
      
      handleCloseReplyModal();
      
      // Refresh reservations
      const data = await getCustomerReservations();
      setReservations(data || []);
    } catch (err) {
      console.error('Failed to submit reply:', err);
      alert(err.message || 'Failed to submit reply');
    } finally {
      setSubmittingReply(false);
    }
  };

  const handleCustomerResponse = async (orderId, action, note = null) => {
    // Skip confirmation for negotiate action (handled in modal)
    if (action !== 'negotiate' && !window.confirm(`Are you sure you want to ${action === 'accept' ? 'accept' : 'decline'} this price offer?`)) {
      return;
    }

    try {
      console.log(`📤 Sending customer response: ${action} for order ${orderId}`);
      
      const payload = { action };
      if (action === 'negotiate' && note) {
        payload.note = note;
      }
      
      await put(`/orders/${orderId}/customer-response`, payload);

      const actionText = action === 'accept' ? 'accepted' : action === 'reject' ? 'declined' : 'sent';
      alert(`Price offer ${actionText} successfully!`);
      
      // Refresh reservations
      const data = await getCustomerReservations();
      setReservations(data || []);
    } catch (err) {
      console.error('Failed to submit customer response:', err);
      alert(err.message || 'Failed to submit response');
    }
  };

  const handleOpenNegotiateModal = (reservation) => {
    setSelectedOrderForNegotiation(reservation);
    setNegotiationMessage('');
    setNegotiateModalOpen(true);
  };

  const handleCloseNegotiateModal = () => {
    setNegotiateModalOpen(false);
    setSelectedOrderForNegotiation(null);
    setNegotiationMessage('');
  };

  const handleSubmitNegotiation = async () => {
    if (!negotiationMessage.trim()) {
      alert('Please enter your negotiation message');
      return;
    }

    try {
      setSubmittingNegotiation(true);
      await handleCustomerResponse(selectedOrderForNegotiation._id, 'negotiate', negotiationMessage);
      handleCloseNegotiateModal();
    } catch (err) {
      console.error('Negotiation error:', err);
    } finally {
      setSubmittingNegotiation(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    setReservationToCancel(reservationId);
    setConfirmCancelModal(true);
  };

  const confirmCancelReservation = async () => {
    if (!reservationToCancel) return;

    try {
      setCancellingId(reservationToCancel);
      setConfirmCancelModal(false);
      await cancelReservation(reservationToCancel);
      
      // Refresh reservations list
      const data = await getCustomerReservations();
      // Show all reservations including "New" (pending) ones
      setReservations(data || []);
      
      setSuccessMessage('Reservation cancelled successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
      setReservationToCancel(null);
    }
  };

  const getDisplayStatus = (status) => {
    const statusMap = {
      'pending': 'Pending Approval',
      'offer_received': 'Price Offer Received',
      'accepted': 'Accepted',
      'rejected': 'Cancelled',
      'completed': 'Completed',
      'cancelled': 'Cancelled',
      'in_progress': 'In Progress',
      'New': 'Pending approval',
      'Price_Proposed': 'Price Proposed',
      'Negotiating': 'Negotiating'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#3498db',
      'offer_received': '#f39c12',
      'accepted': '#27ae60',
      'rejected': '#e74c3c',
      'completed': '#95a5a6',
      'cancelled': '#e74c3c',
      'in_progress': '#f39c12',
      'New': '#3498db',
      'Price_Proposed': '#f39c12',
      'Negotiating': '#e67e22',
      'Confirmed': '#27ae60',
      'In Progress': '#f39c12',
      'Completed': '#95a5a6',
      'Cancelled': '#e74c3c',
      'Accepted': '#27ae60',
      'Rejected': '#e74c3c'
    };
    return colors[status] || '#7f8c8d';
  };

  const toggleDescription = (reservationId) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reservationId)) {
        newSet.delete(reservationId);
      } else {
        newSet.add(reservationId);
      }
      return newSet;
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="reservations-page">
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <h2>Error Loading Reservations</h2>
          <p style={{ color: '#e74c3c', background: '#ffe5e5', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            {error}
          </p>
          <button 
            onClick={() => window.location.reload()}
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const filteredReservations = filterStatus === 'all' 
    ? reservations 
    : filterStatus === 'rejected' 
      ? reservations.filter(res => res.status === 'rejected' || res.status === 'cancelled')
      : reservations.filter(res => res.status === filterStatus);

  return (
    <div className="reservations-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title" style={{color: '#1e3a5f'}}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '32px', height: '32px', verticalAlign: 'middle', marginRight: '12px', color: '#1e3a5f'}}>
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
            My Reservations
          </h1>
          <p className="page-subtitle">
            View and manage your service reservations
          </p>
        </div>

        <div className="reservations-controls">
          <div className="filter-section">
            <h3>Filter by Status:</h3>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({reservations.length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({reservations.filter(r => r.status === 'pending').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'offer_received' ? 'active' : ''}`}
                onClick={() => setFilterStatus('offer_received')}
              >
                Offers ({reservations.filter(r => r.status === 'offer_received').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'accepted' ? 'active' : ''}`}
                onClick={() => setFilterStatus('accepted')}
              >
                Accepted ({reservations.filter(r => r.status === 'accepted').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'rejected' ? 'active' : ''}`}
                onClick={() => setFilterStatus('rejected')}
              >
                Cancelled ({reservations.filter(r => r.status === 'rejected' || r.status === 'cancelled').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed ({reservations.filter(r => r.status === 'completed').length})
              </button>
            </div>
          </div>
        </div>

        {filteredReservations.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '80px', height: '80px', color: '#95a5a6'}}>
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <h3>No reservations yet</h3>
            <p style={{ color: '#7f8c8d', marginBottom: '1.5rem' }}>
              {filterStatus === 'all' 
                ? "You haven't made any reservations yet." 
                : `No ${filterStatus} reservations found.`}
            </p>
            <button
              onClick={() => navigate('/crafts')}
              style={{
                padding: '0.75rem 1.5rem',
                background: '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              Browse Artisans
            </button>
          </div>
        ) : (
          <div className="reservations-cards-container">
            {filteredReservations.map((reservation) => {
              const isExpanded = expandedDescriptions.has(reservation._id);
              const description = reservation.note || reservation.description || 'No description provided';
              const shouldShowReadMore = description.length > 100;
              
              return (
                <div key={reservation._id} className="reservation-card">
                  {/* Card Header */}
                  <div className="card-header">
                    <div className="header-left">
                      <div className="artisan-avatar">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <div className="artisan-details">
                        <h3 className="artisan-name">{reservation.artisan?.name || 'N/A'}</h3>
                      </div>
                    </div>
                    <div className="header-right">
                      <span className="status-badge" style={{
                        backgroundColor: getStatusColor(reservation.status)
                      }}>
                        {getDisplayStatus(reservation.status)}
                      </span>
                      <div className="price-tag">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                        {(reservation.totalPrice === 0 && reservation.type === 'custom_request') 
                          ? 'Price Pending' 
                          : `$${reservation.totalPrice || reservation.price || reservation.agreed_price || reservation.total_price || 0}`}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body">
                    {/* Offer Received Alert */}
                    {reservation.status === 'offer_received' && (
                      <div style={{
                        background: 'linear-gradient(135deg, #fff3cd 0%, #ffe8a1 100%)',
                        border: '2px solid #ffc107',
                        borderRadius: '8px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}>
                        <div style={{ fontSize: '1.5rem' }}>💰</div>
                        <div>
                          <div style={{ fontWeight: 'bold', color: '#856404', marginBottom: '0.25rem' }}>
                            Price Offer Received!
                          </div>
                          <div style={{ fontSize: '0.9rem', color: '#856404' }}>
                            The artisan has proposed a price of <strong>${reservation.totalPrice || reservation.price || 0}</strong>. Please review and accept or decline.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Type Badge */}
                    {reservation.type && (
                      <div style={{ marginBottom: '1rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.4rem 0.8rem',
                          background: reservation.type === 'portfolio_order' ? '#e3f2fd' : '#fff3e0',
                          color: reservation.type === 'portfolio_order' ? '#1976d2' : '#f57c00',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: 'bold'
                        }}>
                          {reservation.type === 'portfolio_order' ? '📸 Portfolio Order' : '🛠️ Custom Request'}
                        </span>
                      </div>
                    )}

                    {/* Project Image & Title for Portfolio Orders */}
                    {reservation.projectImage && reservation.projectTitle && (
                      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <img 
                          src={reservation.projectImage.startsWith('http') 
                            ? reservation.projectImage 
                            : `http://localhost:5000${reservation.projectImage}`}
                          alt={reservation.projectTitle}
                          style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '2px solid #e0e0e0'
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                            {reservation.projectTitle.replace(/^"|"$/g, '')}
                          </div>
                          {reservation.quantity && (
                            <div style={{ color: '#7f8c8d', fontSize: '0.9rem' }}>
                              Quantity: {reservation.quantity}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                          </svg>
                          Location
                        </div>
                        <div className="info-value">{reservation.artisan?.location || 'N/A'}</div>
                      </div>

                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                          </svg>
                          Phone
                        </div>
                        <div className="info-value">{reservation.artisan?.phone || reservation.artisan?.phone_number || 'N/A'}</div>
                      </div>

                      {reservation.start_date && (
                        <div className="info-item">
                          <div className="info-label">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
                            </svg>
                            Start Date
                          </div>
                          <div className="info-value">{formatDate(reservation.start_date)}</div>
                        </div>
                      )}

                      <div className="info-item">
                        <div className="info-label">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                          </svg>
                          Booked On
                        </div>
                        <div className="info-value">{formatDate(reservation.createdAt)}</div>
                      </div>
                    </div>

                    <div className="description-section">
                      <div className="info-label">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                        </svg>
                        Description
                      </div>
                      <p className={`description-text ${isExpanded ? 'expanded' : 'collapsed'}`}>
                        {description}
                      </p>
                      {shouldShowReadMore && (
                        <button 
                          onClick={() => toggleDescription(reservation._id)}
                          className="read-more-btn"
                        >
                          {isExpanded ? (
                            <>
                              Show Less
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>
                              </svg>
                            </>
                          ) : (
                            <>
                              Read More
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Card Footer - Actions */}
                  <div className="card-footer">
                    {reservation.status === 'offer_received' && (
                      <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleCustomerResponse(reservation._id, 'accept')}
                          className="btn-respond"
                          style={{
                            flex: '1 1 45%',
                            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                          Accept (${reservation.totalPrice || reservation.price || 0})
                        </button>
                        
                        <button
                          onClick={() => handleOpenNegotiateModal(reservation)}
                          className="btn-negotiate"
                          style={{
                            flex: '1 1 45%',
                            background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                            <path d="M7 9h2v2H7zm8 0h2v2h-2zm-4 0h2v2h-2z"/>
                          </svg>
                          Negotiate
                        </button>
                        
                        <button
                          onClick={() => handleCustomerResponse(reservation._id, 'reject')}
                          className="btn-cancel"
                          style={{
                            flex: '1 1 100%',
                            background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                            border: 'none',
                            padding: '0.75rem 1rem',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'transform 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '20px', height: '20px' }}>
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                          </svg>
                          Decline Offer
                        </button>
                      </div>
                    )}
                    {(reservation.status === 'Price_Proposed' || reservation.status === 'Negotiating') && reservation.agreed_price > 0 && (
                      <button
                        onClick={() => handleOpenReplyModal(reservation)}
                        className="btn-respond"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                        </svg>
                        Respond to Price (${reservation.agreed_price})
                      </button>
                    )}
                    {(reservation.status === 'New' || reservation.status === 'pending') && (
                      <button
                        onClick={() => handleCancelReservation(reservation._id)}
                        disabled={cancellingId === reservation._id}
                        className="btn-cancel"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        {cancellingId === reservation._id ? 'Cancelling...' : 'Cancel Reservation'}
                      </button>
                    )}
                    {(reservation.status === 'completed' || reservation.status === 'Completed') && reservation.artisan?._id && !reviewedArtisans.has(reservation.artisan._id) && (
                      <button
                        onClick={() => handleOpenReviewForm(reservation._id)}
                        className="btn-review"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                        </svg>
                        Add Review
                      </button>
                    )}
                    {(reservation.status === 'completed' || reservation.status === 'Completed') && reservation.artisan?._id && reviewedArtisans.has(reservation.artisan._id) && (
                      <div className="reviewed-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Review Submitted
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Review Modal */}
        {reviewingId && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.5)',
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
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 style={{ marginBottom: '1.5rem', color: '#2c3e50' }}>Add Review</h2>
              
              {/* Success Message */}
              {reviewSuccess && (
                <div style={{
                  background: 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)',
                  border: '2px solid #28a745',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', color: '#28a745', flexShrink: 0 }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#155724', marginBottom: '0.25rem' }}>
                      ✓ Review Submitted Successfully!
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#155724' }}>
                      Thank you for your feedback!
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {reviewError && (
                <div style={{
                  background: 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                  border: '2px solid #dc3545',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem'
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{ width: '24px', height: '24px', color: '#dc3545', flexShrink: 0 }}>
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#721c24', marginBottom: '0.25rem' }}>
                      Error
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#721c24' }}>
                      {reviewError}
                    </div>
                  </div>
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                  Rating (Stars)
                </label>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '2rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setReviewForm({ ...reviewForm, stars_number: star })}
                      style={{
                        cursor: 'pointer',
                        color: star <= reviewForm.stars_number ? '#f39c12' : '#ddd',
                        transition: 'color 0.2s ease'
                      }}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: '0.5rem', color: '#7f8c8d', fontSize: '0.9rem' }}>
                  {reviewForm.stars_number} {reviewForm.stars_number === 1 ? 'star' : 'stars'}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#2c3e50' }}>
                  Comment
                </label>
                <textarea
                  value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  placeholder="Share your experience with this artisan..."
                  rows="5"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#3498db';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ddd';
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={handleCloseReviewForm}
                  disabled={submittingReview}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: submittingReview ? 'not-allowed' : 'pointer',
                    opacity: submittingReview ? 0.6 : 1,
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!submittingReview) {
                      e.target.style.background = '#7f8c8d';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submittingReview) {
                      e.target.style.background = '#95a5a6';
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const reservation = reservations.find(r => r._id === reviewingId);
                    handleSubmitReview(reservation);
                  }}
                  disabled={submittingReview || !reviewForm.comment.trim()}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: submittingReview || !reviewForm.comment.trim() ? '#95a5a6' : '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    cursor: submittingReview || !reviewForm.comment.trim() ? 'not-allowed' : 'pointer',
                    opacity: submittingReview || !reviewForm.comment.trim() ? 0.6 : 1,
                    transition: 'background 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!submittingReview && reviewForm.comment.trim()) {
                      e.target.style.background = '#2980b9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submittingReview && reviewForm.comment.trim()) {
                      e.target.style.background = '#3498db';
                    }
                  }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Price Reply Modal */}
        {replyModalOpen && selectedReservation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '2rem',
              maxWidth: '550px',
              width: '90%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '28px', height: '28px', color: '#f39c12'}}>
                    <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                  </svg>
                  Respond to Price Proposal
                </h2>
                <p style={{ color: '#7f8c8d', margin: 0 }}>
                  <strong>{selectedReservation.title || 'Service Request'}</strong>
                </p>
                <div style={{ 
                  marginTop: '1rem', 
                  padding: '1rem', 
                  background: '#f8f9fa', 
                  borderRadius: '8px',
                  fontSize: '1.2rem',
                  fontWeight: 'bold',
                  color: '#27ae60',
                  textAlign: 'center'
                }}>
                  Proposed Price: ${selectedReservation.agreed_price}
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '1rem', fontWeight: 'bold', color: '#2c3e50' }}>
                  Your Response:
                </label>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    border: `2px solid ${replyType === 'accept' ? '#27ae60' : '#e1e8ed'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: replyType === 'accept' ? '#e8f8f0' : 'white',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="radio"
                      name="replyType"
                      value="accept"
                      checked={replyType === 'accept'}
                      onChange={(e) => setReplyType(e.target.value)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#27ae60', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px'}}>
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Accept Price
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>I agree with the proposed price</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    border: `2px solid ${replyType === 'reject' ? '#e74c3c' : '#e1e8ed'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: replyType === 'reject' ? '#ffeaea' : 'white',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="radio"
                      name="replyType"
                      value="reject"
                      checked={replyType === 'reject'}
                      onChange={(e) => setReplyType(e.target.value)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#e74c3c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px'}}>
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                        Reject Price
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Price is not acceptable</div>
                    </div>
                  </label>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem',
                    border: `2px solid ${replyType === 'negotiate' ? '#f39c12' : '#e1e8ed'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: replyType === 'negotiate' ? '#fff8e6' : 'white',
                    transition: 'all 0.3s ease'
                  }}>
                    <input
                      type="radio"
                      name="replyType"
                      value="negotiate"
                      checked={replyType === 'negotiate'}
                      onChange={(e) => setReplyType(e.target.value)}
                      style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 'bold', color: '#f39c12', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px'}}>
                          <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
                        </svg>
                        Negotiate Price
                      </div>
                      <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>Propose a different price</div>
                    </div>
                  </label>
                </div>
              </div>

              {replyType === 'negotiate' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                    Negotiation Note *
                  </label>
                  <textarea
                    value={negotiationNote}
                    onChange={(e) => setNegotiationNote(e.target.value)}
                    placeholder="E.g., '150 is too high. Can we do 120?'"
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      border: '2px solid #f39c12',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleCloseReplyModal}
                  disabled={submittingReply}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: submittingReply ? 'not-allowed' : 'pointer',
                    opacity: submittingReply ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitReply}
                  disabled={submittingReply || (replyType === 'negotiate' && !negotiationNote.trim())}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: submittingReply || (replyType === 'negotiate' && !negotiationNote.trim()) 
                      ? '#95a5a6' 
                      : replyType === 'accept' ? '#27ae60' : replyType === 'reject' ? '#e74c3c' : '#f39c12',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: submittingReply || (replyType === 'negotiate' && !negotiationNote.trim()) ? 'not-allowed' : 'pointer',
                    opacity: submittingReply || (replyType === 'negotiate' && !negotiationNote.trim()) ? 0.6 : 1
                  }}
                >
                  {submittingReply ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '18px', height: '18px', marginRight: '6px', animation: 'spin 1s linear infinite'}}>
                        <path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '18px', height: '18px', marginRight: '6px'}}>
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                      Submit Response
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Negotiation Modal */}
        {negotiateModalOpen && selectedOrderForNegotiation && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 10px 40px rgba(0,0,0,0.3)'
            }}>
              <h2 style={{ margin: '0 0 1rem 0', color: '#2c3e50', fontSize: '1.5rem' }}>
                💬 Negotiate Price
              </h2>
              
              <div style={{
                background: '#f8f9fa',
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: '1px solid #dee2e6'
              }}>
                <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  <strong>Artisan:</strong> {selectedOrderForNegotiation.artisan?.name || 'N/A'}
                </p>
                <p style={{ margin: '0 0 0.5rem 0', color: '#6c757d', fontSize: '0.9rem' }}>
                  <strong>Current Price Offer:</strong> <span style={{ color: '#27ae60', fontSize: '1.1rem', fontWeight: 'bold' }}>${selectedOrderForNegotiation.totalPrice || selectedOrderForNegotiation.price || 0}</span>
                </p>
                <p style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                  <strong>Order Type:</strong> {selectedOrderForNegotiation.type === 'custom_request' ? '🛠️ Custom Request' : '📸 Portfolio Order'}
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="negotiationMessage" style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                  color: '#2c3e50'
                }}>
                  Your Counter-Offer / Message *
                </label>
                <textarea
                  id="negotiationMessage"
                  value={negotiationMessage}
                  onChange={(e) => setNegotiationMessage(e.target.value)}
                  placeholder="Example: That is slightly over my budget. Can we do $350? I'm flexible on the delivery date."
                  rows="5"
                  disabled={submittingNegotiation}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#6c757d' }}>
                  ℹ️ Be respectful and clear about your budget or requirements
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button
                  onClick={handleCloseNegotiateModal}
                  disabled={submittingNegotiation}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: submittingNegotiation ? 'not-allowed' : 'pointer',
                    opacity: submittingNegotiation ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitNegotiation}
                  disabled={submittingNegotiation || !negotiationMessage.trim()}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    background: submittingNegotiation || !negotiationMessage.trim() ? '#95a5a6' : 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: submittingNegotiation || !negotiationMessage.trim() ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem'
                  }}
                >
                  {submittingNegotiation ? (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '18px', height: '18px', animation: 'spin 1s linear infinite'}}>
                        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '18px', height: '18px'}}>
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                      </svg>
                      Send Counter-Offer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Confirmation Modal for Cancel */}
        {confirmCancelModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            animation: 'fadeIn 0.3s ease-out'
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
              borderRadius: '20px',
              padding: '0',
              maxWidth: '450px',
              width: '90%',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              animation: 'slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              overflow: 'hidden',
              border: '2px solid rgba(231, 76, 60, 0.2)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                padding: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '64px',
                  filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.2))'
                }}>⚠️</span>
              </div>
              <div style={{
                padding: '35px 40px',
                textAlign: 'center'
              }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#2c3e50',
                  margin: '0 0 15px 0',
                  letterSpacing: '-0.5px'
                }}>Cancel Reservation?</h3>
                <p style={{
                  fontSize: '16px',
                  color: '#5a6c7d',
                  lineHeight: '1.6',
                  margin: '0'
                }}>Are you sure you want to cancel this reservation? This action cannot be undone.</p>
              </div>
              <div style={{
                padding: '0 40px 35px 40px',
                display: 'flex',
                gap: '1rem',
                justifyContent: 'center'
              }}>
                <button
                  onClick={() => {
                    setConfirmCancelModal(false);
                    setReservationToCancel(null);
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #95a5a6 0%, #7f8c8d 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 30px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(149, 165, 166, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(149, 165, 166, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(149, 165, 166, 0.3)';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCancelReservation}
                  style={{
                    background: 'linear-gradient(135deg, #e74c3c 0%, #c0392b 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px 30px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(231, 76, 60, 0.3)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    flex: 1
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(231, 76, 60, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(231, 76, 60, 0.3)';
                  }}
                >
                  Yes, Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Success Message Toast */}
        {successMessage && (
          <div style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            background: 'linear-gradient(135deg, #27ae60 0%, #229954 100%)',
            color: 'white',
            padding: '1.25rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(39, 174, 96, 0.4)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            animation: 'slideInRight 0.4s ease-out',
            maxWidth: '400px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '28px', height: '28px', flexShrink: 0}}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span style={{fontSize: '1.05rem', fontWeight: '600'}}>{successMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;
