import { useState, useEffect } from "react";
import SearchBar from "../shared/SearchBar";
import NewPostButton from "../shared/NewPostButton";
import Navbar from "../shared/Navbar";
import BlogCard from "../components/BlogListing/BlogCard";
import BlogFilterBar from "../components/BlogListing/BlogFilterBar";
import PopularTags from "../components/BlogListing/PopularTags";
import PopularCommunities from "../components/BlogListing/PopularCommunties";
import UpcomingEvents from "../components/BlogListing/UpcomingEvents";
import Loader from "../components/shared/Loader";
import axios from "axios";
import { useAuth } from "../context/auth";
import { reGetTrendingPosts, reGetFeed } from "../api/reApi";

const FILTERS = ["All", "Popular", "Newest"];

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";

const BlogListing = () => {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [blogs, setBlogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [total, setTotal] = useState(0);
  const [limit] = useState(10);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const { auth } = useAuth();

  const basePosts = (import.meta.env.VITE_POSTS_SERVICE_URL || "http://localhost:5000").replace(/\/$/, "");
  const baseRE = (import.meta.env.VITE_RE_SERVICE_URL || "http://localhost:3005").replace(/\/$/, "");

  // Normalize posts for rendering
  const normalizePosts = (posts = []) =>
    posts.map((post) => ({
      id: post._id,
      image: post.thumbnail || DEFAULT_IMAGE,
      community: post.community || "",
      date: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "",
      readTime: post.read_time || "2 min",
      title: post.post_title || "",
      description: post.small_description || "",
      tags: post.tags || [],
      author: post.author || {
        name: "Unknown",
        avatar: "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff",
      },
      user_id: post.user_id || post.userId || post.author_id || null,
      upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : post.upvotes || 0,
      downvotes: Array.isArray(post.downvotes) ? post.downvotes.length : post.downvotes || 0,
      comments: Array.isArray(post.comments) ? post.comments.length : post.comments || 0,
      views: post.views || 0,
      bookmarked: false,
    }));

  // Fetch posts based on filter
  const loadPosts = async (newOffset = 0, isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      let newPosts = [];
      let newTotal = 0;

      if (selectedFilter === "Popular") {
        // Fetch trending posts from RE with pagination
        const trendingRes = await axios.get(`${baseRE}/trending/posts?limit=100`);
        const allTrending = trendingRes?.data || [];
        const paginatedTrending = allTrending.slice(newOffset, newOffset + limit);
        const postIds = paginatedTrending.map((t) => t.postId);

        // Fetch full post details
        const postDetails = await Promise.all(
          postIds.map((id) =>
            axios
              .get(`${basePosts}/api/posts/${id}`)
              .then((r) => r?.data?.post || null)
              .catch(() => null)
          )
        );

        newPosts = normalizePosts(postDetails.filter(Boolean));
        newTotal = allTrending.length;
        const totalFetched = newOffset + paginatedTrending.length;
        setHasMore(totalFetched < newTotal);
      } else if (selectedFilter === "All") {
        // Fetch feed recommendations from RE (only for logged-in users)
        const userId = auth?.user?._id || auth?.user?.id || auth?.user?.user_id;

        if (userId) {
          // Fetch all recommended posts from RE
          const feedRes = await axios.get(`${baseRE}/feed/${userId}?limit=100`);
          const feedData = feedRes?.data || {};
          
          // Get ALL recommended posts available
          const allRecommended = feedData?.recommended?.posts || [];

          if (allRecommended.length === 0) {
            // Fallback: mix Trending + Newest when recommendations are empty
            const [trendingRes, newestRes] = await Promise.all([
              axios.get(`${baseRE}/trending/posts?limit=50`),
              axios.get(`${basePosts}/api/posts`, { params: { skip: 0, limit: 50 } }),
            ]);

            const trendingIds = (trendingRes?.data || []).map((t) => t.postId);
            const newestRaw = newestRes?.data?.posts || [];

            const trendingDetails = await Promise.all(
              trendingIds.map((id) =>
                axios
                  .get(`${basePosts}/api/posts/${id}`)
                  .then((r) => r?.data?.post || null)
                  .catch(() => null)
              )
            );

            // Merge and dedupe by _id
            const combined = [...trendingDetails.filter(Boolean), ...newestRaw];
            const seen = new Set();
            const combinedUnique = [];
            combined.forEach((p) => {
              const pid = p?._id;
              if (!pid || seen.has(pid)) return;
              seen.add(pid);
              combinedUnique.push(p);
            });

            const paginatedFallback = combinedUnique.slice(newOffset, newOffset + limit);
            newPosts = normalizePosts(paginatedFallback);
            newTotal = combinedUnique.length;
            const totalFetched = newOffset + paginatedFallback.length;
            setHasMore(totalFetched < newTotal);
          } else {
            // Paginate recommendations client-side
            const paginatedRecommended = allRecommended.slice(newOffset, newOffset + limit);
            const postIds = paginatedRecommended.map((p) => p._id);

            // Fetch full post details from posts service
            const postDetails = await Promise.all(
              postIds.map((id) =>
                axios
                  .get(`${basePosts}/api/posts/${id}`)
                  .then((r) => r?.data?.post || null)
                  .catch(() => null)
              )
            );

            newPosts = normalizePosts(postDetails.filter(Boolean));
            newTotal = allRecommended.length;
            const totalFetched = newOffset + paginatedRecommended.length;
            setHasMore(totalFetched < newTotal);
            
            console.log('All (Recommended) filter:', { 
              newOffset, 
              paginatedLength: paginatedRecommended.length,
              allRecommendedLength: allRecommended.length,
              totalFetched,
              hasMore: totalFetched < newTotal 
            });
          }
        } else {
          // Fallback: fetch recent posts if not logged in
          const res = await axios.get(`${basePosts}/api/posts`, {
            params: { skip: newOffset, limit },
          });
          newPosts = normalizePosts(res?.data?.posts || []);
          newTotal = Number(res?.data?.total || 0);
          const totalFetched = newOffset + newPosts.length;
          setHasMore(totalFetched < newTotal);
        }
      } else if (selectedFilter === "Newest") {
        // Fetch newest posts with pagination
        const res = await axios.get(`${basePosts}/api/posts`, {
          params: { skip: newOffset, limit },
        });
        newPosts = normalizePosts(res?.data?.posts || []);
        newTotal = Number(res?.data?.total || 0);
        const totalFetched = newOffset + newPosts.length;
        setHasMore(totalFetched < newTotal);
      }

      setTotal(newTotal);
      if (isLoadMore) {
        setBlogs((prev) => [...prev, ...newPosts]);
      } else {
        setBlogs(newPosts);
      }

      setOffset(newOffset + limit);
    } catch (e) {
      setErr(e?.response?.data?.error || e?.message || "Failed to load posts.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load posts when filter changes
  useEffect(() => {
    let isMounted = true;
    (async () => {
      if (isMounted) {
        await loadPosts(0, false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [selectedFilter]);

  // Handle load more
  const handleLoadMore = () => {
    loadPosts(offset, true);
  };

  // Search across all posts in DB
  useEffect(() => {
    let isMounted = true;
    
    const performSearch = async () => {
      if (!searchQuery || !searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        // Fetch all posts (or use a search endpoint if available)
        const res = await axios.get(`${basePosts}/api/posts`, {
          params: { skip: 0, limit: 1000 }, // Fetch large batch for searching
        });
        
        const allPosts = res?.data?.posts || [];
        const q = searchQuery.trim().toLowerCase();
        
        // Filter posts by search query across title, description, community, tags
        const filtered = allPosts.filter((post) => {
          const title = (post.post_title || "").toLowerCase();
          const desc = (post.small_description || "").toLowerCase();
          const comm = (post.community || "").toLowerCase();
          const tags = (post.tags || []).map(t => t.toLowerCase()).join(" ");
          
          return (
            title.includes(q) ||
            desc.includes(q) ||
            comm.includes(q) ||
            tags.includes(q)
          );
        });

        if (isMounted) {
          setSearchResults(normalizePosts(filtered));
        }
      } catch (e) {
        console.error("Search error:", e?.message);
        if (isMounted) {
          setSearchResults([]);
        }
      } finally {
        if (isMounted) {
          setSearchLoading(false);
        }
      }
    };

    performSearch();
    return () => {
      isMounted = false;
    };
  }, [searchQuery]);

  // Filter and display posts
  const displayedPosts = searchQuery && searchQuery.trim() ? searchResults : blogs.filter((b) => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      (b.title || "").toLowerCase().includes(q) ||
      (b.description || "").toLowerCase().includes(q) ||
      (b.community || "").toLowerCase().includes(q) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(q))
    );
  });

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
      <div className="relative z-10 pt-6 sm:pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Title Row with Search & Post Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-8">
            <h2 className="font-fenix text-[24px] sm:text-[28px] text-white font-normal">Your Feed</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto sm:flex-1 sm:justify-center sm:ml-8">
              <SearchBar
                className="flex-1 sm:flex-auto max-w-full sm:max-w-lg"
                placeholder="Search posts"
                onSearch={(q) => setSearchQuery(q)}
              />
              <NewPostButton />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full flex justify-center px-4 sm:px-6 lg:px-8 flex-1">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left Column - Blog Feed */}
          <div className="w-full lg:flex-1 lg:max-w-3xl">
            {/* Filter Bar - Hide when searching */}
            {!searchQuery && (
              <div className="mb-6 overflow-x-auto">
                <BlogFilterBar
                  filters={FILTERS}
                  selected={selectedFilter}
                  onSelect={setSelectedFilter}
                />
              </div>
            )}

            {/* Posts List */}
            <div className="flex flex-col gap-5 sm:gap-7 pb-12">
              {searchQuery && searchLoading ? (
                <Loader message="Searching all blogs..." />
              ) : loading && !searchQuery ? (
                <Loader message="Loading blogs..." />
              ) : err ? (
                <div className="text-red-400 text-center py-8">{err}</div>
              ) : displayedPosts.length === 0 ? (
                <div className="text-white text-center py-8">No blogs found.</div>
              ) : (
                displayedPosts.map((blog) => <BlogCard key={blog.id} {...blog} />)
              )}

              {/* Load More / Pagination - Only show when not searching */}
              {!searchQuery && !loading && !err && blogs.length > 0 && (
                <div className="flex flex-col items-center gap-3 mt-4">
                  {loadingMore ? (
                    <Loader message="Loading more..." />
                  ) : hasMore ? (
                    <button
                      onClick={handleLoadMore}
                      className="px-6 sm:px-8 py-3 rounded-lg bg-navbar-bg hover:bg-white/10 text-white text-sm sm:text-base font-medium transition border"
                      style={{ borderColor: "var(--navbar-border)" }}
                    >
                      Load More
                    </button>
                  ) : null}
                  {total > 0 && (
                    <div className="text-gray-500 text-xs sm:text-xs">
                      Showing {blogs.length} of {total}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <aside className="w-full lg:w-[320px] xl:w-[380px] shrink-0 flex flex-col gap-6">
            <PopularTags posts={blogs} />
            <PopularCommunities />
            <UpcomingEvents />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogListing;