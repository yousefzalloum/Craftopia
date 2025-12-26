import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CraftController } from '../controllers/CraftController';
import { ReservationController } from '../controllers/ReservationController';
import { UserController } from '../controllers/UserController';
import '../styles/CraftDetails.css';

const CraftDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const craft = CraftController.getCraft(id);
  const currentUser = UserController.getCurrentUser();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationMessage, setReservationMessage] = useState('');
  const [reservationType, setReservationType] = useState('craft');
  const [serviceAddress, setServiceAddress] = useState('');
  const [serviceDescription, setServiceDescription] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  if (!craft) {
    return (
      <div className="container">
        <div className="error-message">
          <h2>Craft Not Found</h2>
          <p>The craft you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/crafts')} className="btn-primary">
            Back to Crafts
          </button>
        </div>
      </div>
    );
  }

  const handleReservation = (e) => {
    e.preventDefault();
    setReservationMessage('');

    // For maintenance, use same date for start and end
    const finalEndDate = reservationType === 'maintenance' ? startDate : endDate;

    // Validate dates
    const dateValidation = ReservationController.validateDates(startDate, finalEndDate);
    if (!dateValidation.valid) {
      setReservationMessage(dateValidation.message);
      return;
    }

    // Create reservation
    const result = ReservationController.createReservation(
      craft.id,
      currentUser.id,
      currentUser.name,
      currentUser.email,
      startDate,
      finalEndDate,
      reservationType,
      reservationType === 'maintenance' ? serviceAddress : null,
      reservationType === 'maintenance' ? serviceDescription : null,
      reservationType === 'maintenance' ? appointmentTime : null
    );

    if (result.success) {
      setReservationMessage(result.message + '! Redirecting to your reservations...');
      setTimeout(() => {
        navigate('/reservations');
      }, 2000);
    } else {
      setReservationMessage(`Error: ${result.message}`);
    }
  };

  const duration = startDate && endDate 
    ? ReservationController.calculateDuration(startDate, endDate) 
    : 0;

  return (
    <div className="craft-details-page">
      <div className="container">
        <button 
          className="back-button"
          onClick={() => navigate('/crafts')}
        >
          ← Back to Crafts
        </button>

        <div className="craft-details-container">
          <div className="craft-image-section">
            <img 
              src={craft.imageUrl} 
              alt={craft.name} 
              className="craft-detail-image"
            />
            {!craft.availability && (
              <div className="unavailable-overlay">
                <span>Currently Unavailable</span>
              </div>
            )}
          </div>

          <div className="craft-info-section">
            <div className="craft-category-tag">{craft.category}</div>
            <h1 className="craft-detail-title">{craft.name}</h1>
            
            <div className="craft-artisan-info">
              <span className="artisan-icon">👨‍🎨</span>
              <span>Crafted by <strong>{craft.artisan}</strong></span>
            </div>

            <div className="craft-rating-detail">
              <span className="rating-stars">
                {'⭐'.repeat(Math.round(craft.rating))}
              </span>
              <span className="rating-value">{craft.rating}</span>
              <span className="rating-reviews">({craft.reviews} reviews)</span>
            </div>

            <p className="craft-detail-description">{craft.description}</p>

            <div className="craft-price-section">
              <span className="price-label">Reservation Price:</span>
              <span className="price-value">${craft.price}</span>
            </div>

            <div className="craft-availability">
              <span className={`availability-status ${craft.availability ? 'available' : 'unavailable'}`}>
                {craft.availability ? '✓ Available' : '✗ Unavailable'}
              </span>
            </div>

            {craft.availability && !showReservationForm && (
              <button 
                className="btn-reserve"
                onClick={() => setShowReservationForm(true)}
              >
                Reserve This Craft
              </button>
            )}

            {showReservationForm && craft.availability && (
              <form className="reservation-form" onSubmit={handleReservation}>
                <h3>Make a Reservation</h3>

                <div className="form-group">
                  <label htmlFor="reservationType">Reservation Type:</label>
                  <select
                    id="reservationType"
                    value={reservationType}
                    onChange={(e) => setReservationType(e.target.value)}
                    className="form-select"
                  >
                    <option value="craft">🎨 Craft Reservation</option>
                    <option value="maintenance">🔧 Home Maintenance Visit</option>
                  </select>
                </div>

                {reservationType === 'maintenance' && (
                  <>
                    <div className="form-group">
                      <label htmlFor="serviceAddress">Service Address: *</label>
                      <textarea
                        id="serviceAddress"
                        value={serviceAddress}
                        onChange={(e) => setServiceAddress(e.target.value)}
                        placeholder="Enter your full home address..."
                        rows="3"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="serviceDescription">Service Description: *</label>
                      <textarea
                        id="serviceDescription"
                        value={serviceDescription}
                        onChange={(e) => setServiceDescription(e.target.value)}
                        placeholder="Describe the maintenance work needed..."
                        rows="4"
                        required
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label htmlFor="startDate">
                    {reservationType === 'maintenance' ? 'Appointment Date:' : 'Start Date:'}
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>

                {reservationType === 'maintenance' && (
                  <div className="form-group">
                    <label htmlFor="appointmentTime">Appointment Time: *</label>
                    <select
                      id="appointmentTime"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                      className="form-select"
                      required
                    >
                      <option value="">Select a time...</option>
                      <option value="8:00 AM">8:00 AM</option>
                      <option value="9:00 AM">9:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="1:00 PM">1:00 PM</option>
                      <option value="2:00 PM">2:00 PM</option>
                      <option value="3:00 PM">3:00 PM</option>
                      <option value="4:00 PM">4:00 PM</option>
                      <option value="5:00 PM">5:00 PM</option>
                    </select>
                  </div>
                )}

                {reservationType === 'craft' && (
                  <div className="form-group">
                    <label htmlFor="endDate">End Date:</label>
                    <input
                      type="date"
                      id="endDate"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                )}

                {duration > 0 && (
                  <div className="reservation-summary">
                    <p><strong>Duration:</strong> {duration} {duration === 1 ? 'day' : 'days'}</p>
                    <p><strong>Total Price:</strong> ${craft.price}</p>
                  </div>
                )}

                {reservationMessage && (
                  <div className={`reservation-message ${reservationMessage.includes('success') ? 'success' : 'error'}`}>
                    {reservationMessage}
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    Confirm Reservation
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setShowReservationForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftDetails;
