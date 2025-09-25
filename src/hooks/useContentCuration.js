import { useState, useEffect, useCallback } from 'react';
import { 
  savedPostsAPI, 
  viewHistoryAPI, 
  searchAPI, 
  handleAPIError,
  transformPostToBlog,
  cacheManager 
} from '../services/api';

//SAVED POSTS HOOK WITH REAL-TIME TRACKING 

export const useSavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [currentCategory, setCurrentCategory] = useState('All Items');
  
  // NEW: Track saved post IDs for real-time bookmark state
  const [savedPostIds, setSavedPostIds] = useState(new Set());

  // Load saved posts and update bookmark tracking
  const loadSavedPosts = useCallback(async (category = null, page = 1, append = false) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `saved_posts_${category || 'all'}_${page}`;
      const cachedData = cacheManager.get(cacheKey);
      
      if (cachedData && !append) {
        setSavedPosts(cachedData.posts);
        setPagination(cachedData.pagination);
        
        // Update saved IDs tracking
        const ids = new Set(cachedData.posts.map(post => String(post.id)));
        setSavedPostIds(ids);
        
        setLoading(false);
        return;
      }

      const response = await savedPostsAPI.getSavedPosts(category, page);
      
      const transformedPosts = response.savedPosts
        .map(item => {
          const blogPost = transformPostToBlog(item);
          if (!blogPost) return null;
          
          return {
            ...blogPost,
            savedAt: item.savedAt,
            category: item.category,
            savedPostId: item._id,
            bookmarked: true, // Ensure saved posts are marked as bookmarked
          };
        })
        .filter(Boolean);

      if (append) {
        setSavedPosts(prev => [...prev, ...transformedPosts]);
      } else {
        setSavedPosts(transformedPosts);
        setCurrentCategory(category || 'All Items');
      }
      
      setPagination(response.pagination);

      // Update saved IDs tracking
      const newIds = new Set(transformedPosts.map(post => String(post.id)));
      if (append) {
        setSavedPostIds(prev => new Set([...prev, ...newIds]));
      } else {
        setSavedPostIds(newIds);
      }

      cacheManager.set(cacheKey, {
        posts: transformedPosts,
        pagination: response.pagination
      });

    } catch (err) {
      setError(handleAPIError(err, 'Failed to load saved posts'));
      if (!append) {
        setSavedPosts([]);
        setSavedPostIds(new Set());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Save a post with immediate UI feedback
  const savePost = useCallback(async (blogData, category = 'Saved') => {
    try {
      setError(null);
      
      const postId = String(blogData.id || blogData._id);
      
      // add to saved IDs right away
      setSavedPostIds(prev => new Set([...prev, postId]));
      
      console.log('Saving post with blogData:', blogData);
      
      const response = await savedPostsAPI.savePost(blogData, category);
      
      // Clear relevant cache
      cacheManager.clear();
      
      // Create the new saved item exactly as it would appear from the API
      const newSavedItem = {
        ...blogData,
        savedAt: new Date().toISOString(),
        category,
        savedPostId: response.savedPost?._id || `temp_${Date.now()}`,
        bookmarked: true
      };
      
      // Update local state - add to beginning of list
      setSavedPosts(prev => {
        // Check if item already exists to avoid duplicates
        const exists = prev.some(post => String(post.id) === postId);
        if (exists) {
          // Update existing item's category if it exists
          return prev.map(post => 
            String(post.id) === postId 
              ? { ...post, category, savedAt: new Date().toISOString() }
              : post
          );
        }
        return [newSavedItem, ...prev];
      });
      
      return { success: true, message: response.message || 'Post saved successfully!' };
    } catch (err) {
      // On error, remove from saved IDs (revert optimistic update)
      const postId = String(blogData.id || blogData._id);
      setSavedPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(postId);
        return newSet;
      });
      
      const errorMessage = handleAPIError(err, 'Failed to save post');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Remove saved post with immediate UI feedback
  const removeSavedPost = useCallback(async (postId) => {
    try {
      setError(null);
      
      console.log('Removing saved post with ID:', postId);
      const postIdStr = String(postId);
      
      // remove from saved IDs 
      setSavedPostIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(postIdStr);
        return newSet;
      });
      
      // remove from local state for instant UI feedback
      setSavedPosts(prev => {
        const filtered = prev.filter(post => {
          const keep = String(post.id) !== postIdStr;
          if (!keep) {
            console.log('Removing post from local state:', post.id, post.title);
          }
          return keep;
        });
        console.log('Updated savedPosts length:', filtered.length);
        return filtered;
      });
      
      // Then make the API call (in background)
      try {
        await savedPostsAPI.removeSavedPost(postId);
        console.log('Post removed from API successfully');
      } catch (apiError) {
        console.error('API removal failed, reverting optimistic update:', apiError);
        // Revert optimistic updates on API failure
        setSavedPostIds(prev => new Set([...prev, postIdStr]));
        // Note: We could also revert savedPosts, but for UX it might be better to keep it removed
      }
      
      // Clear cache to ensure fresh data on next load
      cacheManager.clear();
      
      return { success: true, message: 'Post removed successfully!' };
    } catch (err) {
      console.error('Failed to remove post:', err);
      
      const errorMessage = handleAPIError(err, 'Failed to remove post');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  // Check if post is saved - now uses the savedPostIds Set for real-time tracking
  const isPostSaved = useCallback((postId) => {
    const result = savedPostIds.has(String(postId));
    console.log(`Checking if post ${postId} is saved:`, result);
    return result;
  }, [savedPostIds]);

  // Force refresh saved posts (useful after operations)
  const refreshSavedPosts = useCallback(() => {
    cacheManager.clear();
    loadSavedPosts(currentCategory === 'All Items' ? null : currentCategory);
  }, [currentCategory, loadSavedPosts]);

  // Initialize saved IDs on component mount
  useEffect(() => {
    if (savedPosts.length > 0) {
      const ids = new Set(savedPosts.map(post => String(post.id)));
      setSavedPostIds(ids);
    }
  }, [savedPosts]);

  return {
    savedPosts,
    loading,
    error,
    pagination,
    currentCategory,
    savedPostIds, // Export for debugging
    setCurrentCategory,
    loadSavedPosts,
    savePost,
    removeSavedPost,
    isPostSaved,
    refreshSavedPosts,
  };
};

// VIEW HISTORY HOOK 

export const useViewHistory = () => {
  const [viewHistory, setViewHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [selectedItems, setSelectedItems] = useState(new Set());

  const loadViewHistory = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      const cacheKey = `view_history_${page}`;
      const cachedData = cacheManager.get(cacheKey);
      
      if (cachedData) {
        setViewHistory(cachedData.history);
        setPagination(cachedData.pagination);
        setLoading(false);
        return;
      }

      const response = await viewHistoryAPI.getViewHistory(page);
      
      const transformedHistory = response.viewHistory
        .map(item => {
          const blogPost = transformPostToBlog(item);
          if (!blogPost) return null;
          
          return {
            ...blogPost,
            viewedAt: item.viewedAt,
            historyId: item._id,
            timestamp: item.viewedAt,
          };
        })
        .filter(Boolean);

      setViewHistory(transformedHistory);
      setPagination(response.pagination);

      cacheManager.set(cacheKey, {
        history: transformedHistory,
        pagination: response.pagination
      });

    } catch (err) {
      setError(handleAPIError(err, 'Failed to load view history'));
      setViewHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const trackPostView = useCallback(async (blogData) => {
    const postId = blogData.id || blogData._id;
    
    try {
      console.log('Tracking view for post:', postId);
      
      await viewHistoryAPI.trackView(blogData);
      
      cacheManager.clear();
        
      return { success: true };
    } catch (err) {
      console.error('Failed to track view:', err);
      return { success: false, error: handleAPIError(err) };
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      setError(null);
      
      await viewHistoryAPI.clearViewHistory();
      
      cacheManager.clear();
      
      setViewHistory([]);
      setPagination({});
      setSelectedItems(new Set());
      
      return { success: true, message: 'History cleared successfully!' };
    } catch (err) {
      const errorMessage = handleAPIError(err, 'Failed to clear history');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const removeHistoryItem = useCallback(async (historyId) => {
    try {
      setError(null);
      
      await viewHistoryAPI.removeHistoryItem(historyId);
      
      cacheManager.clear();
      
      setViewHistory(prev => prev.filter(item => item.historyId !== historyId));
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(historyId);
        return newSet;
      });
      
      return { success: true, message: 'History item removed successfully!' };
    } catch (err) {
      const errorMessage = handleAPIError(err, 'Failed to remove history item');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const removeMultipleHistoryItems = useCallback(async (historyIds) => {
    try {
      setError(null);
      
      const result = await viewHistoryAPI.removeMultipleHistoryItems(historyIds);
      
      cacheManager.clear();
      
      setViewHistory(prev => prev.filter(item => !historyIds.includes(item.historyId)));
      setSelectedItems(new Set());
      
      return { 
        success: true, 
        message: `${result.deletedCount} history items removed successfully!` 
      };
    } catch (err) {
      const errorMessage = handleAPIError(err, 'Failed to remove history items');
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const toggleItemSelection = useCallback((historyId) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(historyId)) {
        newSet.delete(historyId);
      } else {
        newSet.add(historyId);
      }
      return newSet;
    });
  }, []);

  const selectAllItems = useCallback(() => {
    const allIds = new Set(viewHistory.map(item => item.historyId));
    setSelectedItems(allIds);
  }, [viewHistory]);

  const clearSelection = useCallback(() => {
    setSelectedItems(new Set());
  }, []);

  return {
    viewHistory,
    loading,
    error,
    pagination,
    selectedItems,
    loadViewHistory,
    trackPostView,
    clearHistory,
    removeHistoryItem,
    removeMultipleHistoryItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
  };
};

//  SEARCH HOOK 

export const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [searchPagination, setSearchPagination] = useState({});
  const [currentQuery, setCurrentQuery] = useState('');

  const searchSavedContent = useCallback(async (query, category = null, page = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentQuery('');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      setCurrentQuery(query);

      const response = await searchAPI.searchSavedContent(query, category, page);
      
      const transformedResults = response.results
        .map(item => {
          const blogPost = transformPostToBlog(item);
          if (!blogPost) return null;
          
          return {
            ...blogPost,
            savedAt: item.savedAt,
            category: item.category,
            searchScore: item.score || 1,
          };
        })
        .filter(Boolean);

      setSearchResults(transformedResults);
      setSearchPagination(response.pagination);

    } catch (err) {
      setSearchError(handleAPIError(err, 'Search failed'));
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const searchViewHistory = useCallback(async (query, page = 1) => {
    if (!query.trim()) {
      setSearchResults([]);
      setCurrentQuery('');
      return;
    }

    try {
      setSearchLoading(true);
      setSearchError(null);
      setCurrentQuery(query);

      const response = await searchAPI.searchViewHistory(query, page);
      
      const transformedResults = response.results
        .map(item => {
          const blogPost = transformPostToBlog(item);
          if (!blogPost) return null;
          
          return {
            ...blogPost,
            viewedAt: item.viewedAt,
            historyId: item._id,
            searchScore: item.score || 1,
            timestamp: item.viewedAt,
          };
        })
        .filter(Boolean);

      setSearchResults(transformedResults);
      setSearchPagination(response.pagination);

    } catch (err) {
      setSearchError(handleAPIError(err, 'Search failed'));
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setCurrentQuery('');
    setSearchError(null);
    setSearchPagination({});
  }, []);

  return {
    searchResults,
    searchLoading,
    searchError,
    searchPagination,
    currentQuery,
    searchSavedContent,
    searchViewHistory,
    clearSearch,
  };
};

//  NOTIFICATIONS HOOK (

export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      timestamp: Date.now(),
      ...notification,
    };

    setNotifications(prev => [newNotification, ...prev]);

    if (!notification.persistent) {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 5000);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const showSuccess = useCallback((message) => {
    return addNotification({
      type: 'success',
      message,
      icon: 'check_circle',
    });
  }, [addNotification]);

  const showError = useCallback((message) => {
    return addNotification({
      type: 'error',
      message,
      icon: 'error',
      persistent: true,
    });
  }, [addNotification]);

  const showInfo = useCallback((message) => {
    return addNotification({
      type: 'info',
      message,
      icon: 'info',
    });
  }, [addNotification]);

  return {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showInfo,
  };
};

//  COMBINED CONTENT CURATION HOOK 

export const useContentCuration = () => {
  const savedPosts = useSavedPosts();
  const viewHistory = useViewHistory();
  const search = useSearch();
  const notifications = useNotifications();

  useEffect(() => {
    let mounted = true;
    
    const initializeData = async () => {
      if (mounted) {
        if (savedPosts.savedPosts.length === 0 && !savedPosts.loading) {
          savedPosts.loadSavedPosts();
        }
        if (viewHistory.viewHistory.length === 0 && !viewHistory.loading) {
          viewHistory.loadViewHistory();
        }
      }
    };
    
    initializeData();
    
    return () => {
      mounted = false;
    };
  }, []);

  return {
    savedPosts,
    viewHistory,
    search,
    notifications,
  };
};