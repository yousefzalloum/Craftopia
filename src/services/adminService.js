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
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch stats:', error.message);
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
    console.log('✅ Users fetched successfully:', response.length, 'users');
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch users:', error.message);
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
