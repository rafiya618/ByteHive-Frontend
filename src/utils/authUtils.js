import { jwtDecode } from 'jwt-decode';

export const AUTH_LOGOUT_EVENT = 'bytehive:auth-logout';

const BLOCKED_AUTH_MESSAGE_PATTERN = /\b(blocked|suspend|suspended|banned|ban)\b/i;

const getAuthPayload = () => {
  const authData = localStorage.getItem('Auth');
  if (!authData) {
    return null;
  }

  try {
    return JSON.parse(authData);
  } catch (error) {
    return null;
  }
};

export const getStoredAuthToken = () => {
  const authData = getAuthPayload();
  return authData?.token || null;
};

export const isBlockedAuthResponse = (status, payload = {}) => {
  if (status !== 403) {
    return false;
  }

  const message = [
    payload?.message,
    payload?.error,
    payload?.details,
    payload?.code,
  ]
    .filter(Boolean)
    .join(' ');

  return BLOCKED_AUTH_MESSAGE_PATTERN.test(message);
};

export const forceLogout = () => {
  localStorage.removeItem('Auth');

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_LOGOUT_EVENT, {
      detail: { reason: 'blocked' },
    }));
  }
};

export class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthError';
  }
}

// Get authorization headers for API requests
export const getAuthHeaders = () => {
  const token = getStoredAuthToken();
  if (!token) {
    throw new AuthError('No token, authorization denied');
  }

  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const getAuthToken = () => {
  const token = getStoredAuthToken();
  if (!token) {
    throw new AuthError('No token found');
  }

  return token;
};

// Extract user ID from JWT token
export const getUserIdFromToken = () => {
  const authData = getAuthPayload();
  if (!authData) {
    throw new AuthError('No auth data found');
  }

  try {
    if (!authData.token) {
      throw new AuthError('No token found');
    }

    const decoded = jwtDecode(authData.token);
    const userId = decoded._id || decoded.id || decoded.user_id || decoded.userId;

    if (!userId) {
      throw new AuthError('User ID not found in token');
    }

    return userId;
  } catch (error) {
    throw new AuthError('Invalid auth token');
  }
};

// Check if user can edit community (owner or moderator)
export const canEditCommunity = (community, currentUserId) => {
  if (!currentUserId || !community) return false;
  
  // Handle both userId and user_id field names
  const communityUserId = community.userId || community.user_id;
  const isOwner = communityUserId === currentUserId;
  const isModerator = community.moderators && community.moderators.includes(currentUserId);
  
  return isOwner || isModerator;
};

// Check if user can delete community (only owner)
export const canDeleteCommunity = (community, currentUserId) => {
  if (!currentUserId || !community) return false;
  
  // Handle both userId and user_id field names
  const communityUserId = community.userId || community.user_id;
  return communityUserId === currentUserId;
};

// Check if user is owner of community
export const isOwnerOfCommunity = (community, currentUserId) => {
  if (!currentUserId || !community) return false;
  
  // Handle both userId and user_id field names
  const communityUserId = community.userId || community.user_id;
  return communityUserId === currentUserId;
};
