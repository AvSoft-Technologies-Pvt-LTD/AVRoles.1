import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Search, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://67e631656530dbd3110f0322.mockapi.io/notify');
      const sorted = res.data
        .map((n) => ({
          ...n,
          unread: n.unread ?? true
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationRead = async (notificationId) => {
    try {
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, unread: false }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  };

  const getTimeAgo = (createdAt) => {
    const now = new Date();
    const time = new Date(createdAt);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  };

  const getDateCategory = (createdAt) => {
    const now = new Date();
    const time = new Date(createdAt);
    const diffDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return 'This Week';
    if (diffDays < 30) return 'This Month';
    return 'Earlier';
  };

  const filteredNotifications = notifications.filter(notification => {
    if (searchTerm && !notification.message.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filter === 'unread' && !notification.unread) return false;
    if (filter === 'payment' && !notification.showPayButton) return false;
    return true;
  });

  const groupedNotifications = {};
  filteredNotifications.forEach(notification => {
    const category = getDateCategory(notification.createdAt);
    if (!groupedNotifications[category]) {
      groupedNotifications[category] = [];
    }
    groupedNotifications[category].push(notification);
  });

  const categories = Object.keys(groupedNotifications).sort((a, b) => {
    const order = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'];
    return order.indexOf(a) - order.indexOf(b);
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full mx-auto pt-4 sm:pt-6 px-3 sm:px-4 md:px-6 lg:px-8 pb-16 sm:pb-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
          <Link
            to="/patientdashboard"
            className="text-[var(--primary-color)] hover:text-[var(--accent-color)] flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--primary-color)] flex items-center">
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 sm:ml-3 bg-[var(--accent-color)] text-[var(--primary-color)] text-xs sm:text-sm rounded-full h-5 sm:h-6 px-1.5 sm:px-2 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </h1>
          <div className="ml-auto flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center text-xs sm:text-sm font-medium text-[var(--primary-color)] hover:text-[var(--accent-color)]"
              >
                <CheckCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1" />
                Mark all as read
              </button>
            )}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 sm:pl-10 pr-2.5 sm:pr-3 py-1.5 sm:py-2 w-full rounded-lg bg-white text-[var(--primary-color)] placeholder-gray-400 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] text-xs sm:text-sm"
            />
          </div>
          <div className="flex gap-1.5 sm:gap-2">
            {['all', 'unread', 'payment'].map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium ${
                  filter === type
                    ? 'bg-[var(--primary-color)] text-white'
                    : 'bg-white text-[var(--primary-color)] border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading, Empty, or Notifications */}
        {loading ? (
          <div className="flex justify-center items-center py-12 sm:py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-[var(--accent-color)]"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-10 text-center">
            <Bell className="h-8 w-8 sm:h-10 sm:w-10 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-[var(--primary-color)] mb-1.5 sm:mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 text-xs sm:text-sm">
              {searchTerm || filter !== 'all'
                ? 'Try adjusting your search or filter to see more results.'
                : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {categories.map((category) => (
              <div key={category}>
                <h2 className="font-semibold text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                  {category}
                </h2>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                  {groupedNotifications[category].map((notification) => (
                    <div
                      key={notification.id}
                      className={`group p-3 sm:p-4 ${
                        notification.unread ? 'bg-[var(--accent-color)]/10' : 'bg-white'
                      } hover:bg-[var(--accent-color)]/5 cursor-pointer`}
                      onClick={() => handleNotificationRead(notification.id)}
                    >
                      <div className="flex justify-between gap-2 sm:gap-3 items-start">
                        <div className="flex-1">
                          <p
                            className={`text-xs sm:text-sm text-[var(--primary-color)] ${
                              notification.unread ? 'font-medium' : 'font-normal'
                            }`}
                          >
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-500 mt-1 block">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>
                        {notification.unread && (
                          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 mt-0.5 bg-[var(--accent-color)] rounded-full"></div>
                        )}
                      </div>
                      {notification.showPayButton && (
                        <div className="mt-2.5 sm:mt-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/patientdashboard/payment', {
                                state: {
                                  doctorName: notification.doctorName || 'Dr. John Doe',
                                  consultationFee: notification.consultationFee || '500'
                                }
                              });
                            }}
                            className="bg-[var(--accent-color)] hover:bg-[var(--accent-color)] text-[var(--primary-color)] text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm"
                          >
                            Pay Now
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
