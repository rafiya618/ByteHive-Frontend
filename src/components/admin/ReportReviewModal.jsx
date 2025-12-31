import React, { useState } from 'react';
import { adminReportApi } from '../../api/reportApi';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
  approved: 'celadon',
  removed: 'orange-500',
  deleted: 'red-500',
  user_banned: 'purple-500',
  user_warned: 'yellow-500'
};

export const ReportReviewModal = ({ report, reportData, isOpen, onClose, onActionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [banDuration, setBanDuration] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  if (!isOpen || !report) return null;

  const handleTakeAction = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    if (action === 'user_banned' && !banDuration) {
      toast.error('Please select ban duration');
      return;
    }

    try {
      setLoading(true);
      const userId = localStorage.getItem('userId') || 'admin';
      
      await adminReportApi.takeAction(
        report._id,
        action,
        userId,
        {
          adminNotes,
          banDuration: action === 'user_banned' ? parseInt(banDuration) : null
        }
      );

      toast.success(`Action '${action}' taken successfully`);
      onActionComplete?.();
    } catch (err) {
      toast.error(err.message || 'Failed to take action');
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const targetData = reportData?.targetData;
  const targetContext = reportData?.targetContext || {};
  const reportHistory = reportData?.reportHistory || [];
  const similarReports = reportData?.similarReports || [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-indigo border-b border-navbar-border p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Review Report</h2>
            {/* <p className="text-sm text-gray-400">Report ID: {report._id}</p> */}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Report Details */}
          <div className="bg-dark-navy-purple rounded-lg p-4 border border-navbar-border">
            <p className="text-xs text-gray-500 uppercase mb-3">Report Details</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400">Status</p>
                <span className={`inline-block px-3 py-1 rounded text-xs font-medium mt-1 ${
                  report.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  report.status === 'reviewing' ? 'bg-blue-500/20 text-blue-400' :
                  report.status === 'resolved' ? 'bg-green-500/20 text-green-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Reason</p>
                <p className="text-white mt-1">{report.reason.replace(/_/g, ' ').toUpperCase()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Type</p>
                <p className="text-white mt-1 capitalize">{report.targetType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Reported By</p>
                <div className="flex items-center gap-2 mt-1">
                  <img
                    src={report.reporterProfileImage || '/default-avatar.png'}
                    alt={report.reporterUsername || 'Unknown'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-white">{report.reporterUsername || 'Unknown'}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400">Date</p>
                <p className="text-white mt-1">{new Date(report.createdAt).toLocaleDateString()}</p>
              </div>
              {report.adminAction && (
                <div>
                  <p className="text-xs text-gray-400">Admin Action</p>
                  <p className="text-white mt-1 capitalize">{report.adminAction.replace(/_/g, ' ')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {report.description && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Description</p>
              <p className="text-sm text-gray-300 bg-dark-navy-purple rounded p-3 border border-navbar-border">
                {report.description}
              </p>
            </div>
          )}

          {/* Evidence */}
          {report.evidence && report.evidence.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Evidence</p>
              <div className="flex flex-wrap gap-2">
                {report.evidence.map((img, idx) => (
                  <a
                    key={idx}
                    href={img}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative"
                  >
                    <img
                      src={img}
                      alt={`Evidence ${idx + 1}`}
                      className="w-20 h-20 object-cover rounded border border-navbar-border hover:opacity-80 transition"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Target Content */}
          {targetData && (
            <div className="bg-dark-navy-purple rounded-lg p-4 border border-navbar-border">
              <p className="text-xs text-gray-500 uppercase mb-3">Reported Content</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-400">Title</p>
                  <p className="text-white mt-1">{targetData.post_title || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Content Preview</p>
                  <p className="text-sm text-gray-300 mt-1 line-clamp-3 bg-dark-indigo rounded p-2">
                    {targetData.post_description || 'N/A'}
                  </p>
                </div>

                {/* Engagement Metrics */}
                {targetContext.engagement && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Engagement</p>
                    <div className="grid grid-cols-4 gap-2">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-periwinkle">{targetContext.engagement.upvotes}</p>
                        <p className="text-xs text-gray-400">Upvotes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-red-400">{targetContext.engagement.downvotes}</p>
                        <p className="text-xs text-gray-400">Downvotes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-medium-slate-blue">{targetContext.engagement.comments}</p>
                        <p className="text-xs text-gray-400">Comments</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-celadon">{targetContext.engagement.views}</p>
                        <p className="text-xs text-gray-400">Views</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Report History */}
          {reportHistory.length > 0 && (
            <div className="bg-dark-navy-purple rounded-lg p-4 border border-navbar-border">
              <p className="text-xs text-gray-500 uppercase mb-3">Report History</p>
              <div className="space-y-2">
                {reportHistory.map((rep, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-400">{rep.reporterId?.username || 'Unknown'}</span>
                    <span className="text-gray-500">{rep.reason.replace(/_/g, ' ')}</span>
                    <span className="text-gray-500">{new Date(rep.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Selection */}
          {report.status !== 'resolved' && report.status !== 'dismissed' && (
            <div className="bg-dark-navy-purple rounded-lg p-4 border border-navbar-border">
              <p className="text-xs text-gray-500 uppercase mb-3">Take Action</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Action</label>
                  <select
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white focus:outline-none focus:border-periwinkle"
                  >
                    <option value="">Select an action...</option>
                    <option value="approved">✓ Approve (Dismiss Report)</option>
                    <option value="removed">⚠ Remove Post (Hide)</option>
                    <option value="deleted">🚫 Delete Post (Permanent)</option>
                    <option value="user_warned">⚡ Warn User</option>
                    <option value="user_banned">🔒 Ban/Suspend User</option>
                  </select>
                </div>

                {action === 'user_banned' && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Ban Duration</label>
                    <select
                      value={banDuration}
                      onChange={(e) => setBanDuration(e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white focus:outline-none focus:border-periwinkle"
                    >
                      <option value="">Select duration...</option>
                      <option value="1">1 Day</option>
                      <option value="7">7 Days</option>
                      <option value="30">30 Days</option>
                      <option value="365">1 Year</option>
                      <option value="0">Permanent</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-gray-400 mb-2">Admin Notes (optional)</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Document your reasoning..."
                    disabled={loading}
                    maxLength={500}
                    className="w-full px-3 py-2 bg-dark-indigo border border-navbar-border rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-periwinkle resize-none"
                    rows="3"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-indigo border-t border-navbar-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
          >
            Close
          </button>
          {report.status !== 'resolved' && report.status !== 'dismissed' && (
            <button
              onClick={() => setShowConfirm(true)}
              disabled={loading || !action}
              className="px-4 py-2 rounded bg-medium-slate-blue hover:bg-medium-slate-blue/90 text-white font-medium text-sm transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Take Action'}
            </button>
          )}
        </div>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
            <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-sm w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-white mb-2">Confirm Action</h3>
                <p className="text-sm text-gray-400 mb-6">
                  Are you sure you want to take this action? This will notify the user and reporter.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirm(false)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleTakeAction}
                    disabled={loading}
                    className="flex-1 px-4 py-2 rounded bg-medium-slate-blue hover:bg-medium-slate-blue/90 text-white font-medium text-sm transition disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
