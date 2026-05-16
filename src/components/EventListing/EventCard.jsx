import React from "react";
import { formatDistanceToNowStrict } from "date-fns";
import { useAuth } from "../../context/auth";
import { parseEventDate } from "../../utils/eventCalendar";
import { PrimaryButton } from "../../components/UI";

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
      className={`event-neon-card bg-navbar-bg border rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-[220px_minmax(0,1fr)] ${
        isNear ? "border-[#f59e0b]" : "border-navbar-border"
      }`}
    >
      <div className="relative min-h-[180px] md:min-h-full">
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

      <div className="flex flex-col flex-1 p-5 md:p-6 gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="bg-chip text-white/80 text-xs px-3 py-1 rounded-xl w-fit inline-flex">{category}</span>
            <h3 className="ds-heading-md mt-3 leading-tight">{event_name}</h3>
          </div>
          <span className="text-desc text-xs md:text-sm text-right whitespace-nowrap">{countdown}</span>
        </div>

        <p className="text-desc text-sm md:text-[15px] flex-1 leading-relaxed line-clamp-3">
          {small_event_description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-sm text-desc">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-icons text-base">event</span>
            <span className="truncate">{date}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-icons text-base">schedule</span>
            <span className="truncate">{time}</span>
          </div>
          <div className="flex items-center gap-2 min-w-0 sm:col-span-2">
            <span className="material-icons text-base">place</span>
            <span className="truncate">{location || "Online"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <PrimaryButton
            onClick={handleView}
            className="h-11 w-full min-w-0 whitespace-nowrap px-3 rounded-xl justify-center gap-2 text-sm font-semibold leading-none"
          >
            View Event <span className="material-icons text-sm">open_in_new</span>
          </PrimaryButton>

          <PrimaryButton
            onClick={() => onToggleInterest?.(event)}
            className={`h-11 w-full min-w-0 whitespace-nowrap px-3 rounded-xl justify-center text-sm font-semibold leading-none ${
              isInterested
                ? "!bg-transparent !text-periwinkle !border !border-periwinkle/30 hover:!bg-periwinkle/10"
                : "!bg-transparent !text-columbia-blue !border !border-navbar-border hover:!bg-white/5"
            }`}
          >
            {isInterested ? "Interested" : "Mark Interested"}
          </PrimaryButton>

          <PrimaryButton
            onClick={() => onAddToCalendar?.(event)}
            className="h-11 w-full min-w-0 whitespace-nowrap px-3 rounded-xl justify-center text-sm font-semibold leading-none !bg-transparent !text-columbia-blue !border !border-navbar-border hover:!bg-white/5"
          >
            Add to Calendar
          </PrimaryButton>
        </div>

        {isOwner && (
          <div className="mt-1 flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onEdit && onEdit(event)}
              className="h-9 px-3 rounded-lg border border-navbar-border text-xs font-semibold uppercase tracking-wide text-columbia-blue hover:bg-white/5 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete && onDelete(event)}
              className="h-9 px-3 rounded-lg border border-red-400/40 text-xs font-semibold uppercase tracking-wide text-red-300 hover:bg-red-500/10 transition-colors"
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
