// pages/NotificationsPage.jsx
import { useState, useEffect } from "react";
import { useAuth } from "../../context/auth";
import { useNotifications } from "../../context/NotificationContext";
import { communityApi } from "../../api/communityApi";
import { format, isToday, isYesterday } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  MessageSquare,
  Heart,
  UserPlus,
  AtSign,
  ClipboardList,
  CheckCircle2,
  Users,
  XCircle,
  Flame,
  Info
} from "lucide-react";
import Layout from "../../components/Layout/Layout";

export default function NotificationPage() {
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { notifications, markAllAsRead, deleteNotif } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    markAllAsRead();
  }, []); // run once on mount

  const handleDelete = async (notificationId, e) => {
    e.stopPropagation(); // Prevent click event from bubbling up
    try {
      await deleteNotif(notificationId);
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleRequestResponse = async (e, notification, action) => {
    e.stopPropagation();
    try {
      const communityId = notification.entityId;
      // senderId is now guaranteed to be a string ID because we populate senderDetails virtual instead
      const requesterId = notification.senderId;

      await communityApi.respondToJoinRequest(communityId, requesterId, action);

      // Delete notification after handling
      await deleteNotif(notification._id);

      // Optional: Show success toast/message
    } catch (error) {
      console.error(`Error ${action}ing request: `, error);
      alert(`Failed to ${action} request`);
    }
  };

  const groupNotificationsByDate = () => {
    const grouped = {
      today: [],
      yesterday: [],
      older: []
    };

    notifications.forEach((n) => {
      const createdAt = new Date(n.createdAt);
      if (isToday(createdAt)) {
        grouped.today.push(n);
      } else if (isYesterday(createdAt)) {
        grouped.yesterday.push(n);
      } else {
        grouped.older.push(n);
      }
    });

    return grouped;
  };

  const grouped = groupNotificationsByDate();

  const handleNavigate = (n) => {
    // Navigate based on notification content
    // Common shapes: post like/comment, follow, system, mention
    // Prefer explicit targets provided by backend payload
    const target = n.target || {}; // optional structured target
    const type = n.triggerType;

    // If backend provided a navigate path, use it directly
    if (n.navigate && typeof n.navigate === 'string') {
      navigate(n.navigate);
      return;
    }

    // Post-related notifications (like/comment/mention on a post)
    const postId = n.postId || target.postId || (n.meta && n.meta.postId);
    if ((type === 'like' || type === 'comment' || type === 'mention') && postId) {
      // Navigate to post detail. Ensure path is correct and request includes unapproved posts
      navigate(`/post/${postId}`, { state: { includeUnapproved: true } });
      return;
    }

    // Follow notifications: navigate to user profile if available
    const userId = n.userId || target.userId || (n.meta && n.meta.userId);
    if (type === 'follow' && userId) {
      navigate(`/profile/${userId}`);
      return;
    }

    // Community-related notifications: open community page if provided
    const communityId = n.communityId || target.communityId || (n.meta && n.meta.communityId) || n.entityId;
    if (communityId && (type === 'join_request' || type === 'request_approved' || n.entityType === 'community')) {
      navigate(`/community/${communityId}`);
      return;
    }

    // Fallback: posts page or home
    navigate('/posts');
  };

  const getNotificationIcon = (type) => {
    const iconProps = { size: 20, strokeWidth: 2.5 };

    switch (type) {
      case 'likePost':
      case 'likeComment':
      case 'like':
        return <Heart {...iconProps} className="text-rose-500 fill-rose-500" />;
      case 'comment':
      case 'reply':
        return <MessageSquare {...iconProps} className="text-sky-400" />;
      case 'follow':
        return <UserPlus {...iconProps} className="text-violet-400" />;
      case 'mention':
        return <AtSign {...iconProps} className="text-amber-400" />;
      case 'community_follow':
        return <Users {...iconProps} className="text-indigo-400" />;
      case 'join_request':
        return <ClipboardList {...iconProps} className="text-orange-400" />;
      case 'request_approved':
        return <CheckCircle2 {...iconProps} className="text-emerald-500" />;
      case 'request_declined':
        return <XCircle {...iconProps} className="text-rose-400" />;
      case 'streak_warning':
        return <Flame {...iconProps} className="text-orange-500 fill-orange-500" />;
      case 'system':
      case 'security':
        return <Info {...iconProps} className="text-blue-500" />;
      default:
        return <Bell {...iconProps} className="text-slate-400" />;
    }
  };

  const isSocialNotification = (type) => {
    const socialTypes = ['comment', 'reply', 'likePost', 'likeComment', 'like', 'follow', 'join_request', 'request_approved', 'community_follow', 'mention'];
    return socialTypes.includes(type);
  };

  const renderMessage = (message) => {
    if (!message) return null;

    // Capitalize first letter if it's a simple string
    let displayMessage = message;
    if (typeof displayMessage === 'string' && displayMessage.length > 0) {
      displayMessage = displayMessage.charAt(0).toUpperCase() + displayMessage.slice(1);
    }

    // Split by **text** and keep the delimiters
    const parts = displayMessage.split(/(\*\*.*?\*\*)/);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <span key={i} className="font-bold text-white transition-all group-hover:text-purple-300">{part.slice(2, -2)}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  const renderNotificationGroup = (title, notifs) => {
    if (notifs.length === 0) return null;

    return (
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-3">{title}</h2>
        <div className="space-y-3">
          {notifs.map((n) => {
            const createdAt = new Date(n.createdAt);
            const displayTime = format(createdAt, "h:mm a");

            return (
              <div
                key={n._id}
                onClick={() => handleNavigate(n)}
                className={`group p-4 rounded-2xl transition-all duration-300 relative cursor-pointer
                  ${n.status === 'unread'
                    ? 'bg-linear-to-r from-purple-900/30 to-indigo-900/30 border-2 border-purple-500/30'
                    : 'bg-dark-indigo border-2 border-gray-800 shadow-lg'
                  }
                  hover:shadow-2xl hover:border-purple-500/50
                `}
              >
                {/* Delete Button */}
                <button
                  onClick={(e) => handleDelete(n._id, e)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity
                    bg-red-500/20 hover:bg-red-500/40 text-red-400 hover:text-red-300
                    w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold"
                  title="Delete notification"
                >
                  ✕
                </button>

                <div className="flex items-center gap-4">
                  {/* Left: Avatar with Icon Overlay (Only for Social) */}
                  {isSocialNotification(n.triggerType) ? (
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-gray-800 group-hover:border-purple-500/50 transition-colors bg-gray-900">
                        {n.senderDetails?.profileImage ? (
                          <img
                            src={n.senderDetails.profileImage}
                            alt={n.senderDetails.username || "User"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 text-white font-bold text-xl">
                            {(n.senderDetails?.username || "S").charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {/* Floating Action Icon */}
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gray-900 border-2 border-dark-indigo flex items-center justify-center shadow-lg">
                        {getNotificationIcon(n.triggerType)}
                      </div>
                    </div>
                  ) : (
                    /* Centered System Icon for non-social alerts */
                    <div className="shrink-0 w-14 h-14 rounded-full bg-gray-800/50 border border-gray-700/50 flex items-center justify-center group-hover:border-purple-500/30 transition-colors">
                      {getNotificationIcon(n.triggerType)}
                    </div>
                  )}

                  {/* Right: Message Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] text-gray-200 leading-snug">
                      {renderMessage(n.message)}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[13px] text-gray-500 font-medium">{displayTime}</span>
                      {n.status === 'unread' && (
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                      )}
                    </div>

                    {/* Join Request Actions */}
                    {n.triggerType === 'join_request' && (
                      <div className="flex gap-3 mt-3">
                        <button
                          onClick={(e) => handleRequestResponse(e, n, 'accept')}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleRequestResponse(e, n, 'decline')}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🔔 Notifications
          </h1>
          <p className="text-gray-400">
            Stay updated with your activity and system updates
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
            <p className="text-gray-400 mt-4">Loading notifications...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && notifications.length === 0 && (
          <div className="text-center py-16 bg-dark-indigo rounded-2xl border-2 border-gray-800">
            <div className="text-6xl mb-4">🔕</div>
            <h3 className="text-2xl font-bold text-white mb-2">All caught up!</h3>
            <p className="text-gray-400">
              You don't have any notifications right now.
            </p>
          </div>
        )}

        {/* Notifications Grouped by Date */}
        {!loading && notifications.length > 0 && (
          <>
            {renderNotificationGroup("Today", grouped.today)}
            {renderNotificationGroup("Yesterday", grouped.yesterday)}
            {renderNotificationGroup("Earlier", grouped.older)}
          </>
        )}
      </div>
    </Layout>
  );
}
