import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BellRing } from "lucide-react";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('https://67e631656530dbd3110f0322.mockapi.io/drnotifiy');
      const sorted = res.data
        .map(n => ({
          ...n,
          createdAt: n.createdAt && !isNaN(new Date(n.createdAt)) ? n.createdAt : new Date().toISOString(),
          unread: n.unread ?? true,
          message: n.message || "You have a new notification"
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const getTimeAgo = (time) => {
    const date = new Date(time);
    if (isNaN(date)) return "Unknown time";

    const diff = (Date.now() - date.getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hr${Math.floor(diff / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diff / 86400)} day${Math.floor(diff / 86400) > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="max-w-5xl mx-auto px-6 sm:px-10 py-10">
      <div className="flex items-center gap-3 mb-8">
        <BellRing className="text-[var(--primary-color)] w-8 h-8" />
        <h2 className="text-3xl font-bold text-[var(--primary-color)]">Your Notifications</h2>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border text-center shadow-sm">
          <p className="text-gray-600 text-lg">You're all caught up 🎉</p>
        </div>
      ) : (
        <div className="space-y-5">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`relative p-6 border rounded-xl shadow-sm hover:shadow-md transition bg-white ${
                n.unread ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{n.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{getTimeAgo(n.createdAt)}</p>
                </div>
                {n.unread && (
                  <div className="w-2 h-2 mt-1 bg-[var(--accent-color)] rounded-full" />
                )}
              </div>

              {n.showPayButton && (
                <button
                  onClick={() => console.log("Pay now clicked for", n.id)}
                  className="mt-4 bg-[var(--accent-color)] hover:bg-[#E0B320] text-[var(--primary-color)] text-xs font-medium px-4 py-2 rounded-full"
                >
                  Pay Now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationPage;
