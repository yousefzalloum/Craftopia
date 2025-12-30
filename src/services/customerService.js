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
 * Update customer profile
 * @param {string} customerId - Customer ID
 * @param {Object} updateData - Data to update
 * @returns {Promise<Object>} Updated customer data
 */
export const updateCustomerProfile = async (customerId, updateData) => {
  try {
    const response = await put(`/customers/${customerId}`, updateData);
    
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
    console.log('📡 Creating reservation:', reservationData);
    const response = await post('/reservations', {
      ...reservationData,
      status: 'New'
    });
    console.log('✅ Reservation created:', response);
    return response;
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    throw new Error(parseApiError(error));
  }
};

/**
 * Get customer's reservations
 * @returns {Promise<Array>} Array of reservation objects with artisan details
 */
export const getCustomerReservations = async () => {
  try {
    console.log('📡 Fetching customer reservations from GET /reservations/my-requests');
    const response = await get('/reservations/my-requests');
    console.log('✅ Customer reservations fetched:', response);
    return response;
  } catch (error) {
    console.error('❌ Error fetching customer reservations:', error);
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
    console.log('📡 Cancelling reservation:', reservationId);
    const response = await post(`/reservations/${reservationId}/cancel`);
    console.log('✅ Reservation cancelled:', response);
    return response;
  } catch (error) {
    console.error('❌ Error cancelling reservation:', error);
    throw new Error(parseApiError(error));
  }
};
