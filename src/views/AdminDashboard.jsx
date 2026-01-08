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
          <h1>🔨 Craftopia Admin Panel</h1>
          <button onClick={handleLogout} className="btn-logout">
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
          <h2>📢 Broadcast Notification</h2>
          <p>Send notifications to customers, artisans, or all users</p>
        </div>
        
        {broadcastSuccess && (
          <div className="success-message">
            ✅ {broadcastSuccess}
          </div>
        )}
        
        {broadcastError && (
          <div className="error-message">
            ❌ {broadcastError}
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
              <option value="all">👥 All Users</option>
              <option value="customers">👤 Customers Only</option>
              <option value="artisans">🔨 Artisans Only</option>
            </select>
          </div>
          
          <button type="submit" className="btn-broadcast">
            📤 Send Notification
          </button>
        </form>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-container">
          <div className="stat-card stat-users">
            <div className="stat-icon">👥</div>
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
            <div className="stat-icon">📋</div>
            <div className="stat-details">
              <h3>Reservations</h3>
              <p className="stat-number">{stats.totalReservations}</p>
              <div className="stat-breakdown">
                <span>{stats.completedJobs} Completed</span>
              </div>
            </div>
          </div>

          <div className="stat-card stat-revenue">
            <div className="stat-icon">💰</div>
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
                        {user.role === 'artisan' ? '🔨 Artisan' : '👤 Customer'}
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
                          👁️ View
                        </button>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user._id, user.name, user.role)}
                      >
                        🗑️ Delete
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
          <h2>⭐ Reviews Management</h2>
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
                          🗑️ Delete
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
            <h3>⚠️ Confirm Deletion</h3>
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
            <h3>⚠️ Confirm Review Deletion</h3>
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
