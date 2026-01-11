import { get, patch, del, put, post } from '../utils/api';

const notificationService = {
  // Get all notifications for the authenticated user
  getNotifications: async () => {
    try {
      const data = await get('/notifications');
      
      // Handle different response structures
      if (Array.isArray(data)) {
        return data;
      } else if (data.notifications && Array.isArray(data.notifications)) {
        return data.notifications;
      } else if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('❌ Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      console.log('📡 Marking notification as read:', notificationId);
      // Try PATCH method first (RESTful standard)
      try {
        const data = await patch(`/notifications/${notificationId}`, {
          isRead: true
        });
        return data;
      } catch (patchError) {
        // Fallback to PUT if PATCH doesn't work
        console.log('⚠️ PATCH failed, trying PUT method');
        const data = await put('/notifications/read', {
          notificationId: notificationId
        });
        return data;
      }
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      console.log('📡 Marking all notifications as read');
      const data = await put('/notifications/read', {});
      return data;
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      console.log('📡 Deleting notification:', notificationId);
      const data = await del(`/notifications/${notificationId}`);
      return data;
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const notifications = await notificationService.getNotifications();
      const unreadCount = notifications.filter(n => !n.isRead && !n.read).length;
      return unreadCount;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      return 0;
    }
  },

  // Update price for a reservation (artisan response to negotiation)
  updateNegotiationPrice: async (reservationId, newPrice) => {
    try {
      const data = await put(`/reservations/${reservationId}/update-price`, {
        agreed_price: newPrice
      });
      console.log('✅ Price updated successfully');
      return data;
    } catch (error) {
      console.error('❌ Error updating price:', error);
      throw error;
    }
  },

  // Reject negotiation (artisan rejects customer's price request)
  rejectNegotiation: async (reservationId) => {
    try {
      console.log('📡 Rejecting negotiation for reservation:', reservationId);
      const data = await put(`/reservations/${reservationId}/reject-negotiation`, {});
      console.log('✅ Negotiation rejected successfully');
      return data;
    } catch (error) {
      console.error('❌ Error rejecting negotiation:', error);
      throw error;
    }
  }
};

export default notificationService;
