import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getEvents } from "../../api/eventApi";

const UpcomingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        setLoading(true);
        // Fetch events with a large limit to get all, then sort and slice
        const response = await getEvents(1, 100);
        
        // Handle different response structures
        let eventsList = [];
        if (Array.isArray(response)) {
          eventsList = response;
        } else if (response?.data && Array.isArray(response.data)) {
          eventsList = response.data;
        } else if (response?.events && Array.isArray(response.events)) {
          eventsList = response.events;
        } else {
          console.warn("Unexpected response structure:", response);
          eventsList = [];
        }
        
        // Sort by createdAt (most recent first) and take top 5
        const sorted = eventsList
          .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))
          .slice(0, 5);
        
        console.log("📅 Upcoming Events Data:", sorted);
        setEvents(sorted);
      } catch (err) {
        console.error("Failed to fetch events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-5 md:p-6 z-0">
      {/* Header */}
      <div className="flex justify-between items-baseline mb-6 gap-16">
        <h3 className="font-fenix text-xl text-white">Upcoming Events</h3>
        <a
          href="/events"
          className="text-periwinkle text-sm hover:text-columbia-blue transition-colors flex items-center gap-1 whitespace-nowrap"
        >
          See all <span aria-hidden>→</span>
        </a>
      </div>

      {/* List */}
      <ul className="space-y-4">
        {loading ? (
          <li className="text-periwinkle text-center py-4">Loading events...</li>
        ) : error ? (
          <li className="text-red-400 text-center py-4">{error}</li>
        ) : events.length === 0 ? (
          <li className="text-periwinkle text-center py-4">No events available</li>
        ) : (
          events.map((event, idx) => (
            <li key={event._id || idx} className="flex justify-between items-center">
              {/* Left: Avatar circle + Event info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--periwinkle)] text-rich-black font-semibold shrink-0">
                  {(event.event_name || event.title || event.name || "E").charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="text-desc font-lato font-medium text-[16px]">
                    {event.event_name || event.title || event.name}
                  </div>
                  <div className="font-lato opacity-60 text-periwinkle text-[14px]">
                    {event.location && <span>{event.location}</span>}
                    {event.location && event.event_date && <span className="opacity-30"> - </span>}
                    {event.event_date && (
                      <span>
                        {new Date(event.event_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Details button */}
              <button
                onClick={() => {
                  if (event.registration_link) {
                    window.open(event.registration_link, "_blank");
                  } else if (event._id) {
                    navigate(`/events/${event._id}`);
                  }
                }}
                className="px-5 py-1 rounded-xl border-2 border-navbar-border text-periwinkle text-[15px] hover:text-white hover:border-periwinkle transition-colors shrink-0"
                aria-label={`View details for ${event.event_name || event.title || event.name}`}
              >
                View
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default UpcomingEvents;
