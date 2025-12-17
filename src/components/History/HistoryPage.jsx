import { useState, useEffect, useRef, useCallback } from "react";
import SearchBar from "../../shared/SearchBar";
import BlogCard from "../BlogListing/BlogCard";
import { getHistory, clearHistory, deleteHistoryItems } from "../../api/curationApi";
import { postsApi } from "../../api/postsApi";
import { groupHistoryByDate, formatTime } from "../../utils/historyHelpers";
import { Loader } from "lucide-react"; 

// Default image for posts without thumbnails (same as BlogListing)
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";

const HistoryPage = () => {
  const [historyItems, setHistoryItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const kebabRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page] = useState(1);
  const [groupedHistory, setGroupedHistory] = useState({});

  // Note: groupHistoryByDate is now imported from historyHelpers
  // Day-based grouping logic moved to utils/historyHelpers.js

  const handleDeleteSelected = async () => {
    if (selectedItems.length === 0) {
      alert("No items selected.");
      return;
    }
    if (!window.confirm("Delete selected history items?")) return;
    setLoading(true);
    setError(null);
    try {
      await deleteHistoryItems(selectedItems);
      setHistoryItems((prev) => prev.filter((item) => !selectedItems.includes(item.historyId || item._id)));
      setSelectedItems([]);
      setSelectionMode(false);
    } catch (err) {
      setError(err.message || "Failed to delete selected items");
    } finally {
      setLoading(false);
    }
  };

  const fetchPostDetails = async (postId) => {
    try {
      console.log("Fetching post details for postId:", postId);
      const response = await postsApi.getPostById(postId);
      console.log("Post details response:", response);
      console.log("Image fields:", {
        thumbnail: response.post?.thumbnail,
        image: response.post?.image,
        imageUrl: response.post?.imageUrl
      });
      return response.post || response;
    } catch (error) {
      console.error("Error fetching post details for", postId, ":", error);
      return null;
    }
  };

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Component: Fetching history for page:", page);

      const response = await getHistory(page);
      console.log("Component: History API response:", response);

      let historyData = [];

      if (response) {
        if (Array.isArray(response)) {
          historyData = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            historyData = response.data;
          } else if (response.data.history && Array.isArray(response.data.history)) {
            historyData = response.data.history;
          }
        } else if (response.history && Array.isArray(response.history)) {
          historyData = response.history;
        }
      }

      console.log("Component: Processed history data:", historyData);
      console.log("Component: History data length:", historyData.length);

      if (historyData.length > 0) {
        console.log("Fetching post details for", historyData.length, "history items");
        const historyWithPosts = await Promise.all(
          historyData.map(async (historyItem) => {
            const postDetails = await fetchPostDetails(historyItem.postId);

            if (postDetails) {
              return {
                ...postDetails,
                _id: historyItem._id,
                viewedAt: historyItem.lastAccessed || historyItem.viewedAt,
                lastAccessed: historyItem.lastAccessed,
                viewedDate: historyItem.viewedDate,
                historyId: historyItem._id,
                image: postDetails.thumbnail || postDetails.image || postDetails.imageUrl || DEFAULT_IMAGE,
                title: postDetails.post_title || postDetails.title,
                description: postDetails.small_description || postDetails.description,
                postId: historyItem.postId,
                community: postDetails.community || postDetails.community_name || "Unknown",
                readTime: postDetails.readTime || "5 min read",
                tags: Array.isArray(postDetails.tags) ? postDetails.tags : [],
                author: postDetails.author || { name: "Unknown", avatar: "" },
                user_id: postDetails.user_id || postDetails.userId || postDetails.author_id,
                upvotes: postDetails.upvotes || 0,
                downvotes: postDetails.downvotes || 0,
                comments: postDetails.comments || 0,
                views: postDetails.views || 0
              };
            } else {
              console.warn("Could not fetch post details for:", historyItem.postId);
              return {
                _id: historyItem._id,
                postId: historyItem.postId,
                viewedAt: historyItem.lastAccessed || historyItem.viewedAt,
                lastAccessed: historyItem.lastAccessed,
                viewedDate: historyItem.viewedDate,
                title: "Post no longer available",
                description: "This post may have been deleted or is no longer accessible",
                community: "Unknown",
                readTime: "0 min read",
                tags: [],
                author: { name: "Unknown", avatar: "" },
                upvotes: 0,
                downvotes: 0,
                comments: 0,
                views: 0,
                image: DEFAULT_IMAGE
              };
            }
          })

        );

        console.log("History with post details:", historyWithPosts);
        setHistoryItems(historyWithPosts);
        setGroupedHistory(groupHistoryByDate(historyWithPosts));
      } else {
        setHistoryItems([]);
        setGroupedHistory({});
      }
    } catch (err) {
      console.error("Component: Error fetching history:", err);
      const errorMessage = err.message || err.error || 'Failed to fetch history';
      setError(errorMessage);
      setHistoryItems([]);
      setGroupedHistory({});
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      fetchHistory();
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await getHistory(page);
      let historyData = [];
      if (response) {
        if (Array.isArray(response)) {
          historyData = response;
        } else if (response.data) {
          if (Array.isArray(response.data)) {
            historyData = response.data;
          } else if (response.data.history && Array.isArray(response.data.history)) {
            historyData = response.data.history;
          }
        } else if (response.history && Array.isArray(response.history)) {
          historyData = response.history;
        }
      }

      const historyWithPosts = await Promise.all(
        historyData.map(async (historyItem) => {
          const postDetails = await fetchPostDetails(historyItem.postId);
          if (postDetails) {
            return {
              ...postDetails,
              _id: historyItem._id,
              viewedAt: historyItem.lastAccessed || historyItem.viewedAt,
              lastAccessed: historyItem.lastAccessed,
              viewedDate: historyItem.viewedDate,
              historyId: historyItem._id,
              image: postDetails.thumbnail || postDetails.image || postDetails.imageUrl || DEFAULT_IMAGE,
              title: postDetails.post_title || postDetails.title,
              description: postDetails.small_description || postDetails.description,
              postId: historyItem.postId,
              community: postDetails.community || postDetails.community_name || "Unknown",
              readTime: postDetails.readTime || "5 min read",
              tags: Array.isArray(postDetails.tags) ? postDetails.tags : [],
              author: postDetails.author || { name: "Unknown", avatar: "" },
              user_id: postDetails.user_id || postDetails.userId || postDetails.author_id,
              upvotes: postDetails.upvotes || 0,
              downvotes: postDetails.downvotes || 0,
              comments: postDetails.comments || 0,
              views: postDetails.views || 0
            };
          } else {
            return {
              _id: historyItem._id,
              postId: historyItem.postId,
              viewedAt: historyItem.lastAccessed || historyItem.viewedAt,
              lastAccessed: historyItem.lastAccessed,
              viewedDate: historyItem.viewedDate,
              title: "Post no longer available",
              description: "This post may have been deleted or is no longer accessible",
              community: "Unknown",
              readTime: "0 min read",
              tags: [],
              author: { name: "Unknown", avatar: "" },
              upvotes: 0,
              downvotes: 0,
              comments: 0,
              views: 0,
              image: DEFAULT_IMAGE
            };
          }
        })
      );

      console.log("History with post details:", historyWithPosts);

      // Filter by search term
      const filtered = historyWithPosts.filter((item) =>
        (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );

      setHistoryItems(filtered);
      setGroupedHistory(groupHistoryByDate(filtered));
    } catch (err) {
      setError(err.message || 'Failed to search history');
      setHistoryItems([]);
      setGroupedHistory({});
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your entire history?")) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await clearHistory();
      setHistoryItems([]);
      setGroupedHistory({});
    } catch (err) {
      console.error("Error clearing history:", err);
      setError(err.message || "Failed to clear history");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons text-6xl text-red-500 mb-4 block">
            error
          </span>
          <h3 className="font-fenix text-2xl text-white mb-2">
            Something went wrong
          </h3>
          <p className="text-columbia-blue">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black text-white relative">
      {/* Background Glow Effect */}
      <div
        className="absolute z-0"
        style={{
          width: 637,
          height: 300,
          top: -38,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1842B3",
          filter: "blur(100px)",
          boxShadow: "0px 4px 100px 500px #00000066",
          borderRadius: 30,
          pointerEvents: "none",
        }}
      />

      <div className="container mx-auto px-5 sm:px-7 lg:px-10 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1 className="font-fenix text-[28px] text-white mb-1">
                History
              </h1>
              <p className="text-desc text-base">Your recently viewed posts</p>
            </div>

            {/* Search Bar and Clear Button */}
            <div className="flex items-center gap-4 w-full md:w-[500px]">
              <SearchBar onSearch={handleSearch} />
              {historyItems.length > 0 && (
                <div className="relative" ref={kebabRef}>
                  <button
                    onClick={() => setShowOptions((v) => !v)}
                    className="p-2 rounded-full hover:bg-periwinkle-light focus:outline-none"
                    aria-label="Options"
                  >
                    <span className="material-icons">more_vert</span>
                  </button>
                  {showOptions && (
                    <div className="absolute right-0 mt-2 w-44 bg-rich-black border border-navbar-border rounded-lg shadow-lg z-50">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-periwinkle-light text-white"
                        onClick={() => { setShowOptions(false); handleClearHistory(); }}
                      >
                        Clear History
                      </button>
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-red-500 text-white"
                        onClick={() => { setShowOptions(false); setSelectionMode(true); setSelectedItems([]); }}
                      >
                        Delete Selected
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Items Grid */}
        {loading ? (
          <Loader message="Loading your history..." />
        ) : (
          <div className="space-y-6">
            {historyItems.length > 0 ? (
              <>
                {selectionMode && (
                  <div className="flex items-center mb-4 gap-2">
                    <button
                      onClick={() => setSelectionMode(false)}
                      className="px-3 py-1 text-sm bg-gray-700 rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className="px-3 py-1 text-sm bg-red-600 rounded text-white hover:bg-red-700"
                      disabled={selectedItems.length === 0}
                    >
                      Delete Selected ({selectedItems.length})
                    </button>
                  </div>
                )}

                {/* Google-Style Grouped Sections */}
                {Object.entries(groupedHistory).map(([timeGroup, items]) => (
                  <div key={timeGroup} className="space-y-4">
                    {/* Section Header - Google Style */}
                    <div className="sticky top-0 z-10 bg-rich-black/95 backdrop-blur-sm py-3 border-b border-navbar-border">
                      <h2 className="font-lato text-lg font-semibold text-periwinkle">
                        {timeGroup}
                      </h2>
                      <p className="text-xs text-periwinkle/60 mt-1">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>
                    </div>

                    {/* Items in this section */}
                    <div className="space-y-3">
                      {items.map((item) => {
                        const itemId = item.historyId || item._id;
                        return (
                          <div key={itemId} className="flex items-start gap-4">
                            {selectionMode && (
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(itemId)}
                                onChange={() => setSelectedItems((prev) =>
                                  prev.includes(itemId)
                                    ? prev.filter((id) => id !== itemId)
                                    : [...prev, itemId]
                                )}
                                className="mt-6"
                              />
                            )}
                            <div className="flex-1">
                              <BlogCard
                                id={item.postId || item._id}
                                image={item.image}
                                community={item.community}
                                date={`Last visited at ${formatTime(item.lastAccessed || item.viewedAt)}`}
                                readTime={item.readTime}
                                title={item.title}
                                description={item.description}
                                tags={item.tags}
                                author={item.author}
                                user_id={item.user_id}
                                upvotes={item.upvotes}
                                downvotes={item.downvotes}
                                comments={item.comments}
                                views={item.views}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-16">
                <span className="material-icons text-6xl text-columbia-blue mb-4 block">
                  search_off
                </span>
                <h3 className="font-fenix text-2xl text-white mb-2">
                  No items found
                </h3>
                <p className="text-columbia-blue">
                  {error ? 'An error occurred while searching.' : 'No posts match your search.'}
                </p>
                {error && (
                  <p className="text-red-500 mt-2 text-sm">Debug: {error}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;