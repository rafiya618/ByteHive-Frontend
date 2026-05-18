// src/api/eventApi.js
import axios from "axios";
import { getRequiredUrl } from "../utils/env";

const API_URL = `${getRequiredUrl("VITE_POSTS_SERVICE_URL")}/api/events`; // adjust backend URL

export const createEvent = async (eventData, jwt) => {
  const { data } = await axios.post(API_URL, eventData, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  return data;
};

export const updateEvent = async (id, eventData, jwt) => {
  const { data } = await axios.put(`${API_URL}/${id}`, eventData, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });
  return data;
};

export const deleteEvent = async (id, jwt) => {
  const { data } = await axios.delete(`${API_URL}/${id}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
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

