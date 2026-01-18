/**
 * Craftsman API Service
 * Handles all craftsman/artisan related API calls
 */

import { post, get, put, patch, parseApiError } from '../utils/api';

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
    
    console.log('✅ Artisan profile fetched successfully:', response);
    console.log('📦 Portfolio Images:', response.portfolioImages);
    
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
 * Update artisan profile (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * The backend determines which artisan to update from the token
 * @param {Object} updateData - Data to update
 * @param {string} updateData.name - Artisan name
 * @param {string} updateData.phone - Phone number
 * @param {string} updateData.location - Location/city
 * @param {string} updateData.craftType - Type of craft
 * @param {string} updateData.description - Profile description
 * @param {Array<string>} updateData.portfolioImages - Array of portfolio image URLs
 * @returns {Promise<Object>} Updated artisan profile data
 */
export const updateArtisanProfile = async (updateData) => {
  try {
    console.log('📝 Updating artisan profile...');
    console.log('📝 Update data:', updateData);
    
    // Token is automatically included by the put() helper from localStorage
    // Backend uses token to identify which artisan to update
    const response = await put('/artisans/profile', updateData);
    
    console.log('✅ Artisan profile updated successfully:', {
      _id: response._id,
      name: response.name,
      email: response.email
    });
    
    return response;
  } catch (error) {
    console.error('❌ Failed to update artisan profile');
    console.error('❌ Error Status:', error.status || 'Unknown');
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Response Data:', error.data);
    
    throw new Error(parseApiError(error));
  }
};

/**
 * Upload artisan profile picture (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Response with profilePicture path
 */
export const uploadProfilePicture = async (imageFile) => {
  try {
    console.log('📸 Uploading profile picture...');
    console.log('📸 File:', imageFile.name, imageFile.type, imageFile.size);
    
    // Create FormData and append the image file
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Get token
    const token = localStorage.getItem('token');
    
    // Use relative path to work with Vite proxy
    const url = '/api/artisans/avatar';
    
    console.log('📸 Upload URL:', url);
    
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload profile picture');
    }
    
    console.log('✅ Profile picture uploaded successfully:', data);
    console.log('📸 Avatar path:', data.avatar);
    return data;
  } catch (error) {
    console.error('❌ Failed to upload profile picture:', error);
    throw new Error(error.message || 'Failed to upload profile picture');
  }
};

/**
 * Upload portfolio image (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @param {File} imageFile - The image file to upload
 * @param {number} price - Price of the work
 * @param {string} description - Description of the work
 * @returns {Promise<Object>} Response with portfolio array
 */
/**
 * Get all portfolio projects for the authenticated artisan
 * @returns {Promise<Array>} Array of portfolio projects
 */
export const getArtisanProjects = async () => {
  try {
    const response = await get('/artisans/my-portfolio');
    console.log('📦 Fetched artisan projects:', response);
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (response.portfolio && Array.isArray(response.portfolio)) {
      return response.portfolio;
    } else if (response.data && Array.isArray(response.data.portfolio)) {
      return response.data.portfolio;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    return [];
  } catch (error) {
    console.error('❌ Failed to fetch artisan projects:', error);
    return [];
  }
};

/**
 * Upload portfolio project with multiple images/videos
 * @param {FormData} formData - Form data with files, title, description, price, isForSale
 * @returns {Promise<Object>} Response with project data
 */
export const uploadPortfolioImage = async (formData) => {
  try {
    // Get token
    const token = localStorage.getItem('token');
    
    // Use relative path to work with Vite proxy
    const url = '/api/artisans/portfolio';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload portfolio project');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to upload portfolio project:', error);
    throw new Error(error.message || 'Failed to upload portfolio project');
  }
};

/**
 * Delete portfolio project (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @param {string} projectId - The project ID to delete
 * @returns {Promise<Object>} Response with updated portfolioImages array
 */
export const deletePortfolioImage = async (projectId) => {
  try {
    // Get token
    const token = localStorage.getItem('token');
    
    // Get API base URL from environment or use default
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const url = `${baseUrl}/artisans/portfolio/${projectId}`;
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete portfolio project');
    }
    
    return data;
  } catch (error) {
    console.error('❌ Failed to delete portfolio project:', error);
    throw new Error(error.message || 'Failed to delete portfolio project');
  }
};

/**
 * Get craftsman profile
 * @param {string} craftsmanId - Craftsman ID
 * @returns {Promise<Object>} Craftsman profile data
 */
