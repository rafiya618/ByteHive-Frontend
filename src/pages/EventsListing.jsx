// src/pages/EventsListing.jsx
import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../shared/Navbar";
import SearchBar from "../shared/SearchBar";
import NewEventButton from "../components/EventListing/NewEventButton";
import EventCard from "../components/EventListing/EventCard";
import BlogFilterBar from "../components/BlogListing/BlogFilterBar";
import EventFormCard from "../components/CreateEvent/EventFormCard";
import { getEvents, deleteEvent } from "../api/eventApi";
import { useAuth } from "../context/auth";

const FILTERS = ["All", "Recommended", "Upcoming"];

const EventsListing = () => {
  const [events, setEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const pageSize = 12;

  const [editingEvent, setEditingEvent] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  const { auth, googleRefreshToken, isGoogleConnected } = useAuth();
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

  const handleDelete = async (ev) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await deleteEvent(ev._id, token, googleRefreshToken);
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

  return (
    <div className="min-h-screen bg-rich-black flex flex-col">
      <Navbar />
      <div className="absolute z-0 blur-overlay" style={{ width: 637, height: 300, top: -38, left: "50%", transform: "translateX(-50%)", background: "#1A1842B3", filter: "blur(100px)", boxShadow: "0px 4px 100px 500px #00000066", borderRadius: 30, pointerEvents: "none" }} />
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-9">
          <div className="z-10">
            <h2 className="font-fenix text-[28px] text-white font-normal text-center md:text-left">Events</h2>
            <p className="text-desc font-lato text-center">
              Discover hackathons, workshops, conferences, and more.
              {/* {isGoogleConnected() && (
                <span className="text-green-400 ml-2">
                  ✅ Google Calendar connected
                </span>
              )} */}
            </p>
          </div>
          <div className="flex items-center gap-1 w-full md:w-[600px] z-10">
            <SearchBar className="flex-1 max-w-xs sm:max-w-md" />
            <NewEventButton />
          </div>
        </div>

        <BlogFilterBar filters={FILTERS} selected={selectedFilter} onSelect={(v) => { setSelectedFilter(v); fetchEvents(1); }} />
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 z-10">
        {loading ? <div className="text-center text-white">Loading...</div> : events.length === 0 ? <div className="text-center text-desc">No events found.</div> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map(ev => <EventCard key={ev._id} event={ev} onView={() => {}} onEdit={handleEdit} onDelete={handleDelete} />)}
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
