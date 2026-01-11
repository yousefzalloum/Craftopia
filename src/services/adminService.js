/**
 * Admin API Service
 * Handles all admin related API calls
 */

import { post, get, del, parseApiError, apiRequest } from '../utils/api';

/**
 * Login admin
 * @param {Object} credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with admin data and token
 */
export const loginAdmin = async (credentials) => {
  try {
    // Prepare request payload with trimmed email
    const loginPayload = {
      email: credentials.email.trim(),
      password: credentials.password
    };
    
    console.log('📡 Attempting admin login for:', loginPayload.email);
    
    const response = await post('/admin/login', loginPayload);
    
    console.log('✅ Admin login successful:', response);
    
    // Store token in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role || 'admin');
      localStorage.setItem('userId', response._id);
    }
    
    return response;
  } catch (error) {
    console.error('❌ Admin login failed:', error.message);
    throw error; // Throw the original error to preserve status code
  }
};

/**
 * Get system statistics
 * @returns {Promise<Object>} Stats including totalUsers, customers, artisans, totalReservations, completedJobs, totalRevenue
 */
export const getStats = async () => {
  try {
    console.log('📊 Fetching admin statistics...');
    const response = await get('/admin/stats');
    console.log('✅ Stats fetched successfully:', response);
    console.log('📊 Stats structure:', JSON.stringify(response, null, 2));
    
    // If the response is nested (e.g., { stats: { ... } }), extract it
    const stats = response.stats || response;
    
    // Map backend field names to frontend expected names
    const customers = stats.customers || 0;
    const artisans = stats.artisans || 0;
    const totalUsers = customers + artisans;
    
    // Backend uses 'reviews' and 'reservations' instead of 'totalReviews' and 'totalReservations'
    return {
      totalUsers,
      customers,
      artisans,
      totalReservations: stats.reservations || stats.totalReservations || 0,
      totalReviews: stats.reviews || stats.totalReviews || 0,
      completedJobs: stats.completedJobs || stats.completed || 0,
      totalRevenue: stats.totalRevenue || stats.revenue || 0
    };
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error.message);
    // Return default stats if endpoint doesn't exist
    if (error.message.includes('404')) {
      console.warn('⚠️ Admin stats endpoint not available, returning default values');
      return {
        totalUsers: 0,
        customers: 0,
        artisans: 0,
        totalReservations: 0,
        totalReviews: 0,
        completedJobs: 0,
        totalRevenue: 0
      };
    }
    throw new Error(parseApiError(error));
  }
};

/**
 * Get all users (customers and artisans)
 * @returns {Promise<Array>} List of all users with their details
 */
export const getAllUsers = async () => {
  try {
    console.log('👥 Fetching all users...');
    const response = await get('/admin/users');
    console.log('✅ Users fetched successfully:', response);
    
    // Handle both array and object responses
    if (Array.isArray(response)) {
      return response;
    } else if (response && Array.isArray(response.users)) {
      return response.users;
    } else if (response && typeof response === 'object') {
      console.warn('⚠️ Users response is an object, extracting array from it');
      // If response is an object with user data, try to extract arrays
      const allUsers = [];
      if (Array.isArray(response.customers)) {
        // Add role to each customer if not already present
        const customers = response.customers.map(user => ({
          ...user,
          role: user.role || 'customer'
        }));
        allUsers.push(...customers);
      }
      if (Array.isArray(response.artisans)) {
        // Add role to each artisan if not already present
        const artisans = response.artisans.map(user => ({
          ...user,
          role: user.role || 'artisan'
        }));
        allUsers.push(...artisans);
      }
      return allUsers;
    }
    
    console.warn('⚠️ Unexpected users response format, returning empty array');
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch users:', error.message);
    // Return empty array if endpoint doesn't exist
    if (error.message.includes('404')) {
      console.warn('⚠️ Admin users endpoint not available, returning empty list');
      return [];
    }
    throw new Error(parseApiError(error));
  }
};

/**
 * Delete a user by ID
 * @param {string} userId - User ID to delete
 * @param {string} role - User role (customer or artisan)
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteUser = async (userId, role) => {
  try {
    console.log(`🗑️ Deleting ${role} with ID:`, userId);
    
    // Make DELETE request with role in both query param and body
    const response = await apiRequest(`/admin/users/${userId}?role=${role}`, {
      method: 'DELETE',
      body: JSON.stringify({ role })
    });
    
    console.log('✅ User deleted successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to delete user:', error.message);
    throw new Error(parseApiError(error));
  }
};

/**
 * Broadcast notification to users
 * @param {string} message - Notification message
 * @param {string} target - Target audience: 'all', 'customer', or 'artisan'
 * @returns {Promise<Object>} Broadcast confirmation with count
 */
export const broadcastNotification = async (message, target) => {
  try {
    console.log('📢 Broadcasting notification to:', target);
    
    const response = await post('/admin/broadcast', {
      message,
      target
    });
    
    console.log('✅ Notification broadcast successful:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to broadcast notification:', error.message);
    throw new Error(parseApiError(error));
  }
};

/**
 * Get all reviews
 * @returns {Promise<Array>} List of all reviews with customer and artisan details
 */
export const getAllReviews = async () => {
  try {
    console.log('⭐ Fetching all reviews...');
    const response = await get('/admin/reviews');
    console.log('✅ Reviews fetched successfully:', response.length, 'reviews');
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch reviews:', error.message);
    // Return empty array if endpoint doesn't exist
    if (error.message.includes('404')) {
      console.warn('⚠️ Admin reviews endpoint not available, returning empty list');
      return [];
    }
    throw new Error(parseApiError(error));
  }
};

/**
 * Delete a review by ID
 * @param {string} reviewId - Review ID to delete
 * @returns {Promise<Object>} Delete confirmation
 */
export const deleteReview = async (reviewId) => {
  try {
    console.log('🗑️ Deleting review with ID:', reviewId);
    const response = await del(`/admin/reviews/${reviewId}`);
    console.log('✅ Review deleted successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to delete review:', error.message);
    throw new Error(parseApiError(error));
  }
};

/**
 * Delete a portfolio image
 * @param {string} artisanId - Artisan ID
 * @param {string} imageUrl - Image URL to delete
 * @returns {Promise<Object>} Delete confirmation
 */
export const deletePortfolioImage = async (artisanId, imageUrl) => {
  try {
    console.log('🗑️ Deleting portfolio image for artisan:', artisanId);
    const response = await del('/admin/portfolio', {
      artisanId,
      imageUrl
    });
    console.log('✅ Portfolio image deleted successfully:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to delete portfolio image:', error.message);
    throw new Error(parseApiError(error));
  }
};
