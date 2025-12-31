import React, { useState, useEffect, useCallback } from "react";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminReportApi } from "../../api/reportApi";
import { ReportReviewModal } from "../../components/admin/ReportReviewModal";
import toast from "react-hot-toast";
import debounce from "lodash/debounce";

const STATUSES = ["pending", "reviewing", "resolved", "dismissed"];
const REASONS = [
  "spam",
  "hate_speech",
  "harassment",
  "nudity",
  "fake_information",
  "violence",
  "illegal_activity",
  "other"
];
const TARGET_TYPES = ["post", "comment", "user", "community"];

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [statusFilter, setStatusFilter] = useState("pending");
  const [reasonFilter, setReasonFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    pendingReports: 0,
    reviewingReports: 0,
    resolvedReports: 0,
    dismissedReports: 0,
    topReasons: []
  });

  // Fetch reports
  const fetchReports = useCallback(
    async (page = 1, status = "", reason = "", type = "") => {
      try {
        setLoading(true);
        setError("");
        const res = await adminReportApi.list({
          page,
          limit,
          status: status || undefined,
          reason: reason || undefined,
          targetType: type || undefined
        });

        setReports(res.data || []);
        setTotal(res.pagination?.total || 0);
        setCurrentPage(page);
      } catch (err) {
        setError(err.message || "Failed to fetch reports");
        console.error("Error fetching reports:", err);
        toast.error(err.message || "Failed to fetch reports");
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await adminReportApi.getStats();
      if (res.ok && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  // Debounced filter change
  const debouncedFilter = useCallback(
    debounce((status, reason, type) => {
      fetchReports(1, status, reason, type);
    }, 300),
    [fetchReports]
  );

  // Initial load
  useEffect(() => {
    fetchReports(1, statusFilter, reasonFilter, typeFilter);
    fetchStats();
  }, []);

  // Handle filter changes
  const handleStatusChange = (value) => {
    setStatusFilter(value);
    debouncedFilter(value, reasonFilter, typeFilter);
  };

  const handleReasonChange = (value) => {
    setReasonFilter(value);
    debouncedFilter(statusFilter, value, typeFilter);
  };

  const handleTypeChange = (value) => {
    setTypeFilter(value);
    debouncedFilter(statusFilter, reasonFilter, value);
  };

  // Open review modal
  const openReviewModal = async (report) => {
    try {
      const fullReport = await adminReportApi.get(report._id);
      setSelectedReport(fullReport);
      setReviewModalOpen(true);
    } catch (err) {
      toast.error("Failed to load report details");
    }
  };

  // Handle action completion
  const handleActionComplete = () => {
    setReviewModalOpen(false);
    setSelectedReport(null);
    fetchReports(currentPage, statusFilter, reasonFilter, typeFilter);
    fetchStats();
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
            Content Moderation
          </h2>
          <p className="text-gray-400 text-sm">Review and manage user reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-dark-indigo border border-navbar-border rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase mb-2">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.pendingReports}</p>
          </div>
          <div className="bg-dark-indigo border border-navbar-border rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase mb-2">Reviewing</p>
            <p className="text-2xl font-bold text-blue-400">{stats.reviewingReports}</p>
          </div>
          <div className="bg-dark-indigo border border-navbar-border rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase mb-2">Resolved</p>
            <p className="text-2xl font-bold text-green-400">{stats.resolvedReports}</p>
          </div>
          <div className="bg-dark-indigo border border-navbar-border rounded-lg p-4">
            <p className="text-gray-400 text-xs uppercase mb-2">Dismissed</p>
            <p className="text-2xl font-bold text-gray-400">{stats.dismissedReports}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
            >
              <option value="">All Status</option>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={reasonFilter}
              onChange={(e) => handleReasonChange(e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
            >
              <option value="">All Reasons</option>
              {REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason.replace(/_/g, " ").charAt(0).toUpperCase() + reason.replace(/_/g, " ").slice(1)}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white text-sm focus:outline-none focus:border-periwinkle"
            >
              <option value="">All Types</option>
              {TARGET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchReports(currentPage, statusFilter, reasonFilter, typeFilter)}
              className="px-3 py-2 bg-periwinkle/20 hover:bg-periwinkle/30 text-periwinkle rounded text-sm transition"
              title="Refresh"
            >
              <span className="material-icons text-base">refresh</span>
            </button>
          </div>
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading reports...</div>
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
                        Item
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Reason
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Reported By
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-navbar-border">
                    {reports.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-8 text-center text-gray-400">
                          No reports found
                        </td>
                      </tr>
                    ) : (
                      reports.map((report) => (
                        <tr key={report._id} className="hover:bg-dark-indigo/50 transition">
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openReviewModal(report)}
                              className="text-periwinkle hover:text-white text-sm font-medium line-clamp-2 max-w-xs transition"
                              title="View details"
                            >
                              {report.targetTitle || `${report.targetType} #${report.targetId.slice(-6)}`}
                            </button>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {report.reason.replace(/_/g, " ").charAt(0).toUpperCase() + report.reason.replace(/_/g, " ").slice(1)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <div className="flex items-center gap-2">
                              <img
                                src={report.reporterProfileImage || "/default-avatar.png"}
                                alt={report.reporterUsername || "Unknown"}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                              <span className="text-gray-300">
                                {report.reporterUsername || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded text-xs font-medium ${
                                report.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : report.status === "reviewing"
                                  ? "bg-blue-500/20 text-blue-400"
                                  : report.status === "resolved"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-gray-500/20 text-gray-400"
                              }`}
                            >
                              {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            {new Date(report.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-gray-400 text-sm">
                            <span className="capitalize">
                              {report.targetType}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => openReviewModal(report)}
                              className="p-1 text-medium-slate-blue hover:bg-medium-slate-blue/10 rounded transition"
                              title="Review"
                            >
                              <span className="material-icons text-base">
                                open_in_full
                              </span>
                            </button>
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
                  onClick={() => fetchReports(currentPage - 1, statusFilter, reasonFilter, typeFilter)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded bg-dark-indigo border border-navbar-border text-white hover:border-periwinkle disabled:opacity-50 transition"
                >
                  ← Previous
                </button>
                <div className="text-gray-400 text-sm">
                  Page {currentPage} of {totalPages} ({total} reports)
                </div>
                <button
                  onClick={() => fetchReports(currentPage + 1, statusFilter, reasonFilter, typeFilter)}
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

      {/* Report Review Modal */}
      <ReportReviewModal
        report={selectedReport?.report}
        reportData={selectedReport}
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedReport(null);
        }}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
};

export default Reports;
