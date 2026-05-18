import { getAuthHeader } from './authHeader';
import { getRequiredUrl } from "../utils/env";

const API_BASE_URL = `${getRequiredUrl("VITE_ADMIN_SERVICE_URL")}/api`; // Admin service

// Base API request handler
const apiRequest = async (url, options = {}) => {
  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Authenticated request
const authenticatedRequest = async (url, options = {}) => {
  try {
    const authHeaders = getAuthHeader();
    return await apiRequest(url, {
      ...options,
      headers: {
        ...authHeaders,
        ...options.headers,
      }
    });
  } catch (error) {
    throw error;
  }
};

export const reportApi = {
  // USER: Submit a report
  submit: async (reportData) => {
    try {
      const authHeaders = getAuthHeader();
      const { userId, username, profileImage } = extractUserFromToken(authHeaders.Authorization);

      if (!userId) {
        throw new Error('User not authenticated. Please login again.');
      }

      // Attempt to enrich reporter info from profile service when username/avatar missing
      let enrichedUsername = username;
      let enrichedProfileImage = profileImage;
      if ((!username || username === 'Unknown') || !profileImage) {
        try {
          const profileRes = await fetch(`${getRequiredUrl("VITE_AUTH_SERVICE_URL")}/profile/${userId}`, {
            headers: {
              ...authHeaders,
            }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            const p = profileData.profile || profileData.data || profileData;
            enrichedUsername = p.fullName || p.username || p.name || p.email || enrichedUsername || 'Unknown';
            enrichedProfileImage = p.profileImage || p.avatar || p.image || enrichedProfileImage || '';
          }
        } catch (e) {
          console.warn('Failed to enrich reporter profile:', e?.message || e);
        }
      }

      return await apiRequest('/reports', {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          reporterId: userId,
          reporterUsername: enrichedUsername,
          reporterProfileImage: enrichedProfileImage,
          targetType: reportData.targetType, // 'post', 'comment', 'user', 'community'
          targetId: reportData.targetId,
          reason: reportData.reason,
          description: reportData.description,
          evidence: reportData.evidence || []
        })
      });
    } catch (error) {
      throw error;
    }
  },

  // Check if user already reported this
  hasUserReported: async (targetType, targetId) => {
    try {
      const authHeaders = getAuthHeader();
      const userId = extractUserIdFromToken(authHeaders.Authorization);

      // This will be handled by the submitReport endpoint
      // by returning an error if duplicate found
      return false;
    } catch (error) {
      throw error;
    }
  }
};

// ADMIN APIs
export const adminReportApi = {
  // Get all reports with filters
  list: async (params = {}) => {
    try {
      const queryString = new URLSearchParams();
      if (params.status) queryString.append('status', params.status);
      if (params.reason) queryString.append('reason', params.reason);
      if (params.targetType) queryString.append('targetType', params.targetType);
      if (params.page) queryString.append('page', params.page);
      if (params.limit) queryString.append('limit', params.limit);

      return await authenticatedRequest(
        `/reports?${queryString.toString()}`,
        { method: 'GET' }
      );
    } catch (error) {
      throw error;
    }
  },

  // Get single report with full context
  get: async (reportId) => {
    try {
      return await authenticatedRequest(`/reports/${reportId}`, { method: 'GET' });
    } catch (error) {
      throw error;
    }
  },

  // Take moderation action on report
  takeAction: async (reportId, action, adminId, options = {}) => {
    try {
      return await authenticatedRequest(`/reports/${reportId}/action`, {
        method: 'PATCH',
        body: JSON.stringify({
          action, // 'approved', 'removed', 'deleted', 'user_banned', 'user_warned'
          adminId,
          adminNotes: options.adminNotes || '',
          banDuration: options.banDuration || null
        })
      });
    } catch (error) {
      throw error;
    }
  },

  // Get report statistics
  getStats: async () => {
    try {
      return await authenticatedRequest('/reports/stats', { method: 'GET' });
    } catch (error) {
      throw error;
    }
  }
};

// Helper function to extract user ID from JWT token
function extractUserFromToken(authHeader) {
  try {
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      console.warn('⚠️ No token found in auth header');
      return { userId: null, username: 'Unknown', profileImage: '' };
    }

    const base64Url = token.split('.')[1];
    if (!base64Url) {
      console.warn('⚠️ Invalid token format');
      return { userId: null, username: 'Unknown', profileImage: '' };
    }

    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    console.log('🔑 JWT Payload:', payload);
    
    const userId = payload.id || payload.userId || payload._id || payload.user_id || payload.sub;
    const username = payload.username || payload.name || payload.email || 'Unknown';
    const profileImage = payload.profileImage || payload.avatar || payload.image || '';
    console.log('👤 Extracted user:', { userId, username, profileImage });
    
    return { userId, username, profileImage };
  } catch (error) {
    console.error('❌ Failed to extract user from token:', error);
    return { userId: null, username: 'Unknown', profileImage: '' };
  }
}
