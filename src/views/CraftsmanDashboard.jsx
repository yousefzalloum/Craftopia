import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CraftsmanController } from '../controllers/CraftsmanController';
import { ReservationController } from '../controllers/ReservationController';
import { CraftController } from '../controllers/CraftController';
import ReservationCard from '../components/ReservationCard';
import '../styles/CraftsmanDashboard.css';

const CraftsmanDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [craftsman, setCraftsman] = useState(null);
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
  
  // All possible time slots
  const allTimeSlots = [
    '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  const [selectedTimes, setSelectedTimes] = useState([]);

  useEffect(() => {
    // Check if user is logged in as craftsman
    const craftsmanSession = localStorage.getItem('craftopia_craftsman');
    
    if (!craftsmanSession) {
      alert('Please login as a craftsman to access this page');
      navigate('/login');
      return;
    }
    
    const user = JSON.parse(craftsmanSession);
    setCurrentUser(user);
    
    // Load craftsman data using the logged-in user's email
    const craftsmanData = CraftsmanController.getCraftsmanByEmail(user.email);
    
    if (!craftsmanData) {
      alert('Craftsman profile not found');
      navigate('/login');
      return;
    }
    
    setCraftsman(craftsmanData);
    setSelectedTimes(craftsmanData.availableTimes || []);
    setPortfolio(craftsmanData.portfolio || []);

    // Load bookings
    const allReservations = ReservationController.getReservations();
    const craftsmanBookings = CraftsmanController.getBookings(craftsmanData.id, allReservations);
    setBookings(craftsmanBookings);
  }, [navigate]);

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
            {craftsman.availableTimes && craftsman.availableTimes.length > 0 ? (
              craftsman.availableTimes.map(time => (
                <span key={time} className="time-badge">{time}</span>
              ))
            ) : (
              <p className="no-times">No available times set</p>
            )}
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
              <button className="btn-submit-work" onClick={handleAddWork}>
                Save Work
              </button>
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
            <h2>📋 My Bookings</h2>
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
