import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsApi } from '../api/postsApi';
import { extractUserId } from '../utils/userIdExtractor';

/**
 * Custom hook to manage post voting (upvote/downvote)
 * Handles: optimistic updates, rollback on failure, activity logging
 * 
 * @param {string} postId - The ID of the post
 * @param {Object} auth - Auth context object
 * @param {Object} voteState - Current vote state (upvotes, downvotes, isUpvoted, isDownvoted)
 * @param {Function} setVoteState - State setters for vote data
 * @returns {Object} Voting functions and state
 */
export const useVoting = (postId, auth, voteState, setVoteState) => {
    const navigate = useNavigate();
    const [isVoting, setIsVoting] = useState(false);

    const { upvotes, downvotes, isUpvoted, isDownvoted } = voteState;
    const { setUpvotes, setDownvotes, setIsUpvoted, setIsDownvoted } = setVoteState;

    // Helper to normalize vote counts
    const toCount = (v) => {
        if (Array.isArray(v)) return v.length;
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
        return 0;
    };

    const toggleUpvote = async () => {
        if (!auth?.token) {
            navigate('/login', { state: { from: `/post/${postId}` } });
            return;
        }

        // Prevent concurrent requests
        if (isVoting) return;

        setIsVoting(true);
        // optimistic update
        const previous = { upvotes, downvotes, isUpvoted, isDownvoted };

        if (isUpvoted) {
            setUpvotes((v) => v - 1);
            setIsUpvoted(false);
        } else {
            setUpvotes((v) => v + 1);
            setIsUpvoted(true);
            if (isDownvoted) {
                setDownvotes((v) => v - 1);
                setIsDownvoted(false);
            }
        }

        try {
            const userId = extractUserId(auth);
            const res = await postsApi.likePost(postId, userId);

            // If API returns authoritative counts, normalize and use them
            if (res && res.upvotes !== undefined) setUpvotes(toCount(res.upvotes));
            if (res && res.downvotes !== undefined) setDownvotes(toCount(res.downvotes));
            if (res && typeof res.userLiked === 'boolean') setIsUpvoted(res.userLiked);
            if (res && typeof res.userDisliked === 'boolean') setIsDownvoted(res.userDisliked);

            // Log upvote activity - ONLY when upvote is ADDED (not removed)
            if (!previous.isUpvoted && res.userLiked) {
                try {
                    console.log('📝 [BLOG-DETAIL] Logging upvote activity for post:', postId);
                    const { logActivity } = await import('../api/retentionApi');
                    await logActivity('upvote', postId);
                    console.log('✅ [BLOG-DETAIL] Upvote activity logged successfully');
                } catch (error) {
                    console.error('❌ [BLOG-DETAIL] Failed to log upvote activity:', error);
                }
            } else if (previous.isUpvoted && !res.userLiked) {
                // Remove from userActivity
                console.log('🗑️ [BLOG-DETAIL] Upvote removed - removing from userActivity');
                try {
                    const { removeActivity } = await import('../api/retentionApi');
                    await removeActivity('upvote', postId);
                    console.log('✅ [BLOG-DETAIL] Upvote removed from userActivity');
                } catch (error) {
                    console.error('❌ [BLOG-DETAIL] Failed to remove upvote activity:', error);
                }
            }
        } catch (error) {
            console.error('Like API failed:', error);
            // rollback optimistic update
            setUpvotes(previous.upvotes);
            setDownvotes(previous.downvotes);
            setIsUpvoted(previous.isUpvoted);
            setIsDownvoted(previous.isDownvoted);
        } finally {
            setIsVoting(false);
        }
    };

    const toggleDownvote = async () => {
        if (!auth?.token) {
            navigate('/login', { state: { from: `/post/${postId}` } });
            return;
        }

        // Prevent concurrent requests
        if (isVoting) return;

        setIsVoting(true);
        const previous = { upvotes, downvotes, isUpvoted, isDownvoted };

        if (isDownvoted) {
            setDownvotes((v) => v - 1);
            setIsDownvoted(false);
        } else {
            setDownvotes((v) => v + 1);
            setIsDownvoted(true);
            if (isUpvoted) {
                setUpvotes((v) => v - 1);
                setIsUpvoted(false);
            }
        }

        try {
            const userId = extractUserId(auth);
            const res = await postsApi.dislikePost(postId, userId);

            if (res && res.upvotes !== undefined) {
                const c = toCount(res.upvotes);
                if (c !== null) setUpvotes(c);
            }
            if (res && res.downvotes !== undefined) {
                const c = toCount(res.downvotes);
                if (c !== null) setDownvotes(c);
            }
            if (res && typeof res.userLiked === 'boolean') setIsUpvoted(res.userLiked);
            if (res && typeof res.userDisliked === 'boolean') setIsDownvoted(res.userDisliked);

            // Log downvote activity (only when adding downvote, not removing)
            if (!previous.isDownvoted && res.userDisliked) {
                try {
                    console.log('[DEBUG] About to log downvote activity, postId:', postId);
                    const { logActivity } = await import('../api/retentionApi');
                    const result = await logActivity('downvote', postId);
                    console.log('✅ [BLOG-DETAIL] Downvote activity logged, result:', result);
                } catch (error) {
                    console.error('❌ [BLOG-DETAIL] Failed to log downvote activity:', error);
                }
            }
        } catch (error) {
            console.error('Dislike API failed:', error);
            setUpvotes(previous.upvotes);
            setDownvotes(previous.downvotes);
            setIsUpvoted(previous.isUpvoted);
            setIsDownvoted(previous.isDownvoted);
        } finally {
            setIsVoting(false);
        }
    };

    return {
        toggleUpvote,
        toggleDownvote,
        isVoting,
    };
};
