// src/api/eventApi.js
import axios from "axios";

const API_URL = "http://localhost:5000/api/events"; // adjust backend URL

export const createEvent = async (eventData, jwt, googleRefreshToken) => {
  const { data } = await axios.post(API_URL, eventData, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "x-google-refresh-token": googleRefreshToken || "",
    },
  });
  return data;
};

export const updateEvent = async (id, eventData, jwt, googleRefreshToken) => {
  const { data } = await axios.put(`${API_URL}/${id}`, eventData, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "x-google-refresh-token": googleRefreshToken || "",
    },
  });
  return data;
};

export const deleteEvent = async (id, jwt, googleRefreshToken) => {
  const { data } = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
      "x-google-refresh-token": googleRefreshToken || "",
    },
  });
  return data;
};

export const getEvents = async (page = 1, limit = 10) => {
  const { data } = await axios.get(`${API_URL}?page=${page}&limit=${limit}`);
  return data;
};

export const getEventById = async (id) => {
  const { data } = await axios.get(`${API_URL}/${id}`);
  return data;
};

export const searchEvents = async (params) => {
  const { data } = await axios.get(`${API_URL}/search/query`, { params });
  return data;
};

// 🔥 FIXED: Sync Event to Google Calendar - corrected endpoint path
export const syncEventToCalendar = async (eventId, token, googleRefreshToken) => {
  console.log("Syncing event to calendar:", { eventId, hasToken: !!token, hasRefreshToken: !!googleRefreshToken });

  const res = await axios.post(
    `http://localhost:5000/api/events/${eventId}/sync`, // Fixed: removed '-calendar' from path
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "x-google-refresh-token": googleRefreshToken || "", // Pass refresh token in header
      },
    }
  );
  return res.data;
};

