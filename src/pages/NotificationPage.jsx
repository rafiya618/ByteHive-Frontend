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
    <Layout className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">All Notifications</h1>
      <div className="space-y-2">
        {notifications.map((n) => {
          const createdAt = new Date(n.createdAt);
          let displayDate;

          if (isToday(createdAt)) {
            displayDate = "Today at " + format(createdAt, "p");
            // e.g. Today at 10:30 AM
          } else if (isYesterday(createdAt)) {
            displayDate = "Yesterday at " + format(createdAt, "p");
            // e.g. Yesterday at 9:15 PM
          } else {
            displayDate = format(createdAt, "MMM d, yyyy");
            // e.g. Aug 22, 2025
          }

          return (
            <div
              onClick={() => handleNavigation(n)}
              key={n._id}
              style={{ cursor: "pointer" }}
              className={`p-3 rounded-lg ${n.isRead ? "bg-gray-100" : "bg-white shadow"
                }`}
            >
              <div>{n.message}</div>
              <div className="text-xs text-gray-500">{displayDate}</div>
              {/* <div onClick={() => HandleDelete(n._id)} style={{cursor: "pointer", color: "black", fontWeight: "bolder"}}>Delete</div> */}
            </div>
          );
        })}
      </div>
    </Layout>
  );
}
