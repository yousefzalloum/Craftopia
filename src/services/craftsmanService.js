/**
 * Craftsman API Service
 * Handles all craftsman/artisan related API calls
 */

import { post, get, put, parseApiError } from '../utils/api';

/**
 * Register a new craftsman/artisan
 * @param {Object} craftsmanData - Registration data
 * @param {string} craftsmanData.name - Craftsman's full name
 * @param {string} craftsmanData.email - Email address
 * @param {string} craftsmanData.password - Password
 * @param {string} craftsmanData.phone_number - Phone number
 * @param {string} craftsmanData.craftType - Type of craft/profession
 * @param {string} craftsmanData.location - City/location
 * @returns {Promise<Object>} Response with craftsman data and token
 */
export const registerCraftsman = async (craftsmanData) => {
  try {
    const response = await post('/artisans/signup', craftsmanData);
    
    // Store token in localStorage if provided
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role || 'artisan');
      localStorage.setItem('userId', response._id);
    }
    
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

/**
 * Login craftsman/artisan
 * @param {Object} credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with craftsman data and token
 */
export const loginCraftsman = async (credentials) => {
  try {
    // Prepare request payload with trimmed email
    const loginPayload = {
      email: credentials.email.trim(),
      password: credentials.password
    };
    
    // Calculate final URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const finalUrl = `${baseUrl}/artisans/login`;
    
    // Log request details
    console.log('🔐 Artisan Login Request Payload:', {
      email: loginPayload.email,
      emailLength: loginPayload.email.length,
      passwordLength: loginPayload.password.length
    });
    console.log('🔗 Final Request URL:', finalUrl);
    
    const response = await post('/artisans/login', loginPayload);
    
    // Log success response
    console.log('✅ Artisan Login Success - Response Status: 200');
    console.log('✅ Artisan Login Response Data:', {
      _id: response._id,
      name: response.name,
      role: response.role,
      token: response.token ? '✓ Token received' : '✗ No token'
    });
    
    // Store token, role, and userId in localStorage (same keys as customer)
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      localStorage.setItem('userId', response._id);
      console.log('💾 Stored in localStorage - token, role, userId');
    }
    
    return response;
  } catch (error) {
    // Log detailed error information
    console.error('❌ Artisan Login Failed');
    console.error('❌ Error Status:', error.status || 'Unknown');
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Response Data:', error.data);
    
    // Create error object that preserves status code for Login.jsx fallback logic
    const err = new Error(parseApiError(error));
    err.status = error.status;
    throw err;
  }
};

/**
 * Get artisan profile (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @returns {Promise<Object>} Artisan profile data
 */
export const getArtisanProfile = async () => {
  try {
    console.log('📋 Fetching artisan profile...');
    
    // Token is automatically included by the get() helper from localStorage
    const response = await get('/artisans/profile');
    
    console.log('✅ Artisan profile fetched successfully:', {
      _id: response._id,
      name: response.name,
      email: response.email,
      role: response.role
    });
    
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch artisan profile');
    console.error('❌ Error Status:', error.status || 'Unknown');
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Response Data:', error.data);
    
    throw new Error(parseApiError(error));
  }
};

/**
 * Get craftsman profile
 * @param {string} craftsmanId - Craftsman ID
 * @returns {Promise<Object>} Craftsman profile data
 */
export const getCraftsmanProfile = async (craftsmanId) => {
  try {
    const response = await get(`/artisans/${craftsmanId}`);
    return response;
  } catch (error) {
    // Preserve the original error with status if it's an ApiError
    if (error.status) {
      throw error;
    }
    throw new Error(parseApiError(error));
  }
};

/**
 * Update craftsman profile
 * @param {string} craftsmanId - Craftsman ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated craftsman data
 */
export const updateCraftsmanProfile = async (craftsmanId, updateData) => {
  try {
    const response = await put(`/artisans/${craftsmanId}`, updateData);
    
    // Update local storage if successful
    const currentUser = JSON.parse(localStorage.getItem('craftopia_current_user') || '{}');
    const updatedUser = { ...currentUser, ...updateData };
    localStorage.setItem('craftopia_current_user', JSON.stringify(updatedUser));
    
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

/**
 * Get all craftsmen/artisans (public endpoint)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of craftsmen
 */
export const getAllCraftsmen = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const endpoint = queryParams ? `/artisans?${queryParams}` : '/artisans';
    const response = await get(endpoint);
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

/**
 * Logout craftsman
 * Clears local storage and authentication data
 */
export const logoutCraftsman = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
};
