// User Controller - Business logic for user operations
import { getUserById, getUserByEmail, getCurrentUser } from '../models/User';

export const UserController = {
  // Get user by ID
  getUser: (id) => {
    try {
      const user = getUserById(id);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  // Get user by email
  getUserByEmailAddress: (email) => {
    try {
      const user = getUserByEmail(email);
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  },

  // Get current logged-in user
  getCurrentUser: () => {
    try {
      return getCurrentUser();
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  },

  // Validate email format
  validateEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate phone format
  validatePhone: (phone) => {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  },

  // Format user data for display
  formatUserData: (user) => {
    if (!user) return null;
    
    return {
      ...user,
      joinedDateFormatted: new Date(user.joinedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  },

  // Update user profile image
  updateProfileImage: (userId, newImageUrl) => {
    try {
      const users = JSON.parse(localStorage.getItem('craftopia_users')) || [];
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].profileImage = newImageUrl;
        localStorage.setItem('craftopia_users', JSON.stringify(users));
        
        // Update current user if it's the same user
        const currentUser = getCurrentUser();
        if (currentUser && currentUser.id === userId) {
          currentUser.profileImage = newImageUrl;
          localStorage.setItem('craftopia_current_user', JSON.stringify(currentUser));
        }
        
        return { success: true, message: 'Profile image updated successfully' };
      }
      return { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Error updating profile image:', error);
      return { success: false, message: error.message };
    }
  }
};
