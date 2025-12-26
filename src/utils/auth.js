// Authentication Helper Functions for localStorage
// This file provides utilities for managing user authentication with localStorage

/**
 * Initialize demo users in localStorage
 * This runs once to set up default users for testing
 */
export const initializeDemoUsers = () => {
  const existingUsers = localStorage.getItem('craftopia_users');
  const existingCraftsmen = localStorage.getItem('craftopia_craftsmen');
  
  // Only initialize if no users exist
  if (!existingUsers) {
    const demoUsers = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        password: 'password123',
        type: 'customer',
        address: '123 Main St, New York, NY 10001',
        joinedDate: '2024-01-15',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        id: 2,
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        phone: '+1 (555) 987-6543',
        password: 'password123',
        type: 'customer',
        address: '456 Oak Ave, Los Angeles, CA 90001',
        joinedDate: '2024-03-22',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      {
        id: 3,
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1 (555) 246-8135',
        password: 'password123',
        type: 'customer',
        address: '789 Pine Rd, Chicago, IL 60601',
        joinedDate: '2024-06-10',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      }
    ];
    
    localStorage.setItem('craftopia_users', JSON.stringify(demoUsers));
    console.log('✅ Demo users initialized');
  }

  // Initialize craftsmen
  if (!existingCraftsmen) {
    const demoCraftsmen = [
      {
        id: 1,
        name: 'Ahmad Hassan',
        email: 'ahmad.hassan@craftopia.com',
        password: 'craftsman123',
        phone: '+1 (555) 111-2222',
        type: 'craftsman',
        profession: 'Welder'
      },
      {
        id: 2,
        name: 'Sarah Mitchell',
        email: 'sarah.mitchell@craftopia.com',
        password: 'craftsman123',
        phone: '+1 (555) 222-3333',
        type: 'craftsman',
        profession: 'Carpenter'
      },
      {
        id: 3,
        name: 'James Wilson',
        email: 'james.wilson@craftopia.com',
        password: 'craftsman123',
        phone: '+1 (555) 333-4444',
        type: 'craftsman',
        profession: 'Plumber'
      }
    ];
    localStorage.setItem('craftopia_craftsmen', JSON.stringify(demoCraftsmen));
    console.log('✅ Demo craftsmen initialized');
  }
};

/**
 * Get current logged-in user
 * @returns {Object|null} Current user or null
 */
export const getCurrentUser = () => {
  const userSession = localStorage.getItem('craftopia_current_user');
  return userSession ? JSON.parse(userSession) : null;
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user is logged in
 */
export const isAuthenticated = () => {
  return getCurrentUser() !== null;
};

/**
 * Login user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Object} { success: boolean, user?: Object, message: string }
 */
export const loginUser = (email, password) => {
  // Check customers
  const users = JSON.parse(localStorage.getItem('craftopia_users') || '[]');
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  
  if (user) {
    const userSession = {
      id: user.id,
      name: user.name,
      email: user.email,
      userType: 'customer',
      loginTime: new Date().toISOString()
    };
    localStorage.setItem('craftopia_current_user', JSON.stringify(userSession));
    
    return { 
      success: true, 
      user: userSession,
      userType: 'customer',
      message: 'Login successful' 
    };
  }

  // Check craftsmen
  const craftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen') || '[]');
  const craftsman = craftsmen.find(
    c => c.email.toLowerCase() === email.toLowerCase() && c.password === password
  );
  
  if (craftsman) {
    const userSession = {
      id: craftsman.id,
      name: craftsman.name,
      email: craftsman.email,
      type: 'craftsman',
      userType: 'craftsman',
      profession: craftsman.profession,
      loginTime: new Date().toISOString()
    };
    // Store in both locations for smooth navigation
    localStorage.setItem('craftopia_current_user', JSON.stringify(userSession));
    localStorage.setItem('craftopia_craftsman', JSON.stringify(userSession));
    
    return { 
      success: true, 
      user: userSession,
      userType: 'craftsman',
      message: 'Login successful' 
    };
  }
  
  return { 
    success: false,
    userType: null,
    message: 'Invalid email or password' 
  };
};

/**
 * Register new user
 * @param {Object} userData - User registration data
 * @returns {Object} { success: boolean, user?: Object, message: string }
 */
export const registerUser = (userData) => {
  const users = JSON.parse(localStorage.getItem('craftopia_users') || '[]');
  
  // Check if email already exists
  const emailExists = users.some(
    u => u.email.toLowerCase() === userData.email.toLowerCase()
  );
  
  if (emailExists) {
    return { 
      success: false, 
      message: 'Email already registered' 
    };
  }
  
  // Create new user
  const newUser = {
    id: users.length + 1,
    name: userData.name,
    email: userData.email.toLowerCase(),
    phone: userData.phone,
    password: userData.password,
    address: '',
    joinedDate: new Date().toISOString().split('T')[0],
    profileImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=e67e22&color=fff&size=150`
  };
  
  users.push(newUser);
  localStorage.setItem('craftopia_users', JSON.stringify(users));
  
  // Auto-login
  const userSession = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('craftopia_current_user', JSON.stringify(userSession));
  
  return { 
    success: true, 
    user: userSession, 
    message: 'Registration successful' 
  };
};

/**
 * Logout current user
 */
export const logoutUser = () => {
  localStorage.removeItem('craftopia_current_user');
  localStorage.removeItem('craftopia_token');
};

/**
 * Save authentication token
 * @param {string} token - JWT token
 */
export const saveToken = (token) => {
  if (token) {
    localStorage.setItem('craftopia_token', token);
  }
};

/**
 * Get authentication token
 * @returns {string|null} Token or null
 */
export const getToken = () => {
  return localStorage.getItem('craftopia_token');
};

/**
 * Remove authentication token
 */
export const clearToken = () => {
  localStorage.removeItem('craftopia_token');
};

/**
 * Check if user has valid token
 * @returns {boolean}
 */
export const hasValidToken = () => {
  const token = getToken();
  if (!token) return false;
  
  try {
    // Basic JWT structure check
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Decode payload (second part)
    const payload = JSON.parse(atob(parts[1]));
    
    // Check if token is expired
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

/**
 * Save user session data
 * @param {Object} userData - User session data
 */
export const saveUserSession = (userData) => {
  const userSession = {
    ...userData,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('craftopia_current_user', JSON.stringify(userSession));
};

/**
 * Clear all authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem('craftopia_current_user');
  localStorage.removeItem('craftopia_token');
};

/**
 * Get user full profile by ID
 * @param {number} userId - User ID
 * @returns {Object|null} Full user profile or null
 */
export const getUserProfile = (userId) => {
  const users = JSON.parse(localStorage.getItem('craftopia_users') || '[]');
  return users.find(u => u.id === userId) || null;
};
