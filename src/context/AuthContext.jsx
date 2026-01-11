import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * AuthContext - Global authentication state management
 * Provides login/logout functions and auth state to all components
 */
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // Full profile from /artisans/profile
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage on app load
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedRole = localStorage.getItem('role');
      const storedUserId = localStorage.getItem('userId');
      
      if (storedToken && storedUserId) {
        setToken(storedToken);
        setRole(storedRole);
        setUserId(storedUserId);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Login function - saves auth data to state and localStorage
   * @param {Object} authData - Authentication data from backend
   * @param {string} authData.token - JWT token
   * @param {string} authData.role - User role
   * @param {string} authData._id - User ID
   * @param {string} authData.name - User name
   */
  const login = (authData) => {
    console.log('🔐 Logging in user:', authData.name);
    
    // Save to localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('role', authData.role);
    localStorage.setItem('userId', authData._id);
    
    // Update state immediately
    setToken(authData.token);
    setRole(authData.role);
    setUserId(authData._id);
    setUser(authData);
    setIsLoggedIn(true);
    
    console.log('✅ Auth state updated - user is now logged in');
  };

  /**
   * Update profile - called after fetching profile from API
   * @param {Object} profileData - Full profile data from /artisans/profile
   */
  const updateProfile = (profileData) => {
    console.log('👤 Updating profile:', profileData?.name);
    setProfile(profileData);
  };

  /**
   * Logout function - clears auth state and localStorage
   */
  const logout = () => {
    console.log('🚪 Logging out user');
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    // Clear state
    setToken(null);
    setRole(null);
    setUserId(null);
    setUser(null);
    setProfile(null);
    setIsLoggedIn(false);
    
    console.log('✅ Auth state cleared - user is logged out');
  };

  const value = {
    // State
    token,
    role,
    userId,
    user,
    profile,
    isLoggedIn,
    isLoading,
    
    // Functions
    login,
    updateProfile,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use AuthContext in any component
 * @returns {Object} Auth context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
