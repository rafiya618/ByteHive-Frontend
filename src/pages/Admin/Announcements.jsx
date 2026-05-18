import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { getRequiredUrl } from "../../utils/env";

const ADMIN_BASE = getRequiredUrl("VITE_ADMIN_SERVICE_URL");

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    message: "",
    audience: "all_active",
    scheduledFor: "",
    sendImmediately: true,
  });
  const [announcementSaving, setAnnouncementSaving] = useState(false);
  const [announcementError, setAnnouncementError] = useState("");

  const handleAnnouncementChange = (key, value) => {
    setAnnouncementForm((s) => ({ ...s, [key]: value }));
  };

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${ADMIN_BASE}/api/admin/announcements`);
      setAnnouncements(res.data?.announcements || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncementError("");
    setAnnouncementSaving(true);

    try {
      const payload = {
        title: announcementForm.title,
        message: announcementForm.message,
        audience: announcementForm.audience,
        scheduledFor: announcementForm.sendImmediately ? null : announcementForm.scheduledFor || null,
        sendImmediately: announcementForm.sendImmediately,
      };
      const res = await axios.post(`${ADMIN_BASE}/api/admin/announcements`, payload);
      const created = res.data?.announcement || res.data;
      toast.success(announcementForm.sendImmediately ? "Announcement sent successfully" : "Announcement scheduled successfully");
      setAnnouncementForm({ title: "", message: "", audience: "all_active", scheduledFor: "", sendImmediately: true });
      if (created) setAnnouncements((prev) => [created, ...prev]);
    } catch (err) {
      console.error(err);
      setAnnouncementError(err?.response?.data?.message || "Failed to create announcement");
    } finally {
      setAnnouncementSaving(false);
    }
  };

  const handleDeleteAnnouncement = async (announcementId, status) => {
    const confirmed = window.confirm(
      status === "scheduled"
        ? "Delete this scheduled announcement before it is sent?"
        : "Delete this announcement?"
    );

    if (!confirmed) return;

    try {
      await axios.delete(`${ADMIN_BASE}/api/admin/announcements/${announcementId}`);
      setAnnouncements((prev) => prev.filter((announcement) => announcement._id !== announcementId));
      toast.success("Announcement deleted");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete announcement");
    }
  };

  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />

      <div className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h2 className="font-fenix text-[28px] text-white font-normal mb-2">Notification Management</h2>
          <p className="text-gray-400 text-sm">Send platform-wide announcements and schedule important updates</p>
        </div>

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading announcements...</div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <form onSubmit={handleCreateAnnouncement} className="xl:col-span-1">
              <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-6 sticky top-8 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <h3 className="text-white font-fenix text-lg font-normal mb-6">Create Announcement</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-white/90 font-fenix mb-2">Title</label>
                    <input
                      type="text"
                      value={announcementForm.title}
                      onChange={(e) => handleAnnouncementChange("title", e.target.value)}
                      className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle"
                      placeholder="Important update for all users"
                      maxLength={140}
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">{announcementForm.title.length}/140</p>
                  </div>

                  <div>
                    <label className="block text-white/90 font-fenix mb-2">Message</label>
                    <textarea
                      value={announcementForm.message}
                      onChange={(e) => handleAnnouncementChange("message", e.target.value)}
                      className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle min-h-[140px] resize-none"
                      placeholder="Write the update your users should see..."
                      maxLength={2000}
                      required
                    />
                    <p className="text-[11px] text-gray-500 mt-1">{announcementForm.message.length}/2000</p>
                  </div>

                  <div>
                    <label className="block text-white/90 font-fenix mb-2">Audience</label>
                    <select
                      value={announcementForm.audience}
                      onChange={(e) => handleAnnouncementChange("audience", e.target.value)}
                      className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle"
                    >
                      <option value="all_active">All active users only</option>
                      <option value="all_users">All users (including inactive)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white/90 font-fenix mb-3">When to send</label>

                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        onClick={() => handleAnnouncementChange("sendImmediately", true)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition border ${announcementForm.sendImmediately ? "bg-periwinkle text-white border-periwinkle shadow-[0_0_0_1px_rgba(176,186,255,0.35)] hover:border-white" : "bg-navbar-bg border-navbar-border text-desc hover:border-periwinkle hover:text-white"}`}
                      >
                        Send Now
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAnnouncementChange("sendImmediately", false)}
                        className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition border ${!announcementForm.sendImmediately ? "bg-periwinkle text-white border-periwinkle shadow-[0_0_0_1px_rgba(176,186,255,0.35)] hover:border-white" : "bg-navbar-bg border-navbar-border text-desc hover:border-periwinkle hover:text-white"}`}
                      >
                        Schedule
                      </button>
                    </div>

                    {!announcementForm.sendImmediately && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <input
                              type="date"
                              value={announcementForm.scheduledFor.split("T")[0] || ""}
                              onChange={(e) => {
                                const time = announcementForm.scheduledFor.split("T")[1] || "09:00";
                                handleAnnouncementChange("scheduledFor", `${e.target.value}T${time}`);
                              }}
                              className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle hover:border-periwinkle caret-periwinkle transition cursor-text"
                              required={!announcementForm.sendImmediately}
                            />
                          </div>
                          <div>
                            <input
                              type="time"
                              value={announcementForm.scheduledFor.split("T")[1] || "09:00"}
                              onChange={(e) => {
                                const date = announcementForm.scheduledFor.split("T")[0] || new Date().toISOString().split("T")[0];
                                handleAnnouncementChange("scheduledFor", `${date}T${e.target.value}`);
                              }}
                              className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle hover:border-periwinkle caret-periwinkle transition cursor-text"
                              required={!announcementForm.sendImmediately}
                            />
                          </div>
                        </div>

                        {announcementForm.scheduledFor && (
                          <p className="text-[11px] text-periwinkle">📅 {new Date(announcementForm.scheduledFor).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {announcementForm.scheduledFor.split("T")[1]}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {announcementError ? <div className="text-sm text-red-400">{announcementError}</div> : null}

                  <button type="submit" disabled={announcementSaving || (!announcementForm.sendImmediately && !announcementForm.scheduledFor)} className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-periwinkle to-medium-slate-blue px-5 py-3 text-sm font-medium text-white border border-periwinkle transition hover:from-periwinkle hover:to-medium-slate-blue hover:border-white hover:-translate-y-[1px] hover:shadow-lg hover:shadow-periwinkle/25 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none">
                    {announcementSaving ? (<>Processing...</>) : (announcementForm.sendImmediately ? "Send" : "Schedule")}
                  </button>
                </div>
              </div>
            </form>

            <div className="xl:col-span-2">
              <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-white font-fenix text-lg font-normal">Recent Announcements</h3>
                  <span className="text-xs text-gray-400 bg-rich-black/60 rounded-full px-3 py-1 border border-navbar-border">{announcements.length} total</span>
                </div>

                {announcements.length === 0 ? (
                  <div className="text-center text-gray-400 text-sm py-16">
                    <span className="material-icons text-5xl text-gray-600 mx-auto mb-4 block">campaign</span>
                    <p>No announcements yet</p>
                    <p className="text-xs mt-2">Create your first announcement using the form</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {announcements.map((announcement) => (
                      <div key={announcement._id} className="bg-rich-black border border-navbar-border rounded-2xl p-4 sm:p-5 hover:border-periwinkle/50 transition shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-fenix text-[18px] font-normal">{announcement.title}</h4>
                              <span className={`text-[10px] uppercase tracking-wider font-medium rounded-full px-2 py-1 border ${announcement.status === "sent" ? "bg-celadon/10 border-celadon/30 text-celadon" : announcement.status === "sending" ? "bg-medium-slate-blue/10 border-medium-slate-blue/30 text-medium-slate-blue" : announcement.status === "scheduled" ? "bg-periwinkle/10 border-periwinkle/30 text-periwinkle" : "bg-red-400/10 border-red-400/30 text-red-400"}`}>{announcement.status}</span>
                            </div>
                            <p className="text-desc text-sm line-clamp-2">{announcement.message}</p>
                          </div>

                          {announcement.status === "scheduled" && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAnnouncement(announcement._id, announcement.status)}
                              className="inline-flex items-center gap-2 rounded-lg border border-red-400/70 px-3 py-2 text-sm font-medium text-red-300 transition hover:border-red-300 hover:bg-red-500/10 hover:text-red-200"
                              title="Delete scheduled announcement"
                            >
                              <span className="material-icons text-[18px]">delete_outline</span>
                              Delete
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 p-3 bg-navbar-bg/50 rounded-lg  border-navbar-border">
                          <div>
                            <p className="text-[11px] text-gray-400 uppercase">Audience</p>
                            <p className="text-xs text-white font-medium">{announcement.audience === "all_users" ? "All users" : "Active users"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 uppercase">Scheduled</p>
                            <p className="text-xs text-white font-medium">{announcement.scheduledFor ? new Date(announcement.scheduledFor).toLocaleDateString() : "Now"}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 uppercase">Delivered</p>
                            <p className="text-xs text-white font-medium">{announcement.deliverySummary?.delivered || 0}/{announcement.deliverySummary?.totalRecipients || 0}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-gray-400 uppercase">Sent</p>
                            <p className="text-xs text-white font-medium">{announcement.sentAt ? new Date(announcement.sentAt).toLocaleDateString() : "—"}</p>
                          </div>
                        </div>

                        {announcement.deliverySummary?.error && (<div className="text-[11px] text-red-400 bg-red-400/10 border border-red-400/20 rounded p-2">Error: {announcement.deliverySummary.error}</div>)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
