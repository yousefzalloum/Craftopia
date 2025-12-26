import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CraftController } from '../controllers/CraftController';
import { CraftsmanController } from '../controllers/CraftsmanController';
import { ReservationController } from '../controllers/ReservationController';
import { getCurrentUser } from '../utils/auth';
import '../styles/BookMaintenance.css';

const BookMaintenance = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const crafts = CraftController.getCrafts();
  const craftsmen = CraftsmanController.getCraftsmen();

  // Check authentication on component mount
  useEffect(() => {
    if (!currentUser) {
      alert('Please login or sign up to book a maintenance service');
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const [formData, setFormData] = useState({
    category: '',
    craftsmanId: '',
    serviceDescription: '',
    serviceAddress: '',
    appointmentDate: '',
    appointmentTime: ''
  });

  const [message, setMessage] = useState('');

  // Get unique professions from craftsmen
  const professions = [...new Set(craftsmen.map(c => c.profession))];

  // Filter craftsmen by selected profession
  const availableCraftsmen = formData.category 
    ? craftsmen.filter(c => c.profession === formData.category && c.availability)
    : [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // If category changes, reset craftsman selection
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value,
        craftsmanId: '' // Reset craftsman when category changes
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');

    if (!currentUser) {
      setMessage('Please login first to book a service');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Validate all fields
    if (!formData.craftsmanId || !formData.serviceDescription || !formData.serviceAddress || !formData.appointmentDate || !formData.appointmentTime) {
      setMessage('Please fill in all fields');
      return;
    }

    // Create maintenance appointment
    const result = ReservationController.createReservation(
      parseInt(formData.craftsmanId),
      currentUser.id,
      currentUser.name,
      currentUser.email,
      formData.appointmentDate,
      formData.appointmentDate,
      'maintenance',
      formData.serviceAddress,
      formData.serviceDescription,
      formData.appointmentTime
    );

    if (result.success) {
      setMessage('✅ Appointment booked successfully! Redirecting...');
      setTimeout(() => {
        navigate('/reservations');
      }, 2000);
    } else {
      setMessage(`❌ Error: ${result.message}`);
    }
  };

  // Don't render the page if user is not logged in
  if (!currentUser) {
    return null;
  }

  return (
    <div className="book-maintenance-page">
      <div className="container">
        <div className="page-header">
          <h1>🔧 Book Home Maintenance</h1>
          <p>Need something fixed? Book a craftsman to visit your home</p>
        </div>

        <div className="maintenance-form-container">
          <form className="maintenance-form" onSubmit={handleSubmit}>
            
            {/* Select Category/Profession */}
            <div className="form-group">
              <label htmlFor="category">
                🔨 Choose a Profession *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select profession...</option>
                {professions.map(profession => (
                  <option key={profession} value={profession}>
                    {profession}
                  </option>
                ))}
              </select>
              <small>Select the type of service you need</small>
            </div>

            {/* Select Craftsman - Only shows after category is selected */}
            {formData.category && (
              <div className="form-group">
                <label htmlFor="craftsmanId">
                  👨‍🎨 Choose a Craftsman *
                </label>
                
                {/* Display available craftsmen as cards with profile links */}
                <div className="craftsmen-list">
                  {availableCraftsmen.map(craftsman => (
                    <div key={craftsman.id} className="craftsman-card-select">
                      <div className="craftsman-info">
                        <h4>{craftsman.name}</h4>
                        <p className="craftsman-details">
                          ⭐ {craftsman.rating} ({craftsman.reviews} reviews) • 
                          💵 ${craftsman.price || craftsman.rate}/hr {craftsman.city && `• 📍 ${craftsman.city}`}
                        </p>
                        <p className="craftsman-profession">{craftsman.profession}</p>
                      </div>
                      <div className="craftsman-actions">
                        <Link 
                          to={`/craftsman/${craftsman.id}`} 
                          className="btn-view-profile"
                          target="_blank"
                        >
                          👁️ View Profile
                        </Link>
                        <button
                          type="button"
                          className={`btn-select-craftsman ${formData.craftsmanId === craftsman.id ? 'selected' : ''}`}
                          onClick={() => setFormData({...formData, craftsmanId: craftsman.id})}
                        >
                          {formData.craftsmanId === craftsman.id ? '✓ Selected' : 'Select'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                
                {availableCraftsmen.length === 0 && (
                  <p className="no-craftsmen">No craftsmen available in {formData.category} at the moment.</p>
                )}
                
                <small>{availableCraftsmen.length} craftsmen available in {formData.category}</small>
              </div>
            )}

            {/* Service Description */}
            <div className="form-group">
              <label htmlFor="serviceDescription">
                📝 What needs to be fixed? *
              </label>
              <textarea
                id="serviceDescription"
                name="serviceDescription"
                value={formData.serviceDescription}
                onChange={handleChange}
                placeholder="Example: Fix broken table leg and repair scratches..."
                rows="4"
                required
              />
              <small>Describe the problem in detail</small>
            </div>

            {/* Address */}
            <div className="form-group">
              <label htmlFor="serviceAddress">
                📍 Your Address *
              </label>
              <textarea
                id="serviceAddress"
                name="serviceAddress"
                value={formData.serviceAddress}
                onChange={handleChange}
                placeholder="123 Main Street, Apartment 4B, City, State, ZIP"
                rows="3"
                required
              />
            </div>

            {/* Date and Time Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="appointmentDate">
                  📅 Appointment Date *
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="appointmentTime">
                  🕒 Appointment Time *
                </label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select time...</option>
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
            </div>

            {/* Message */}
            {message && (
              <div className={`form-message ${message.includes('✅') ? 'success' : 'error'}`}>
                {message}
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="btn-submit">
              📞 Book Appointment
            </button>
          </form>

          {/* Info Box */}
          <div className="info-box">
            <h3>📋 How It Works</h3>
            <ol>
              <li><strong>Choose a profession</strong> - Carpenter, Plumber, Electrician, etc.</li>
              <li><strong>Select a craftsman</strong> - See ratings and prices</li>
              <li><strong>Describe the problem</strong> - Be specific</li>
              <li><strong>Provide your address</strong> - Where they'll visit</li>
              <li><strong>Pick date & time</strong> - Schedule your appointment</li>
              <li><strong>Craftsman visits your home!</strong> ✅</li>
            </ol>
            
            <div className="quick-tips">
              <h4>💡 Available Professions:</h4>
              <ul>
                <li><strong>🔨 Carpenter:</strong> Furniture, doors, cabinets, shelves</li>
                <li><strong>⚡ Electrician:</strong> Wiring, outlets, circuit breakers</li>
                <li><strong>🚰 Plumber:</strong> Pipes, fixtures, leaks, drains</li>
                <li><strong>🎨 Painter:</strong> Walls, ceilings, interior/exterior</li>
                <li><strong>🔧 Welder:</strong> Metal gates, railings, repairs</li>
                <li><strong>🌿 Landscaper:</strong> Gardens, lawns, outdoor spaces</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookMaintenance;
