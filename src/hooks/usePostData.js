import { useState, useEffect } from 'react';
import { postsApi } from '../api/postsApi';
import { checkSavedStatus, recordView } from '../api/curationApi';
import { extractUserId } from '../utils/userIdExtractor';

/**
 * Custom hook to manage post data fetching and enrichment
 * Handles: post fetching, vote status, author enrichment, bookmark status, view tracking
 * 
 * @param {string} postId - The ID of the post to fetch
 * @param {Object} auth - Auth context object
 * @returns {Object} Post data and state
 */
export const usePostData = (postId, auth, options = {}) => {
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [savedCategory, setSavedCategory] = useState(null);
    const [upvotes, setUpvotes] = useState(0);
    const [downvotes, setDownvotes] = useState(0);
    const [isUpvoted, setIsUpvoted] = useState(false);
    const [isDownvoted, setIsDownvoted] = useState(false);

    const currentUserId = extractUserId(auth);

    // Helper to normalize upvote/downvote values (arrays or numbers) to a numeric count
    const toCount = (v) => {
        if (Array.isArray(v)) return v.length;
        if (typeof v === 'number') return v;
        if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
        return 0;
    };

    // Fetch post data
    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            try {
                let data;
                const userId = auth?.token ? currentUserId : null;
                const isAdmin = String(auth?.user?.role || '').toLowerCase() === 'admin';
                const postFetchOptions = (isAdmin || options?.includeUnapproved) ? { includeUnapproved: true } : {};

                if (userId) {
                    try {
                        const [postResp, voteResp] = await Promise.all([
                            postsApi.getPostById(postId, postFetchOptions),
                            postsApi.getPostVoteStatus(postId, userId)
                        ]);

                        data = postResp.post || postResp;
                        if (voteResp?.ok) {
                            data = {
                                ...data,
                                upvotes: voteResp.upvotes ?? data.upvotes,
                                downvotes: voteResp.downvotes ?? data.downvotes,
                                userLiked: voteResp.userLiked ?? false,
                                userDisliked: voteResp.userDisliked ?? false,
                            };
                        }
                    } catch {
                        // fallback to basic fetch
                        const res = await postsApi.getPostById(postId, postFetchOptions);
                        data = res.post || res;
                    }
                } else {
                    const res = await postsApi.getPostById(postId, postFetchOptions);
                    data = res.post || res;
                }

                setPost(data);
                // normalize upvotes/downvotes which may be arrays or numbers
                setUpvotes(toCount(data.upvotes));
                setDownvotes(toCount(data.downvotes));
                // Set vote flags if provided
                if (data.userLiked !== undefined) setIsUpvoted(Boolean(data.userLiked));
                if (data.userDisliked !== undefined) setIsDownvoted(Boolean(data.userDisliked));

                // Record view in curation history (for backward compatibility)
                if (auth?.token) {
                    try {
                        await recordView(postId);
                        console.log('✅ [BLOG-DETAIL] View recorded in history');
                    } catch (error) {
                        console.error('❌ [BLOG-DETAIL] Failed to record view in history:', error);
                    }

                    // Log activity for retention tracking
                    try {
                        const { logActivity } = await import('../api/retentionApi');
                        await logActivity('read', postId);
                        console.log('✅ [BLOG-DETAIL] Read activity logged');
                    } catch (error) {
                        console.error('❌ [BLOG-DETAIL] Failed to log read activity:', error);
                    }
                }

                // Increment view count with session tracking (if logged in)
                try {
                    if (auth?.token) {
                        await postsApi.incrementView(postId, currentUserId);
                    } else {
                        await postsApi.incrementView(postId);
                    }
                } catch (error) {
                    console.error('Failed to increment view count:', error);
                }
            } catch (error) {
                const status = error?.response?.status || error?.status || (error?.message && error.message.toLowerCase().includes('not found') ? 404 : null);
                // If not found, attempt a fallback fetch that includes unapproved posts
                if (status === 404) {
                    try {
                        const fallback = await postsApi.getPostById(postId, { includeUnapproved: true });
                        const data2 = fallback.post || fallback;
                        setPost(data2);
                        setUpvotes(toCount(data2.upvotes));
                        setDownvotes(toCount(data2.downvotes));
                        if (data2.userLiked !== undefined) setIsUpvoted(Boolean(data2.userLiked));
                        if (data2.userDisliked !== undefined) setIsDownvoted(Boolean(data2.userDisliked));
                    } catch (err2) {
                        const msg = err2?.response?.data?.error || err2?.message || 'Failed to load post';
                        setError(msg);
                    }
                } else {
                    const msg = error?.response?.data?.error || error?.message || 'Failed to load post';
                    setError(msg);
                }
            }
            setLoading(false);
        };

        if (postId) fetchPost();
    }, [postId, auth?.token, currentUserId]);

    // Enrich author details when missing
    useEffect(() => {
        let mounted = true;
        const enrich = async () => {
            try {
                if (!post) return;
                const hasName = !!post.author?.name && post.author.name !== 'Unknown';
                const uid = post.user_id || post.userId;
                if (hasName || !uid) return;

                const { getProfile } = await import('../api/ProfileApi.jsx');
                const res = await getProfile({ userId: uid });
                const data = res?.data || res?.profile || {};
                const name = data.fullName || data.username || data.name ||
                    [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Unknown';
                const avatar = data.profileImage || data.avatar || data.image ||
                    'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);

                if (!mounted) return;
                setPost((prev) => prev ? { ...prev, author: { name, avatar } } : prev);
            } catch (err) {
                console.warn('Failed to enrich author profile:', err?.message || err);
            }
        };
        enrich();
        return () => { mounted = false; };
    }, [post]);

    // Check if post is saved
    useEffect(() => {
        const checkSaved = async () => {
            try {
                const status = await checkSavedStatus(postId);
                if (status?.isSaved) {
                    setIsBookmarked(true);
                    setSavedCategory(status.category || 'Saved');
                }
            } catch (err) {
                console.warn('Error checking saved status:', err?.message || err);
            }
        };

        if (auth?.token) {
            checkSaved();
        }
    }, [auth?.token, postId]);

    return {
        post,
        setPost,
        loading,
        error,
        isBookmarked,
        setIsBookmarked,
        savedCategory,
        setSavedCategory,
        upvotes,
        setUpvotes,
        downvotes,
        setDownvotes,
        isUpvoted,
        setIsUpvoted,
        isDownvoted,
        setIsDownvoted,
        currentUserId,
    };
};
