import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminCommunityApi } from "../../api/adminCommunityApi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

const Communities = () => {
  const navigate = useNavigate();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch communities
  const fetchCommunities = useCallback(
    async (page = 1, search = "", owner = "") => {
      try {
        setLoading(true);
        setError("");
        const res = await adminCommunityApi.list({
          page,
          limit,
          search: search?.trim() || undefined,
          owner: owner?.trim() || undefined,
        });
        setCommunities(res.data || []);
        setTotal(res.pagination?.total || res.data?.length || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Failed to fetch communities");
        console.error("Error fetching communities:", err);
        toast.error(err.message || "Failed to fetch communities");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((search, owner) => {
      fetchCommunities(1, search, owner);
    }, 500),
    [fetchCommunities]
  );

  // Handle search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value, ownerFilter);
  };

  // Handle owner filter
  const handleOwnerFilterChange = (e) => {
    setOwnerFilter(e.target.value);
    debouncedSearch(searchQuery, e.target.value);
  };

  // Delete community
  const handleDelete = async (communityId) => {
    if (!window.confirm("Are you sure you want to delete this community?")) {
      return;
    }

    try {
      setDeletingId(communityId);
      await adminCommunityApi.delete(communityId);
      setCommunities((prev) => prev.filter((c) => (c._id || c.id) !== communityId));
      toast.success("Community deleted successfully");
    } catch (err) {
      toast.error(err.message || "Failed to delete community");
      console.error("Error deleting community:", err);
    } finally {
      setDeletingId(null);
    }
  };

  // Initial load
  useEffect(() => {
    fetchCommunities(1, "", "");
  }, []);

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
            Communities Management
          </h2>
          <p className="text-gray-400 text-sm">Manage all communities</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 bg-dark-indigo border border-navbar-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-periwinkle transition"
            />
            <span className="material-icons absolute right-3 top-3 text-gray-500">
              search
            </span>
          </div>
          <input
            type="text"
            placeholder="Filter by owner username or user ID"
            value={ownerFilter}
            onChange={handleOwnerFilterChange}
            className="w-full px-4 py-3 bg-dark-indigo border border-navbar-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-periwinkle transition"
          />
        </div>

        {/* Communities Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading communities...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-12">{error}</div>
        ) : (
          <>
            <div className="bg-dark-indigo border border-navbar-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-navbar-border bg-dark-indigo/50">
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Logo
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Members
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Posts
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Created
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-navbar-border">
                    {communities.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                          No communities found
                        </td>
                      </tr>
                    ) : (
                      communities.map((community) => (
                        <tr key={community._id || community.id} className="hover:bg-dark-indigo/50 transition">
                          <td className="px-6 py-4">
                            <img
                              src={community.image || "/default-community.png"}
                              alt={community.community_name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => navigate(`/admin/communities/${community._id || community.id}`)}
                              className="text-periwinkle hover:text-white text-sm font-medium transition"
                              title="View details"
                            >
                              {community.community_name}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {community.owner_username || community.owner_name || "-"}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="text-periwinkle font-medium">
                              {community.no_of_followers || community.members?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="text-medium-slate-blue font-medium">
                              {community.no_of_posts || community.posts?.length || 0}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {community.createdAt ? new Date(community.createdAt).toLocaleDateString() : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2 items-center">
                              <button
                                onClick={() => navigate(`/admin/communities/${community._id || community.id}`)}
                                className="p-1 text-medium-slate-blue hover:bg-medium-slate-blue/10 rounded transition"
                                title="View"
                              >
                                <span className="material-icons text-base">
                                  visibility
                                </span>
                              </button>
                              <button
                                onClick={() => handleDelete(community._id || community.id)}
                                disabled={deletingId === (community._id || community.id)}
                                className="p-1 text-pinkish hover:bg-pinkish/10 rounded transition disabled:opacity-50"
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
                  onClick={() => fetchCommunities(currentPage - 1, searchQuery, ownerFilter)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded bg-dark-indigo border border-navbar-border text-white hover:border-periwinkle disabled:opacity-50 transition"
                >
                  ← Previous
                </button>
                <div className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages} ({total} communities)
                </div>
                <button
                  onClick={() => fetchCommunities(currentPage + 1, searchQuery, ownerFilter)}
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
    </div>
  );
};

export default Communities;
