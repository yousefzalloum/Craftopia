import { get, patch, del, put } from '../utils/api';

const notificationService = {
  // Get all notifications for the authenticated user
  getNotifications: async () => {
    try {
      const data = await get('/notifications');
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId) => {
    try {
      const data = await put('/notifications/read', {
        notificationId: notificationId
      });
      return data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      // Send empty notificationId or no notificationId to mark all as read
      const data = await put('/notifications/read', {});
      return data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      const data = await del(`/notifications/${notificationId}`);
      return data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const notifications = await notificationService.getNotifications();
      return notifications.filter(n => !n.isRead).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
};

export default notificationService;
