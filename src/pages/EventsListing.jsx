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
import { Card, Dropdown, PageContainer, PrimaryButton, SecondaryButton } from "../components/UI";
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

const TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "online", label: "Online" },
  { value: "offline", label: "Offline" },
];

const DropdownFilter = ({ label, value, options, onChange, minWidth = 170 }) => {
  const selectedLabel = options.find((option) => option.value === value)?.label || label;
  const triggerLabel = value === "all" ? label : selectedLabel;

  return (
    <Dropdown
      align="left"
      trigger={
        <SecondaryButton
          type="button"
          className="events-filter-control h-[42px] justify-between gap-3 px-4 rounded-xl text-sm whitespace-nowrap"
          style={{ minWidth }}
        >
          <span>{triggerLabel}</span>
          <span className="flex min-w-0 items-center gap-2 text-left text-columbia-blue/90">
            <span className="material-icons text-[18px] leading-none">expand_more</span>
          </span>
        </SecondaryButton>
      }
    >
      {({ close }) => (
        <div className="min-w-[220px] p-2">
          {options.map((option) => {
            const selected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  close();
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selected
                    ? "bg-white/10 text-white"
                    : "text-columbia-blue hover:bg-white/5 hover:text-white"
                }`}
              >
                <span>{option.label}</span>
                {selected && <span className="material-icons text-[16px]">check</span>}
              </button>
            );
          })}
        </div>
      )}
    </Dropdown>
  );
};

const EventsListing = () => {
  const [events, setEvents] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [eventDateFilter, setEventDateFilter] = useState("");
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

      const selectedDate = eventDateFilter ? parseISO(`${eventDateFilter}T00:00:00`) : null;
      const matchesDate = !selectedDate || (eventDate && eventDate.toDateString() === selectedDate.toDateString());

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
        matchesDate &&
        quickFilterMatches
      );
    });
  }, [
    events,
    searchText,
    categoryFilter,
    typeFilter,
    eventDateFilter,
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
    setEventDateFilter("");
  };

  return (
    <div className="events-page min-h-screen bg-rich-black flex flex-col relative overflow-x-hidden">
      <Navbar />
      <PageContainer className="relative z-10 py-10">
        <div className="mb-8 flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h2 className="font-fenix text-[28px] text-white font-normal text-center md:text-left">
              Events Hub
            </h2>
            <p className="text-desc font-lato text-center md:text-left mt-1">
              Discover, filter, and track events with in-app calendar integration and reminders.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start">
          <div className="min-w-0 space-y-5">
            <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
              <SearchBar
                className="flex-1"
                placeholder="Search events"
                value={searchText}
                onSearch={setSearchText}
              />
              <NewEventButton />
            </div>

            <BlogFilterBar filters={FILTERS} selected={selectedFilter} onSelect={(v) => { setSelectedFilter(v); fetchEvents(1); }} />

            <div className="space-y-3">
              <div className="flex flex-wrap gap-3 items-start">
                <DropdownFilter
                  label="Category"
                  value={categoryFilter}
                  options={eventCategories.map((category) => ({
                    value: category,
                    label: category === "all" ? "All categories" : category,
                  }))}
                  onChange={setCategoryFilter}
                    minWidth={160}
                />

                <DropdownFilter
                  label="Type"
                  value={typeFilter}
                  options={TYPE_OPTIONS}
                  onChange={setTypeFilter}
                    minWidth={145}
                />

                <input
                  type="date"
                  value={eventDateFilter}
                  onChange={(e) => setEventDateFilter(e.target.value)}
                  className="events-control events-filter-control flex-[1_1_180px] min-w-[170px] max-w-[210px]"
                  />
                <PrimaryButton
                  onClick={clearFilters}
                  className="events-reset-btn h-[42px] px-4 rounded-xl text-sm whitespace-nowrap !bg-transparent !text-columbia-blue hover:!bg-white/5"
                >
                  Reset filters
                </PrimaryButton>
                </div>
            </div>

            <div className="space-y-4">
              {loading ? <div className="text-center text-white py-8">Loading...</div> : filteredEvents.length === 0 ? <div className="text-center text-desc py-8">No events found.</div> : (
                filteredEvents.map((ev) => (
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
                ))
              )}
            </div>

            {pages > 1 && (
              <div className="flex justify-center mt-8 gap-3">
                {page > 1 && (
                  <PrimaryButton
                    onClick={() => fetchEvents(page - 1)}
                    className="h-10 px-4 rounded-xl text-sm !bg-transparent !text-columbia-blue !border !border-navbar-border hover:!bg-white/5"
                  >
                    Prev
                  </PrimaryButton>
                )}
                <div className="px-4 py-2 rounded text-desc flex items-center">{page} / {pages}</div>
                {page < pages && (
                  <PrimaryButton
                    onClick={() => fetchEvents(page + 1)}
                    className="h-10 px-4 rounded-xl text-sm !bg-transparent !text-columbia-blue !border !border-navbar-border hover:!bg-white/5"
                  >
                    Next
                  </PrimaryButton>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6 xl:sticky xl:top-24">
            <EventCalendarPanel
              events={filteredEvents}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              onExportCalendar={() => downloadInterestedEventsICS(interestedEvents)}
              exportDisabled={!interestedEvents.length}
            />

            <Card className="p-4 md:p-5 space-y-3">
              <h3 className="ds-heading-md">Event Snapshot</h3>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-xl border border-navbar-border bg-rich-black-light/70 p-3">
                  <div className="text-xl font-semibold text-white">{filteredEvents.length}</div>
                  <div className="text-desc text-xs uppercase tracking-wide">Visible</div>
                </div>
                <div className="rounded-xl border border-navbar-border bg-rich-black-light/70 p-3">
                  <div className="text-xl font-semibold text-white">{interestedEvents.length}</div>
                  <div className="text-desc text-xs uppercase tracking-wide">Interested</div>
                </div>
                <div className="rounded-xl border border-navbar-border bg-rich-black-light/70 p-3">
                  <div className="text-xl font-semibold text-white">{eventCategories.length - 1}</div>
                  <div className="text-desc text-xs uppercase tracking-wide">Categories</div>
                </div>
              </div>
            </Card>
          </aside>
        </div>
      </PageContainer>

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
