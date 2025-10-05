import axios from "axios";
import { getAuthHeader } from "./authHeader";

const API = axios.create({
  baseURL: import.meta.env.VITE_AUTH_SERVICE_URL,
});

export const getProfile = (userId) =>
   API.get(`/profile/${userId}`, { headers: getAuthHeader() });

export const updateProfile = (userId, formData) => 
  API.put(`/profile/${userId}`, formData, { headers: getAuthHeader() });

export const createProfile = (userId, formData) => 
  API.post(`/profile/setup/${userId}`, formData, { headers: getAuthHeader() });
