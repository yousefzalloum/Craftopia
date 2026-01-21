import React, { useState } from 'react';
import NotificationController from '../controllers/NotificationController.jsx';
import '../styles/NotificationCard.css';

const NotificationCard = ({ notification, onMarkAsRead, onDelete, onRefresh, onPriceUpdate, onReject, showToast }) => {
  const [showPriceForm, setShowPriceForm] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [updating, setUpdating] = useState(false);

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

  const handleUpdatePrice = async (e) => {
    e.stopPropagation();
    if (!newPrice || parseFloat(newPrice) <= 0) {
      if (showToast) showToast({ message: 'Please enter a valid price', type: 'error' });
      return;
    }
    
    try {
      setUpdating(true);
      await onPriceUpdate(notification.reservationId, parseFloat(newPrice));
      setShowPriceForm(false);
      setNewPrice('');
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating price:', error);
      if (showToast) showToast({ message: 'Failed to update price', type: 'error' });
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async (e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to reject this negotiation?')) {
      return;
    }
    
    try {
      setUpdating(true);
      await onReject(notification.reservationId);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error rejecting:', error);
      alert('Failed to reject negotiation');
    } finally {
      setUpdating(false);
    }
  };

  const icon = NotificationController.getNotificationIcon(notification.type);
  const timeAgo = NotificationController.formatNotificationTime(notification.createdAt);
  const isNegotiation = notification.type === 'negotiation' || notification.message?.toLowerCase().includes('negotiate');

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
        
        {isNegotiation && notification.reservationId && !showPriceForm && (
          <div className="negotiation-quick-actions">
            <button 
              className="btn-update-price"
              onClick={(e) => { e.stopPropagation(); setShowPriceForm(true); }}
              disabled={updating}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
              </svg>
              Update Price
            </button>
            <button 
              className="btn-reject-nego"
              onClick={handleReject}
              disabled={updating}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
              Reject
            </button>
          </div>
        )}

        {showPriceForm && (
          <div className="price-update-form">
            <label>New Price ($):</label>
            <div className="price-input-group">
              <input
                type="number"
                min="0"
                step="0.01"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="Enter new price"
                onClick={(e) => e.stopPropagation()}
              />
              <button 
                className="btn-submit-price"
                onClick={handleUpdatePrice}
                disabled={updating}
              >
                {updating ? (
                  <svg className="btn-icon spinning" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
                  </svg>
                ) : (
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                  </svg>
                )}
                Submit
              </button>
              <button 
                className="btn-cancel-price"
                onClick={(e) => { e.stopPropagation(); setShowPriceForm(false); }}
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        <div className="notification-actions">
          {!notification.isRead && (
            <button 
              className="btn-mark-read"
              onClick={handleMarkAsRead}
              title="Mark as read"
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
              </svg>
              Mark as Read
            </button>
          )}
          <button 
            className="btn-delete"
            onClick={handleDelete}
            title="Delete notification"
          >
            <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
            Delete
          </button>
        </div>
      </div>
      
      {!notification.isRead && <div className="unread-indicator"></div>}
    </div>
  );
};

export default NotificationCard;
