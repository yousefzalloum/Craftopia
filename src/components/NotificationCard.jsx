import React, { useState } from 'react';
import NotificationController from '../controllers/NotificationController';
import '../styles/NotificationCard.css';

const NotificationCard = ({ notification, onMarkAsRead, onDelete, onRefresh, onPriceUpdate, onReject }) => {
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
      alert('Please enter a valid price');
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
      alert('Failed to update price');
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
              💰 Update Price
            </button>
            <button 
              className="btn-reject-nego"
              onClick={handleReject}
              disabled={updating}
            >
              ❌ Reject
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
                {updating ? '⏳' : '✓'} Submit
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
