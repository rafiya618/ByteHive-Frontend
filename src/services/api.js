const API_BASE_URL = 'http://localhost:5000/api';

// Get user ID from localStorage
const getUserId = () => {
  let userId = localStorage.getItem('user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_id', userId);
  }
  return userId;
};

// Get dummy JWT token
const getAuthToken = () => {
  return 'dummy_jwt_token_for_development';
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    console.log('API Call:', `${API_BASE_URL}${endpoint}`, options);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        ...options.headers,
      },
      ...options,
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('Response data:', responseData);
    return responseData;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// ==================== SAVED POSTS API ====================

export const savedPostsAPI = {
  savePost: async (blogData, category = 'Saved') => {
    const userId = getUserId();
    
    const postId = String(blogData.id || blogData._id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const title = blogData.title || 'Untitled Post';
    const content = blogData.description || blogData.content || 'No content available';
    const authorName = typeof blogData.author === 'string' 
      ? blogData.author 
      : (blogData.author?.name || 'Anonymous');
    const tags = Array.isArray(blogData.tags) ? blogData.tags : [];
    
    const requestBody = {
      userId,
      postId,
      category,
      title,
      content,
      author: authorName,
      tags
    };
    
    console.log('Saving post with data:', requestBody);
    
    return apiCall('/saved-posts', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  },

  getSavedPosts: async (category = null, page = 1, limit = 10) => {
    const userId = getUserId();
    const queryParams = new URLSearchParams({ page, limit });
    if (category) queryParams.append('category', category);
    
    return apiCall(`/saved-posts/user/${userId}?${queryParams}`);
  },

  getSavedPostsByCategory: async (category, page = 1, limit = 10) => {
    const userId = getUserId();
    const queryParams = new URLSearchParams({ page, limit });
    
    return apiCall(`/saved-posts/user/${userId}/category/${category}?${queryParams}`);
  },

  removeSavedPost: async (postId) => {
    const userId = getUserId();
    console.log('Removing saved post:', { userId, postId });
    return apiCall(`/saved-posts/user/${userId}/post/${encodeURIComponent(postId)}`, {
      method: 'DELETE',
    });
  },
};

// VIEW HISTORY API 

export const viewHistoryAPI = {
  trackView: async (blogData) => {
    const userId = getUserId();
    
    const postId = String(blogData.id || blogData._id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    const title = blogData.title || 'Untitled Post';
    const content = blogData.description || blogData.content || 'No content available';
    const authorName = typeof blogData.author === 'string' 
      ? blogData.author 
      : (blogData.author?.name || 'Anonymous');
    const tags = Array.isArray(blogData.tags) ? blogData.tags : [];
    
    // Remove duplicate tracking prevention to allow multiple views
    const trackingKey = `${userId}_${postId}_${Date.now()}`;
    
    if (window.pendingTrackRequests && window.pendingTrackRequests.has(trackingKey)) {
      console.log('Duplicate track request prevented');
      return { message: 'View tracking already in progress' };
    }
    
    if (!window.pendingTrackRequests) {
      window.pendingTrackRequests = new Set();
    }
    
    window.pendingTrackRequests.add(trackingKey);
    
    try {
      const requestBody = {
        userId,
        postId,
        title,
        content,
        author: authorName,
        tags
      };
      
      console.log('Tracking view with data:', requestBody);
      
      const result = await apiCall('/view-history', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });
      
      return result;
    } finally {
      setTimeout(() => {
        window.pendingTrackRequests.delete(trackingKey);
      }, 500);
    }
  },

  getViewHistory: async (page = 1, limit = 10) => {
    const userId = getUserId();
    const queryParams = new URLSearchParams({ page, limit });
    
    return apiCall(`/view-history/user/${userId}?${queryParams}`);
  },

  clearViewHistory: async () => {
    const userId = getUserId();
    return apiCall(`/view-history/user/${userId}`, {
      method: 'DELETE',
    });
  },

  removeHistoryItem: async (historyId) => {
    const userId = getUserId();
    return apiCall(`/view-history/user/${userId}/item/${historyId}`, {
      method: 'DELETE',
    });
  },

  removeMultipleHistoryItems: async (historyIds) => {
    const userId = getUserId();
    return apiCall(`/view-history/user/${userId}/remove-multiple`, {
      method: 'POST',
      body: JSON.stringify({ historyIds }),
    });
  },
};

// SEARCH API 

export const searchAPI = {
  searchSavedContent: async (query, category = null, page = 1, limit = 10) => {
    const userId = getUserId();
    const queryParams = new URLSearchParams({ q: query, page, limit });
    if (category && category !== 'All Items') {
      queryParams.append('category', category === 'Read Later' ? 'Watch Later' : category);
    }
    
    return apiCall(`/search/saved/${userId}?${queryParams}`);
  },

  searchViewHistory: async (query, page = 1, limit = 10) => {
    const userId = getUserId();
    const queryParams = new URLSearchParams({ q: query, page, limit });
    
    return apiCall(`/search/history/${userId}?${queryParams}`);
  },
};

// ==================== POSTS API ====================

export const postsAPI = {
  createPost: async (postData) => {
    return apiCall('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  getPost: async (postId) => {
    return apiCall(`/posts/${postId}`);
  },
};

//  UTILITY FUNCTIONS 

export const transformBlogToPost = (blogData) => {
  const postId = String(blogData.id || blogData._id || `generated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const title = blogData.title || 'Untitled Post';
  const content = blogData.description || blogData.content || 'No content available';
  const authorName = typeof blogData.author === 'string' 
    ? blogData.author 
    : (blogData.author?.name || 'Anonymous');
  const tags = Array.isArray(blogData.tags) ? blogData.tags : [];
  
  return {
    id: postId,
    _id: postId,
    title,
    content,
    description: content,
    author: authorName,
    community: blogData.community || 'General',
    category: blogData.community || 'General',
    tags,
    date: blogData.date || new Date().toLocaleDateString(),
    createdAt: new Date(blogData.date || Date.now()),
  };
};

// Generate dynamic images based on post data
export const transformPostToBlog = (postData) => {
  const post = postData.post || postData.postId || postData;
  
  if (!post || !post._id) {
    console.warn('Invalid post data:', postData);
    return null;
  }
  
  // Create a consistent hash from the post ID for image generation
  const postId = String(post._id);
  const hashCode = postId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  // Generate a consistent but varied image URL based on post ID
  const imageBase = Math.abs(hashCode) % 1000000;
  const imageId = 1550000000000 + imageBase;
  
  return {
    id: postId,
    title: post.title || 'Untitled Post',
    description: post.content || 'No content available',
    author: {
      name: post.author || 'Anonymous',
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    },
    community: post.category || 'General',
    date: new Date(post.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }),
    readTime: '5 min',
    tags: post.tags || [],
    upvotes: Math.floor(Math.random() * 200) + 50,
    downvotes: Math.floor(Math.random() * 20) + 1,
    comments: Math.floor(Math.random() * 50) + 5,
    views: Math.floor(Math.random() * 2000) + 500,
    // FIXED: Generate unique images based on post ID hash
    image: `https://images.unsplash.com/photo-${imageId}?w=600&h=300&fit=crop`,
    bookmarked: true,
  };
};

export const handleAPIError = (error, defaultMessage = 'Something went wrong') => {
  console.error('API Error:', error);
  return error.message || defaultMessage;
};

export const isOnline = () => navigator.onLine;

// Cache management - In-memory cache
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for better real-time updates
const cache = new Map();

export const cacheManager = {
  get: (key) => {
    try {
      const item = cache.get(key);
      if (!item) return null;
      
      const { data, timestamp } = item;
      if (Date.now() - timestamp > CACHE_DURATION) {
        cache.delete(key);
        return null;
      }
      
      return data;
    } catch {
      return null;
    }
  },

  set: (key, data) => {
    try {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  },

  remove: (key) => {
    cache.delete(key);
  },

  clear: () => {
    cache.clear();
  }
};