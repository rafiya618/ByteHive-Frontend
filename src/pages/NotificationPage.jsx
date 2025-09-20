// pages/NotificationsPage.jsx
import { useState, useEffect } from "react";
import { deleteNotification, getNotifications } from "../api/notificationApi";
import { useAuth } from "../context/auth";
import { useNotifications } from "../context/NotificationContext";
import { format, isToday, isYesterday } from "date-fns";
import Layout from "../components/Layout/Layout";
import { useNavigate } from "react-router-dom";

export default function NotificationPage() {
  const [cursor, setCursor] = useState(null);
  const [loading, setLoading] = useState(false);
  const { auth } = useAuth();
  const { notifications, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    markAllAsRead();
  }, []); // run once on mount

  const HandleDelete = async (id) => {
    try {
      await deleteNotification(id)
    } catch (error) {

    }
  }

  const handleNavigation = (n) => {
    console.log('n', n)
    const isAggregated = (n.meta?.count ?? 1) > 1;
    console.log('isAggregated', isAggregated)

    if (isAggregated) {
      switch (n.triggerType) {
        // case "post":
        //   navigate(`/posts/${n.entityId}`, {
        //     state: {
        //       triggerType: "post",
        //       triggerId: n.triggerId,
        //       entityId: n.entityId,
        //     },
        //   });
        //   break;

        case "comment":
          navigate(`/comment`, {
            state: {
              triggerType: "comment",
              triggerId: n.triggerId,
              entityId: n.entityId,
            },
          });
          break;

        case "reply":
          navigate(`/comment`, {
            state: {
              triggerType: "reply",
              triggerId: n.entityId,
              entityId: n.entityId,
              isAggregation: true
            },
          });
          break;

        default:
          navigate(`/`);
      }

    } else {
      switch (n.triggerType) {
        case "post":
          navigate(`/posts/${n.entityId}`, {
            state: {
              triggerType: "post",
              triggerId: n.triggerId,
              entityId: n.entityId,
            },
          });
          break;

        case "comment":
          navigate(`/comment`, {
            state: {
              triggerType: "comment",
              triggerId: n.triggerId,
              entityId: n.entityId,
            },
          });
          break;

        case "like":
          navigate(`/comment`, {
            state: {
              triggerType: "like",
              triggerId: n.triggerId,
              entityId: n.entityId,
            },
          });
          break;

        case "reply":
          navigate(`/comment`, {
            state: {
              triggerType: "reply",
              triggerId: n.triggerId,
              entityId: n.entityId,
            },
          });
          break;

        case "profile":
          navigate(`/profile/${n.entityId}`, {
            state: {
              triggerType: "profile",
              triggerId: n.triggerId,
              entityId: n.entityId,
            },
          });
          break;

        default:
          navigate(`/`);
      }
    }

  };


  return (
    <Layout>
      <div className="max-w-xl mx-auto w-full">
        <h1 className="text-3xl font-bold mb-6 text-white text-center md:text-left">
          All Notifications
        </h1>

        <div className="space-y-4">
          {notifications.length === 0 ? (
            <p className="text-gray-400 text-center">No notifications yet</p>
          ) : (
            notifications.map((n) => {
              const createdAt = new Date(n.createdAt);
              let displayDate = isToday(createdAt)
                ? `Today at ${format(createdAt, "p")}`
                : isYesterday(createdAt)
                  ? `Yesterday at ${format(createdAt, "p")}`
                  : format(createdAt, "MMM d, yyyy");

              return (
                <div
                  key={n._id}
                  onClick={() => handleNavigation(n)}
                  className={`cursor-pointer p-4 rounded-xl transition-all duration-300
                    ${n.isRead ? "bg-gray-800" : "bg-white text-black shadow-lg"}
                    hover:scale-[1.02] hover:shadow-2xl
                  `}
                >
                  <div className="font-medium">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{displayDate}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
