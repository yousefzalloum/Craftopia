import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile, updateCustomerProfile, uploadCustomerProfilePicture } from '../services/customerService';
import Loading from '../components/Loading';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit profile states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: ''
  });

  useEffect(() => {
    // Check authentication
    if (!isLoggedIn) {
      console.log('❌ Not logged in');
      navigate('/login');
      return;
    }

    // Only allow customers (or if role is undefined during login transition)
    if (role && role !== 'customer') {
      console.log('❌ Not a customer, redirecting to dashboard');
      navigate('/craftsman-dashboard');
      return;
    }

    // Fetch customer profile from API
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('📋 Fetching customer profile...');
        
        const data = await getCustomerProfile();
        console.log('✅ Profile data received:', data);
        
        // Format data for display
        const userData = {
          id: data._id,
          name: data.name,
          email: data.email,
          phone: data.phone_number || 'Not specified',
          profilePicture: data.profilePicture,
          registerDate: data.register_date,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
        console.log('📸 Profile picture loaded:', data.profilePicture);
        setUser(userData);
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [isLoggedIn, role, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="profile-page">
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 20px 20px' }}>
          <h2>Error Loading Profile</h2>
          <p className="error-message" style={{ color: '#e74c3c', background: '#ffe5e5', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
            {error}
          </p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 20px 20px', textAlign: 'center' }}>
          <h2>Profile not found</h2>
          <button 
            onClick={() => navigate(-1)} 
            style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', background: '#3498db', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Open edit modal and pre-fill form with current data
  const handleOpenEditModal = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone_number: user.phone || ''
      });
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      setIsEditModalOpen(true);
      setEditError(null);
      setSuccessMessage(null);
    }
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setEditError(null);
    setSuccessMessage(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle profile picture file selection
  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setEditError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setEditError('Image size must be less than 5MB');
        return;
      }
      
      console.log('📸 Profile picture selected:', file.name);
      setProfilePictureFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setEditError(null);
    }
  };

  // Handle form submission
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    
    try {
      setEditLoading(true);
      setEditError(null);
      setSuccessMessage(null);
      
      console.log('📝 Submitting profile update:', formData);
      
      // Upload profile picture first if selected
      if (profilePictureFile) {
        console.log('📸 Uploading profile picture...');
        try {
          await uploadCustomerProfilePicture(profilePictureFile);
          console.log('✅ Profile picture uploaded');
        } catch (uploadError) {
          console.warn('⚠️ Profile picture upload failed:', uploadError.message);
          // Continue with other updates even if image upload fails
        }
      }
      
      // Send update request - backend uses Bearer token to identify customer
      await updateCustomerProfile(formData);
      
      console.log('✅ Profile update request successful');
      
      // Refetch the complete profile to ensure all fields are present
      const refreshedProfile = await getCustomerProfile();
      console.log('✅ Refreshed profile data:', refreshedProfile);
      console.log('📸 Profile picture field:', refreshedProfile.profilePicture);
      
      // Update local user data with complete data
      const userData = {
        id: refreshedProfile._id,
        name: refreshedProfile.name,
        email: refreshedProfile.email,
        phone: refreshedProfile.phone_number || 'Not specified',
        profilePicture: refreshedProfile.profilePicture,
        registerDate: refreshedProfile.register_date,
        createdAt: refreshedProfile.createdAt,
        updatedAt: refreshedProfile.updatedAt
      };
      setUser(userData);
      
      // Clear file input
      setProfilePictureFile(null);
      setProfilePicturePreview(null);
      
      // Show success message
      setSuccessMessage('Profile updated successfully!');
      
      // Close modal after 1.5 seconds
      setTimeout(() => {
        setIsEditModalOpen(false);
        setSuccessMessage(null);
      }, 1500);
      
    } catch (err) {
      console.error('❌ Failed to update profile:', err);
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setEditLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="profile-page">
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '100px 20px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <button 
              onClick={() => navigate(-1)} 
              style={{ padding: '0.5rem 1rem', background: 'white', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', marginRight: '1rem' }}
            >
              ← Back
            </button>
            <h1 style={{ margin: 0 }}>My Profile</h1>
          </div>
          <button 
            onClick={handleOpenEditModal}
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#667eea', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'background 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = '#5568d3'}
            onMouseLeave={(e) => e.target.style.background = '#667eea'}
          >
            ✏️ Edit Profile
          </button>
        </div>
        
        {/* Success Message */}
        {successMessage && (
          <div style={{
            background: '#d4edda',
            color: '#155724',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid #c3e6cb',
            fontWeight: '600'
          }}>
            ✅ {successMessage}
          </div>
        )}
        
        {/* Profile Header */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            {user.profilePicture ? (
              <img
                src={
                  user.profilePicture.startsWith('http') 
                    ? user.profilePicture 
                    : `http://localhost:5000${user.profilePicture}`
                }
                alt={user.name}
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px solid #667eea'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: user.profilePicture ? 'none' : 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 'bold'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ margin: '0 0 0.5rem 0', color: '#2c3e50' }}>{user.name}</h2>
              <p style={{ margin: 0, color: '#7f8c8d' }}>Customer Account</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>📞 Contact Information</h3>
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
              <strong style={{ color: '#555' }}>📧 Email:</strong>
              <span style={{ marginLeft: '1rem', color: '#2c3e50' }}>{user.email}</span>
            </div>
            <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #3498db' }}>
              <strong style={{ color: '#555' }}>📱 Phone:</strong>
              <span style={{ marginLeft: '1rem', color: '#2c3e50' }}>{user.phone}</span>
            </div>
          </div>
        </div>

        {/* Account Details */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: 0, color: '#2c3e50' }}>ℹ️ Account Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #3498db' }}>
              <strong style={{ display: 'block', color: '#7f8c8d', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>User ID</strong>
              <span style={{ color: '#2c3e50', fontWeight: '600', wordBreak: 'break-all' }}>{user.id}</span>
            </div>
            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #27ae60' }}>
              <strong style={{ display: 'block', color: '#7f8c8d', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Registered</strong>
              <span style={{ color: '#2c3e50', fontWeight: '600' }}>{formatDate(user.registerDate)}</span>
            </div>
            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #f39c12' }}>
              <strong style={{ display: 'block', color: '#7f8c8d', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Created At</strong>
              <span style={{ color: '#2c3e50', fontWeight: '600' }}>{formatDate(user.createdAt)}</span>
            </div>
            <div style={{ padding: '1.5rem', background: '#f8f9fa', borderRadius: '12px', borderLeft: '4px solid #9b59b6' }}>
              <strong style={{ display: 'block', color: '#7f8c8d', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Last Updated</strong>
              <span style={{ color: '#2c3e50', fontWeight: '600' }}>{formatDate(user.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
          onClick={handleCloseEditModal}
        >
          <div 
            style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '16px',
              maxWidth: '500px',
              width: '90%',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>✏️ Edit Profile</h2>
              <button 
                onClick={handleCloseEditModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#7f8c8d'
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit}>
              {editError && (
                <div style={{
                  background: '#f8d7da',
                  color: '#721c24',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #f5c6cb'
                }}>
                  ❌ {editError}
                </div>
              )}
              
              {successMessage && (
                <div style={{
                  background: '#d4edda',
                  color: '#155724',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  border: '1px solid #c3e6cb'
                }}>
                  ✅ {successMessage}
                </div>
              )}
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="profilePicture"
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#2c3e50'
                  }}
                >
                  Profile Picture
                </label>
                <input
                  type="file"
                  id="profilePicture"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
                {profilePicturePreview && (
                  <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                    <img 
                      src={profilePicturePreview} 
                      alt="Preview" 
                      style={{ 
                        width: '120px', 
                        height: '120px', 
                        objectFit: 'cover', 
                        borderRadius: '50%',
                        border: '3px solid #667eea'
                      }} 
                    />
                  </div>
                )}
                <small style={{ color: '#666', fontSize: '0.85rem', marginTop: '0.5rem', display: 'block' }}>
                  Upload an image file (max 5MB)
                </small>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="name"
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#2c3e50'
                  }}
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Your full name"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label 
                  htmlFor="phone_number"
                  style={{
                    display: 'block',
                    fontWeight: '600',
                    marginBottom: '0.5rem',
                    color: '#2c3e50'
                  }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  required
                  placeholder="Your phone number"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={editLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#95a5a6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: editLoading ? 0.6 : 1
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  style={{
                    padding: '0.75rem 1.5rem',
                    background: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: editLoading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    opacity: editLoading ? 0.6 : 1
                  }}
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
