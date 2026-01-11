import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArtisanProfile, setAvailability } from '../services/craftsmanService';
import { apiRequest } from '../utils/api';
import { CraftsmanController } from '../controllers/CraftsmanController';
import { ReservationController } from '../controllers/ReservationController';
import { CraftController } from '../controllers/CraftController';
import ReservationCard from '../components/ReservationCard';
import Loading from '../components/Loading';
import '../styles/CraftsmanDashboard.css';

const CraftsmanDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, user, profile, updateProfile } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [craftsman, setCraftsman] = useState(null);
  const [acceptedJobs, setAcceptedJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(false);
  const [jobsError, setJobsError] = useState(null);
  const [completingJobId, setCompletingJobId] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // Availability form state
  const [availabilityForm, setAvailabilityForm] = useState({
    day: 'Monday',
    start_time: '09:00',
    end_time: '17:00'
  });
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [availabilityMessage, setAvailabilityMessage] = useState(null);

  useEffect(() => {
    // Check if user is logged in as artisan
    if (!isLoggedIn || role !== 'artisan') {
      console.log('❌ Not logged in as artisan. isLoggedIn:', isLoggedIn, 'role:', role);
      alert('Please login as an artisan to access this page');
      navigate('/login');
      return;
    }
    
    console.log('✅ Artisan authenticated:', user?.name);
    setCurrentUser(user);
    
    // Fetch real artisan profile from API (only once if not already fetched)
    const fetchProfile = async () => {
      if (profile) {
        console.log('📦 Using cached profile from AuthContext');
        setCraftsman(profile);
        return;
      }
      
      try {
        setIsLoadingProfile(true);
        console.log('📋 Fetching artisan profile from API...');
        const apiProfile = await getArtisanProfile();
        console.log('✅ Profile fetched from API:', apiProfile);
        
        // Store in AuthContext for reuse
        updateProfile(apiProfile);
        
        // Set local state
        setCraftsman(apiProfile);
      } catch (error) {
        console.error('⚠️ Failed to fetch profile from API:', error.message);
        // Fallback to demo data if available
        const demoData = CraftsmanController.getCraftsmanByEmail(user?.email);
        if (demoData) {
          console.log('Using fallback demo data');
          setCraftsman(demoData);
        }
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();

    // Fetch accepted jobs from API
    fetchAcceptedJobs();

    // Load bookings (from demo data for now)
    const allReservations = ReservationController.getReservations();
    if (craftsman?.id) {
      const craftsmanBookings = CraftsmanController.getBookings(craftsman.id, allReservations);
      setBookings(craftsmanBookings);
    }
  }, [navigate, isLoggedIn, role, user, profile, updateProfile]);

  const fetchAcceptedJobs = async () => {
    try {
      setIsLoadingJobs(true);
      setJobsError(null);
      
      const data = await apiRequest('/orders/reservations/artisan', {
        method: 'GET'
      });

      // Filter for accepted jobs only (lowercase 'accepted')
      const accepted = (data || []).filter(job => job.status === 'accepted');
      
      // Remove duplicates based on _id
      const uniqueAccepted = accepted.reduce((acc, current) => {
        const exists = acc.find(item => item._id === current._id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
      console.log('✅ Accepted orders loaded:', uniqueAccepted.length);
      setAcceptedJobs(uniqueAccepted);
    } catch (err) {
      console.error('❌ Error fetching accepted jobs:', err);
      setJobsError(err.message || 'Failed to load accepted jobs');
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleMarkAsCompleted = async (bookingId) => {
    if (!window.confirm('Mark this order as completed? The customer will be able to review your work.')) {
      return;
    }

    try {
      setCompletingJobId(bookingId);
      
      await apiRequest(`/orders/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'completed' })
      });

      console.log(`✅ Order ${bookingId} marked as completed`);
      
      // Refresh bookings list to remove completed booking
      await fetchAcceptedJobs();
      
      alert('Order marked as completed successfully! Customer can now review your work.');
    } catch (err) {
      console.error(`❌ Error marking order as completed:`, err);
      alert(`Failed to mark order as completed: ${err.message}`);
    } finally {
      setCompletingJobId(null);
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const handleToggleAvailability = () => {
    const result = CraftsmanController.toggleStatus(currentUser.id);
    if (result.success) {
      alert(result.message);
      // Reload craftsman data
      const updatedCraftsman = CraftsmanController.getCraftsman(currentUser.id);
      setCraftsman(updatedCraftsman);
    } else {
      alert('❌ Error: ' + result.message);
    }
  };

  const handleAvailabilityInputChange = (e) => {
    const { name, value } = e.target;
    setAvailabilityForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveAvailability = async () => {
    try {
      setIsSavingAvailability(true);
      setAvailabilityMessage(null);

      const response = await setAvailability(availabilityForm);
      
      console.log('✅ Availability saved:', response);
      setAvailabilityMessage({
        type: 'success',
        text: 'Availability set successfully!'
      });
      
      // Reset form to default values
      setAvailabilityForm({
        day: 'Monday',
        start_time: '09:00',
        end_time: '17:00'
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowTimeSettings(false);
        setAvailabilityMessage(null);
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error saving availability:', error);
      setAvailabilityMessage({
        type: 'error',
        text: error.message || 'Failed to save availability'
      });
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const handleAcceptBooking = (reservationId) => {
    const result = ReservationController.acceptReservation(reservationId);
    if (result.success) {
      alert('✅ Booking accepted!');
      // Reload bookings
      const allReservations = ReservationController.getReservations();
      const craftsmanBookings = CraftsmanController.getBookings(currentUser.id, allReservations);
      setBookings(craftsmanBookings);
    } else {
      alert('❌ Error: ' + result.message);
    }
  };

  const handleRejectBooking = (reservationId) => {
    if (window.confirm('Are you sure you want to reject this booking?')) {
      const result = ReservationController.rejectReservation(reservationId);
      if (result.success) {
        alert('Booking rejected');
        // Reload bookings
        const allReservations = ReservationController.getReservations();
        const craftsmanBookings = CraftsmanController.getBookings(currentUser.id, allReservations);
        setBookings(craftsmanBookings);
      } else {
        alert('❌ Error: ' + result.message);
      }
    }
  };

  const getReservationWithCraft = (reservation) => {
    const craft = CraftController.getCraft(reservation.craftId);
    return { reservation, craft };
  };

  if (!craftsman) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="craftsman-dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <div className="craftsman-info">
            <h1>👨‍🔧 {craftsman.name}'s Dashboard</h1>
            <p className="profession">{craftsman.profession} • Business Management</p>
            <p className="bio">Manage your bookings, availability</p>
          </div>
          
          <div className="dashboard-actions">
            <button 
              className="btn-settings"
              onClick={() => setShowTimeSettings(!showTimeSettings)}
            >
              ⚙️ Manage Times
            </button>
          </div>
        </div>

        {/* Time Settings Modal */}
        {showTimeSettings && (
          <div className="time-settings-panel">
            <h3>⏰ Set Your Availability</h3>
            <p>Define your working hours for each day:</p>
            
            {/* Availability Form */}
            <div className="availability-form">
              <div className="form-group">
                <label htmlFor="day">Day of Week:</label>
                <select
                  id="day"
                  name="day"
                  value={availabilityForm.day}
                  onChange={handleAvailabilityInputChange}
                  className="form-control"
                >
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start_time">Start Time:</label>
                  <input
                    type="time"
                    id="start_time"
                    name="start_time"
                    value={availabilityForm.start_time}
                    onChange={handleAvailabilityInputChange}
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end_time">End Time:</label>
                  <input
                    type="time"
                    id="end_time"
                    name="end_time"
                    value={availabilityForm.end_time}
                    onChange={handleAvailabilityInputChange}
                    className="form-control"
                  />
                </div>
              </div>

              {availabilityMessage && (
                <div className={`availability-message ${availabilityMessage.type}`}>
                  {availabilityMessage.type === 'success' ? '✅' : '❌'} {availabilityMessage.text}
                </div>
              )}

              <div className="time-settings-actions">
                <button 
                  className="btn-save" 
                  onClick={handleSaveAvailability}
                  disabled={isSavingAvailability}
                >
                  {isSavingAvailability ? '⏳ Saving...' : '✅ Save Availability'}
                </button>
                <button 
                  className="btn-cancel" 
                  onClick={() => {
                    setShowTimeSettings(false);
                    setAvailabilityMessage(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Section */}
        <div className="bookings-section">
          <div className="section-header">
            <h2>📅 Bookings</h2>
            <p className="section-description">Your confirmed reservations with customers</p>
          </div>

          {isLoadingJobs ? (
            <Loading />
          ) : jobsError ? (
            <div className="error-message">
              <p>⚠️ {jobsError}</p>
              <button onClick={fetchAcceptedJobs} className="btn-retry">
                Try Again
              </button>
            </div>
          ) : (() => {
            // Sort accepted jobs by start_date ascending
            const sortedBookings = [...acceptedJobs].sort((a, b) => 
              new Date(a.start_date) - new Date(b.start_date)
            );

            if (sortedBookings.length === 0) {
              return (
                <div className="no-bookings">
                  <div className="no-bookings-icon">📭</div>
                  <h3>No bookings yet</h3>
                  <p>You haven't accepted any reservations yet. Check the Jobs page for new requests.</p>
                </div>
              );
            }

            return (
              <div className="bookings-list">
                {sortedBookings.map((booking) => (
                  <div key={booking._id} className="booking-card">
                    <div className="booking-card-header">
                      <div className="customer-name">
                        <span className="icon">👤</span>
                        <h3>{booking.customer?.name || 'N/A'}</h3>
                      </div>
                      <div className="booking-price">
                        ${(booking.totalPrice || booking.price || booking.agreed_price || booking.total_price || 0).toFixed(2)}
                      </div>
                    </div>
                    
                    {/* Order Type Badge */}
                    {booking.type && (
                      <div style={{ marginBottom: '0.75rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.3rem 0.7rem',
                          background: booking.type === 'portfolio_order' ? '#e3f2fd' : '#fff3e0',
                          color: booking.type === 'portfolio_order' ? '#1976d2' : '#f57c00',
                          borderRadius: '6px',
                          fontSize: '0.8rem',
                          fontWeight: 'bold'
                        }}>
                          {booking.type === 'portfolio_order' ? '📸 Portfolio Order' : '🛠️ Custom Request'}
                        </span>
                      </div>
                    )}
                    
                    {/* Project Title and Image for Portfolio Orders */}
                    {booking.projectTitle && (
                      <div className="booking-info-row">
                        <span className="label">📝 Project:</span>
                        <span className="value" style={{ fontWeight: 'bold' }}>{booking.projectTitle.replace(/^"|"$/g, '')}</span>
                      </div>
                    )}
                    
                    {booking.quantity > 1 && (
                      <div className="booking-info-row">
                        <span className="label">📦 Quantity:</span>
                        <span className="value">{booking.quantity}</span>
                      </div>
                    )}
                    
                    <div className="booking-card-body">
                      <div className="booking-info-row">
                        <span className="label">📞 Phone:</span>
                        <span className="value">{booking.customer?.phone || booking.customer?.phone_number || 'N/A'}</span>
                      </div>
                      <div className="booking-info-row">
                        <span className="label">📝 Note:</span>
                        <span className="value">{booking.note || booking.description || 'No description'}</span>
                      </div>
                      <div className="booking-info-row">
                        <span className="label">🚚 Delivery Date:</span>
                        <span className="value">{booking.deliveryDate ? formatDate(booking.deliveryDate) : formatDate(booking.start_date || booking.createdAt)}</span>
                      </div>
                      <div className="booking-info-row">
                        <span className="label">✅ Status:</span>
                        <span className="status-badge status-accepted">{booking.status}</span>
                      </div>
                    </div>

                    {booking.status === 'accepted' && (
                      <div className="booking-card-footer">
                        <button
                          className="btn-mark-completed"
                          onClick={() => handleMarkAsCompleted(booking._id)}
                          disabled={completingJobId === booking._id}
                        >
                          {completingJobId === booking._id ? '⏳ Processing...' : '✓ Mark as Completed'}
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
};

export default CraftsmanDashboard;
