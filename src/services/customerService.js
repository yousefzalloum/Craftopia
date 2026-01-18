/**
 * Customer API Service
 * Handles all customer related API calls
 */

import { post, get, put, parseApiError } from '../utils/api';

/**
 * Register a new customer
 * @param {Object} customerData - Registration data
 * @param {string} customerData.name - Customer's full name
 * @param {string} customerData.email - Email address
 * @param {string} customerData.password - Password
 * @param {string} customerData.phone_number - Phone number
 * @returns {Promise<Object>} Response with customer data and token
 */
export const registerCustomer = async (customerData) => {
  try {
    const response = await post('/customers/signup', customerData);
    
    // Store token in localStorage if provided
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role || 'customer');
      localStorage.setItem('userId', response._id);
    }
    
    return response;
  } catch (error) {
    throw new Error(parseApiError(error));
  }
};

/**
 * Login customer
 * @param {Object} credentials
 * @param {string} credentials.email - Email address
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with customer data and token
 */
export const loginCustomer = async (credentials) => {
  try {
    // Prepare request payload with trimmed email
    const loginPayload = {
      email: credentials.email.trim(),
      password: credentials.password
    };
    
    // Calculate final URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const finalUrl = `${baseUrl}/customers/login`;
    
    // Log request details
    console.log('🔐 Login Request Payload:', {
      email: loginPayload.email,
      emailLength: loginPayload.email.length,
      passwordLength: loginPayload.password.length
    });
    console.log('🔗 Final Request URL:', finalUrl);
    
    const response = await post('/customers/login', loginPayload);
    
    // Log success response
    console.log('✅ Login Success - Response Status: 200');
    console.log('✅ Login Response Data:', {
      _id: response._id,
      name: response.name,
      role: response.role,
      token: response.token ? '✓ Token received' : '✗ No token'
    });
    
    // Store token, role, and userId in localStorage
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      localStorage.setItem('userId', response._id);
      console.log('💾 Stored in localStorage - token, role, userId');
    }
    
    return response;
  } catch (error) {
    // Log detailed error information
    console.error('❌ Login Failed');
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
 * Get authenticated customer profile
 * Uses Bearer token from localStorage for authentication
 * @returns {Promise<Object>} Customer profile data
 */
export const getCustomerProfile = async () => {
  try {
    console.log('📡 Fetching customer profile from GET /customers/profile');
    const response = await get('/customers/profile');
    console.log('✅ Customer profile fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching customer profile:', error.status, error.message);
    // Preserve error status for caller to handle 401
    const err = new Error(parseApiError(error));
    err.status = error.status;
    throw err;
  }
};

/**
 * Update customer profile (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * The backend determines which customer to update from the token
 * @param {Object} updateData - Data to update
 * @param {string} updateData.name - Customer name
 * @param {string} updateData.phone_number - Phone number
 * @returns {Promise<Object>} Updated customer profile data
 */
export const updateCustomerProfile = async (updateData) => {
  try {
    console.log('📝 Updating customer profile...');
    console.log('📝 Update data:', updateData);
    
    // Token is automatically included by the put() helper from localStorage
    // Backend uses token to identify which customer to update
    const response = await put('/customers/profile', updateData);
    
    console.log('✅ Customer profile updated successfully:', {
      _id: response._id,
      name: response.name,
      email: response.email
    });
    
    return response;
  } catch (error) {
    console.error('❌ Failed to update customer profile');
    console.error('❌ Error Status:', error.status || 'Unknown');
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Response Data:', error.data);
    
    throw new Error(parseApiError(error));
  }
};

/**
 * Upload customer profile picture (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @param {File} imageFile - The image file to upload
 * @returns {Promise<Object>} Response with profilePicture path
 */
export const uploadCustomerProfilePicture = async (imageFile) => {
  try {
    console.log('📸 Uploading customer profile picture...');
    console.log('📸 File:', imageFile.name, imageFile.type, imageFile.size);
    
    // Create FormData and append the image file
    const formData = new FormData();
    formData.append('image', imageFile);
    
    // Get token
    const token = localStorage.getItem('token');
    
    // Use relative path to work with Vite proxy
    const url = '/api/customers/avatar';
    
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
    
    console.log('✅ Customer profile picture uploaded successfully:', data);
    console.log('📸 Avatar path:', data.avatar);
    return data;
  } catch (error) {
    console.error('❌ Failed to upload customer profile picture:', error);
    throw new Error(error.message || 'Failed to upload profile picture');
  }
};

/**
 * Logout customer
 * Clears local storage and authentication data
 */
export const logoutCustomer = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
};

