// src/components/EventListing/EventCard.jsx
import React from "react";
import { useAuth } from "../../context/auth";
import { syncEventToCalendar } from "../../api/eventApi";

const EventCard = ({ event, onEdit, onDelete }) => {
  const { auth, googleRefreshToken, isGoogleConnected, setGoogleToken } = useAuth();
  const token = auth?.token || "";
  const userId = auth?.user?._id || auth?.user?.id;
  const isOwner = userId && event.createdBy === userId;

  const { thumbnail, category, event_name, small_event_description, event_date, location, registration_link } = event;

  const dt = event_date ? new Date(event_date) : null;
  const date = dt ? dt.toLocaleDateString() : "TBD";
  const time = dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD";

  const handleGoogleConnect = async () => {
    // For now, we'll use a hardcoded refresh token for testing
    // In production, this should redirect to Google OAuth flow
    const testRefreshToken = "1//04YyOsdrV2hIuCgYIARAAGAQSNgF-L9IraVEIiL9qYyLMDwnmz3KLe7wpq8rJR6cjqVMvZFU_nZz3YgAjDS600vTqZxp1h6IKCg";
    
    try {
      setGoogleToken(testRefreshToken);
      //alert("✅ Google Calendar connected! You can now add events to your calendar.");
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      alert("❌ Failed to connect Google Calendar. Please try again.");
    }
  };

  const handleCalendarSync = async () => {
    // Check if user is authenticated
    if (!token) {
      alert("Please log in to add events to your calendar.");
      return;
    }

    // Check if we have Google refresh token
    if (!isGoogleConnected()) {
      const shouldConnect = window.confirm(
        "Google Calendar integration not set up. Would you like to connect your Google account now?"
      );
      
      if (shouldConnect) {
        await handleGoogleConnect();
        // After connecting, try to sync again
        if (isGoogleConnected()) {
          return handleCalendarSync();
        }
      }
      return;
    }

    try {
      console.log('Starting calendar sync for event:', event._id);
      const result = await syncEventToCalendar(event._id, token, googleRefreshToken);
      
      if (result.ok) {
        alert(`✅ ${result.message || 'Event successfully added to your Google Calendar!'}`);
      } else {
        alert(`❌ Failed to sync: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Calendar sync error:', err);
      
      // Provide more specific error messages
      if (err.response?.status === 404) {
        alert("❌ Event not found. It may have been deleted.");
      } else if (err.response?.status === 400) {
        alert("❌ Google Calendar integration issue. Please reconnect your Google account.");
        // Clear the stored token if it's invalid
        setGoogleToken("");
      } else if (err.response?.status === 401) {
        alert("❌ Authentication failed. Please log in again.");
      } else {
        alert(`❌ Failed to add event to calendar: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const handleView = () => {
    if (registration_link) {
      window.open(registration_link, "_blank", "noopener,noreferrer");
    } else {
      alert("No registration link provided for this event.");
    }
  };

  return (
    <div className="bg-navbar-bg border border-navbar-border rounded-2xl overflow-hidden shadow-md flex flex-col">
      <div className="h-48 w-full">
        <img
          src={thumbnail || "https://via.placeholder.com/600x300?text=No+image"}
          alt={event_name}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        <span className="bg-chip text-white/80 text-xs px-3 py-1 rounded-xl w-fit">{category}</span>
        <h3 className="font-fenix text-lg text-white">{event_name}</h3>
        <p className="text-desc text-sm flex-1">{small_event_description}</p>

        <div className="text-sm text-periwinkle space-y-2">
          <div className="flex items-center gap-2"><span className="material-icons text-base">event</span>{date}</div>
          <div className="flex items-center gap-2"><span className="material-icons text-base">schedule</span>{time}</div>
          <div className="flex items-center gap-2"><span className="material-icons text-base">place</span>{location || "Online"}</div>
        </div>

        <div className="mt-4 flex gap-2 flex-wrap">
          <button
            onClick={handleView}
            className="bg-[var(--card-button-bg)] hover:bg-[var(--card-button-hover-bg)] text-white px-4 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            View Event <span className="material-icons text-sm">open_in_new</span>
          </button>
          
          {isOwner && (
            <>
              <button 
                onClick={() => onEdit && onEdit(event)} 
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete && onDelete(event)} 
                className="bg-[#D9467C] hover:bg-[#C33] text-white px-4 py-2 rounded-xl transition-colors"
              >
                Delete
              </button>
            </>
          )}
          
          {/* Google Calendar Integration
          {!isGoogleConnected() ? (
            <button 
              onClick={handleGoogleConnect} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              disabled={!token}
            >
              <span className="material-icons text-sm">link</span>
              Connect Google Calendar
            </button>
          ) : (
            <button 
              onClick={handleCalendarSync} 
              className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-xl transition-colors flex items-center gap-2"
              disabled={!token}
            >
              <span className="material-icons text-sm">event</span>
              Add to Calendar
            </button>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
