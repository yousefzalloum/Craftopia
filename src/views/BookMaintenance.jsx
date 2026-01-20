import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ReservationController } from '../controllers/ReservationController';
import { getAllArtisans, getArtisanAvailability } from '../services/craftsmanService';
import { isDateAvailable, getAvailableDaysText, validateDateSelection } from '../utils/dateUtils';
import '../styles/BookMaintenance.css';

const BookMaintenance = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, userId } = useAuth();
  const [artisans, setArtisans] = useState([]);
  const [artisansLoading, setArtisansLoading] = useState(true);
  const [availability, setAvailability] = useState([]);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    if (!isLoggedIn) {
      alert('You must login first to book a maintenance service');
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  // Fetch artisans from API
  useEffect(() => {
    const fetchArtisans = async () => {
      try {
        setArtisansLoading(true);
        const data = await getAllArtisans();
        console.log('📋 Fetched artisans:', data);
        setArtisans(data || []);
      } catch (error) {
        console.error('❌ Failed to fetch artisans:', error);
        setArtisans([]);
      } finally {
        setArtisansLoading(false);
      }
    };
    
    if (isLoggedIn) {
      fetchArtisans();
    }
  }, [isLoggedIn]);

  const [formData, setFormData] = useState({
    category: '',
    craftsmanId: '',
    serviceDescription: '',
    serviceAddress: '',
    appointmentDate: '',
    appointmentTime: '',
    customTitle: ''
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch availability when craftsman is selected
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!formData.craftsmanId) {
        setAvailability([]);
        return;
      }
      
      try {
        setAvailabilityLoading(true);
        console.log('📅 Fetching availability for artisan:', formData.craftsmanId);
        const data = await getArtisanAvailability(formData.craftsmanId);
        console.log('✅ Availability fetched:', data);
        
        if (Array.isArray(data)) {
          setAvailability(data);
          // Reset appointment date when availability changes
          setFormData(prev => ({ ...prev, appointmentDate: '' }));
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

    fetchAvailability();
  }, [formData.craftsmanId]);

  // Get unique professions from artisans
  const professions = [...new Set(artisans.map(a => a.craftType).filter(Boolean))];

  // Filter artisans by selected profession
  const availableArtisans = formData.category 
    ? artisans.filter(a => a.craftType === formData.category)
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!isLoggedIn || !user) {
      setMessage('You must login first to book a service');
      setTimeout(() => navigate('/login'), 2000);
      return;
    }

    // Validate all fields
    if (!formData.craftsmanId || !formData.serviceDescription || !formData.serviceAddress || !formData.appointmentDate || !formData.appointmentTime) {
      setMessage('Please fill in all fields');
      return;
    }

    // Validate date availability
    const dateValidation = validateDateSelection(formData.appointmentDate, availability);
    if (!dateValidation.valid) {
      setMessage(dateValidation.message);
      return;
    }

    try {
      setLoading(true);
      
      // Create custom request using the new controller method
      const title = formData.customTitle || `${formData.category} Service Request`;
      
      const result = await ReservationController.createCustomRequest(
        formData.craftsmanId.toString(), // artisanId (convert to string for backend)
        title,
        `${formData.serviceDescription}\n\nAddress: ${formData.serviceAddress}\nPreferred time: ${formData.appointmentTime}`,
        formData.appointmentDate
      );

      if (result.success) {
        setMessage('✅ Custom request submitted successfully! Redirecting...');
        setTimeout(() => {
          navigate('/reservations');
        }, 2000);
      } else {
        setMessage(`❌ Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      setMessage(`❌ Error: ${error.message || 'Failed to submit request'}`);
    } finally {
      setLoading(false);
    }
  };

  // Don't render the page if user is not logged in
  if (!isLoggedIn) {
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
            
            {/* Request Title */}
            <div className="form-group">
              <label htmlFor="customTitle">
                📋 Request Title *
              </label>
              <input
                type="text"
                id="customTitle"
                name="customTitle"
                value={formData.customTitle}
                onChange={handleChange}
                placeholder="e.g., Fix my dining table"
                required
              />
              <small>Give your request a short, descriptive title</small>
            </div>
            
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

            {/* Select Artisan - Only shows after category is selected */}
            {formData.category && (
              <div className="form-group">
                <label htmlFor="craftsmanId">
                  👨‍🎨 Choose an Artisan *
                </label>
                
                {artisansLoading ? (
                  <p>Loading artisans...</p>
                ) : availableArtisans.length > 0 ? (
                  <div className="craftsmen-list">
                    {availableArtisans.map(artisan => (
                      <div key={artisan._id} className="craftsman-card-select">
                        <div className="craftsman-info">
                          <h4>{artisan.name}</h4>
                          <p className="craftsman-details">
                            ⭐ {artisan.averageRating ? artisan.averageRating.toFixed(1) : 'New'} • 
                            📍 {artisan.location}
                          </p>
                          <p className="craftsman-profession">{artisan.craftType}</p>
                        </div>
                        <div className="craftsman-actions">
                          <Link 
                            to={`/artisan/${artisan._id}`} 
                            className="btn-view-profile"
                            target="_blank"
                          >
                            👁️ View Profile
                          </Link>
                          <button
                            type="button"
                            className={`btn-select-craftsman ${formData.craftsmanId === artisan._id ? 'selected' : ''}`}
                            onClick={() => setFormData({...formData, craftsmanId: artisan._id})}
                          >
                            {formData.craftsmanId === artisan._id ? '✓ Selected' : 'Select'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-craftsmen">No artisans available in {formData.category} at the moment.</p>
                )}
                
                <small>{availableArtisans.length} artisans available in {formData.category}</small>
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
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    if (selectedDate && availability.length > 0) {
                      // Validate the selected date
                      const validation = validateDateSelection(selectedDate, availability);
                      if (!validation.valid) {
                        setMessage(`⚠️ ${validation.message}`);
                        return;
                      }
                    }
                    handleChange(e);
                    setMessage(''); // Clear any previous error
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={!formData.craftsmanId || availabilityLoading}
                  required
                />
                {formData.craftsmanId && availability.length > 0 && (
                  <small style={{ color: '#27ae60', marginTop: '0.25rem', display: 'block' }}>
                    Available days: {getAvailableDaysText(availability)}
                  </small>
                )}
                {availabilityLoading && (
                  <small style={{ color: '#3498db', marginTop: '0.25rem', display: 'block' }}>
                    Loading availability...
                  </small>
                )}
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
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? '⏳ Submitting...' : '📞 Submit Request'}
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
