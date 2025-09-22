import { getAuthToken } from '../utils/auth';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get headers with auth token
const getHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Helper function to get headers for form data
const getFormHeaders = (includeAuth = true) => {
  const headers = {};
  
  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
};

export const communityApi = {
  // Discover Communities (Public)
  discoverCommunities: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.tags) queryParams.append('tags', filters.tags.join(','));
      if (filters.page) queryParams.append('page', filters.page);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.visible) queryParams.append('visible', filters.visible);
      
      const response = await fetch(
        `${API_BASE_URL}/communities/discover?${queryParams}`,
        {
          method: 'GET',
          headers: getHeaders(false), // Public endpoint
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error discovering communities:', error);
      throw error;
    }
  },

  // Get Community Details (Public)
  getCommunityDetails: async (communityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
        method: 'GET',
        headers: getHeaders(false), // Public endpoint
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting community details:', error);
      throw error;
    }
  },

  // Create Community (Protected)
  createCommunity: async (communityData, imageFile = null) => {
    try {
      const { initializeDummyAuth } = await import('../utils/auth');
      initializeDummyAuth();
      
      const formData = new FormData();
      
      formData.append('community_name', communityData.community_name);
      formData.append('description', communityData.description);
      
      // Send each tag individually for backend compatibility
      if (communityData.community_tags && communityData.community_tags.length > 0) {
        communityData.community_tags.forEach(tag => {
          formData.append('community_tags[]', tag);
        });
      }
      
      if (communityData.visible) {
        formData.append('visible', communityData.visible);
      }
      
      if (communityData.moderation) {
        formData.append('moderation', communityData.moderation);
      }
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/communities`, {
        method: 'POST',
        headers: getFormHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  },

  // Update Community (Protected) 
  updateCommunity: async (communityId, communityData, imageFile = null) => {
    try {
      const { initializeDummyAuth } = await import('../utils/auth');
      initializeDummyAuth();
      
      const formData = new FormData();
      
      if (communityData.community_name) {
        formData.append('community_name', communityData.community_name);
      }
      if (communityData.description) {
        formData.append('description', communityData.description);
      }
      
      // Handle tags properly - send each tag individually
      if (communityData.community_tags && communityData.community_tags.length > 0) {
        communityData.community_tags.forEach(tag => {
          formData.append('community_tags[]', tag);
        });
      }
      
      if (communityData.visible) {
        formData.append('visible', communityData.visible);
      }
      if (communityData.moderation) {
        formData.append('moderation', communityData.moderation);
      }
      
      if (imageFile) {
        formData.append('image', imageFile);
      }
      
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
        method: 'PUT',
        headers: getFormHeaders(true),
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating community:', error);
      throw error;
    }
  },

  // Follow Community (Protected)
  followCommunity: async (communityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/follow`, {
        method: 'POST',
        headers: getHeaders(true),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error following community:', error);
      throw error;
    }
  },

  // Unfollow Community (Protected)
  unfollowCommunity: async (communityId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}/unfollow`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error unfollowing community:', error);
      throw error;
    }
  },

  // Get User's Communities (Protected)
  getUserCommunities: async (searchQuery = '') => {
    try {
      const { initializeDummyAuth } = await import('../utils/auth');
      initializeDummyAuth();
      
      const queryParams = searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : '';
      
      const response = await fetch(`${API_BASE_URL}/communities/user/my-communities${queryParams}`, {
        method: 'GET',
        headers: getHeaders(true),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting user communities:', error);
      // Return dummy data with search filtering
      const dummyData = {
        owned: [
          {
            _id: 'owned-1',
            community_name: "My Tech Community",
            description: "A community I created for sharing tech knowledge and experiences.",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
            no_of_followers: 234,
            no_of_posts: 45,
            user_id: '507f1f77bcf86cd799439011', // User owns this
            community_tags: ["Technology", "Programming"],
            visible: "public",
            moderation: "only admin"
          }
        ],
        followed: [] // Will be populated as user follows communities
      };
      
      // Apply search filtering to dummy data
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        dummyData.owned = dummyData.owned.filter(community =>
          community.community_name.toLowerCase().includes(searchLower) ||
          community.description.toLowerCase().includes(searchLower)
        );
        dummyData.followed = dummyData.followed.filter(community =>
          community.community_name.toLowerCase().includes(searchLower) ||
          community.description.toLowerCase().includes(searchLower)
        );
      }
      
      return dummyData;
    }
  },

  // Delete Community (Protected)
  deleteCommunity: async (communityId) => {
    try {
      const { initializeDummyAuth } = await import('../utils/auth');
      initializeDummyAuth();
      
      const response = await fetch(`${API_BASE_URL}/communities/${communityId}`, {
        method: 'DELETE',
        headers: getHeaders(true),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting community:', error);
      throw error;
    }
  },
};