import { communityApi } from './communityApi.js';

const API_BASE_URL = 'http://localhost:5001/api/admin/communities';

// Reuse auth headers from communityApi
const getAuthHeaders = () => {
  // using same helper logic
  const authData = localStorage.getItem('Auth');
  if (!authData) throw new Error('No token, authorization denied');
  const parsed = JSON.parse(authData);
  const token = parsed.token;
  if (!token) throw new Error('No token, authorization denied');
  return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };
};

export const adminCommunityApi = {
  list: async (params = {}) => {
    const qp = new URLSearchParams();
    if (params.search) qp.append('search', params.search);
    if (params.visible) qp.append('visible', params.visible);
    if (params.page) qp.append('page', params.page);
    if (params.limit) qp.append('limit', params.limit);
    if (params.sortBy) qp.append('sortBy', params.sortBy);
    if (params.order) qp.append('order', params.order);
    if (params.owner) qp.append('owner', params.owner);

    const res = await fetch(`${API_BASE_URL}?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch communities');
    return res.json();
  },

  get: async (communityId) => {
    const res = await fetch(`${API_BASE_URL}/${communityId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch community');
    return res.json();
  },

  posts: async (communityId, { page = 1, limit = 10 } = {}) => {
    const qp = new URLSearchParams({ page, limit });
    const res = await fetch(`${API_BASE_URL}/${communityId}/posts?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch community posts');
    return res.json();
  },

  addModerator: async (communityId, userId) => {
    const res = await fetch(`${API_BASE_URL}/${communityId}/moderators`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to add moderator');
    return res.json();
  },

  removeModerator: async (communityId, userId) => {
    const res = await fetch(`${API_BASE_URL}/${communityId}/moderators/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove moderator');
    return res.json();
  },

  delete: async (communityId) => {
    const res = await fetch(`${API_BASE_URL}/${communityId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete community');
    return res.json();
  },
};
