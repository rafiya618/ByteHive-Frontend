import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { format } from "date-fns";
import { isNearEvent, isTodayEvent, parseEventDate } from "../../utils/eventCalendar";
import { Card, PrimaryButton } from "../../components/UI";

const EventCalendarPanel = ({ events = [], selectedDate, onDateChange, onExportCalendar, exportDisabled = false }) => {
  const normalizedEvents = useMemo(
    () =>
      events
        .map((event) => ({ event, date: parseEventDate(event) }))
        .filter((item) => item.date),
    [events]
  );

  const eventsByDate = useMemo(() => {
    const map = new Map();
    normalizedEvents.forEach(({ event, date }) => {
      const key = format(date, "yyyy-MM-dd");
      const existing = map.get(key) || [];
      existing.push(event);
      map.set(key, existing);
    });
    return map;
  }, [normalizedEvents]);

  const selectedKey = selectedDate ? format(selectedDate, "yyyy-MM-dd") : null;
  const selectedEvents = selectedKey ? eventsByDate.get(selectedKey) || [] : [];

  return (
    <Card className="event-calendar-panel p-4 relative overflow-hidden">
      <div className="flex flex-col gap-4">
        <h3 className="font-fenix text-[22px] text-white font-normal">Event Calendar</h3>

        <div>
          <Calendar
            value={selectedDate}
            onChange={onDateChange}
            className="bytehive-calendar"
            tileClassName={({ date }) => {
              const key = format(date, "yyyy-MM-dd");
              const dayEvents = eventsByDate.get(key) || [];
              if (!dayEvents.length) return "";

              const hasToday = dayEvents.some((e) => isTodayEvent(parseEventDate(e)));
              const hasNear = dayEvents.some((e) => isNearEvent(parseEventDate(e), 7));

              if (hasToday) return "calendar-tile-today-event";
              if (hasNear) return "calendar-tile-near-event";
              return "calendar-tile-has-event";
            }}
          />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <h4 className="font-fenix text-lg text-white font-normal">
            {selectedDate ? `Events on ${format(selectedDate, "PPP")}` : "Pick a day"}
            </h4>
            <PrimaryButton
              onClick={onExportCalendar}
              disabled={exportDisabled}
              className="h-10 px-4 rounded-xl text-sm whitespace-nowrap disabled:opacity-50"
            >
              Export Calendar (.ics)
            </PrimaryButton>
          </div>
          {!selectedDate ? (
            <p className="text-desc">Choose a date in the calendar to preview events.</p>
          ) : selectedEvents.length === 0 ? (
            <p className="text-desc">No events on this date.</p>
          ) : (
            <div className="space-y-2">
              {selectedEvents.map((event) => {
                const eventDate = parseEventDate(event);
                return (
                  <div key={event._id} className="border border-navbar-border rounded-xl px-3 py-2 bg-rich-black-light">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-white font-semibold">{event.event_name}</p>
                      <span className="text-xs px-2 py-1 rounded-lg bg-chip text-periwinkle">{event.category}</span>
                    </div>
                    <p className="text-desc text-sm mt-1">
                      {eventDate ? format(eventDate, "p") : "TBD"} | {event.location || "Online"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EventCalendarPanel;
