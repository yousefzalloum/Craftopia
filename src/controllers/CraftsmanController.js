// Craftsman Controller - Business logic for craftsman operations
import { 
  getAllCraftsmen, 
  getCraftsmanById,
  getCraftsmenByProfession,
  getAvailableCraftsmen,
  updateAvailableTimes,
  toggleAvailability
} from '../models/Craftsman';
import { post, parseApiError } from '../utils/api';

export const CraftsmanController = {
  // Get all craftsmen
  getCraftsmen: () => {
    try {
      return getAllCraftsmen();
    } catch (error) {
      console.error('Error fetching craftsmen:', error);
      return [];
    }
  },

  // Get single craftsman by ID
  getCraftsman: (id) => {
    try {
      const craftsman = getCraftsmanById(id);
      if (!craftsman) {
        throw new Error('Craftsman not found');
      }
      return craftsman;
    } catch (error) {
      console.error('Error fetching craftsman:', error);
      return null;
    }
  },

  // Get craftsmen by profession
  getByProfession: (profession) => {
    try {
      return getCraftsmenByProfession(profession);
    } catch (error) {
      console.error('Error fetching craftsmen by profession:', error);
      return [];
    }
  },

  // Get available craftsmen
  getAvailable: () => {
    try {
      return getAvailableCraftsmen();
    } catch (error) {
      console.error('Error fetching available craftsmen:', error);
      return [];
    }
  },

  // Update available times
  updateTimes: (craftsmanId, newTimes) => {
    try {
      const result = updateAvailableTimes(craftsmanId, newTimes);
      if (result) {
        return { success: true, message: 'Available times updated successfully' };
      }
      return { success: false, message: 'Craftsman not found' };
    } catch (error) {
      console.error('Error updating available times:', error);
      return { success: false, message: error.message };
    }
  },

  // Toggle availability
  toggleStatus: (craftsmanId) => {
    try {
      const newStatus = toggleAvailability(craftsmanId);
      if (newStatus !== null) {
        return { 
          success: true, 
          availability: newStatus,
          message: `Availability ${newStatus ? 'enabled' : 'disabled'} successfully` 
        };
      }
      return { success: false, message: 'Craftsman not found' };
    } catch (error) {
      console.error('Error toggling availability:', error);
      return { success: false, message: error.message };
    }
  },

  // Get craftsman's bookings
  getBookings: (craftsmanId, reservations) => {
    try {
      // Filter reservations by craftsman ID (craftId in reservations matches craftsman)
      return reservations.filter(reservation => 
        reservation.craftId === parseInt(craftsmanId)
      );
    } catch (error) {
      console.error('Error fetching craftsman bookings:', error);
      return [];
    }
  },

  // Get craftsman by email
  getCraftsmanByEmail: (email) => {
    try {
      const allCraftsmen = getAllCraftsmen();
      return allCraftsmen.find(c => c.email === email) || null;
    } catch (error) {
      console.error('Error fetching craftsman by email:', error);
      return null;
    }
  },

  // Update craftsman bio
  updateCraftsmanBio: (craftsmanId, newBio) => {
    try {
      const craftsmen = JSON.parse(localStorage.getItem('craftopia_craftsmen')) || getAllCraftsmen();
      const craftsmanIndex = craftsmen.findIndex(c => c.id === craftsmanId);
      
      if (craftsmanIndex !== -1) {
        craftsmen[craftsmanIndex].bio = newBio;
        localStorage.setItem('craftopia_craftsmen', JSON.stringify(craftsmen));
        return { success: true, message: 'Bio updated successfully' };
      }
      return { success: false, message: 'Craftsman not found' };
    } catch (error) {
      console.error('Error updating bio:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Register a new craftsman/artisan via backend API
   * @param {Object} craftsmanData - Craftsman registration data
   * @returns {Promise<Object>} Registration result with token and user data
   */
  signupCraftsman: async (craftsmanData) => {
    try {
      // Validate required fields
      if (!craftsmanData.name || !craftsmanData.email || !craftsmanData.password) {
        return {
          success: false,
          message: 'Name, email, and password are required'
        };
      }

      // Make API request to register artisan
      const response = await post('/artisan', {
        name: craftsmanData.name,
        email: craftsmanData.email,
        password: craftsmanData.password,
        craftType: craftsmanData.craftType,
        location: craftsmanData.location
      });

      // Store authentication token
      if (response.token) {
        localStorage.setItem('craftopia_token', response.token);
      }

      // Store user session
      const userSession = {
        id: response._id,
        name: response.name,
        email: response.email,
        craftType: response.craftType,
        location: response.location,
        userType: 'craftsman',
        loginTime: new Date().toISOString()
      };
      localStorage.setItem('craftopia_current_user', JSON.stringify(userSession));

      return {
        success: true,
        message: response.message || 'Registration successful',
        data: {
          id: response._id,
          name: response.name,
          email: response.email,
          craftType: response.craftType,
          location: response.location,
          token: response.token
        }
      };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        message: parseApiError(error)
      };
    }
  }
};

