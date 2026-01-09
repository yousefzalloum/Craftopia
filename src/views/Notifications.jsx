import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationController from '../controllers/NotificationController';
import NotificationCard from '../components/NotificationCard';
import Loading from '../components/Loading';
import '../styles/Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [groupedNotifications, setGroupedNotifications] = useState(null);

  useEffect(() => {
    fetchNotifications();
    
    // Auto-refresh every 30 seconds while on the page
    const interval = setInterval(() => {
      console.log('🔄 Auto-refreshing notifications...');
      fetchNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const grouped = NotificationController.groupNotificationsByDate(notifications);
      setGroupedNotifications(grouped);
    }
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔔 Fetching notifications for user...');
      const data = await NotificationController.getAllNotifications();
      console.log('✅ Notifications fetched:', data);
      setNotifications(data);
    } catch (err) {
      console.error('❌ Error fetching notifications:', err);
      setError(err.message || 'Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      console.log('📝 Marking notification as read:', notificationId);
      await NotificationController.markNotificationAsRead(notificationId);
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true, read: true } : n)
      );
      
      // Refresh from server to ensure sync
      setTimeout(() => fetchNotifications(), 500);
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
      alert('Failed to mark notification as read. Please try again.');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      console.log('🗑️ Deleting notification:', notificationId);
      await NotificationController.deleteNotification(notificationId);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      console.log('✅ Notification deleted successfully');
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      alert('Failed to delete notification. Please try again.');
      // Refresh to get current state
      fetchNotifications();
    }
  };

  const handlePriceUpdate = async (reservationId, newPrice) => {
    try {
      console.log('💰 Updating price for reservation:', reservationId, 'to:', newPrice);
      await NotificationController.updateNegotiationPrice(reservationId, newPrice);
      alert('Price updated successfully! Customer has been notified.');
      // Refresh notifications
      setTimeout(() => fetchNotifications(), 500);
    } catch (error) {
      console.error('❌ Failed to update price:', error);
      throw error;
    }
  };

  const handleRejectNegotiation = async (reservationId) => {
    try {
      console.log('❌ Rejecting negotiation for reservation:', reservationId);
      await NotificationController.rejectNegotiation(reservationId);
      alert('Negotiation rejected. Customer has been notified.');
      // Refresh notifications
      setTimeout(() => fetchNotifications(), 500);
    } catch (error) {
      console.error('❌ Failed to reject negotiation:', error);
      throw error;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      console.log('📝 Marking all notifications as read');
      await NotificationController.markAllNotificationsAsRead();
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, read: true })));
      
      // Refresh from server to ensure sync
      setTimeout(() => fetchNotifications(), 500);
      
      console.log('✅ All notifications marked as read');
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      alert('Failed to mark all notifications as read. Please try again.');
    }
  };

  const getFilteredNotifications = () => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    } else if (filter === 'read') {
      return notifications.filter(n => n.isRead);
    }
    return notifications;
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount} unread</span>
          )}
        </div>

        <div className="notifications-controls">
          <div className="filter-buttons">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
              onClick={() => setFilter('read')}
            >
              Read ({notifications.length - unreadCount})
            </button>
          </div>

          <div className="action-buttons">
            {unreadCount > 0 && (
              <button 
                className="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
              >
                ✓ Mark All as Read
              </button>
            )}
            <button 
              className="btn-refresh"
              onClick={fetchNotifications}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchNotifications}>Try Again</button>
          </div>
        )}

        {filteredNotifications.length === 0 ? (
          <div className="no-notifications">
            <div className="no-notifications-icon">🔔</div>
            <h2>No notifications</h2>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications yet."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {groupedNotifications && filter === 'all' ? (
              <>
                {groupedNotifications.today.length > 0 && (
                  <div className="notification-group">
                    <h3 className="group-title">Today</h3>
                    {groupedNotifications.today.map(notification => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onRefresh={fetchNotifications}
                        onPriceUpdate={handlePriceUpdate}
                        onReject={handleRejectNegotiation}
                      />
                    ))}
                  </div>
                )}

                {groupedNotifications.yesterday.length > 0 && (
                  <div className="notification-group">
                    <h3 className="group-title">Yesterday</h3>
                    {groupedNotifications.yesterday.map(notification => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onRefresh={fetchNotifications}
                        onPriceUpdate={handlePriceUpdate}
                        onReject={handleRejectNegotiation}
                      />
                    ))}
                  </div>
                )}

                {groupedNotifications.older.length > 0 && (
                  <div className="notification-group">
                    <h3 className="group-title">Older</h3>
                    {groupedNotifications.older.map(notification => (
                      <NotificationCard
                        key={notification._id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                        onDelete={handleDelete}
                        onRefresh={fetchNotifications}
                        onPriceUpdate={handlePriceUpdate}
                        onReject={handleRejectNegotiation}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              filteredNotifications.map(notification => (
                <NotificationCard
                  key={notification._id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onDelete={handleDelete}
                  onRefresh={fetchNotifications}
                  onPriceUpdate={handlePriceUpdate}
                  onReject={handleRejectNegotiation}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
