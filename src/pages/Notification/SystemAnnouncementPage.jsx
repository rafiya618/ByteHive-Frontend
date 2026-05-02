import { useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import Layout from "../../components/Layout/Layout";
import { useNotifications } from "../../context/NotificationContext";

export default function SystemAnnouncementPage() {
  const { announcementId } = useParams();
  const navigate = useNavigate();
  const { notifications } = useNotifications();

  const announcement = useMemo(() => {
    const matches = notifications.filter((n) => {
      const payloadAnnouncementId = n?.data?.announcementId?.toString();
      const entityAnnouncementId = n?.entityId?.toString()?.replace(/^announcement-/, "");
      const directEntityMatch = n?.entityId === `announcement-${announcementId}`;

      return (
        directEntityMatch ||
        payloadAnnouncementId === announcementId ||
        entityAnnouncementId === announcementId
      );
    });

    return matches[0] || null;
  }, [announcementId, notifications]);

  const handleBack = () => navigate("/notifications");

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="text-sm text-purple-300 hover:text-white transition"
          >
            ← Back to notifications
          </button>
        </div>

        <div className="bg-dark-indigo border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-gray-400 mb-3">
            System Announcement
          </p>

          {announcement ? (
            <>
              <h1 className="text-3xl font-bold text-white mb-4">
                {announcement.title || "Announcement"}
              </h1>
              <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-6">
                <span>
                  Status: <span className="text-white">{announcement.status || "sent"}</span>
                </span>
                {announcement.createdAt ? (
                  <span>
                    Received: <span className="text-white">{format(new Date(announcement.createdAt), "PPpp")}</span>
                  </span>
                ) : null}
              </div>

              <div className="prose prose-invert max-w-none text-gray-200">
                <p className="whitespace-pre-wrap leading-7">
                  {announcement.message || "No announcement message was found for this notification."}
                </p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-white mb-4">
                Announcement not found
              </h1>
              <p className="text-gray-300 mb-6">
                The announcement with ID {announcementId} is not in your loaded notifications yet.
              </p>
              <Link
                to="/notifications"
                className="inline-flex items-center rounded-lg bg-purple-500 px-4 py-2 text-sm font-medium text-white hover:bg-purple-600 transition"
              >
                Go to notifications
              </Link>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
