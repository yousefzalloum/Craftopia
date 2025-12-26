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
 * @param {string} craftsmanData.craftType - Type of craft/profession
 * @param {string} craftsmanData.location - City/location
 * @returns {Promise<Object>} Response with craftsman data and token
 */
export const registerCraftsman = async (craftsmanData) => {
  try {
    const response = await post('/artisans', craftsmanData);
    
    // Store token in localStorage if provided
    if (response.token) {
      localStorage.setItem('craftopia_token', response.token);
      localStorage.setItem('craftopia_craftsman_id', response._id);
      
      // Store craftsman info (without sensitive data)
      const craftsmanInfo = {
        id: response._id,
        name: response.name,
        email: response.email,
        craftType: response.craftType,
        location: response.location,
        type: 'craftsman'
      };
      localStorage.setItem('craftopia_current_user', JSON.stringify(craftsmanInfo));
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
    const response = await post('/artisans/login', credentials);
    
    // Store token and user info
    if (response.token) {
      localStorage.setItem('craftopia_token', response.token);
      localStorage.setItem('craftopia_craftsman_id', response._id);
      
      const craftsmanInfo = {
        id: response._id,
        name: response.name,
        email: response.email,
        craftType: response.craftType,
        location: response.location,
        type: 'craftsman'
      };
      localStorage.setItem('craftopia_current_user', JSON.stringify(craftsmanInfo));
    }
    
    return response;
  } catch (error) {
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
  localStorage.removeItem('craftopia_token');
  localStorage.removeItem('craftopia_craftsman_id');
  localStorage.removeItem('craftopia_current_user');
};
