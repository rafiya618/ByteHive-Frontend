import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminPostApi } from "../../api/adminPostApi";
import {
  PostDetailModal,
  ApprovePostModal,
  RejectPostModal,
  DeletePostModal,
  EditPostModal,
} from "../../components/admin/PostActionModals";
import toast from "react-hot-toast";

const STATUSES = ["pending_review", "approved", "rejected"];
const CATEGORIES = ["blog", "question"];

const Posts = () => {
  // State for data
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [communities, setCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(false);

  // State for filters
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [communityFilter, setCommunityFilter] = useState("");
  const [order, setOrder] = useState("desc");

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  // State for modals
  const [selectedPost, setSelectedPost] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Fetch communities for dropdown
  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoadingCommunities(true);
        const res = await adminPostApi.getCommunities({ limit: 100, page: 1 });
        setCommunities(res.data || []);
      } catch (err) {
        console.error("Error fetching communities:", err);
        // Don't show error to user, communities are optional
      } finally {
        setLoadingCommunities(false);
      }
    };
    fetchCommunities();
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        setError("");
        const res = await adminPostApi.list({
          page,
          limit,
          status: statusFilter || undefined,
          category: categoryFilter || undefined,
          community: communityFilter?.trim() || undefined,
          order,
        });
        setPosts(res.data || []);
        setTotal(res.pagination?.total || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Failed to fetch posts");
        console.error("Error fetching posts:", err);
        toast.error(err.message || "Failed to fetch posts");
      } finally {
        setLoading(false);
      }
    },
    [statusFilter, categoryFilter, communityFilter, order, limit]
  );

  // Initial load
  useEffect(() => {
    fetchPosts(1);
  }, []);

  // Filter handlers
  const handleFilterChange = (filterName, value) => {
    setCurrentPage(1);
    if (filterName === "status") setStatusFilter(value);
    else if (filterName === "category") setCategoryFilter(value);
    else if (filterName === "community") setCommunityFilter(value);
    else if (filterName === "order") setOrder(value);
  };

  // Modal handlers
  const openDetailModal = async (post) => {
    try {
      const fullPost = await adminPostApi.get(post._id);
      setSelectedPost(fullPost.post);
      setDetailModalOpen(true);
    } catch (err) {
      toast.error("Failed to load post details");
    }
  };

  const handleApproveClick = (post) => {
    setSelectedPost(post);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (post) => {
    setSelectedPost(post);
    setRejectModalOpen(true);
  };

  const handleDeleteClick = (post) => {
    setSelectedPost(post);
    setDeleteModalOpen(true);
  };

  const handleEditClick = async (post) => {
    try {
      const fullPost = await adminPostApi.get(post._id);
      setSelectedPost(fullPost.post);
      setEditModalOpen(true);
    } catch (err) {
      toast.error("Failed to load post details");
    }
  };

  const handleRefresh = () => {
    fetchPosts(currentPage);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-rich-black flex">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-fenix text-[28px] text-white font-normal mb-2">
            Posts Management
          </h2>
          <p className="text-gray-400 text-sm">
            Manage, approve, and moderate all content posts
          </p>
        </div>

        {/* Filters Section */}
        <div className="mb-6">
          {/* Filter Controls */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
            >
              <option value="">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace("_", " ").toUpperCase()}
                </option>
              ))}
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>

            {/* Community Filter */}
            <select
              value={communityFilter}
              onChange={(e) => handleFilterChange("community", e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
              disabled={loadingCommunities}
            >
              <option value="">All Communities</option>
              {communities.map((community) => (
                <option key={community._id} value={community.community_name}>
                  {community.community_name}
                </option>
              ))}
            </select>

            {/* Order */}
            <select
              value={order}
              onChange={(e) => handleFilterChange("order", e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
            >
              <option value="desc">Newest</option>
              <option value="asc">Oldest</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              className="px-3 py-2 bg-periwinkle/20 hover:bg-periwinkle/30 text-periwinkle rounded text-sm transition"
              title="Refresh posts"
            >
              <span className="material-icons text-base">refresh</span>
            </button>
          </div>
        </div>

        {/* Posts Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading posts...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-12">{error}</div>
        ) : (
          <>
            <div className="bg-dark-indigo border border-navbar-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navbar-border bg-dark-indigo/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Author
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Community
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Engagement
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-navbar-border">
                    {posts.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                          No posts found
                        </td>
                      </tr>
                    ) : (
                      posts.map((post) => (
                        <tr
                          key={post._id}
                          className="hover:bg-dark-indigo/50 transition"
                        >
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openDetailModal(post)}
                              className="text-periwinkle hover:text-white text-sm font-medium line-clamp-2 max-w-xs transition"
                              title="View details"
                            >
                              {post.post_title}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {post.author_username || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                                post.status === "approved"
                                  ? "bg-celadon/20 text-celadon-dark"
                                  : post.status === "rejected"
                                  ? "bg-red-500/20 text-red-400"
                                  : "bg-yellow-500/20 text-yellow-400"
                              }`}
                            >
                              {post.status.replace("_", " ").toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {post.category ? post.category.charAt(0).toUpperCase() + post.category.slice(1) : "-"}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {post.community || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="text-periwinkle font-medium">
                              {post.engagement_count}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(post.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 items-center">
                              {post.status === "pending_review" && (
                                <>
                                  <button
                                    onClick={() => handleApproveClick(post)}
                                    className="p-1 text-celadon hover:bg-celadon/10 rounded transition"
                                    title="Approve"
                                  >
                                    <span className="material-icons text-base">
                                      check_circle
                                    </span>
                                  </button>
                                  <button
                                    onClick={() => handleRejectClick(post)}
                                    className="p-1 text-red-400 hover:bg-red-400/10 rounded transition"
                                    title="Reject"
                                  >
                                    <span className="material-icons text-base">
                                      cancel
                                    </span>
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleEditClick(post)}
                                className="p-1 text-medium-slate-blue hover:bg-medium-slate-blue/10 rounded transition"
                                title="Edit"
                              >
                                <span className="material-icons text-base">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={() => handleDeleteClick(post)}
                                className="p-1 text-pinkish hover:bg-pinkish/10 rounded transition"
                                title="Delete"
                              >
                                <span className="material-icons text-base">
                                  delete
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <button
                  onClick={() => fetchPosts(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded bg-dark-indigo border border-navbar-border text-white hover:border-periwinkle disabled:opacity-50 transition"
                >
                  ← Previous
                </button>
                <div className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages} ({total} posts)
                </div>
                <button
                  onClick={() => fetchPosts(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded bg-dark-indigo border border-navbar-border text-white hover:border-periwinkle disabled:opacity-50 transition"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <PostDetailModal
        post={selectedPost}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
      />
      <ApprovePostModal
        postId={selectedPost?._id}
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onSuccess={handleRefresh}
      />
      <RejectPostModal
        postId={selectedPost?._id}
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSuccess={handleRefresh}
      />
      <DeletePostModal
        postId={selectedPost?._id}
        postTitle={selectedPost?.post_title}
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onSuccess={handleRefresh}
      />
      <EditPostModal
        post={selectedPost}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
};

export default Posts;
