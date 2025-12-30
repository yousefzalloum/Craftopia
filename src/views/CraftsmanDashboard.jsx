import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getArtisanProfile } from '../services/craftsmanService';
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
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [portfolio, setPortfolio] = useState([]);
  const [newWork, setNewWork] = useState({
    title: '',
    description: '',
    imageUrl: ''
  });
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  
  // All possible time slots
  const allTimeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const [selectedTimes, setSelectedTimes] = useState([]);

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
        setPortfolio(profile.portfolioImages || []);
        setSelectedTimes(profile.availableTimes || []);
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
        setPortfolio(apiProfile.portfolioImages || []);
        setSelectedTimes(apiProfile.availableTimes || []);
      } catch (error) {
        console.error('⚠️ Failed to fetch profile from API:', error.message);
        // Fallback to demo data if available
        const demoData = CraftsmanController.getCraftsmanByEmail(user?.email);
        if (demoData) {
          console.log('Using fallback demo data');
          setCraftsman(demoData);
          setPortfolio(demoData.portfolio || []);
          setSelectedTimes(demoData.availableTimes || []);
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
      
      const data = await apiRequest('/reservations/incoming-jobs', {
        method: 'GET'
      });

      // Filter for accepted jobs only
      const accepted = (data || []).filter(job => job.status === 'Accepted');
      
      // Remove duplicates based on _id
      const uniqueAccepted = accepted.reduce((acc, current) => {
        const exists = acc.find(item => item._id === current._id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []);
      
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
    if (!window.confirm('Mark this booking as completed?')) {
      return;
    }

    try {
      setCompletingJobId(bookingId);
      
      await apiRequest(`/reservations/${bookingId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: 'Completed' })
      });

      console.log(`✅ Booking ${bookingId} marked as completed`);
      
      // Refresh bookings list to remove completed booking
      await fetchAcceptedJobs();
      
      alert('Booking marked as completed successfully!');
    } catch (err) {
      console.error(`❌ Error marking booking as completed:`, err);
      alert(`Failed to mark booking as completed: ${err.message}`);
    } finally {
      setCompletingJobId(null);
    }
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : bookings.filter(booking => booking.status === filterStatus);

  const handleTimeToggle = (time) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else {
      setSelectedTimes([...selectedTimes, time]);
    }
  };

  const handleSaveTimes = () => {
    const result = CraftsmanController.updateTimes(currentUser.id, selectedTimes);
    if (result.success) {
      alert('✅ Available times updated successfully!');
      setShowTimeSettings(false);
      // Reload craftsman data
      const updatedCraftsman = CraftsmanController.getCraftsman(currentUser.id);
      setCraftsman(updatedCraftsman);
    } else {
      alert('❌ Error updating times: ' + result.message);
    }
  };

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

  const handleAddWork = () => {
    if (!newWork.title || !newWork.description || !newWork.imageUrl) {
      alert('Please fill in all fields');
      return;
    }

    const work = {
      id: Date.now(),
      ...newWork,
      createdAt: new Date().toISOString()
    };

    const updatedPortfolio = [...portfolio, work];
    setPortfolio(updatedPortfolio);

    // Update in localStorage
    const storedCraftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen') || '[]');
    const index = storedCraftsmen.findIndex(c => c.id === currentUser.id);
    if (index !== -1) {
      storedCraftsmen[index].portfolio = updatedPortfolio;
      localStorage.setItem('craftopia_craftsmen', JSON.stringify(storedCraftsmen));
    }

    // Reset form
    setNewWork({ title: '', description: '', imageUrl: '' });
    setShowPortfolioForm(false);
    alert('✅ Work added to portfolio!');
  };

  const handleDeleteWork = (workId) => {
    if (window.confirm('Are you sure you want to delete this work?')) {
      const updatedPortfolio = portfolio.filter(w => w.id !== workId);
      setPortfolio(updatedPortfolio);

      // Update in localStorage
      const storedCraftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen') || '[]');
      const index = storedCraftsmen.findIndex(c => c.id === currentUser.id);
      if (index !== -1) {
        storedCraftsmen[index].portfolio = updatedPortfolio;
        localStorage.setItem('craftopia_craftsmen', JSON.stringify(storedCraftsmen));
      }

      alert('Work deleted from portfolio');
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
            <p className="bio">Manage your bookings, availability, and portfolio</p>
          </div>
          
          <div className="dashboard-actions">
            <button 
              className={`btn-availability ${craftsman.availability ? 'active' : 'inactive'}`}
              onClick={handleToggleAvailability}
            >
              {craftsman.availability ? '✓ Available' : '✗ Unavailable'}
            </button>
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
            <h3>⏰ Set Your Available Time Slots</h3>
            <p>Select the times you're available to take appointments:</p>
            
            <div className="time-slots-grid">
              {allTimeSlots.map(time => (
                <button
                  key={time}
                  className={`time-slot ${selectedTimes.includes(time) ? 'selected' : ''}`}
                  onClick={() => handleTimeToggle(time)}
                >
                  {time}
                </button>
              ))}
            </div>

            <div className="time-settings-actions">
              <button className="btn-save" onClick={handleSaveTimes}>
                ✅ Save Times ({selectedTimes.length} selected)
              </button>
              <button className="btn-cancel" onClick={() => setShowTimeSettings(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Current Available Times */}
        <div className="current-times">
          <h3>📅 Current Available Times:</h3>
          <div className="times-list">
            {(() => {
              // Sort accepted jobs by start_date ascending
              const sortedJobs = [...acceptedJobs].sort((a, b) => 
                new Date(a.start_date) - new Date(b.start_date)
              );
              
              if (sortedJobs.length > 0) {
                return sortedJobs.map(job => (
                  <span key={job._id} className="time-badge">
                    {formatDate(job.start_date)}
                  </span>
                ));
              } else {
                return <p className="no-times">No available times</p>;
              }
            })()}
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="portfolio-section">
          <div className="section-header">
            <h2>🎨 My Portfolio</h2>
            <button 
              className="btn-add-work"
              onClick={() => setShowPortfolioForm(!showPortfolioForm)}
            >
              {showPortfolioForm ? '✕ Cancel' : '+ Add Work'}
            </button>
          </div>

          {showPortfolioForm && (
            <div className="portfolio-form">
              <h3>Add New Work</h3>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder="e.g., Custom Metal Gate"
                  value={newWork.title}
                  onChange={(e) => setNewWork({...newWork, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe your work..."
                  rows="3"
                  value={newWork.description}
                  onChange={(e) => setNewWork({...newWork, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={newWork.imageUrl}
                  onChange={(e) => setNewWork({...newWork, imageUrl: e.target.value})}
                />
                <small>Enter a valid image URL from the web</small>
              </div>
              <div className="form-actions">
                <button className="btn-submit-work" onClick={handleAddWork}>
                  Save Work
                </button>
              </div>
            </div>
          )}

          <div className="portfolio-grid">
            {portfolio.length > 0 ? (
              portfolio.map((work) => (
                <div key={work.id} className="portfolio-item">
                  <div className="portfolio-image">
                    <img src={work.imageUrl} alt={work.title} onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'} />
                  </div>
                  <div className="portfolio-content">
                    <h3>{work.title}</h3>
                    <p>{work.description}</p>
                    <button 
                      className="btn-delete-work"
                      onClick={() => handleDeleteWork(work.id)}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-portfolio">
                <div className="no-portfolio-icon">🖼️</div>
                <h3>No work in portfolio yet</h3>
                <p>Showcase your best work to attract more clients!</p>
              </div>
            )}
          </div>
        </div>

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
                        ${booking.total_price?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    
                    <div className="booking-card-body">
                      <div className="booking-info-row">
                        <span className="label">📞 Phone:</span>
                        <span className="value">{booking.customer?.phone_number || 'N/A'}</span>
                      </div>
                      <div className="booking-info-row">
                        <span className="label">📝 Description:</span>
                        <span className="value">{booking.description || 'No description'}</span>
                      </div>
                      <div className="booking-info-row">
                        <span className="label">📅 Start Date:</span>
                        <span className="value">{formatDate(booking.start_date)}</span>
                      </div>
                      <div className="booking-info-row">
                        <span className="label">✅ Status:</span>
                        <span className="status-badge status-accepted">{booking.status}</span>
                      </div>
                    </div>

                    {booking.status === 'Accepted' && (
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

        {/* Legacy Bookings Section */}
        <div className="bookings-section legacy-bookings">
          <div className="section-header">
            <h2>📋 My Bookings (Legacy)</h2>
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                All ({bookings.length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'pending' ? 'active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Pending ({bookings.filter(b => b.status === 'pending').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'confirmed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('confirmed')}
              >
                Confirmed ({bookings.filter(b => b.status === 'confirmed').length})
              </button>
              <button 
                className={`filter-btn ${filterStatus === 'completed' ? 'active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Completed ({bookings.filter(b => b.status === 'completed').length})
              </button>
            </div>
          </div>

          <div className="bookings-list">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => {
                const { craft } = getReservationWithCraft(booking);
                return (
                  <div key={booking.id} className="craftsman-booking-card">
                    <div className="booking-header">
                      <div className="booking-info">
                        <h3>{booking.reservationType === 'maintenance' ? '🔧 Maintenance Service' : craft?.name || 'Craft Reservation'}</h3>
                        <span className={`status-badge status-${booking.status}`}>
                          {booking.status}
                        </span>
                      </div>
                      <div className="booking-date">
                        {booking.reservationType === 'maintenance' 
                          ? `${booking.startDate} at ${booking.appointmentTime}`
                          : `${booking.startDate} - ${booking.endDate}`
                        }
                      </div>
                    </div>

                    <div className="booking-details">
                      <p><strong>Customer:</strong> {booking.userName}</p>
                      <p><strong>Email:</strong> {booking.userEmail}</p>
                      {booking.reservationType === 'maintenance' && (
                        <>
                          <p><strong>Address:</strong> {booking.serviceAddress}</p>
                          <p><strong>Description:</strong> {booking.serviceDescription}</p>
                        </>
                      )}
                      <p><strong>Price:</strong> ${booking.totalPrice}</p>
                      <p><strong>Booked on:</strong> {booking.createdAt}</p>
                    </div>

                    {booking.status === 'pending' && (
                      <div className="booking-actions">
                        <button 
                          className="btn-accept"
                          onClick={() => handleAcceptBooking(booking.id)}
                        >
                          ✓ Accept
                        </button>
                        <button 
                          className="btn-reject"
                          onClick={() => handleRejectBooking(booking.id)}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-bookings">
                <div className="no-bookings-icon">📭</div>
                <h3>No bookings found</h3>
                <p>
                  {filterStatus === 'all' 
                    ? "You don't have any bookings yet." 
                    : `You don't have any ${filterStatus} bookings.`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanDashboard;
