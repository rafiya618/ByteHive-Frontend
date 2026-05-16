import React from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useAuth } from "../../context/auth";
import { parseEventDate } from "../../utils/eventCalendar";

const EventCard = ({
  event,
  onEdit,
  onDelete,
  onToggleInterest,
  onSetReminder,
  onAddToCalendar,
  isInterested = false,
  reminderMinutes = 30,
  isNear = false,
}) => {
  const { auth } = useAuth();
  const userId = auth?.user?._id || auth?.user?.id;
  const isOwner = userId && event.createdBy === userId;

  const {
    thumbnail,
    category,
    event_name,
    small_event_description,
    event_date,
    location,
    registration_link,
  } = event;

  const dt = parseEventDate(event);
  const date = dt ? dt.toLocaleDateString() : "TBD";
  const time = dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";
  const countdown = dt ? formatDistanceToNowStrict(dt, { addSuffix: true }) : "No date";

  const handleView = () => {
    if (registration_link) {
      window.open(registration_link, "_blank", "noopener,noreferrer");
    } else {
      alert("No registration link provided for this event.");
    }
  };

  return (
    <div
      className={`event-neon-card bg-navbar-bg border rounded-2xl overflow-hidden flex flex-col ${
        isNear ? "border-[#f59e0b]" : "border-navbar-border"
      }`}
    >
      <div className="h-48 w-full relative">
        <img
          src={thumbnail || "https://via.placeholder.com/600x300?text=No+image"}
          alt={event_name}
          className="w-full h-full object-cover"
        />
        {isNear && (
          <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-lg bg-[#f59e0b] text-black font-semibold">
            Near Event
          </span>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <span className="bg-chip text-white/80 text-xs px-3 py-1 rounded-xl w-fit">{category}</span>
        <h3 className="font-fenix text-xl text-white leading-tight">{event_name}</h3>
        <p className="text-desc text-sm flex-1">{small_event_description}</p>

        <div className="text-sm text-periwinkle space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-icons text-base">event</span>
            {date}
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-base">schedule</span>
            {time}
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-base">timer</span>
            {countdown}
          </div>
          <div className="flex items-center gap-2">
            <span className="material-icons text-base">place</span>
            {location || "Online"}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={handleView}
            className="event-btn-primary px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            View Event <span className="material-icons text-sm">open_in_new</span>
          </button>

          <button
            onClick={() => onToggleInterest?.(event)}
            className={`px-4 py-3 rounded-xl transition-colors font-semibold ${
              isInterested
                ? "event-btn-interested"
                : "event-btn-secondary"
            }`}
          >
            {isInterested ? "Interested" : "Mark Interested"}
          </button>

          <button
            onClick={() => onAddToCalendar?.(event)}
            className="sm:col-span-2 event-btn-accent px-4 py-3 rounded-xl transition-colors"
          >
            Add to Calendar
          </button>
        </div>

        {isOwner && (
          <div className="mt-1 flex items-center gap-2">
            <button
              onClick={() => onEdit && onEdit(event)}
              className="event-btn-ghost text-white px-3 py-2 rounded-lg text-xs uppercase tracking-wide"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(event)}
              className="event-btn-ghost danger text-white px-3 py-2 rounded-lg text-xs uppercase tracking-wide"
            >
              Delete
            </button>
          </div>
        )}

        {isInterested && (
          <div className="mt-2 border border-navbar-border rounded-xl p-3 bg-rich-black-light">
            <label className="text-sm text-white/90">Reminder</label>
            <select
              value={String(reminderMinutes)}
              onChange={(e) => onSetReminder?.(event._id, Number(e.target.value))}
              className="mt-1 w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="10">10 minutes before</option>
              <option value="30">30 minutes before</option>
              <option value="60">1 hour before</option>
              <option value="1440">1 day before</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
