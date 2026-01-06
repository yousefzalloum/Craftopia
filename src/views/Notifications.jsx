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
      const data = await NotificationController.getAllNotifications();
      setNotifications(data);
    } catch (err) {
      setError('Failed to load notifications. Please try again.');
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await NotificationController.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n._id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await NotificationController.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await NotificationController.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
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
