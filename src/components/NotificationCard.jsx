import React from 'react';
import NotificationController from '../controllers/NotificationController';
import '../styles/NotificationCard.css';

const NotificationCard = ({ notification, onMarkAsRead, onDelete, onRefresh }) => {
  const handleMarkAsRead = async (e) => {
    e.stopPropagation();
    try {
      await onMarkAsRead(notification._id);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    try {
      await onDelete(notification._id);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const icon = NotificationController.getNotificationIcon(notification.type);
  const timeAgo = NotificationController.formatNotificationTime(notification.createdAt);

  return (
    <div className={`notification-card ${!notification.isRead ? 'unread' : ''}`}>
      <div className="notification-icon">
        {icon}
      </div>
      
      <div className="notification-content">
        <div className="notification-header">
          <span className={`notification-type ${notification.type.toLowerCase()}`}>
            {notification.type}
          </span>
          <span className="notification-time">{timeAgo}</span>
        </div>
        
        <p className="notification-message">{notification.message}</p>
        
        <div className="notification-actions">
          {!notification.isRead && (
            <button 
              className="btn-mark-read"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              ✓ Mark as Read
            </button>
          )}
          <button 
            className="btn-delete"
            onClick={handleDelete}
            title="Delete notification"
          >
            🗑️ Delete
          </button>
        </div>
      </div>
      
      {!notification.isRead && <div className="unread-indicator"></div>}
    </div>
  );
};

export default NotificationCard;
