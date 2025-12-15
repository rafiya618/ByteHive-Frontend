// src/components/EventListing/EventFormCard.jsx
import React, { useState, useRef, useEffect } from "react";
import ActionButton from "../../shared/ActionButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "../CreatePost/quill-custom.css";
import { useAuth } from "../../context/auth";
import {
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
} from "../../api/eventApi";

const EVENT_TYPES = [
  "hackathon",
  "conference",
  "meetup",
  "workshop",
  "webinar",
  "other",
];

const EventFormCard = ({ initialData = null, onSuccess, onCancel }) => {
  const isEdit = Boolean(initialData);
  const { auth, googleRefreshToken } = useAuth(); // use your AuthContext
  const token = auth?.token || "";

  const [title, setTitle] = useState(initialData?.event_name || "");
  const [description, setDescription] = useState(initialData?.small_event_description || "");
  const [thumbnail, setThumbnail] = useState(initialData?.thumbnail || null);
  const [location, setLocation] = useState(initialData?.location || "Online");
  const [date, setDate] = useState(initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(0,10) : "");
  const [time, setTime] = useState(initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(11,16) : "");
  const [registrationLink, setRegistrationLink] = useState(initialData?.registration_link || "");
  const [rules, setRules] = useState(initialData?.rules || "");
  const [eventType, setEventType] = useState(initialData?.category || EVENT_TYPES[0]);
  const [tags, setTags] = useState((initialData?.tags || []).join(", "));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quillRef = useRef(null);
  const modules = {
    toolbar: [
      ["bold", "italic", "underline"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["clean"],
    ],
    clipboard: { matchVisual: false },
  };

  useEffect(() => {
    if (quillRef.current) {
      // noop
    }
  }, [quillRef]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setThumbnail(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const buildPayload = () => {
    let eventDateISO = null;
    if (date) {
      if (time) eventDateISO = new Date(`${date}T${time}`).toISOString();
      else eventDateISO = new Date(date).toISOString();
    }

    return {
      event_name: title,
      small_event_description: description,
      thumbnail,
      location,
      event_date: eventDateISO,
      registration_link: registrationLink,
      rules,
      category: eventType,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!title.trim() || !description.trim() || !date || !time) {
      setError("Title, description, date and time are required.");
      return;
    }

    setLoading(true);
    try {
      const payload = buildPayload();
      let returnedEvent;

      if (isEdit) {
        const res = await apiUpdateEvent(initialData._id, payload, token, googleRefreshToken);
        returnedEvent = res.event || res; // support both shapes
        onSuccess && onSuccess("updated");
      } else {
        const res = await apiCreateEvent(payload, token, googleRefreshToken);
        returnedEvent = res.event || res;
        onSuccess && onSuccess("created");
      }

      // If frontend wants manual sync (you already pass refresh token header,
      // createEvent/updateEvent have already attempted sync if refresh token present).
      // But if you want an explicit extra sync endpoint you can call it here.
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err?.response?.data?.error || err?.message || "Failed to save event. Please try again.");
    }
  };

  return (
    <form className="bg-navbar-bg border border-navbar-border rounded-2xl p-6 flex flex-col gap-6 w-full max-w-xl mx-auto" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-[#D9467C22] border border-[#D9467C] text-[#D9467C] px-3 py-2 rounded-md text-sm">
          {error}
        </div>
      )}

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Event Title</label>
        <input type="text" placeholder="Choose event title"
          className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle"
          value={title} onChange={(e) => setTitle(e.target.value)} required />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Description</label>
        <textarea placeholder="Describe what your event is about" className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle min-h-[100px]" value={description} onChange={(e) => setDescription(e.target.value)} />
      </div>

      {/* Thumbnail */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Thumbnail Image</label>
        <div className="border border-dashed border-navbar-border rounded-lg p-5 text-center text-desc cursor-pointer hover:border-periwinkle" onClick={() => document.getElementById("event-thumbnail-input").click()}>
          <span className="material-icons text-2xl text-periwinkle mb-1">image</span>
          <p className="text-sm">Click to upload or drag and drop</p>
          <p className="text-xs mt-1">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
          {thumbnail && <img src={thumbnail} alt="thumbnail" className="mx-auto mt-2 rounded-md max-h-32" />}
          <input id="event-thumbnail-input" type="file" accept="image/*" style={{ display: "none" }} onChange={handleThumbnailChange} />
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Location</label>
        <input type="text" placeholder="Enter location (or leave blank for online)" className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle" value={location} onChange={(e) => setLocation(e.target.value)} />
      </div>

      {/* Date & Time */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-white/90 font-fenix">Date</label>
          <input type="date" className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-white/90 font-fenix">Time</label>
          <input type="time" className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle" value={time} onChange={(e) => setTime(e.target.value)} required />
        </div>
      </div>

      {/* Registration Link */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Registration Link</label>
        <input type="url" placeholder="http://example.com/register" className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle" value={registrationLink} onChange={(e) => setRegistrationLink(e.target.value)} />
      </div>

      {/* Event Type */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Event Type</label>
        <select className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle" value={eventType} onChange={(e) => setEventType(e.target.value)}>
          {EVENT_TYPES.map((type) => <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>)}
        </select>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Tags</label>
        <input type="text" placeholder="Add up to 5 tags (comma separated)" className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle" value={tags} onChange={(e) => setTags(e.target.value)} />
        <p className="text-xs text-desc">Separate tags with commas.</p>
      </div>

      {/* Rules */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Rules</label>
        <div className="rounded-lg border border-navbar-border overflow-hidden">
          <ReactQuill ref={quillRef} value={rules} onChange={setRules} modules={modules} formats={["bold", "italic", "underline", "list", "bullet"]} placeholder="List any rules for your event" theme="snow" className="custom-quill" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <ActionButton variant="secondary" type="button" onClick={() => onCancel && onCancel()}>Cancel</ActionButton>
        <ActionButton variant="primary" type="submit" disabled={loading}>{loading ? (isEdit ? "Updating..." : "Creating...") : (isEdit ? "Update Event" : "Create Event")}</ActionButton>
      </div>
    </form>
  );
};

export default EventFormCard;
