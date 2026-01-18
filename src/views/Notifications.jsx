import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import NotificationController from '../controllers/NotificationController.jsx';
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
          <h1>🔔 Notifications</h1>
          <div className="header-divider"></div>
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
                <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                </svg>
                Mark All as Read
              </button>
            )}
            <button 
              className="btn-refresh"
              onClick={fetchNotifications}
            >
              <svg className="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
              </svg>
              Refresh
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
            <svg className="no-notifications-icon" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
            </svg>
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
