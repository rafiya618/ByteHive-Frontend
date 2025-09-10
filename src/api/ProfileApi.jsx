import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL, // update if different
  // withCredentials: true, // if you're using cookies/auth
});

export const getProfile = (userId) => API.get(`/profile/${userId}`);

export const updateProfile = (userId, formData) =>
  API.put(`/profile/${userId}`, formData);

export const createProfile = (userId, formData) =>
  API.post(`/profile/setup/${userId}`, formData);
