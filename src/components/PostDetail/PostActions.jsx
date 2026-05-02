import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postsApi } from '../../api/postsApi';
import { communityApi } from '../../api/communityApi';
import { ReportPostModal } from '../posts/ReportPostModal';

/**
 * PostActions Component
 * Displays share, bookmark, edit, and delete buttons
 * 
 * @param {Object} props
 * @param {Object} props.post - The post object
 * @param {string} props.currentUserId - Current user's ID
 * @param {boolean} props.isBookmarked - Whether post is bookmarked
 * @param {Function} props.handleBookmark - Handler for bookmark button click
 * @param {boolean} props.showBookmarkMenu - Whether bookmark menu is visible
 * @param {string|null} props.savedCategory - Current saved category
 * @param {Function} props.handleSavePost - Handler to save post
 * @param {Function} props.handleUnsavePost - Handler to unsave post
 * @param {Function} props.setShowBookmarkMenu - Setter for bookmark menu visibility
 */
const PostActions = ({
    post,
    currentUserId,
    isBookmarked,
    handleBookmark,
    showBookmarkMenu,
    savedCategory,
    handleSavePost,
    handleUnsavePost,
    setShowBookmarkMenu,
}) => {
    const navigate = useNavigate();
    const [showReportModal, setShowReportModal] = useState(false);
    const postId = post._id || post.id;

    const handleDelete = async () => {
        const confirmed = window.confirm('Delete this post? This cannot be undone.');
        if (!confirmed) return;

        try {
            await postsApi.deletePost(postId);
            // Attempt to remove this post from its community's list
            try {
                if (post?.community) {
                    const all = await communityApi.getAllCommunities();
                    const list = all?.communities || all?.data || all;
                    const matched = Array.isArray(list)
                        ? list.find(
                            (c) =>
                                String(c?.community_name || '').toLowerCase() ===
                                String(post.community).toLowerCase()
                        )
                        : null;
                    if (matched?._id) {
                        await communityApi.removePostFromCommunity(matched._id, postId);
                    }
                }
            } catch (syncErr) {
                console.warn('Failed to remove post from community list:', syncErr);
            }

            toast.success('Post deleted');
            navigate(-1);
        } catch (e) {
            console.error('Delete failed:', e);
            toast.error(e?.message || 'Failed to delete post');
        }
    };

    const isOwner = String(post.user_id || '') === String(currentUserId || '');

    return (
        <div className="flex items-center space-x-4">
            {/* Share Button */}
            <button className="flex items-center space-x-2 px-4 py-2 border border-periwinkle text-periwinkle rounded-md hover:bg-periwinkle-light transition-colors font-lato">
                <span className="material-icons text-lg">share</span>
                <span>Share</span>
            </button>

            {/* Bookmark Button with Dropdown */}
            <div className="relative">
                <button
                    onClick={handleBookmark}
                    className="flex items-center space-x-2 px-4 py-2 border border-periwinkle text-periwinkle rounded-md hover:bg-periwinkle-light transition-colors font-lato"
                >
                    <span className="material-icons text-lg">
                        {isBookmarked ? 'bookmark' : 'bookmark_border'}
                    </span>
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>

                {/* Bookmark Dropdown Menu */}
                {showBookmarkMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-dark-navy-purple border border-navbar-border rounded-lg shadow-lg z-50 min-w-[200px] py-2">
                        {isBookmarked ? (
                            <>
                                <button
                                    onClick={() => handleSavePost('Saved')}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2 ${savedCategory === 'Saved' ? 'text-periwinkle' : 'text-white'
                                        }`}
                                >
                                    <span className="material-icons text-sm">check</span>
                                    Saved
                                </button>
                                <button
                                    onClick={() => handleSavePost('Watch Later')}
                                    className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2 ${savedCategory === 'Watch Later' ? 'text-periwinkle' : 'text-white'
                                        }`}
                                >
                                    <span className="material-icons text-sm">
                                        {savedCategory === 'Watch Later' ? 'check' : ''}
                                    </span>
                                    Watch Later
                                </button>
                                <hr className="my-2 border-gray-600" />
                                <button
                                    onClick={handleUnsavePost}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400 flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">close</span>
                                    Remove
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => handleSavePost('Saved')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">bookmark</span>
                                    Saved
                                </button>
                                <button
                                    onClick={() => handleSavePost('Watch Later')}
                                    className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white flex items-center gap-2"
                                >
                                    <span className="material-icons text-sm">schedule</span>
                                    Watch Later
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Report Button */}
            <button
                onClick={() => setShowReportModal(true)}
                className="flex items-center space-x-2 px-4 py-2 border border-red-400 text-red-300 rounded-md hover:bg-red-500/10 transition-colors font-lato"
                title="Report post"
            >
                <span className="material-icons text-lg">flag</span>
                <span>Report</span>
            </button>

            {/* Owner-only actions */}
            {isOwner && (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => navigate('/create-post', { state: { editPost: post } })}
                        className="flex items-center space-x-2 px-4 py-2 border border-amber-400 text-amber-300 rounded-md hover:bg-amber-400/10 transition-colors font-lato"
                        title="Edit post"
                    >
                        <span className="material-icons text-lg">edit</span>
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex items-center space-x-2 px-4 py-2 border border-red-400 text-red-400 rounded-md hover:bg-red-500/10 transition-colors font-lato"
                        title="Delete post"
                    >
                        <span className="material-icons text-lg">delete</span>
                        <span>Delete</span>
                    </button>
                </div>
            )}

            <ReportPostModal
                post={post}
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
                onSuccess={() => setShowReportModal(false)}
            />
        </div>
    );
};

export default PostActions;