/**
 * Create a reservation with an artisan
 * @param {Object} reservationData - Reservation details
 * @param {string} reservationData.artisan - Artisan ID
 * @param {string} reservationData.description - Service description
 * @param {string} reservationData.start_date - Start date (ISO format)
 * @param {number} reservationData.total_price - Total price
 * @returns {Promise<Object>} Created reservation
 */
export const createReservation = async (reservationData) => {
  try {
    console.log('📡 Creating order with payload:', JSON.stringify(reservationData, null, 2));
    const response = await post('/orders', reservationData);
    console.log('✅ Order created:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    console.error('❌ Error status:', error.status);
    console.error('❌ Error data:', JSON.stringify(error.data, null, 2));
    
    // Extract detailed error message from backend
    let errorMessage = 'Failed to create reservation';
    
    if (error.data) {
      // Check for detailed backend error first
      if (error.data.error) {
        errorMessage = error.data.error;
      } else if (error.data.message && error.data.message !== 'Booking failed') {
        errorMessage = error.data.message;
      } else if (error.data.errors) {
        // Handle validation errors array
        const errors = Array.isArray(error.data.errors) 
          ? error.data.errors.map(e => e.msg || e.message).join(', ')
          : JSON.stringify(error.data.errors);
        errorMessage = `Validation error: ${errors}`;
      }
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Get customer's reservations
 * @returns {Promise<Array>} Array of reservation objects with artisan details
 */
export const getCustomerReservations = async () => {
  try {
    console.log('📡 Fetching customer orders from GET /orders/customer?populate=artisan');
    const response = await get('/orders/customer?populate=artisan');
    console.log('✅ Customer orders fetched:', response);
    
    // Handle different response structures
    if (Array.isArray(response)) {
      return response;
    } else if (response.orders && Array.isArray(response.orders)) {
      return response.orders;
    } else if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    console.warn('⚠️ Unexpected orders response structure:', response);
    return [];
  } catch (error) {
    console.error('❌ Error fetching customer orders:', error);
    throw new Error(parseApiError(error));
  }
};

/**
 * Cancel a reservation
 * @param {string} reservationId - Reservation ID
 * @returns {Promise<Object>} Cancelled reservation
 */
export const cancelReservation = async (reservationId) => {
  try {
    console.log('📡 Cancelling order:', reservationId);
    const response = await post(`/orders/${reservationId}/cancel`);
    console.log('✅ Order cancelled:', response);
    return response;
  } catch (error) {
    console.error('❌ Error cancelling reservation:', error);
    throw new Error(parseApiError(error));
  }
};

/**
 * Change customer password (authenticated endpoint)
 * Requires valid JWT token in Authorization header
 * @param {Object} passwordData - Password change data
 * @param {string} passwordData.currentPassword - Current password
 * @param {string} passwordData.newPassword - New password
 * @returns {Promise<Object>} Success response
 */
export const changePassword = async (passwordData) => {
  try {
    console.log('🔐 Changing customer password...');
    
    const response = await put('/customers/change-password', {
      oldPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    
    console.log('✅ Password changed successfully');
    return response;
  } catch (error) {
    console.error('❌ Failed to change password');
    console.error('❌ Error Status:', error.status || 'Unknown');
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Response Data:', error.data);
    
    throw new Error(parseApiError(error));
  }
};
