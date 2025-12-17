import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { savePost, unsavePost } from '../api/curationApi';

/**
 * Custom hook to manage post bookmarking
 * Handles: save/unsave posts, bookmark menu visibility
 * 
 * @param {string} postId - The ID of the post
 * @param {Object} auth - Auth context object
 * @param {boolean} isBookmarked - Current bookmark state
 * @param {Function} setIsBookmarked - Setter for bookmark state
 * @param {string|null} savedCategory - Current saved category
 * @param {Function} setSavedCategory - Setter for saved category
 * @returns {Object} Bookmark functions and state
 */
export const useBookmark = (
    postId,
    auth,
    isBookmarked,
    setIsBookmarked,
    savedCategory,
    setSavedCategory
) => {
    const navigate = useNavigate();
    const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);

    const handleBookmark = (e) => {
        e?.preventDefault?.();
        e?.stopPropagation?.();
        setShowBookmarkMenu(!showBookmarkMenu);
    };

    const handleSavePost = async (category) => {
        if (!auth?.token) {
            navigate('/login', { state: { from: `/post/${postId}` } });
            return;
        }

        try {
            console.log('BlogDetail: Attempting to save post', { postId, category });
            await savePost(postId, category);
            setIsBookmarked(true);
            setSavedCategory(category);
            setShowBookmarkMenu(false);
            toast.success(`Post saved to ${category}!`);
        } catch (err) {
            console.error('Error saving post:', err);
            const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to save post';
            toast.error(errorMsg);
        }
    };

    const handleUnsavePost = async () => {
        try {
            await unsavePost(postId);
            setIsBookmarked(false);
            setSavedCategory(null);
            setShowBookmarkMenu(false);
            toast.success('Post removed from saved');
        } catch (err) {
            console.error('Error unsaving post:', err);
            toast.error('Failed to unsave post');
        }
    };

    return {
        handleBookmark,
        handleSavePost,
        handleUnsavePost,
        showBookmarkMenu,
        setShowBookmarkMenu,
    };
};