export const getCraftsmanProfile = async (craftsmanId) => {
  try {
    // First try the direct endpoint
    const response = await get(`/artisans/${craftsmanId}`);
    return response;
  } catch (error) {
    // If 404, fallback to fetching all artisans and filtering
    if (error.status === 404) {
      console.log('⚠️ Direct endpoint not found, trying to fetch from all artisans...');
      try {
        const allArtisans = await get('/artisans');
        const artisan = allArtisans.find(a => a._id === craftsmanId);
        if (artisan) {
          console.log('✅ Found artisan in all artisans list');
          return artisan;
        }
        // If still not found, throw original 404
        throw error;
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        throw error; // Throw original 404 error
      }
    }
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
    // Try /artisans endpoint (primary), fallback to /craftsmen if needed
    const endpoint = queryParams ? `/artisans?${queryParams}` : '/artisans';
    console.log('🔍 Fetching artisans from:', endpoint);
    const response = await get(endpoint);
    console.log('✅ Artisans response:', response.length || response?.length || 'unknown length');
    return response;
  } catch (error) {
    console.error('❌ Failed to fetch artisans from API:', error.message);
    // Import dummy data as fallback
    const { craftsmenData } = await import('../models/Craftsman');
    console.log('⚠️ Using dummy data fallback:', craftsmenData.length, 'artisans');
    
    // Convert dummy data to API format first
    const converted = craftsmenData.map(c => ({
      _id: c.id.toString(),
      name: c.name,
      email: c.email,
      phone: c.phone,
      craftType: c.profession,
      location: c.city,
      averageRating: c.rating,
      totalReviews: c.reviews,
      description: c.bio,
      yearsOfExperience: c.experienceYears,
      portfolioImages: c.portfolio?.map(p => p.imageUrl) || [],
      availability: c.availability,
      availableTimes: c.availableTimes
    }));
    
    // Apply filters to converted data
    let filtered = converted;
    if (filters.craftType) {
      filtered = filtered.filter(c => c.craftType === filters.craftType);
    }
    if (filters.location) {
      filtered = filtered.filter(c => c.location === filters.location);
    }
    
    return filtered;
  }
};

/**
 * Set artisan availability
 * @param {Object} availabilityData
 * @param {string} availabilityData.day - Day of the week (e.g., "Monday")
 * @param {string} availabilityData.start_time - Start time (e.g., "09:00")
 * @param {string} availabilityData.end_time - End time (e.g., "17:00")
 * @returns {Promise<Object>} Created availability record
 */
export const setAvailability = async (availabilityData) => {
  try {
    const response = await post('/availability', availabilityData);
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

/**
 * Get artisan availability by artisan ID
 * @param {string} artisanId - Artisan ID
 * @returns {Promise<Array>} Array of availability records
 */
export const getArtisanAvailability = async (artisanId) => {
  try {
    const response = await get(`/availability/${artisanId}`);
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

/**
 * Get all artisans (public endpoint)
 * @returns {Promise<Array>} Array of all artisans
 */
export const getAllArtisans = async () => {
  try {
    const response = await get('/artisans');
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

/**
 * Change artisan password (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.oldPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const changeArtisanPassword = async (passwordData) => {
  try {
    console.log('🔐 Changing artisan password...');
    
    const response = await put('/artisans/change-password', {
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    });
    
    console.log('✅ Artisan password changed successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to change artisan password');
    console.error('❌ Error Status:', error.status || 'Unknown');
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Response Data:', error.data);
    
    throw new Error(parseApiError(error));
  }
};

/**
 * Get artisan reviews
 * @returns {Promise<Array>} Array of reviews
 */
export const getArtisanReviews = async () => {
  try {
    console.log('📝 Fetching artisan reviews...');
    const response = await get('/artisans/reviews');
    console.log('✅ Reviews fetched successfully');
    return response || [];
  } catch (error) {
    console.error('❌ Failed to fetch artisan reviews:', error);
    return [];
  }
};

/**
 * Get portfolio image comments
 * @param {number} imageIndex - Index of the portfolio image
 * @returns {Promise<Array>} Array of comments
 */
export const getPortfolioComments = async (imageIndex) => {
  try {
    console.log(`💬 Fetching comments for portfolio image ${imageIndex}...`);
    const response = await get(`/artisans/portfolio/${imageIndex}/comments`);
    console.log('✅ Comments fetched successfully');
    return response || [];
  } catch (error) {
    console.error(`❌ Failed to fetch comments for image ${imageIndex}:`, error);
    return [];
  }
};

// Default export
const craftsmanService = {
  registerCraftsman,
  loginCraftsman,
  getArtisanProfile,
  updateArtisanProfile,
  uploadProfilePicture,
  uploadPortfolioImage,
  deletePortfolioImage,
  getCraftsmanProfile,
  updateCraftsmanProfile,
  getAllCraftsmen,
  setAvailability,
  getArtisanAvailability,
  getAllArtisans,
  logoutCraftsman,
  changeArtisanPassword,
  getArtisanReviews,
  getPortfolioComments,
  getArtisanProjects
};

export default craftsmanService;
