import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import axios from "axios";
import debounce from "lodash/debounce";

const BASE_URL = "http://localhost:3000"; // Your backend URL

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5;

  // Fetch users from backend
  const fetchUsers = async (search = "", newCursor = null) => {
    try {
      setLoading(true);
      const res = await axios.get(`${BASE_URL}/admin/users`, {
        params: {
          search,
          cursor: newCursor,
          limit,
        },
      });

      if (newCursor) {
        // Append next page
        setUsers((prev) => [...prev, ...res.data.users]);
      } else {
        // Reset on new search
        setUsers(res.data.users);
      }

      setCursor(res.data.nextCursor);
      setHasMore(res.data.nextCursor !== null);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  const debouncedSearch = useCallback(
    debounce((query) => {
      setCursor(null);
      fetchUsers(query, null);
    }, 500),
    []
  );

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Load more (for infinite scroll or "Load More" button)
  const loadMore = () => {
    if (hasMore) fetchUsers(searchQuery, cursor);
  };

  // Admin actions
  const handleBlock = async (userId) => {
    try {
      await axios.put(`${BASE_URL}/admin/users/${userId}/block`);
      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, status: u.status === "active" ? "blocked" : "active" }
            : u
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handlePromote = async (userId) => {
    try {
      await axios.put(`${BASE_URL}/admin/users/${userId}/promote`);
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: "admin" } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (userId) => {
    try {
      await axios.delete(`${BASE_URL}/admin/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="font-fenix text-[28px] text-white font-normal mb-2">
            Users Management
          </h2>
          <p className="text-gray-400 text-sm">Manage all registered users</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full px-4 py-3 bg-dark-indigo border border-navbar-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-periwinkle transition"
            />
            <span className="material-icons absolute right-3 top-3 text-gray-500">
              search
            </span>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading...</div>
        ) : error ? (
          <div className="text-red-400 text-center py-12">{error}</div>
        ) : (
          <div className="bg-dark-indigo border border-navbar-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navbar-border bg-dark-indigo/50">
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Avatar
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Username
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Email
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-navbar-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user._id} className="hover:bg-dark-indigo/50 transition">
                        <td className="px-6 py-4">
                          <img
                            src={user.profileImage || "/default-avatar.png"}
                            alt={user.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        </td>
                        <td className="px-6 py-4 text-white text-sm">{user.name}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{user.username || "-"}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{user.email}</td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "active"
                                ? "bg-celadon/20 text-celadon-dark"
                                : "bg-gray-700/50 text-gray-400"
                              }`}
                          >
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">{user.role}</td>
                        <td className="px-6 py-4 flex gap-2">
                          <button
                            onClick={() => handleBlock(user._id)}
                            className="px-2 py-1 bg-orange-500 text-white rounded text-xs"
                          >
                            {user.status === "active" ? "Block" : "Unblock"}
                          </button>
                          {user.role !== "admin" && (
                            <button
                              onClick={() => handlePromote(user._id)}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs"
                            >
                              Promote
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(user._id)}
                            className="px-2 py-1 bg-red-500 text-white rounded text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
              {hasMore && !loading && (
                <div className="p-4 text-center">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 bg-periwinkle text-white rounded"
                  >
                    Load More
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Users;
