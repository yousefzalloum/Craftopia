import notificationService from '../services/notificationService';

class NotificationController {
  // Get all notifications
  async getAllNotifications() {
    try {
      const notifications = await notificationService.getNotifications();
      // Sort by date - newest first
      return notifications.sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  }

  // Get unread notifications
  async getUnreadNotifications() {
    try {
      const notifications = await notificationService.getNotifications();
      return notifications.filter(n => !n.isRead);
    } catch (error) {
      console.error('Failed to fetch unread notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      await notificationService.markAsRead(notificationId);
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  }

  // Mark all as read
  async markAllNotificationsAsRead() {
    try {
      await notificationService.markAllAsRead();
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  }

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await notificationService.deleteNotification(notificationId);
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      throw error;
    }
  }

  // Get unread count
  async getUnreadCount() {
    try {
      return await notificationService.getUnreadCount();
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  // Group notifications by date
  groupNotificationsByDate(notifications) {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const grouped = {
      today: [],
      yesterday: [],
      older: []
    };

    notifications.forEach(notification => {
      const notificationDate = new Date(notification.createdAt);
      if (this.isSameDay(notificationDate, today)) {
        grouped.today.push(notification);
      } else if (this.isSameDay(notificationDate, yesterday)) {
        grouped.yesterday.push(notification);
      } else {
        grouped.older.push(notification);
      }
    });

    return grouped;
  }

  // Helper to check if two dates are the same day
  isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  // Format notification time
  formatNotificationTime(createdAt) {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / 1000 / 60);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    const icons = {
      'Booking': '📅',
      'Review': '⭐',
      'Payment': '💰',
      'Message': '💬',
      'System': '🔔'
    };
    return icons[type] || '🔔';
  }
}

export default new NotificationController();
