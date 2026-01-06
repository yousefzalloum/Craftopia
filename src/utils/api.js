/**
 * API Configuration and Utilities
 * Centralized API setup with error handling and interceptors
 */

// Base API URL - can be configured via environment variable
const envApiUrl = import.meta.env.VITE_API_BASE_URL;
export const API_BASE_URL = envApiUrl || 'http://localhost:5000/api';

// Debug: Log the API base URL and source
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📦 Using VITE_API_BASE_URL:', envApiUrl ? 'Yes (from env variable)' : 'No (using default)');

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Make an HTTP request with proper error handling
 * @param {string} endpoint - API endpoint (e.g., '/artisans')
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('📡 API Request:', url, options.method || 'GET');
  
  // Default headers
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Add authorization token if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('✅ Response received:', response.status, response.statusText);

    // Parse response body
    const data = await response.json().catch(() => ({}));
    
    console.log('📦 Response data:', data);

    // Handle error responses
    if (!response.ok) {
      // Extract error message from response - prioritize backend message
      const errorMessage = data.message || data.error || data.msg || `HTTP error! status: ${response.status}`;
      console.error('❌ API Error:', errorMessage);
      console.error('❌ Status Code:', response.status);
      console.error('❌ Full Error Data:', JSON.stringify(data, null, 2));
      throw new ApiError(errorMessage, response.status, data);
    }

    return data;
  } catch (error) {
    console.error('❌ Fetch Error:', error);
    
    // Network errors or other fetch errors
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors (CORS or network issues)
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new ApiError(
        'Unable to connect to the server. Please check if the backend is running and CORS is enabled.',
        0,
        null
      );
    }

    throw new ApiError(
      error.message || 'An unexpected error occurred',
      0,
      null
    );
  }
};

/**
 * GET request helper
 */
export const get = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'GET',
    ...options,
  });
};

/**
 * POST request helper
 */
export const post = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PUT request helper
 */
export const put = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * PATCH request helper
 */
export const patch = (endpoint, data, options = {}) => {
  return apiRequest(endpoint, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  });
};

/**
 * DELETE request helper
 */
export const del = (endpoint, options = {}) => {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options,
  });
};

/**
 * Parse API error for user-friendly messages
 * @param {Error} error - Error object
 * @returns {string} User-friendly error message
 */
export const parseApiError = (error) => {
  if (error instanceof ApiError) {
    // Handle specific HTTP status codes
    switch (error.status) {
      case 400:
        return error.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Resource not found.';
      case 409:
        return error.message || 'This resource already exists.';
      case 422:
        return error.message || 'Validation error. Please check your input.';
      case 500:
        // Show actual server error message instead of generic one
        return error.message || 'Server error. Please try again later.';
      case 0:
        return error.message;
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  }

  return error.message || 'An unexpected error occurred.';
};
