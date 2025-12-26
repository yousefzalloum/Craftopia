// Reservation Controller - Business logic for reservation operations
import { 
  getAllReservations, 
  getReservationById, 
  getReservationsByUserId,
  getReservationsByStatus,
  getReservationsByType,
  addReservation 
} from '../models/Reservation';
import { getCraftById } from '../models/Craft';

export const ReservationController = {
  // Get all reservations
  getReservations: () => {
    try {
      return getAllReservations();
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  },

  // Get single reservation by ID
  getReservation: (id) => {
    try {
      const reservation = getReservationById(id);
      if (!reservation) {
        throw new Error('Reservation not found');
      }
      return reservation;
    } catch (error) {
      console.error('Error fetching reservation:', error);
      return null;
    }
  },

  // Get user's reservations
  getUserReservations: (userId) => {
    try {
      return getReservationsByUserId(userId);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
      return [];
    }
  },

  // Get reservations by status
  getByStatus: (status) => {
    try {
      return getReservationsByStatus(status);
    } catch (error) {
      console.error('Error fetching reservations by status:', error);
      return [];
    }
  },

  // Get reservations by type (craft or maintenance)
  getByType: (type) => {
    try {
      return getReservationsByType(type);
    } catch (error) {
      console.error('Error fetching reservations by type:', error);
      return [];
    }
  },

  // Create new reservation
  createReservation: (craftId, userId, userName, userEmail, startDate, endDate, reservationType = 'craft', serviceAddress = null, serviceDescription = null, appointmentTime = null) => {
    try {
      // Validate craft exists
      const craft = getCraftById(craftId);
      if (!craft) {
        throw new Error('Craft not found');
      }

      // Validate craft availability
      if (!craft.availability) {
        throw new Error('Craft is not available for reservation');
      }

      // For maintenance appointments, validate required fields
      if (reservationType === 'maintenance') {
        if (!serviceAddress) {
          throw new Error('Service address is required for home maintenance');
        }
        if (!serviceDescription) {
          throw new Error('Service description is required for home maintenance');
        }
        if (!appointmentTime) {
          throw new Error('Appointment time is required for home maintenance');
        }
      }

      // Calculate total price (for demo: just use craft price)
      const totalPrice = craft.price;

      // Create reservation
      const newReservation = addReservation({
        craftId,
        userId,
        userName,
        userEmail,
        startDate,
        endDate,
        totalPrice,
        reservationType,
        serviceAddress,
        serviceDescription,
        appointmentTime
      });

      return {
        success: true,
        reservation: newReservation,
        message: reservationType === 'maintenance' 
          ? 'Home maintenance appointment scheduled successfully' 
          : 'Reservation created successfully'
      };
    } catch (error) {
      console.error('Error creating reservation:', error);
      return {
        success: false,
        reservation: null,
        message: error.message
      };
    }
  },

  // Validate reservation dates
  validateDates: (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        return { valid: false, message: 'Start date cannot be in the past' };
      }

      if (end <= start) {
        return { valid: false, message: 'End date must be after start date' };
      }

      return { valid: true, message: 'Dates are valid' };
    } catch (error) {
      return { valid: false, message: 'Invalid date format' };
    }
  },

  // Calculate reservation duration
  calculateDuration: (startDate, endDate) => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  },

  // Accept reservation (craftsman action)
  acceptReservation: (reservationId) => {
    try {
      const reservations = getAllReservations();
      const reservation = reservations.find(r => r.id === parseInt(reservationId));
      
      if (!reservation) {
        return { success: false, message: 'Reservation not found' };
      }

      if (reservation.status !== 'pending') {
        return { success: false, message: 'Only pending reservations can be accepted' };
      }

      reservation.status = 'confirmed';
      localStorage.setItem('craftopia_reservations', JSON.stringify(reservations));

      return { success: true, message: 'Reservation accepted successfully' };
    } catch (error) {
      console.error('Error accepting reservation:', error);
      return { success: false, message: error.message };
    }
  },

  // Reject reservation (craftsman action)
  rejectReservation: (reservationId) => {
    try {
      const reservations = getAllReservations();
      const reservation = reservations.find(r => r.id === parseInt(reservationId));
      
      if (!reservation) {
        return { success: false, message: 'Reservation not found' };
      }

      if (reservation.status !== 'pending') {
        return { success: false, message: 'Only pending reservations can be rejected' };
      }

      reservation.status = 'cancelled';
      localStorage.setItem('craftopia_reservations', JSON.stringify(reservations));

      return { success: true, message: 'Reservation rejected' };
    } catch (error) {
      console.error('Error rejecting reservation:', error);
      return { success: false, message: error.message };
    }
  }
};