import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile } from '../services/customerService';
import Loading from '../components/Loading';
import '../styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuth();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
          registerDate: data.register_date,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        };
        
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
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '0.5rem 1rem', background: 'white', border: '2px solid #ddd', borderRadius: '8px', cursor: 'pointer', marginRight: '1rem' }}
          >
            ← Back
          </button>
          <h1 style={{ margin: 0 }}>My Profile</h1>
        </div>
        
        {/* Profile Header */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              display: 'flex',
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
    </div>
  );
};

export default Profile;
