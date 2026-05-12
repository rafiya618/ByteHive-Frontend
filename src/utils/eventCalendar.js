import { format, isAfter, isBefore, addDays, isSameDay, parseISO } from "date-fns";

const INTERESTED_KEY = "bytehive:events:interested";

export function parseEventDate(event) {
  if (!event?.event_date) return null;
  try {
    return typeof event.event_date === "string"
      ? parseISO(event.event_date)
      : new Date(event.event_date);
  } catch {
    return null;
  }
}

export function isNearEvent(eventDate, days = 7) {
  if (!eventDate) return false;
  const now = new Date();
  const upper = addDays(now, days);
  return isAfter(eventDate, now) && isBefore(eventDate, upper);
}

export function isTodayEvent(eventDate) {
  if (!eventDate) return false;
  return isSameDay(eventDate, new Date());
}

export function toICSDate(date) {
  return format(date, "yyyyMMdd'T'HHmmss'Z'");
}

function escapeICS(value = "") {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function buildICSBody(events) {
  const now = new Date();
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "CALSCALE:GREGORIAN",
    "PRODID:-//ByteHive//Event Calendar//EN",
  ];

  events.forEach((event) => {
    const start = parseEventDate(event);
    if (!start) return;

    const end = new Date(start.getTime() + 60 * 60 * 1000);
    lines.push("BEGIN:VEVENT");
    lines.push(`UID:${escapeICS(event._id || `${event.event_name}-${start.toISOString()}`)}@bytehive`);
    lines.push(`DTSTAMP:${toICSDate(now)}`);
    lines.push(`DTSTART:${toICSDate(start)}`);
    lines.push(`DTEND:${toICSDate(end)}`);
    lines.push(`SUMMARY:${escapeICS(event.event_name || "ByteHive Event")}`);
    lines.push(`DESCRIPTION:${escapeICS(event.small_event_description || "")}`);
    lines.push(`LOCATION:${escapeICS(event.location || "Online")}`);
    if (event.registration_link) {
      lines.push(`URL:${escapeICS(event.registration_link)}`);
    }
    lines.push("END:VEVENT");
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function downloadTextFile(content, fileName, mimeType = "text/calendar;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function downloadEventICS(event) {
  const ics = buildICSBody([event]);
  const safeTitle = (event?.event_name || "event").replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  downloadTextFile(ics, `${safeTitle || "event"}.ics`);
}

export function downloadInterestedEventsICS(events) {
  if (!events?.length) return;
  const ics = buildICSBody(events);
  downloadTextFile(ics, "bytehive-interested-events.ics");
}

export function loadInterestedMap() {
  try {
    const raw = localStorage.getItem(INTERESTED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveInterestedMap(map) {
  localStorage.setItem(INTERESTED_KEY, JSON.stringify(map));
}

export function toggleInterestedEvent(event, reminderMinutes = 30) {
  const map = loadInterestedMap();
  const id = event?._id;
  if (!id) return map;

  if (map[id]) {
    delete map[id];
  } else {
    map[id] = {
      reminderMinutes,
      eventSnapshot: {
        _id: event._id,
        event_name: event.event_name,
        small_event_description: event.small_event_description,
        event_date: event.event_date,
        location: event.location,
        registration_link: event.registration_link,
        category: event.category,
      },
      interestedAt: new Date().toISOString(),
    };
  }

  saveInterestedMap(map);
  return map;
}

export function setEventReminderMinutes(eventId, reminderMinutes) {
  const map = loadInterestedMap();
  if (!map[eventId]) return map;
  map[eventId].reminderMinutes = reminderMinutes;
  saveInterestedMap(map);
  return map;
}

export function scheduleReminder(event, reminderMinutes, onTrigger) {
  const eventDate = parseEventDate(event);
  if (!eventDate || !Number.isFinite(reminderMinutes)) return null;

  const reminderAt = new Date(eventDate.getTime() - reminderMinutes * 60 * 1000);
  const delay = reminderAt.getTime() - Date.now();

  if (delay <= 0) return null;

  return window.setTimeout(() => {
    onTrigger?.(event, reminderMinutes);
  }, delay);
}

export function sendReminderNotification(event, reminderMinutes) {
  const title = `Upcoming Event: ${event.event_name}`;
  const body = `${event.event_name} starts in ${reminderMinutes} minutes.`;

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, { body });
    return;
  }

  alert(`${body}`);
}
