import axios from 'axios';

const baseRE = (import.meta.env.VITE_RE_SERVICE_URL || 'http://localhost:3005').replace(/\/$/, '');

export async function reTrackEvent({ userId, action, entityType, entityId, metadata }) {
  try {
    const url = `${baseRE}/track`;
    const payload = { userId, action, entityType, entityId, metadata };
    const res = await axios.post(url, payload);
    return res?.data;
  } catch (error) {
    console.error('Failed to track event:', error);
    return null;
  }
}

export async function reGetTrendingPosts(limit = 20) {
  try {
    const url = `${baseRE}/trending/posts?limit=${limit}`;
    const res = await axios.get(url);
    const data = res?.data?.data || res?.data || [];
    return Array.isArray(data) ? data.slice(0, limit) : [];
  } catch (error) {
    console.error('Failed to fetch trending posts:', error);
    return [];
  }
}

export async function reGetTrendingCommunities(limit = 20) {
  try {
    const url = `${baseRE}/trending/communities?limit=${limit}`;
    const res = await axios.get(url);
    const data = res?.data?.data || res?.data || [];
    return Array.isArray(data) ? data.slice(0, limit) : [];
  } catch (error) {
    console.error('Failed to fetch trending communities:', error);
    return [];
  }
}

export async function reGetFeed(userId, limit = 20) {
  try {
    const url = `${baseRE}/feed/${encodeURIComponent(userId)}?limit=${limit}`;
    const res = await axios.get(url);
    // Returns { recommended: { posts: [...] }, trending: { posts: [...], communities: [...] }, recent: { posts: [...] } }
    return res?.data || {};
  } catch (error) {
    console.error('Failed to fetch feed:', error);
    return {};
  }
}
