import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomerReservations, cancelReservation } from '../services/customerService';
import { post } from '../utils/api';
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
  const [reviewedArtisans, setReviewedArtisans] = useState(new Set());

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
        // Show all reservations including "New" (pending) ones
        setReservations(data || []);
        
        // Fetch customer's existing reviews to check which artisans they've already reviewed
        await fetchCustomerReviews();
      } catch (err) {
        console.error('Failed to fetch reservations:', err);
        setError(err.message || 'Failed to load reservations');
      } finally {
        setLoading(false);
      }
    };

    fetchReservations();
  }, [isLoggedIn, role, navigate]);

  // Fetch customer's reviews to check which artisans they've already reviewed
  const fetchCustomerReviews = async () => {
    try {
      const response = await get('/reviews/customer');
      const reviews = Array.isArray(response) ? response : (response.reviews || []);
      
      // Create a set of artisan IDs that this customer has already reviewed
      const reviewedArtisanIds = new Set(reviews.map(review => review.artisan));
      setReviewedArtisans(reviewedArtisanIds);
      
      console.log('✅ Customer has reviewed these artisans:', Array.from(reviewedArtisanIds));
    } catch (err) {
      console.error('❌ Failed to fetch customer reviews:', err);
      // Don't show error, just continue
    }
  };

  const handleOpenReviewForm = (reservationId) => {
    setReviewingId(reservationId);
    setReviewForm({ stars_number: 5, comment: '' });
  };

  const handleCloseReviewForm = () => {
    setReviewingId(null);
    setReviewForm({ stars_number: 5, comment: '' });
  };

  const handleSubmitReview = async (reservation) => {
    if (!reviewForm.comment.trim()) {
      alert('Please add a comment to your review');
      return;
    }

    try {
      setSubmittingReview(true);
      
      const reviewData = {
        artisanId: reservation.artisan._id,
        stars_number: reviewForm.stars_number,
        comment: reviewForm.comment.trim()
      };

      await post('/reviews', reviewData);
      
      // Mark this artisan as reviewed
      setReviewedArtisans(prev => new Set([...prev, reservation.artisan._id]));
      
      // Close the form
      handleCloseReviewForm();
      
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelReservation = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) {
      return;
    }

    try {
      setCancellingId(reservationId);
      await cancelReservation(reservationId);
      
      // Refresh reservations list
      const data = await getCustomerReservations();
      // Show all reservations including "New" (pending) ones
      setReservations(data || []);
      
      alert('Reservation cancelled successfully');
    } catch (err) {
      console.error('Failed to cancel reservation:', err);
      alert(err.message || 'Failed to cancel reservation');
    } finally {
      setCancellingId(null);
    }
  };

  const getDisplayStatus = (status) => {
    if (status === 'New') {
      return 'Pending approval';
    }
    return status;
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
      'New': '#3498db',
      'Confirmed': '#27ae60',
      'In Progress': '#f39c12',
      'Completed': '#95a5a6',
      'Cancelled': '#e74c3c',
      'Accepted': '#27ae60',
      'Rejected': '#e74c3c'
    };
    return colors[status] || '#7f8c8d';
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
    : reservations.filter(res => res.status === filterStatus);

  return (
    <div className="reservations-page">
      <div className="container">
        <div className="page-header">
          <h1 className="page-title">My Reservations</h1>
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
                className={`filter-btn ${filterStatus === 'New' ? 'active' : ''}`}
                onClick={() => setFilterStatus('New')}
              >
                Pending ({reservations.filter(r => r.status === 'New').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'Accepted' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Accepted')}
              >
                Accepted ({reservations.filter(r => r.status === 'Accepted').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'Rejected' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Rejected')}
              >
                Rejected ({reservations.filter(r => r.status === 'Rejected').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'Completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('Completed')}
              >
                Completed ({reservations.filter(r => r.status === 'Completed').length})
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
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📭</div>
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
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Artisan</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Craft Type</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Location</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Description</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Start Date</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                  <th style={{ padding: '1rem', textAlign: 'right', borderBottom: '2px solid #dee2e6' }}>Price</th>
                  <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Booked On</th>
                  <th style={{ padding: '1rem', textAlign: 'center', borderBottom: '2px solid #dee2e6' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReservations.map((reservation) => (
                  <tr key={reservation._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '1rem' }}>
                      <div>
                        <strong>{reservation.artisan?.name || 'N/A'}</strong>
                        {reservation.artisan?.phone_number && (
                          <div style={{ fontSize: '0.85rem', color: '#7f8c8d' }}>
                            📱 {reservation.artisan.phone_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        background: '#e8f4f8',
                        color: '#2c3e50',
                        borderRadius: '12px',
                        fontSize: '0.9rem'
                      }}>
                        {reservation.artisan?.craftType || 'N/A'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        📍 {reservation.artisan?.location || 'N/A'}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', maxWidth: '200px' }}>
                      <div style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }} title={reservation.description}>
                        {reservation.description}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', whiteSpace: 'nowrap' }}>
                      {formatDate(reservation.start_date)}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        background: getStatusColor(reservation.status),
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 'bold'
                      }}>
                        {getDisplayStatus(reservation.status)}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right', fontWeight: 'bold', color: '#27ae60' }}>
                      ${reservation.total_price}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.9rem', color: '#7f8c8d', whiteSpace: 'nowrap' }}>
                      {formatDate(reservation.createdAt)}
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'center' }}>
                      {reservation.status === 'New' && (
                        <button
                          onClick={() => handleCancelReservation(reservation._id)}
                          disabled={cancellingId === reservation._id}
                          style={{
                            padding: '0.5rem 1rem',
                            background: cancellingId === reservation._id ? '#95a5a6' : '#e74c3c',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            cursor: cancellingId === reservation._id ? 'not-allowed' : 'pointer',
                            opacity: cancellingId === reservation._id ? 0.6 : 1,
                            transition: 'background 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            if (cancellingId !== reservation._id) {
                              e.target.style.background = '#c0392b';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (cancellingId !== reservation._id) {
                              e.target.style.background = '#e74c3c';
                            }
                          }}
                        >
                          {cancellingId === reservation._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}
                      {reservation.status === 'Completed' && reservation.artisan?._id && !reviewedArtisans.has(reservation.artisan._id) && (
                        <button
                          onClick={() => handleOpenReviewForm(reservation._id)}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#27ae60',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                            transition: 'background 0.3s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#229954';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = '#27ae60';
                          }}
                        >
                          Add Review
                        </button>
                      )}
                      {reservation.status === 'Completed' && reservation.artisan?._id && reviewedArtisans.has(reservation.artisan._id) && (
                        <span style={{
                          padding: '0.5rem 1rem',
                          background: '#95a5a6',
                          color: 'white',
                          borderRadius: '6px',
                          fontSize: '0.9rem',
                          display: 'inline-block'
                        }}>
                          ✓ Reviewed
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
      </div>
    </div>
  );
};

export default Reservations;
