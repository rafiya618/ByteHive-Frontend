import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_NOTIFICATION_SERVICE_URL, // update if different
  // withCredentials: true, // if you're using cookies/auth
});

export const getNotifications = async (userId) => API.get(`/notifications/${userId}`);

export const deleteNotification = async (notificationId) => API.delete(`/notifications/delete/${notificationId}`);

export const markNotificationAsRead = async (userId) => API.put(`/notifications/${userId}/read`);
  




