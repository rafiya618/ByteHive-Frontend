import { getAuthHeaders } from '../utils/authUtils';
import { getRequiredUrl } from "../utils/env";

// Posts admin routes live on the posts service; community admin lives on the community service
const POSTS_BASE = getRequiredUrl("VITE_POSTS_SERVICE_URL");
const COMMUNITY_BASE = getRequiredUrl("VITE_COMMUNITY_SERVICE_URL");
const API_BASE_URL = `${POSTS_BASE}/api/admin/posts`;
const COMMUNITY_API_BASE = `${COMMUNITY_BASE}/api/admin/communities`;

export const adminPostApi = {
  // List all posts with filters and pagination
  list: async (params = {}) => {
    console.log('Enter in post admin api')
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page);
    if (params.limit) qp.append('limit', params.limit);
    if (params.search) qp.append('search', params.search);
    if (params.community) qp.append('community', params.community);
    if (params.category) qp.append('category', params.category);
    if (params.status) qp.append('status', params.status);
    if (params.sortBy) qp.append('sortBy', params.sortBy);
    if (params.order) qp.append('order', params.order);

    const res = await fetch(`${API_BASE_URL}?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({ message: 'Unknown error' }));
      console.error('Admin posts fetch failed:', res.status, errorData);
      throw new Error(errorData.message || `Failed to fetch posts (${res.status})`);
    }
    return res.json();
  },

  // Get single post details
  get: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/${postId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch post');
    return res.json();
  },

  // Get popular posts
  popular: async (params = {}) => {
    const qp = new URLSearchParams();
    if (params.limit) qp.append('limit', params.limit);
    if (params.community) qp.append('community', params.community);
    if (params.category) qp.append('category', params.category);

    const res = await fetch(`${API_BASE_URL}/popular?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch popular posts');
    return res.json();
  },

  // Get new posts
  new: async (params = {}) => {
    const qp = new URLSearchParams();
    if (params.limit) qp.append('limit', params.limit);
    if (params.community) qp.append('community', params.community);
    if (params.category) qp.append('category', params.category);

    const res = await fetch(`${API_BASE_URL}/new?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch new posts');
    return res.json();
  },

  // Get community posts
  byCommunity: async (communityId, params = {}) => {
    const qp = new URLSearchParams();
    if (params.page) qp.append('page', params.page);
    if (params.limit) qp.append('limit', params.limit);
    if (params.status) qp.append('status', params.status);
    if (params.category) qp.append('category', params.category);

    const res = await fetch(`${API_BASE_URL}/community/${communityId}?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch community posts');
    return res.json();
  },

  // Approve a post
  approve: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/${postId}/approve`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to approve post');
    return res.json();
  },

  // Reject a post
  reject: async (postId, reason = '') => {
    const res = await fetch(`${API_BASE_URL}/${postId}/reject`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    if (!res.ok) throw new Error('Failed to reject post');
    return res.json();
  },

  // Delete a post
  delete: async (postId) => {
    const res = await fetch(`${API_BASE_URL}/${postId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete post');
    return res.json();
  },

  // Edit a post (title, content)
  edit: async (postId, data = {}) => {
    const res = await fetch(`${API_BASE_URL}/${postId}/edit`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to edit post');
    return res.json();
  },

  // Get all communities for filtering
  getCommunities: async (params = {}) => {
    const qp = new URLSearchParams();
    if (params.limit) qp.append('limit', params.limit);
    if (params.page) qp.append('page', params.page);

    const res = await fetch(`${COMMUNITY_API_BASE}?${qp.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch communities');
    return res.json();
  },
};
