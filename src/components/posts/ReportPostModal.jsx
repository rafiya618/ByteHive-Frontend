import React, { useState } from 'react';
import { reportApi } from '../../api/reportApi';
import toast from 'react-hot-toast';

const REPORT_REASONS = [
  { value: 'spam', label: 'Spam' },
  { value: 'hate_speech', label: 'Hate Speech' },
  { value: 'harassment', label: 'Harassment' },
  { value: 'fake_information', label: 'Fake Information' },
  { value: 'violence', label: 'Violence' },
  { value: 'illegal_activity', label: 'Illegal Activity' },
  { value: 'other', label: 'Other' }
];

export const ReportPostModal = ({ post, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [evidence, setEvidence] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reason) {
      toast.error('Please select a reason');
      return;
    }

    try {
      setLoading(true);
      await reportApi.submit({
        targetType: 'post',
        targetId: post.id || post._id,
        reason,
        description,
        evidence
      });

      toast.success('Report submitted successfully');
      onSuccess?.();
      onClose();
      
      // Reset form
      setReason('');
      setDescription('');
      setEvidence([]);
    } catch (err) {
      const errorMessage = err.message || 'Failed to submit report';
      
      // Check if it's a duplicate report error
      if (errorMessage.includes('already reported')) {
        toast.error('You have already reported this post');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-lg w-full">
        {/* Header */}
        <div className="border-b border-navbar-border p-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-white">Report Post</h3>
            <p className="text-sm text-gray-400 mt-1">
              Help us understand why this post violates our guidelines
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Post Info */}
          <div className="bg-dark-navy-purple rounded p-3 border border-navbar-border">
            <p className="text-xs text-gray-500 uppercase mb-1">Post Title</p>
            <p className="text-sm text-white line-clamp-2">{post.post_title}</p>
          </div>

          {/* Reason Dropdown */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Reason for Report <span className="text-red-400">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 bg-dark-navy-purple border border-navbar-border rounded text-white focus:outline-none focus:border-periwinkle"
              disabled={loading}
            >
              <option value="">Select a reason...</option>
              {REPORT_REASONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Details (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more context about this report..."
              maxLength={500}
              className="w-full px-3 py-2 bg-dark-navy-purple border border-navbar-border rounded text-white placeholder-gray-500 text-sm focus:outline-none focus:border-periwinkle resize-none"
              rows="3"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
            </p>
          </div>

          {/* Evidence Upload */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Evidence (optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Upload screenshots or images as evidence (max 3)
            </p>
            <div className="flex gap-2">
              {evidence.length < 3 && (
                <label className="flex-1 px-3 py-2 border-2 border-dashed border-navbar-border rounded text-center cursor-pointer hover:border-periwinkle transition">
                  <span className="material-icons text-sm text-gray-400">
                    add_a_photo
                  </span>
                  <p className="text-xs text-gray-400 mt-1">Add Photo</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          setEvidence([...evidence, reader.result]);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                    disabled={loading}
                  />
                </label>
              )}

              {/* Evidence previews */}
              {evidence.map((img, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={img}
                    alt={`Evidence ${idx + 1}`}
                    className="w-16 h-16 object-cover rounded border border-navbar-border"
                  />
                  <button
                    type="button"
                    onClick={() => setEvidence(evidence.filter((_, i) => i !== idx))}
                    className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 flex items-center justify-center text-white text-xs hover:bg-red-600"
                    disabled={loading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded p-3">
            <p className="text-xs text-blue-300">
              ℹ️ All reports are reviewed by our moderation team. False reports may result in account restrictions.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="border-t border-navbar-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !reason}
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-medium text-sm transition disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
};
