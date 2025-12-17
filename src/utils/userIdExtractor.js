/**
 * Utility to extract and normalize user ID from auth context
 * Centralizes the user ID extraction logic used throughout the app
 */

/**
 * Extracts user ID from auth context and normalizes it to a string
 * @param {Object} auth - Auth context object
 * @returns {string|null} Normalized user ID as string, or null if not found
 */
export const extractUserId = (auth) => {
    if (!auth?.user) return null;

    const userId =
        auth.user._id ??
        auth.user.id ??
        auth.user.user_id ??
        auth.user.sub ??
        auth.user.userId ??
        null;

    return userId !== null && userId !== undefined ? String(userId) : null;
};

/**
 * Checks if a user ID matches the current authenticated user
 * @param {string|number} targetUserId - The user ID to compare
 * @param {Object} auth - Auth context object
 * @returns {boolean} True if the target user ID matches the current user
 */
export const isCurrentUser = (targetUserId, auth) => {
    const currentUserId = extractUserId(auth);
    if (!currentUserId || !targetUserId) return false;

    return String(targetUserId) === currentUserId;
};
