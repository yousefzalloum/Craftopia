import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserController } from '../controllers/UserController';
import { ReservationController } from '../controllers/ReservationController';
import { CraftsmanController } from '../controllers/CraftsmanController';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [craftsman, setCraftsman] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [bioText, setBioText] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [reservationStats, setReservationStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0
  });

  useEffect(() => {
    // Check for craftsman login first, then regular user login
    const craftsmanSession = localStorage.getItem('craftopia_craftsman');
    const regularUser = UserController.getCurrentUser();
    
    let currentUser = null;
    let isCraftsman = false;

    if (craftsmanSession) {
      // User logged in as craftsman
      const craftsmanData = JSON.parse(craftsmanSession);
      const craftsmanProfile = CraftsmanController.getCraftsmanByEmail(craftsmanData.email);
      
      if (craftsmanProfile) {
        // Create user object from craftsman data
        currentUser = {
          id: craftsmanProfile.id,
          name: craftsmanProfile.name,
          email: craftsmanProfile.email,
          phone: craftsmanProfile.phone,
          address: craftsmanProfile.city || 'Not specified',
          profileImage: 'https://via.placeholder.com/150?text=' + craftsmanProfile.name.charAt(0),
          joinedDate: new Date().toISOString()
        };
        isCraftsman = true;
        setCraftsman(craftsmanProfile);
        setBioText(craftsmanProfile.bio || '');
        setProfileImageUrl(currentUser.profileImage);
      }
    } else if (regularUser) {
      // Regular user login
      currentUser = regularUser;
      setProfileImageUrl(currentUser.profileImage);
      
      // Check if this user is also a craftsman
      const craftsmanProfile = CraftsmanController.getCraftsmanByEmail(currentUser.email);
      if (craftsmanProfile) {
        setCraftsman(craftsmanProfile);
        setBioText(craftsmanProfile.bio || '');
      }
    }
    
    if (!currentUser) {
      alert('Please login to view your profile');
      navigate('/login');
      return;
    }

    setUser(UserController.formatUserData(currentUser));
    
    const userReservations = ReservationController.getUserReservations(currentUser.id);
    setReservationStats({
      total: userReservations.length,
      pending: userReservations.filter(r => r.status === 'pending').length,
      confirmed: userReservations.filter(r => r.status === 'confirmed').length,
      completed: userReservations.filter(r => r.status === 'completed').length
    });
  }, [navigate]);

  const handleSaveBio = () => {
    if (craftsman) {
      CraftsmanController.updateCraftsmanBio(craftsman.id, bioText);
      setCraftsman({ ...craftsman, bio: bioText });
      setIsEditingBio(false);
      alert('Bio updated successfully!');
    }
  };

  const handleSaveProfileImage = () => {
    if (tempImageUrl.trim()) {
      // Check if logged in as craftsman
      const craftsmanSession = localStorage.getItem('craftopia_craftsman');
      
      if (craftsmanSession) {
        // Update craftsman's profile image
        // For now, just update the state (craftsmen don't have profile images in the model)
        setProfileImageUrl(tempImageUrl);
        setUser({ ...user, profileImage: tempImageUrl });
      } else {
        // Update regular user's profile image
        UserController.updateProfileImage(user.id, tempImageUrl);
        setProfileImageUrl(tempImageUrl);
        setUser({ ...user, profileImage: tempImageUrl });
      }
      
      setIsEditingProfile(false);
      alert('Profile picture updated successfully!');
    } else {
      alert('Please enter a valid image URL');
    }
  };

  const handleCancelImageEdit = () => {
    setTempImageUrl('');
    setIsEditingProfile(false);
  };

  if (!user) {
    return null;
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <div className="profile-header-content">
            <div className="profile-avatar-container">
              <img 
                src={profileImageUrl} 
                alt={user.name} 
                className="profile-avatar"
              />
              <button 
                className="btn-edit-avatar"
                onClick={() => {
                  setTempImageUrl(profileImageUrl);
                  setIsEditingProfile(true);
                }}
                title="Change profile picture"
              >
                📷
              </button>
            </div>
            <div className="profile-header-info">
              <h1 className="profile-name">{user.name}</h1>
              {craftsman && (
                <p className="profile-profession">{craftsman.profession} • {craftsman.experienceYears} years experience</p>
              )}
              <p className="profile-member-since">Member since {user.joinedDateFormatted}</p>
            </div>
          </div>
          {craftsman && (
            <div className="profile-badge">
              <span className="badge-craftsman">✨ Craftsman</span>
              <span className="badge-rating">⭐ {craftsman.rating}</span>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          {craftsman && (
            <button 
              className={`tab-btn ${activeTab === 'professional' ? 'active' : ''}`}
              onClick={() => setActiveTab('professional')}
            >
              💼 Professional Info
            </button>
          )}
          <button 
            className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Statistics
          </button>
        </div>

        {/* Tab Content */}
        <div className="profile-content">
          {/* Profile Image Edit Modal */}
          {isEditingProfile && (
            <div className="modal-overlay" onClick={handleCancelImageEdit}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h3>Change Profile Picture</h3>
                  <button className="btn-close" onClick={handleCancelImageEdit}>✕</button>
                </div>
                <div className="modal-body">
                  <div className="image-preview">
                    <img 
                      src={tempImageUrl || profileImageUrl} 
                      alt="Preview" 
                      className="preview-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/150?text=Invalid+URL';
                      }}
                    />
                  </div>
                  <div className="input-group">
                    <label htmlFor="imageUrl">Image URL:</label>
                    <input
                      id="imageUrl"
                      type="text"
                      className="input-text"
                      value={tempImageUrl}
                      onChange={(e) => setTempImageUrl(e.target.value)}
                      placeholder="Enter image URL (e.g., https://example.com/image.jpg)"
                    />
                  </div>
                  <p className="help-text">💡 Tip: Use image hosting services like Imgur, or direct image URLs</p>
                </div>
                <div className="modal-footer">
                  <button className="btn-primary" onClick={handleSaveProfileImage}>
                    💾 Save Picture
                  </button>
                  <button className="btn-outline" onClick={handleCancelImageEdit}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="tab-content">
              <div className="profile-section compact">
                <h3 className="section-title">Personal Information</h3>
                <div className="info-grid compact">
                  <div className="info-item compact">
                    <span className="info-icon">📧</span>
                    <div className="info-content">
                      <span className="info-label">Email</span>
                      <span className="info-value">{user.email}</span>
                    </div>
                  </div>
                  <div className="info-item compact">
                    <span className="info-icon">📱</span>
                    <div className="info-content">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{user.phone}</span>
                    </div>
                  </div>
                  <div className="info-item compact">
                    <span className="info-icon">📍</span>
                    <div className="info-content">
                      <span className="info-label">Address</span>
                      <span className="info-value">{user.address}</span>
                    </div>
                  </div>
                  <div className="info-item compact">
                    <span className="info-icon">🆔</span>
                    <div className="info-content">
                      <span className="info-label">User ID</span>
                      <span className="info-value">#{user.id}</span>
                    </div>
                  </div>
                </div>
              </div>

              {craftsman && (
                <div className="profile-section">
                  <div className="section-header">
                    <h3 className="section-title">About Me</h3>
                    {!isEditingBio && (
                      <button 
                        className="btn-edit"
                        onClick={() => setIsEditingBio(true)}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                  
                  {isEditingBio ? (
                    <div className="bio-editor">
                      <textarea
                        className="bio-textarea"
                        value={bioText}
                        onChange={(e) => setBioText(e.target.value)}
                        placeholder="Tell your clients about yourself, your experience, and specialties..."
                        rows="6"
                      />
                      <div className="bio-actions">
                        <button className="btn-primary" onClick={handleSaveBio}>
                          💾 Save Bio
                        </button>
                        <button 
                          className="btn-outline" 
                          onClick={() => {
                            setBioText(craftsman.bio || '');
                            setIsEditingBio(false);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="bio-text">
                      {craftsman.bio || 'No bio added yet. Click Edit to add your professional description.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Professional Info Tab (Craftsmen Only) */}
          {activeTab === 'professional' && craftsman && (
            <div className="tab-content">
              <div className="profile-section">
                <h3 className="section-title">Professional Details</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="info-label">🛠️ Profession</span>
                    <span className="info-value">{craftsman.profession}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📅 Experience</span>
                    <span className="info-value">{craftsman.experienceYears} years</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">⭐ Rating</span>
                    <span className="info-value">{craftsman.rating} / 5.0</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">💬 Reviews</span>
                    <span className="info-value">{craftsman.reviews} reviews</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">💰 Hourly Rate</span>
                    <span className="info-value">${craftsman.price}/hour</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">🏙️ City</span>
                    <span className="info-value">{craftsman.city}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">📍 Availability</span>
                    <span className={`availability-badge ${craftsman.availability ? 'available' : 'unavailable'}`}>
                      {craftsman.availability ? '✅ Available' : '❌ Unavailable'}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">🕐 Time Slots</span>
                    <span className="info-value">{craftsman.availableTimes.length} slots</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3 className="section-title">Portfolio</h3>
                {craftsman.portfolio && craftsman.portfolio.length > 0 ? (
                  <div className="portfolio-grid">
                    {craftsman.portfolio.map((item) => (
                      <div key={item.id} className="portfolio-item">
                        <img src={item.imageUrl} alt={item.title} className="portfolio-image" />
                        <h4 className="portfolio-title">{item.title}</h4>
                        <p className="portfolio-description">{item.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-state">No portfolio items yet.</p>
                )}
              </div>
            </div>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <div className="tab-content">
              <div className="profile-section">
                <h3 className="section-title">Reservation Statistics</h3>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{reservationStats.total}</div>
                    <div className="stat-label">Total Reservations</div>
                  </div>
                  <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value">{reservationStats.pending}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                  <div className="stat-card confirmed">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{reservationStats.confirmed}</div>
                    <div className="stat-label">Confirmed</div>
                  </div>
                  <div className="stat-card completed">
                    <div className="stat-icon">🎉</div>
                    <div className="stat-value">{reservationStats.completed}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
