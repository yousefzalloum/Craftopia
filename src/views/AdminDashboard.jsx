import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStats, getAllUsers, deleteUser } from '../services/adminService';
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
        // Fetch stats and users in parallel
        const [statsData, usersData] = await Promise.all([
          getStats(),
          getAllUsers()
        ]);
        
        setStats(statsData);
        setUsers(usersData);
        setDataFetched(true);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
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
                    <td>{user.phone_number}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>
                        {user.role === 'artisan' ? '🔨 Artisan' : '👤 Customer'}
                      </span>
                    </td>
                    <td>{new Date(user.register_date).toLocaleDateString()}</td>
                    <td>
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

      {/* Delete Confirmation Modal */}
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
    </div>
  );
};

export default AdminDashboard;
