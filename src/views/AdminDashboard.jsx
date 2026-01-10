import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats, getAllUsers, deleteUser, broadcastNotification, getAllReviews, deleteReview } from '../services/adminService';
import { API_BASE_URL } from '../utils/api';
import Loading from '../components/Loading';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, role, isLoading: authLoading, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, customer, artisan
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null); // {userId, userName, role}
  const [dataFetched, setDataFetched] = useState(false);
  
  // Notification broadcast states
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationTarget, setNotificationTarget] = useState('all');
  const [broadcastSuccess, setBroadcastSuccess] = useState('');
  const [broadcastError, setBroadcastError] = useState('');
  
  // Reviews states
  const [reviews, setReviews] = useState([]);
  const [deleteReviewConfirm, setDeleteReviewConfirm] = useState(null);

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Check if user is admin
    if (!isLoggedIn || role !== 'admin') {
      navigate('/login');
      return;
    }

    // Prevent double fetching
    if (dataFetched) {
      return;
    }

    // Fetch dashboard data
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        // Fetch stats, users, and reviews in parallel
        const [statsData, usersData, reviewsData] = await Promise.all([
          getStats(),
          getAllUsers(),
          getAllReviews()
        ]);
        
        setStats(statsData);
        setUsers(usersData);
        setReviews(reviewsData);
        setDataFetched(true);
        
        // Show info message if endpoints returned default values
        if (statsData.totalUsers === 0 && usersData.length === 0 && reviewsData.length === 0) {
          console.warn('⚠️ Admin endpoints may not be fully implemented in the backend');
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        // Don't show error if it's just 404s (endpoints not implemented)
        if (!err.message.includes('404') && !err.message.includes('not found')) {
          setError(err.message || 'Failed to load dashboard data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [authLoading, isLoggedIn, role, navigate, dataFetched]);

  const handleDeleteUser = async (userId, userName, userRole) => {
    setDeleteConfirm({ userId, userName, role: userRole });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    
    try {
      await deleteUser(deleteConfirm.userId, deleteConfirm.role);
      
      // Remove user from local state
      setUsers(users.filter(user => user._id !== deleteConfirm.userId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers - 1,
        [deleteConfirm.role === 'customer' ? 'customers' : 'artisans']: 
          prevStats[deleteConfirm.role === 'customer' ? 'customers' : 'artisans'] - 1
      }));
      
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete user: ' + err.message);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    
    if (!notificationMessage.trim()) {
      setBroadcastError('Please enter a message');
      return;
    }
    
    setBroadcastError('');
    setBroadcastSuccess('');
    
    try {
      const response = await broadcastNotification(notificationMessage, notificationTarget);
      setBroadcastSuccess(response.message || 'Notification sent successfully!');
      setNotificationMessage('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setBroadcastSuccess(''), 5000);
    } catch (err) {
      setBroadcastError(err.message || 'Failed to send notification');
    }
  };

  const handleDeleteReview = (reviewId, customerName) => {
    setDeleteReviewConfirm({ reviewId, customerName });
  };

  const confirmDeleteReview = async () => {
    if (!deleteReviewConfirm) return;
    
    try {
      await deleteReview(deleteReviewConfirm.reviewId);
      
      // Remove review from local state
      setReviews(reviews.filter(review => review._id !== deleteReviewConfirm.reviewId));
      
      setDeleteReviewConfirm(null);
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
    }
  };

  const cancelDeleteReview = () => {
    setDeleteReviewConfirm(null);
  };

  const renderStars = (stars) => {
    return '⭐'.repeat(stars);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Filter users based on role filter and search term
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getProfilePictureUrl = (picturePath) => {
    if (!picturePath) return '/default-avatar.png';
    if (picturePath.startsWith('http')) return picturePath;
    // Remove '/api' from the base URL if it exists
    const baseUrl = API_BASE_URL.replace('/api', '');
    return `${baseUrl}${picturePath}`;
  };

  // Show loading while auth is initializing or data is fetching
  if (authLoading || isLoading) {
    return <Loading />;
  }

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <h1>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '28px', height: '28px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M12 0C8.25 0 5.25 3 5.25 6.75c0 1.5.75 3.75 3 6 1.5 1.5 2.25 3 2.25 4.5V19.5c0 .75.75 1.5 1.5 1.5s1.5-.75 1.5-1.5v-2.25c0-1.5.75-3 2.25-4.5 2.25-2.25 3-4.5 3-6C18.75 3 15.75 0 12 0zm0 9c-1.125 0-2.25-.75-2.25-2.25S10.875 4.5 12 4.5s2.25.75 2.25 2.25S13.125 9 12 9z"/>
            </svg>
            Craftopia Admin Panel
          </h1>
          <button onClick={handleLogout} className="btn-logout">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '18px', height: '18px', marginRight: '6px'}}>
              <path d="M16 13v-2H7V8l-5 4 5 4v-3z"/>
              <path d="M20 3h-9c-1.103 0-2 .897-2 2v4h2V5h9v14h-9v-4H9v4c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2z"/>
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Error Display */}
      {error && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Broadcast Notification Section */}
      <div className="broadcast-section">
        <div className="broadcast-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M21 19v-2h-3v-4.5c0-2.34-1.28-4.37-3-5.19V6.5A1.5 1.5 0 0 0 13.5 5h-3A1.5 1.5 0 0 0 9 6.5v.81C7.28 8.13 6 10.16 6 12.5V17H3v2h18zm-8 2a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2z"/>
            </svg>
            Broadcast Notification
          </h2>
          <p>Send notifications to customers, artisans, or all users</p>
        </div>
        
        {broadcastSuccess && (
          <div className="success-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', flexShrink: 0}}>
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
            </svg>
            {broadcastSuccess}
          </div>
        )}
        
        {broadcastError && (
          <div className="error-message">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '20px', height: '20px', flexShrink: 0}}>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
            {broadcastError}
          </div>
        )}
        
        <form onSubmit={handleBroadcast} className="broadcast-form">
          <div className="form-group">
            <label htmlFor="notificationMessage">Message:</label>
            <textarea
              id="notificationMessage"
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              placeholder="Enter notification message..."
              rows="4"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="notificationTarget">Target Audience:</label>
            <select
              id="notificationTarget"
              value={notificationTarget}
              onChange={(e) => setNotificationTarget(e.target.value)}
            >
              <option value="all">All Users</option>
              <option value="customers">Customers Only</option>
              <option value="artisans">Artisans Only</option>
            </select>
          </div>
          
          <button type="submit" className="btn-broadcast">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '18px', height: '18px'}}>
              <path d="M2 21l21-9L2 3v7l15 2-15 2z"/>
            </svg>
            Send Notification
          </button>
        </form>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card stat-users">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </div>
            <div className="stat-details">
              <h3>Total Users</h3>
              <p className="stat-number">{stats.totalUsers}</p>
              <div className="stat-breakdown">
                <span>{stats.customers} Customers</span>
                <span>{stats.artisans} Artisans</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-reservations">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <div className="stat-details">
              <h3>Reservations</h3>
              <p className="stat-number">{stats.totalReservations}</p>
              <div className="stat-breakdown">
                <span>{stats.completedJobs} Completed</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-revenue">
            <div className="stat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
            </div>
            <div className="stat-details">
              <h3>Total Revenue</h3>
              <p className="stat-number">${stats.totalRevenue}</p>
            </div>
          </div>
        </div>
      )}

      {/* Users Management Section */}
      <div className="users-section">
        <div className="users-header">
          <h2>User Management</h2>
          
          {/* Filters and Search */}
          <div className="users-controls">
            <div className="filter-buttons">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Users ({users.length})
              </button>
              <button 
                className={`filter-btn ${filter === 'customer' ? 'active' : ''}`}
                onClick={() => setFilter('customer')}
              >
                Customers ({users.filter(u => u.role === 'customer').length})
              </button>
              <button 
                className={`filter-btn ${filter === 'artisan' ? 'active' : ''}`}
                onClick={() => setFilter('artisan')}
              >
                Artisans ({users.filter(u => u.role === 'artisan').length})
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search by name or email..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-users">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user._id}>
                    <td className="user-name">{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.phone_number || user.phone || 'N/A'}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'artisan' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '16px', height: '16px'}}>
                              <path d="M12 0C8.25 0 5.25 3 5.25 6.75c0 1.5.75 3.75 3 6 1.5 1.5 2.25 3 2.25 4.5V19.5c0 .75.75 1.5 1.5 1.5s1.5-.75 1.5-1.5v-2.25c0-1.5.75-3 2.25-4.5 2.25-2.25 3-4.5 3-6C18.75 3 15.75 0 12 0z"/>
                            </svg>
                            Artisan
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '16px', height: '16px'}}>
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            Customer
                          </>
                        )}
                      </span>
                    </td>
                    <td>
                      {user.register_date || user.registered_date || user.createdAt 
                        ? new Date(user.register_date || user.registered_date || user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="actions-cell">
                      {user.role === 'artisan' && (
                        <button 
                          className="btn-view-profile"
                          onClick={() => navigate(`/artisans/${user._id}`)}
                          title="View artisan profile"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '16px', height: '16px'}}>
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                          </svg>
                          View
                        </button>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user._id, user.name, user.role)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '16px', height: '16px'}}>
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                        </svg>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews Management Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '8px'}}>
              <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
            </svg>
            Reviews Management
          </h2>
          <p>Total Reviews: {reviews.length}</p>
        </div>

        <div className="reviews-table-container">
          <table className="reviews-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Artisan</th>
                <th>Craft Type</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-reviews">
                    No reviews found
                  </td>
                </tr>
              ) : (
                reviews.map(review => {
                  // Log the first review to see its structure
                  if (reviews.indexOf(review) === 0) {
                    console.log('📝 Review structure:', review);
                  }
                  
                  // Skip reviews with missing required data
                  if (!review || !review._id) {
                    console.warn('⚠️ Skipping review with no ID:', review);
                    return null;
                  }
                  
                  // Handle different customer/artisan field formats
                  const customer = review.customer || review.customerId || {};
                  const artisan = review.artisan || review.artisanId || {};
                  
                  return (
                    <tr key={review._id}>
                      <td>
                        <div className="review-user">
                          <strong>{customer.name || customer._id || 'Unknown Customer'}</strong>
                          <span className="user-email">{customer.email || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <strong>{artisan.name || artisan._id || 'Unknown Artisan'}</strong>
                      </td>
                      <td>{artisan.craftType || 'N/A'}</td>
                      <td className="review-stars">
                        {renderStars(review.stars_number || review.rating || 0)}
                        <span className="star-count">({review.stars_number || review.rating || 0})</span>
                      </td>
                      <td className="review-comment">{review.comment || 'No comment'}</td>
                      <td>{review.review_date ? new Date(review.review_date).toLocaleDateString() : new Date(review.createdAt).toLocaleDateString()}</td>
                      <td>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteReview(review._id, customer?.name || 'Unknown')}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '16px', height: '16px'}}>
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                          </svg>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete User Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '8px', color: '#e67e22'}}>
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              Confirm Deletion
            </h3>
            <p>
              Are you sure you want to delete <strong>{deleteConfirm.userName}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDelete} className="btn-confirm-delete">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Review Confirmation Modal */}
      {deleteReviewConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '24px', height: '24px', verticalAlign: 'middle', marginRight: '8px', color: '#e67e22'}}>
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
              </svg>
              Confirm Review Deletion
            </h3>
            <p>
              Are you sure you want to delete the review by <strong>{deleteReviewConfirm.customerName}</strong>?
              <br />
              This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button onClick={cancelDeleteReview} className="btn-cancel">
                Cancel
              </button>
              <button onClick={confirmDeleteReview} className="btn-confirm-delete">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
