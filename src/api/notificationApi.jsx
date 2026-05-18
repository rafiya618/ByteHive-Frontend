import axios from "axios";
import { getAuthHeader } from "./authHeader";
import { getRequiredUrl } from "../utils/env";

const API = axios.create({
  baseURL: getRequiredUrl("VITE_NOTIFICATION_SERVICE_URL"),
});

export const getNotifications = (userId) =>
  API.get(`/notifications/${userId}`, { headers: getAuthHeader() });

export const deleteNotification = (notificationId) =>
  API.delete(`/notifications/delete/${notificationId}`, { headers: getAuthHeader() });

export const markNotificationAsRead = (userId) =>
  API.put(`/notifications/${userId}/read`, {}, { headers: getAuthHeader() });


export const getPreferences = (userId) =>
  API.get(`/preferences/${userId}`, { headers: getAuthHeader() });

export const updatePreferences = async (userId, newPrefs) => {
  console.log(`📡 [API] Calling updatePreferences: ${getRequiredUrl("VITE_NOTIFICATION_SERVICE_URL")}/preferences/${userId}`);
  console.log('📦 [API] Payload:', newPrefs);

  try {
    const response = await API.put(`/preferences/${userId}`, newPrefs, { headers: getAuthHeader() });
    console.log('✅ [API] Response:', response.data);
    return response;
  } catch (error) {
    console.error('❌ [API] Error:', error.response?.data || error.message);
    throw error;
  }
};
