// src/pages/EventsListing.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { addDays, isAfter, isBefore, parseISO } from "date-fns";
import Navbar from "../shared/Navbar";
import SearchBar from "../shared/SearchBar";
import NewEventButton from "../components/EventListing/NewEventButton";
import EventCard from "../components/EventListing/EventCard";
import BlogFilterBar from "../components/BlogListing/BlogFilterBar";
import EventCalendarPanel from "../components/EventListing/EventCalendarPanel";
import EventFormCard from "../components/CreateEvent/EventFormCard";
import { getEvents, deleteEvent } from "../api/eventApi";
import { useAuth } from "../context/auth";
import {
  downloadEventICS,
  downloadInterestedEventsICS,
  isNearEvent,
  loadInterestedMap,
  saveInterestedMap,
  scheduleReminder,
  sendReminderNotification,
  setEventReminderMinutes,
  toggleInterestedEvent,
} from "../utils/eventCalendar";

const FILTERS = ["All", "Recommended", "Upcoming"];

const EventsListing = () => {
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [onlyInterested, setOnlyInterested] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [interestedMap, setInterestedMap] = useState(() => loadInterestedMap());
  const reminderTimers = useRef([]);

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const pageSize = 12;

  const [editingEvent, setEditingEvent] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const { auth } = useAuth();
  const token = auth?.token || "";

  const fetchEvents = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await getEvents(p, pageSize);
      setEvents(res.events || []);
      setPage(res.pagination?.page || 1);
      setPages(res.pagination?.pages || 1);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents]);

  useEffect(() => {
    saveInterestedMap(interestedMap);
  }, [interestedMap]);

  useEffect(() => {
    reminderTimers.current.forEach((timer) => clearTimeout(timer));
    reminderTimers.current = [];

    events.forEach((event) => {
      const item = interestedMap[event._id];
      if (!item) return;

      const timer = scheduleReminder(
        event,
        Number(item.reminderMinutes || 30),
        (ev, mins) => sendReminderNotification(ev, mins)
      );

      if (timer) reminderTimers.current.push(timer);
    });

    return () => {
      reminderTimers.current.forEach((timer) => clearTimeout(timer));
      reminderTimers.current = [];
    };
  }, [events, interestedMap]);

  const eventCategories = useMemo(() => {
    const categories = new Set(events.map((event) => event.category).filter(Boolean));
    return ["all", ...Array.from(categories)];
  }, [events]);

  const filteredEvents = useMemo(() => {
    const now = new Date();
    const recommendedWindowEnd = addDays(now, 30);

    return events.filter((event) => {
      const title = (event.event_name || "").toLowerCase();
      const description = (event.small_event_description || "").toLowerCase();
      const matchesSearch =
        !searchText ||
        title.includes(searchText.toLowerCase()) ||
        description.includes(searchText.toLowerCase());

      const matchesCategory = categoryFilter === "all" || event.category === categoryFilter;

      const isOnline = (event.location || "").toLowerCase().includes("online");
      const matchesType =
        typeFilter === "all" ||
        (typeFilter === "online" && isOnline) ||
        (typeFilter === "offline" && !isOnline);

      const eventDate = event.event_date ? parseISO(event.event_date) : null;

      const fromDate = dateFrom ? parseISO(`${dateFrom}T00:00:00`) : null;
      const toDate = dateTo ? parseISO(`${dateTo}T23:59:59`) : null;

      const matchesDateFrom = !fromDate || (eventDate && isAfter(eventDate, fromDate));
      const matchesDateTo = !toDate || (eventDate && isBefore(eventDate, toDate));

      const matchesInterested = !onlyInterested || Boolean(interestedMap[event._id]);

      const quickFilterMatches =
        selectedFilter === "All" ||
        (selectedFilter === "Upcoming" && eventDate && isAfter(eventDate, now)) ||
        (selectedFilter === "Recommended" &&
          ((eventDate && isAfter(eventDate, now) && isBefore(eventDate, recommendedWindowEnd)) ||
            Boolean(interestedMap[event._id])));

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesDateFrom &&
        matchesDateTo &&
        matchesInterested &&
        quickFilterMatches
      );
    });
  }, [
    events,
    searchText,
    categoryFilter,
    typeFilter,
    dateFrom,
    dateTo,
    onlyInterested,
    interestedMap,
    selectedFilter,
  ]);

  const interestedEvents = useMemo(
    () => events.filter((event) => Boolean(interestedMap[event._id])),
    [events, interestedMap]
  );

  const handleDelete = async (ev) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(ev._id, token);
      await fetchEvents(1);
      alert("Deleted");
    } catch (err) {
      console.error(err);
      alert("Failed to delete");
    }
  };

  const handleEdit = (ev) => {
    setEditingEvent(ev);
    setShowFormModal(true);
  };

  const onFormSuccess = async (action) => {
    setShowFormModal(false);
    setEditingEvent(null);
    await fetchEvents(1);
    alert(`Event ${action}`);
  };

  const handleToggleInterested = (event) => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    const nextMap = toggleInterestedEvent(event, interestedMap[event._id]?.reminderMinutes || 30);
    setInterestedMap({ ...nextMap });
  };

  const handleSetReminder = (eventId, reminderMinutes) => {
    const nextMap = setEventReminderMinutes(eventId, reminderMinutes);
    setInterestedMap({ ...nextMap });
  };

  const handleAddToCalendar = (event) => {
    downloadEventICS(event);
  };

  const clearFilters = () => {
    setSearchText("");
    setCategoryFilter("all");
    setTypeFilter("all");
    setDateFrom("");
    setDateTo("");
    setOnlyInterested(false);
  };

  return (
    <div className="events-page min-h-screen bg-rich-black flex flex-col relative overflow-x-hidden">
      <Navbar />
      <div className="absolute z-0 events-neon-orb events-neon-orb-left" />
      <div className="absolute z-0 events-neon-orb events-neon-orb-right" />

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="events-hero relative z-10 mb-8 rounded-3xl p-6 md:p-8 border border-navbar-border">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <p className="events-hero-kicker text-xs uppercase tracking-[0.22em] mb-2">Discover and Track</p>
              <h2 className="font-fenix text-[34px] md:text-[42px] leading-tight text-white font-normal text-left">Events Hub</h2>
              <p className="text-desc font-lato mt-2">
              Discover, filter, and track events with in-app calendar integration and reminders.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="events-pill">{filteredEvents.length} visible</span>
              <span className="events-pill">{interestedEvents.length} interested</span>
              <span className="events-pill">{eventCategories.length - 1} categories</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-6 z-10 relative">
          <div className="flex items-center gap-2 w-full xl:max-w-[700px]">
            <SearchBar
              className="events-search flex-1"
              placeholder="Search events"
              value={searchText}
              onSearch={setSearchText}
            />
            <NewEventButton />
          </div>

          <button
            onClick={() => downloadInterestedEventsICS(interestedEvents)}
            disabled={!interestedEvents.length}
            className="events-export-btn px-4 py-3 rounded-xl disabled:opacity-50 text-white text-sm"
          >
            Export Interested (.ics)
          </button>
        </div>

        <BlogFilterBar filters={FILTERS} selected={selectedFilter} onSelect={(v) => { setSelectedFilter(v); fetchEvents(1); }} />

        <div className="events-filter-wrap mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 p-3 rounded-2xl border border-navbar-border">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="events-control"
          >
            {eventCategories.map((category) => (
              <option key={category} value={category}>
                {category === "all" ? "All categories" : category}
              </option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="events-control"
          >
            <option value="all">All types</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="events-control"
          />

          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="events-control"
          />

          <label className="events-control flex items-center gap-2 text-white text-sm">
            <input
              type="checkbox"
              checked={onlyInterested}
              onChange={(e) => setOnlyInterested(e.target.checked)}
            />
            Interested only
          </label>

          <button
            onClick={clearFilters}
            className="events-reset-btn px-3 py-2 rounded-lg text-white"
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 z-10">
        <EventCalendarPanel
          events={filteredEvents}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
        />

        {loading ? <div className="text-center text-white">Loading...</div> : filteredEvents.length === 0 ? <div className="text-center text-desc">No events found.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((ev) => (
              <EventCard
                key={ev._id}
                event={ev}
                onView={() => {}}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onToggleInterest={handleToggleInterested}
                onSetReminder={handleSetReminder}
                onAddToCalendar={handleAddToCalendar}
                isInterested={Boolean(interestedMap[ev._id])}
                reminderMinutes={Number(interestedMap[ev._id]?.reminderMinutes || 30)}
                isNear={isNearEvent(ev.event_date ? parseISO(ev.event_date) : null, 7)}
              />
            ))}
          </div>
        )}

        {pages > 1 && (
          <div className="flex justify-center mt-8 gap-3">
            {page > 1 && (
              <button
                onClick={() => fetchEvents(page - 1)}
                className="px-4 py-2 rounded bg-navbar-bg border border-navbar-border text-white"
              >
                Prev
              </button>
            )}
            <div className="px-4 py-2 rounded text-white">{page} / {pages}</div>
            {page < pages && (
              <button
                onClick={() => fetchEvents(page + 1)}
                className="px-4 py-2 rounded bg-navbar-bg border border-navbar-border text-white"
              >
                Next
              </button>
            )}
          </div>
        )}
      </div>

      {showFormModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
    {/* ✅ make modal scrollable if content is large */}
    <div className="bg-navbar-bg rounded-2xl w-full max-w-3xl max-h-[90vh] p-6 overflow-y-auto">
      <h3 className="text-xl text-white mb-4">{editingEvent ? "Edit Event" : "Create Event"}</h3>
      <EventFormCard
        initialData={editingEvent}
        onCancel={() => { setShowFormModal(false); setEditingEvent(null); }}
        onSuccess={onFormSuccess}
      />
    </div>
  </div>
)}

    </div>
  );
};

export default EventsListing;
