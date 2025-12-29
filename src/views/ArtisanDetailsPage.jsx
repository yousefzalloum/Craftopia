import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCraftsmanProfile } from '../services/craftsmanService';
import Loading from '../components/Loading';
import '../styles/CraftsmanProfile.css';

const ArtisanDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [artisan, setArtisan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtisanDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📋 Fetching artisan details for ID:', id);
        
        const data = await getCraftsmanProfile(id);
        console.log('✅ Artisan details fetched:', data);
        
        setArtisan(data);
      } catch (err) {
        console.error('❌ Failed to fetch artisan details:', err);
        // More detailed error message
        const errorMessage = err.message || 'Failed to load artisan details';
        console.log('📋 Error details - Status:', err.status, 'Message:', errorMessage);
        
        // Provide helpful error messages based on status
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
      fetchArtisanDetails();
    }
  }, [id]);

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

  if (!artisan) {
    return (
      <div className="craftsman-profile-page">
        <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>
          <h2>Artisan not found</h2>
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="craftsman-profile-page">
      <div className="container">
        {/* Header Section */}
        <div className="profile-header">
          <button onClick={() => navigate('/crafts')} className="btn-back">
            ← Back to Search
          </button>
          
          <div className="profile-hero">
            <div className="profile-image-container">
              <img 
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(artisan.name)}&background=3498db&color=fff&size=200`}
                alt={artisan.name}
                className="profile-image"
              />
              <span className="availability-badge">Active</span>
            </div>

            <div className="profile-info">
              <h1>{artisan.name}</h1>
              <p className="profession">{artisan.craftType}</p>
              <p className="location">📍 {artisan.location}</p>
              
              <div className="profile-stats">
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <div>
                    <strong>{artisan.averageRating.toFixed(1)}</strong>
                    <small>Rating</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📷</span>
                  <div>
                    <strong>{artisan.portfolioImages?.length || 0}</strong>
                    <small>Portfolio</small>
                  </div>
                </div>
                <div className="stat">
                  <span className="stat-icon">📅</span>
                  <div>
                    <strong>{formatDate(artisan.createdAt)}</strong>
                    <small>Member Since</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="profile-section">
          <h2>📖 About</h2>
          <p className="bio">
            {artisan.description || 'No description provided yet.'}
          </p>
        </div>

        {/* Contact Section */}
        <div className="profile-section">
          <h2>📞 Contact Information</h2>
          <div className="contact-info">
            <div className="contact-item">
              <strong>📧 Email:</strong>
              <span>{artisan.email}</span>
            </div>
            <div className="contact-item">
              <strong>📱 Phone:</strong>
              <span>{artisan.phone_number || 'Not provided'}</span>
            </div>
            <div className="contact-item">
              <strong>📍 Location:</strong>
              <span>{artisan.location}</span>
            </div>
            <div className="contact-item">
              <strong>🔨 Craft Type:</strong>
              <span>{artisan.craftType}</span>
            </div>
          </div>
        </div>

        {/* Portfolio Section */}
        <div className="profile-section">
          <h2>🎨 Portfolio</h2>
          {artisan.portfolioImages && artisan.portfolioImages.length > 0 ? (
            <div className="portfolio-grid">
              {artisan.portfolioImages.map((imageUrl, index) => (
                <div key={index} className="portfolio-item">
                  <div className="portfolio-image">
                    <img 
                      src={imageUrl} 
                      alt={`Portfolio ${index + 1}`}
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found'}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🖼️</div>
              <h3>No portfolio items yet</h3>
              <p>This artisan hasn't added any work samples yet.</p>
            </div>
          )}
        </div>

        {/* Profile Details */}
        <div className="profile-section">
          <h2>ℹ️ Profile Details</h2>
          <div className="profile-details-grid">
            <div className="detail-card">
              <strong>Profile ID</strong>
              <span className="detail-value">{artisan._id}</span>
            </div>
            <div className="detail-card">
              <strong>Created At</strong>
              <span className="detail-value">{formatDate(artisan.createdAt)}</span>
            </div>
            <div className="detail-card">
              <strong>Last Updated</strong>
              <span className="detail-value">{formatDate(artisan.updatedAt)}</span>
            </div>
            <div className="detail-card">
              <strong>Average Rating</strong>
              <span className="detail-value">⭐ {artisan.averageRating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArtisanDetailsPage;
