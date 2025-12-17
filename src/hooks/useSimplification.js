import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { simplifyPost } from '../api/smartReadingApi';

/**
 * Custom hook to manage AI post simplification
 * Handles: simplification API calls, loading states, error handling, activity logging
 * 
 * @param {string} postId - The ID of the post
 * @param {Object} post - The post object with content
 * @param {Function} setReadingMode - Setter for reading mode state
 * @returns {Object} Simplification functions and state
 */
export const useSimplification = (postId, post, setReadingMode) => {
    const [simplifiedContent, setSimplifiedContent] = useState(null);
    const [loadingSimplification, setLoadingSimplification] = useState(false);
    const [simplificationLevel, setSimplificationLevel] = useState('detailed_summary');
    const [showSimplifyDropdown, setShowSimplifyDropdown] = useState(false);
    const simplifyDropdownRef = useRef(null);

    const handleSimplifyClick = async (levelOverride = null) => {
        if (!post || !post.post_description) {
            console.warn('[SIMPLIFY] ⚠️ No content to simplify');
            toast.error('No content to simplify');
            return;
        }

        // Use provided level or fall back to state
        const levelToUse = levelOverride || simplificationLevel;

        console.log('[SIMPLIFY] Starting simplification:', {
            postId,
            level: levelToUse,
            contentLength: post.post_description.length
        });

        try {
            // Switch to simplify mode FIRST so loading spinner shows in content area
            setReadingMode('simplify');
            setLoadingSimplification(true);

            // Always generate fresh simplification
            console.log(`🔄 [SIMPLIFY] Generating ${levelToUse} with AI...`);
            const result = await simplifyPost(
                postId,
                post.post_description,
                levelToUse
            );

            console.log('✅ [SIMPLIFY] Simplification generated successfully');
            setSimplifiedContent(result);

            // Log simplify activity
            try {
                const { logActivity } = await import('../api/retentionApi');
                await logActivity('simplify', postId);
                console.log('✅ [BLOG-DETAIL] Simplify activity logged');

                // Show success toast ONLY after everything succeeds
                toast.success('Post simplified successfully!');
            } catch (error) {
                console.error('❌ [BLOG-DETAIL] Failed to log simplify activity:', error);
            }
        } catch (error) {
            console.error('❌ [SIMPLIFY] Error:', error);

            // Determine user-friendly error message based on error type
            let errorMessage = 'Failed to simplify post. Please try again.';
            let errorDetails = 'An unexpected error occurred';

            // Check for quota/rate limit errors (429)
            if (error.response?.status === 429 || error.response?.data?.code === 'QUOTA_EXCEEDED') {
                errorMessage = 'AI service quota exceeded. Please try again later or contact support.';
                errorDetails = 'API quota limit reached';
            }
            // Check for service unavailable (503)
            else if (error.response?.status === 503 || error.response?.data?.code === 'SERVICE_UNAVAILABLE') {
                errorMessage = 'AI service is temporarily unavailable. Please try again in a few moments.';
                errorDetails = error.response?.data?.details || 'Service temporarily down';
            }
            // Check for authentication errors (403)
            else if (error.response?.status === 403 || error.response?.data?.code === 'API_KEY_INVALID') {
                errorMessage = 'AI service authentication failed';
                errorDetails = error.response?.data?.details || 'API key is invalid or expired';
            }
            // Check if server provided a custom error message
            else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
                errorDetails = error.response?.data?.details || error.response?.data?.code || 'Server error';
            }
            // Check for network errors
            else if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                errorMessage = 'Request timed out. The AI service is taking too long to respond. Please try again.';
                errorDetails = 'Connection timeout';
            }
            else if (!error.response) {
                errorMessage = 'Cannot connect to AI service. Please check your connection and try again.';
                errorDetails = 'Network error';
            }

            toast.error(errorMessage);

            // Set error state so UI shows error instead of placeholder
            setSimplifiedContent({
                error: true,
                message: errorMessage,
                details: errorDetails
            });

            // Switch to simplify view to show the error state
            setReadingMode('simplify');
        } finally {
            setLoadingSimplification(false);
        }
    };

    return {
        handleSimplifyClick,
        simplifiedContent,
        setSimplifiedContent,
        loadingSimplification,
        simplificationLevel,
        setSimplificationLevel,
        showSimplifyDropdown,
        setShowSimplifyDropdown,
        simplifyDropdownRef,
    };
};
