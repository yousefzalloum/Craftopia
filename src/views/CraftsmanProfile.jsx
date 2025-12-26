import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CraftsmanController } from '../controllers/CraftsmanController';
import { ReservationController } from '../controllers/ReservationController';
import { CraftController } from '../controllers/CraftController';
import '../styles/CraftsmanProfile.css';

const CraftsmanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [craftsman, setCraftsman] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('about'); // 'about', 'portfolio', 'receipts', 'reviews'

  useEffect(() => {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('craftopia_current_user') || 'null');
    setCurrentUser(user);

    // Load craftsman data
    const craftsmanData = CraftsmanController.getCraftsman(id);
    if (craftsmanData) {
      setCraftsman(craftsmanData);
      
      // Load bookings/receipts for this craftsman
      const allReservations = ReservationController.getReservations();
      const craftsmanBookings = CraftsmanController.getBookings(parseInt(id), allReservations);
      setBookings(craftsmanBookings);
    }
    setLoading(false);
  }, [id]);

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!craftsman) {
    return (
      <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
        <h2>Craftsman not found</h2>
        <button onClick={() => navigate(-1)} className="btn-back">Go Back</button>
      </div>
    );
  }

  // Calculate statistics
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalEarnings = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
  const averageRating = craftsman.rating;

  const getReservationWithCraft = (reservation) => {
    const craft = CraftController.getCraft(reservation.craftId);
    return { reservation, craft };
  };

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <button onClick={() => navigate(-1)} className="btn-back">← Back</button>
          
          <div className="profile-hero">
            <div className="profile-image-container">
              <img 
                src={craftsman.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(craftsman.name)}&background=3498db&color=fff&size=200`} 
                alt={craftsman.name}
                className="profile-image"
              />
              {craftsman.availability && (
                <span className="availability-badge">Available</span>
              )}
            </div>

            <div className="profile-info">
              <h1>{craftsman.name}</h1>
              <p className="profession">{craftsman.profession}</p>
              <p className="location">📍 {craftsman.city || 'City not specified'}</p>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <strong>{craftsman.rating}</strong>
                    <small>Rating</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">💬</span>
                  <div>
                    <strong>{craftsman.reviews}</strong>
                    <small>Reviews</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">⏱️</span>
                  <div>
                    <strong>{craftsman.experienceYears}+</strong>
                    <small>Years Exp.</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">💰</span>
                  <div>
                    <strong>${craftsman.price || craftsman.rate}</strong>
                    <small>Per Hour</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📋</span>
                  <div>
                    <strong>{bookings.length}</strong>
                    <small>Total Jobs</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">💵</span>
                  <div>
                    <strong>${totalEarnings}</strong>
                    <small>Total Earned</small>
                  </div>
                </div>
              </div>

              <button 
                className="btn-book-now"
                onClick={() => navigate('/book-maintenance')}
              >
                📅 Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            📖 About
          </button>
          <button 
            className={`tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            🎨 Portfolio ({craftsman.portfolio?.length || 0})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'receipts' ? 'active' : ''}`}
            onClick={() => setActiveTab('receipts')}
          >
            🧾 Receipts ({bookings.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            ⭐ Reviews ({craftsman.reviews})
          </button>
        </div>

        {/* About Tab */}
        {activeTab === 'about' && (
          <>
            {/* About Section */}
            <div className="profile-section">
              <h2>About Me</h2>
              <p className="bio">{craftsman.bio || 'No bio available'}</p>
            </div>

            {/* Available Times Section */}
            {craftsman.availableTimes && craftsman.availableTimes.length > 0 && (
              <div className="profile-section">
                <h2>⏰ Available Times</h2>
                <div className="available-times">
                  {craftsman.availableTimes.map((time, index) => (
                    <span key={index} className="time-badge">{time}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Contact Section */}
            <div className="profile-section">
              <h2>📞 Contact Information</h2>
              <div className="contact-info">
                <p>
                  <strong>Phone:</strong> {craftsman.phone || 'Not provided'}
                </p>
                <p>
                  <strong>Email:</strong> {craftsman.email}
                </p>
                {craftsman.city && (
                  <p>
                    <strong>City:</strong> {craftsman.city}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className="profile-section">
            <h2>🎨 Portfolio</h2>
            {craftsman.portfolio && craftsman.portfolio.length > 0 ? (
              <div className="portfolio-grid">
                {craftsman.portfolio.map((work) => (
                  <div key={work.id} className="portfolio-item">
                    <div className="portfolio-image">
                      <img 
                        src={work.imageUrl} 
                        alt={work.title}
                        onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'}
                      />
                    </div>
                    <div className="portfolio-content">
                      <h3>{work.title}</h3>
                      <p>{work.description}</p>
                      <small className="work-date">📅 {work.createdAt}</small>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🖼️</div>
                <h3>No portfolio items yet</h3>
                <p>This craftsman hasn't added any work samples yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Receipts Tab */}
        {activeTab === 'receipts' && (
          <div className="profile-section">
            <h2>🧾 Service Receipts</h2>
            {bookings.length > 0 ? (
              <div className="receipts-list">
                {bookings.map((booking) => {
                  const { craft } = getReservationWithCraft(booking);
                  return (
                    <div key={booking.id} className="receipt-card">
                      <div className="receipt-header">
                        <div className="receipt-info">
                          <h3>{booking.reservationType === 'maintenance' ? '🔧 Maintenance Service' : craft?.name || 'Craft Reservation'}</h3>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </div>
                        <div className="receipt-price">
                          <strong>${booking.totalPrice}</strong>
                        </div>
                      </div>

                      <div className="receipt-details">
                        <div className="detail-row">
                          <span>👤 Customer:</span>
                          <strong>{booking.userName}</strong>
                        </div>
                        <div className="detail-row">
                          <span>📅 Date:</span>
                          <strong>
                            {booking.reservationType === 'maintenance' 
                              ? `${booking.startDate} at ${booking.appointmentTime}`
                              : `${booking.startDate} - ${booking.endDate}`
                            }
                          </strong>
                        </div>
                        <div className="detail-row">
                          <span>📧 Email:</span>
                          <strong>{booking.userEmail}</strong>
                        </div>
                        {booking.reservationType === 'maintenance' && (
                          <>
                            <div className="detail-row">
                              <span>📍 Address:</span>
                              <strong>{booking.serviceAddress}</strong>
                            </div>
                            <div className="detail-row">
                              <span>📝 Description:</span>
                              <strong>{booking.serviceDescription}</strong>
                            </div>
                          </>
                        )}
                        <div className="detail-row">
                          <span>🕒 Booked on:</span>
                          <strong>{booking.createdAt}</strong>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <h3>No receipts yet</h3>
                <p>Service receipts will appear here once bookings are made.</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="profile-section">
            <h2>⭐ Customer Reviews</h2>
            <div className="reviews-summary">
              <div className="rating-overview">
                <div className="rating-score">
                  <span className="rating-number">{craftsman.rating}</span>
                  <div className="rating-stars">
                    {'⭐'.repeat(Math.round(craftsman.rating))}
                  </div>
                  <p>{craftsman.reviews} reviews</p>
                </div>
              </div>
            </div>

            {/* Sample reviews (in a real app, these would come from a database) */}
            <div className="reviews-list">
              {craftsman.reviews > 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">💬</div>
                  <h3>Reviews Coming Soon</h3>
                  <p>Customer reviews will be displayed here. Currently showing aggregate rating of {craftsman.rating} stars from {craftsman.reviews} reviews.</p>
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">⭐</div>
                  <h3>No reviews yet</h3>
                  <p>This craftsman hasn't received any reviews yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CraftsmanProfile;
