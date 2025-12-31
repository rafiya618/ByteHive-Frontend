import React, { useState, useEffect } from 'react';
import { adminPostApi } from '../../api/adminPostApi';
import toast from 'react-hot-toast';

export const PostDetailModal = ({ post, isOpen, onClose, onActionComplete }) => {
  if (!isOpen || !post) return null;

  const engagementCount = (post.upvotes_count || 0) + 
                         (post.downvotes_count || 0) + 
                         (post.comments || 0) + 
                         (post.views || 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-dark-indigo border-b border-navbar-border p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-2">Title: {post.post_title}</h2>
            {/* <p className="text-sm text-gray-400">ID: {post._id}</p> */}
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
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
              <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${
                  post.status === 'approved' ? 'bg-celadon/20 text-celadon-dark' :
                  post.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {post.status?.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Category</p>
              <p className="text-sm text-white capitalize">{post.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Date</p>
              <p className="text-sm text-white">{new Date(post.date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase mb-1">Community</p>
              <p className="text-sm text-white">{post.community || 'N/A'}</p>
            </div>
          </div>

          {/* Engagement Stats */}
          <div className="bg-dark-navy-purple rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase mb-3">Engagement</p>
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center">
                <p className="text-lg font-semibold text-periwinkle">{post.upvotes_count || 0}</p>
                <p className="text-xs text-gray-400">Upvotes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-red-400">{post.downvotes_count || 0}</p>
                <p className="text-xs text-gray-400">Downvotes</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-medium-slate-blue">{post.comments || 0}</p>
                <p className="text-xs text-gray-400">Comments</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-semibold text-celadon">{post.views || 0}</p>
                <p className="text-xs text-gray-400">Views</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-400">
              Total Engagement: <span className="text-white font-semibold">{engagementCount}</span>
            </p>
          </div>

          {/* Description */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Summary</p>
            <p className="text-sm text-gray-300 bg-dark-navy-purple rounded p-3">
              {post.small_description || 'No summary provided'}
            </p>
          </div>

          {/* Full Content */}
          <div>
            <p className="text-xs text-gray-500 uppercase mb-2">Content</p>
            <div className="text-sm text-gray-300 bg-dark-navy-purple rounded p-3 max-h-[300px] overflow-y-auto">
              {post.post_description}
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 uppercase mb-2">Tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, idx) => (
                  <span key={idx} className="bg-periwinkle/20 text-periwinkle px-2 py-1 rounded text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-dark-indigo border-t border-navbar-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ApprovePostModal = ({ postId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    try {
      setLoading(true);
      await adminPostApi.approve(postId);
      toast.success('Post approved successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to approve post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-celadon/20 mb-4">
            <span className="material-icons text-celadon">check_circle</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Approve Post?</h3>
          <p className="text-sm text-gray-400 mb-6">
            Are you sure you want to approve this post? The author will be notified.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleApprove}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded bg-celadon text-dark-indigo font-medium text-sm hover:bg-celadon/90 transition disabled:opacity-50"
            >
              {loading ? 'Approving...' : 'Approve'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const RejectPostModal = ({ postId, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');

  const handleReject = async () => {
    try {
      setLoading(true);
      await adminPostApi.reject(postId, reason);
      toast.success('Post rejected successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to reject post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-500/20 mb-4">
            <span className="material-icons text-red-400">cancel</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Reject Post?</h3>
          <p className="text-sm text-gray-400 mb-4">
            Provide a reason for rejection (optional). The author will be notified.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="E.g., Content violates community guidelines..."
            className="w-full px-3 py-2 bg-dark-navy-purple border border-navbar-border rounded text-white placeholder-gray-500 text-sm mb-6 focus:outline-none focus:border-periwinkle"
            rows="3"
          />
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleReject}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const DeletePostModal = ({ postId, postTitle, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await adminPostApi.delete(postId);
      toast.success('Post deleted successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to delete post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-sm w-full">
        <div className="p-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-pinkish/20 mb-4">
            <span className="material-icons text-pinkish">delete</span>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
          <p className="text-sm text-gray-400 mb-3">
            This action cannot be undone. The post "{postTitle}" will be permanently deleted.
          </p>
          <p className="text-xs text-red-400 mb-6 bg-red-500/10 p-2 rounded">
            ⚠️ The author will be notified of the deletion.
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="flex-1 px-4 py-2 rounded bg-pinkish text-white font-medium text-sm hover:bg-pinkish/90 transition disabled:opacity-50"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const EditPostModal = ({ post, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    post_title: '',
    small_description: '',
    post_description: '',
  });

  useEffect(() => {
    if (post && isOpen) {
      setFormData({
        post_title: post.post_title || '',
        small_description: post.small_description || '',
        post_description: post.post_description || '',
      });
    }
  }, [post, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await adminPostApi.edit(post._id, {
        post_title: formData.post_title.trim(),
        small_description: formData.small_description.trim(),
        post_description: formData.post_description.trim(),
      });
      toast.success('Post updated successfully');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-indigo border border-navbar-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-dark-indigo border-b border-navbar-border p-6 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white">Edit Post</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title</label>
            <input
              type="text"
              name="post_title"
              value={formData.post_title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-navy-purple border border-navbar-border rounded text-white placeholder-gray-500 focus:outline-none focus:border-periwinkle"
              placeholder="Post title"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Summary</label>
            <textarea
              name="small_description"
              value={formData.small_description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-navy-purple border border-navbar-border rounded text-white placeholder-gray-500 focus:outline-none focus:border-periwinkle"
              placeholder="Brief summary (max 220 characters)"
              rows="2"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Content</label>
            <textarea
              name="post_description"
              value={formData.post_description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-navy-purple border border-navbar-border rounded text-white placeholder-gray-500 focus:outline-none focus:border-periwinkle"
              placeholder="Full post content"
              rows="8"
            />
          </div>
        </div>

        <div className="sticky bottom-0 bg-dark-indigo border-t border-navbar-border p-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 rounded bg-medium-slate-blue text-white font-medium text-sm hover:bg-medium-slate-blue/90 transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};
