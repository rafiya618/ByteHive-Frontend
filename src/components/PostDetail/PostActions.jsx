import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postsApi } from '../../api/postsApi';
import { communityApi } from '../../api/communityApi';
import { ReportPostModal } from '../posts/ReportPostModal';
import { SecondaryButton } from '../../components/UI';

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

    const handleShare = async () => {
        const postUrl = `${window.location.origin}/#/post/${postId}`;

        try {
            await navigator.clipboard.writeText(postUrl);
            toast.success('Post link copied to clipboard');
        } catch (error) {
            console.error('Failed to copy post link:', error);
            toast.error('Could not copy link');
        }
    };

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
        <div className="flex flex-wrap items-center gap-3">
            {/* Share Button */}
            <SecondaryButton onClick={handleShare} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-navbar-border bg-white/5 text-columbia-blue hover:bg-white/10 transition-all font-lato">
                <span className="material-icons text-lg">share</span>
                <span>Share</span>
            </SecondaryButton>

            {/* Bookmark Button with Dropdown */}
            <div className="relative">
                <SecondaryButton onClick={handleBookmark} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-navbar-border bg-white/5 text-columbia-blue hover:bg-white/10 transition-all font-lato">
                    <span className="material-icons text-lg">{isBookmarked ? 'bookmark' : 'bookmark_border'}</span>
                    <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </SecondaryButton>

                {/* Bookmark Dropdown Menu */}
                {showBookmarkMenu && (
                    <div className="absolute top-full right-0 mt-2 bg-dark-navy-purple border border-navbar-border rounded-lg shadow-lg z-50 min-w-[200px] py-2">
                        {isBookmarked ? (
                            <>
                                <SecondaryButton onClick={() => handleSavePost('Saved')} className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2 ${savedCategory === 'Saved' ? 'text-periwinkle' : 'text-white'}`}>
                                    <span className="material-icons text-sm">check</span>
                                    Saved
                                </SecondaryButton>
                                <SecondaryButton onClick={() => handleSavePost('Watch Later')} className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2 ${savedCategory === 'Watch Later' ? 'text-periwinkle' : 'text-white'}`}>
                                    <span className="material-icons text-sm">{savedCategory === 'Watch Later' ? 'check' : ''}</span>
                                    Watch Later
                                </SecondaryButton>
                                <hr className="my-2 border-gray-600" />
                                <SecondaryButton onClick={handleUnsavePost} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400 flex items-center gap-2">
                                    <span className="material-icons text-sm">close</span>
                                    Remove
                                </SecondaryButton>
                            </>
                        ) : (
                            <>
                                <SecondaryButton onClick={() => handleSavePost('Saved')} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white flex items-center gap-2">
                                    <span className="material-icons text-sm">bookmark</span>
                                    Saved
                                </SecondaryButton>
                                <SecondaryButton onClick={() => handleSavePost('Watch Later')} className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white flex items-center gap-2">
                                    <span className="material-icons text-sm">schedule</span>
                                    Watch Later
                                </SecondaryButton>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Report Button */}
            <SecondaryButton onClick={() => setShowReportModal(true)} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-red-400 text-red-300 bg-transparent hover:bg-red-500/10 transition-all font-lato" title="Report post">
                <span className="material-icons text-lg">flag</span>
                <span>Report</span>
            </SecondaryButton>

            {/* Owner-only actions */}
            {isOwner && (
                <div className="flex items-center space-x-3">
                    <SecondaryButton onClick={() => navigate('/create-post', { state: { editPost: post } })} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-amber-400 text-amber-300 bg-transparent hover:bg-amber-400/10 transition-all font-lato" title="Edit post">
                        <span className="material-icons text-lg">edit</span>
                        <span>Edit</span>
                    </SecondaryButton>
                    <SecondaryButton onClick={handleDelete} className="flex items-center space-x-2 px-4 py-2 rounded-full border border-red-400 text-red-400 bg-transparent hover:bg-red-500/10 transition-all font-lato" title="Delete post">
                        <span className="material-icons text-lg">delete</span>
                        <span>Delete</span>
                    </SecondaryButton>
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
