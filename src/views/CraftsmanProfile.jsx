import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getCraftsmanProfile } from '../services/craftsmanService';
import Loading from '../components/Loading';
import '../styles/CraftsmanProfile.css';

const CraftsmanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [craftsman, setCraftsman] = useState(location.state?.artisan || null);
  const [loading, setLoading] = useState(!location.state?.artisan);
  const [error, setError] = useState(null);

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
              <p className="profession">{craftsman.craftType}</p>
              <p className="location">📍 {craftsman.location || 'City not specified'}</p>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <strong>{craftsman.averageRating || 'N/A'}</strong>
                    <small>Rating</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📧</span>
                  <div>
                    <strong>{craftsman.email}</strong>
                    <small>Email</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📱</span>
                  <div>
                    <strong>{craftsman.phone_number}</strong>
                    <small>Phone</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <div>
                    <strong>{new Date(craftsman.createdAt).getFullYear()}</strong>
                    <small>Member Since</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-section">
          <h2>About Me</h2>
          <p className="bio">{craftsman.description || 'No description available'}</p>
        </div>

        {/* Portfolio Section */}
        {craftsman.portfolioImages && craftsman.portfolioImages.length > 0 && (
          <div className="profile-section">
            <h2>🎨 Portfolio</h2>
            <div className="portfolio-grid">
              {craftsman.portfolioImages.map((image, index) => (
                <div key={index} className="portfolio-item">
                  <img src={image} alt={`Portfolio ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Section */}
        <div className="profile-section">
          <h2>📞 Contact Information</h2>
          <div className="contact-info">
            <p>
              <strong>Phone:</strong> {craftsman.phone_number || 'Not provided'}
            </p>
            <p>
              <strong>Email:</strong> {craftsman.email}
            </p>
            <p>
              <strong>Location:</strong> {craftsman.location}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CraftsmanProfile;
