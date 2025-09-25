// src/components/UI/NotificationSystem.jsx
import React from "react";

const NotificationItem = ({ notification, onRemove }) => {
  const { id, type, message, icon, persistent } = notification;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500 bg-opacity-10 border-green-500',
          text: 'text-green-400',
          icon: 'text-green-400',
        };
      case 'error':
        return {
          bg: 'bg-red-500 bg-opacity-10 border-red-500',
          text: 'text-red-400',
          icon: 'text-red-400',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-500 bg-opacity-10 border-blue-500',
          text: 'text-blue-400',
          icon: 'text-blue-400',
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`flex items-start space-x-3 p-4 rounded-lg border backdrop-blur-sm ${styles.bg} animate-slide-in`}
    >
      {/* Icon */}
      <span className={`material-icons text-xl ${styles.icon} flex-shrink-0`}>
        {icon}
      </span>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className={`font-lato text-sm ${styles.text}`}>
          {message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(id)}
        className={`${styles.text} hover:opacity-70 transition-opacity flex-shrink-0`}
        title="Dismiss"
      >
        <span className="material-icons text-lg">close</span>
      </button>
    </div>
  );
};

const NotificationSystem = ({ notifications, onRemove }) => {
  if (!notifications.length) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm w-full">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
};

export default NotificationSystem;