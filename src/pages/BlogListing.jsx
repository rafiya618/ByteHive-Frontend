import React, { useState, useEffect, useCallback } from "react";
import SearchBar from "../shared/SearchBar";
import NewPostButton from "../shared/NewPostButton";
import Navbar from "../shared/Navbar";
import BlogCard from "../components/BlogListing/BlogCard";
import BlogFilterBar from "../components/BlogListing/BlogFilterBar";
import PopularTags from "../components/BlogListing/PopularTags";
import PopularCommunities from "../components/BlogListing/PopularCommunties";
import UpcomingEvents from "../components/BlogListing/UpcomingEvents";
import { postsApi } from "../api/postsApi";
import axios from "axios";

// Filters
const FILTERS = ["All", "Popular", "Newest"];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";

const BlogListing = () => {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Simplified debounced search function - allow single character searches
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        // If search is empty, fetch all posts
        fetchAllBlogs();
        return;
      }

      // Allow single character searches now
      if (query.trim().length < 1) {
        setBlogs([]);
        setErr(""); // Clear error
        return;
      }

      setIsSearching(true);
      try {
        console.log("Searching posts with query:", query);

        const searchResponse = await postsApi.searchPosts({
          q: query.trim(),
          page: 1,
          limit: 50,
        });

        console.log("Search response:", searchResponse);

        if (searchResponse.ok && searchResponse.posts) {
          // Backend already handles relevance scoring, just transform the data
          const transformedPosts = searchResponse.posts.map((post) => ({
            id: post._id,
            image: post.thumbnail || DEFAULT_IMAGE,
            community: post.community_name || post.community || "",
            date: post.createdAt
              ? new Date(post.createdAt).toLocaleDateString()
              : "",
            readTime: post.read_time || "6 min",
            title: post.post_title || "",
            description: post.small_description || "",
            tags: Array.isArray(post.tags) ? post.tags : [],
            author: post.author || {
              name: "Unknown",
              avatar: "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
            },
            upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : 0,
            downvotes: Array.isArray(post.downvotes) ? post.downvotes.length : 0,
            comments: post.comments || 0,
            views: post.views || 0,
            bookmarked: false,
            user_id: post.user_id,
          }));

          setBlogs(transformedPosts);
          setErr(""); // Clear error message

          console.log(
            `Found ${transformedPosts.length} relevant posts for query: "${query}"`
          );
        } else {
          setBlogs([]);
          setErr(""); // Don't set error message, just show empty results
        }
      } catch (error) {
        console.error("Search error:", error);
        setErr(""); // Don't show error message during search
        setBlogs([]);
      } finally {
        setIsSearching(false);
      }
    }, 300), // Reduced debounce for single character searches
    []
  );

  // Handle search input change
  const handleSearch = (query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  };

  // Fetch all blogs (default view)
  const fetchAllBlogs = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await axios.get("http://localhost:5000/api/posts");
      setBlogs(
        Array.isArray(res.data.posts)
          ? res.data.posts.map((post) => ({
              id: post._id,
              image: post.thumbnail || DEFAULT_IMAGE,
              community: post.community_name || post.community || "",
              date: post.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : "",
              readTime: post.read_time || "6 min",
              title: post.post_title || "",
              description: post.small_description || "",
              tags: Array.isArray(post.tags) ? post.tags : [],
              author: post.author || {
                name: "Unknown",
                avatar: "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
              },
              upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : 0,
              downvotes: Array.isArray(post.downvotes) ? post.downvotes.length : 0,
              comments: post.comments || 0,
              views: post.views || 0,
              bookmarked: false,
              user_id: post.user_id,
            }))
          : []
      );
    } catch (err) {
      setBlogs([]);
      setErr(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to fetch blogs. Please try again."
      );
    }
    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    fetchAllBlogs();
  }, []);

  // Filter blogs based on selected filter
  const getFilteredBlogs = () => {
    if (selectedFilter === "All") {
      return blogs;
    } else if (selectedFilter === "Popular") {
      // Sort by upvotes and views
      return [...blogs].sort((a, b) => {
        const scoreA = a.upvotes * 2 + a.views * 0.5;
        const scoreB = b.upvotes * 2 + b.views * 0.5;
        return scoreB - scoreA;
      });
    } else if (selectedFilter === "Newest") {
      // Sort by date (newest first)
      return [...blogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    return blogs;
  };

  const filteredBlogs = getFilteredBlogs();
  const isLoadingOrSearching = loading || isSearching;

  return (
    <div className="min-h-screen bg-rich-black flex flex-col relative">
      <Navbar />

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
      {/* Header */}
      <div className="w-full flex justify-center pt-8 pb-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-7xl z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Title */}
          <div>
            <h2 className="font-fenix text-[28px] text-white font-normal text-center md:text-left">
              Your Feed
            </h2>
            {/* Remove the search status message completely */}
          </div>

          {/* Search + Post */}
          <div className="flex justify-center items-center gap-2 w-full md:flex-1 md:justify-center md:px-12">
            <SearchBar
              className="flex-1 max-w-xs sm:max-w-md"
              placeholder="Search Posts (title, description, tags)"
              onSearch={handleSearch}
              value={searchQuery}
            />
            <NewPostButton />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex justify-center px-4 lg:px-8">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
          {/* Left Column - Blog Feed */}
          <div className="flex-1 lg:max-w-3xl">
            {/* Filter - Hide when searching */}
            {!searchQuery && (
              <div className="mb-6">
                <BlogFilterBar
                  filters={FILTERS}
                  selected={selectedFilter}
                  onSelect={setSelectedFilter}
                />
              </div>
            )}

            <div className="flex flex-col gap-7 pb-12">
              {isLoadingOrSearching ? (
                <div className="text-white text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-periwinkle"></div>
                    <span>
                      {isSearching
                        ? "Searching posts..."
                        : "Loading blogs..."}
                    </span>
                  </div>
                </div>
              ) : err && !searchQuery ? ( // Only show error when not searching
                <div className="text-red-400 text-center py-8">{err}</div>
              ) : filteredBlogs.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-desc text-lg mb-4">
                    {searchQuery
                      ? `No posts found matching "${searchQuery}"`
                      : "No blogs found."}
                  </div>
                  {searchQuery && (
                    <div className="text-desc text-sm space-y-2">
                      <p>Try searching for:</p>
                      <ul className="text-periwinkle space-y-1">
                        <li>• Keywords from post titles</li>
                        <li>• Technology names (React, JavaScript, Python)</li>
                        <li>• Tags or categories</li>
                        <li>• Words from descriptions</li>
                      </ul>
                      <button
                        onClick={() => handleSearch("")}
                        className="text-periwinkle hover:text-white mt-4 underline"
                      >
                        Clear search to see all posts
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Search results header */}
                  {searchQuery && (
                    <div className="bg-navbar-bg border border-navbar-border rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">Search Results</h3>
                          <p className="text-desc text-sm">
                            Found {filteredBlogs.length} posts matching "{searchQuery}"
                          </p>
                        </div>
                        <button
                          onClick={() => handleSearch("")}
                          className="text-periwinkle hover:text-white text-sm underline"
                        >
                          Clear search
                        </button>
                      </div>
                    </div>
                  )}
                  {filteredBlogs.map((blog) => <BlogCard key={blog.id} {...blog} />)}
                </>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col gap-6">
            <PopularTags />
            <PopularCommunities />
            <UpcomingEvents />
          </aside>
        </div>
      </div>
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default BlogListing;