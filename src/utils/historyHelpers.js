
/**
 * Date Grouping Helper for History Page
 * Groups history items by exact calendar dates (Google-style)
 * SINGLE SOURCE OF TRUTH for grouping logic
 */

/**
 * Check if two dates are the same calendar day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same day
 */
export const isSameDay = (date1, date2) => {
    return date1.toDateString() === date2.toDateString();
};

/**
 * Format date for section headers
 * Shows "Today" and "Yesterday" for convenience, otherwise full date
 * @param {string|Date} dateString - Date to format
 * @returns {string} Formatted date header (e.g., "Today", "December 17, 2025")
 */
export const formatDateHeader = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Show "Today" and "Yesterday" for convenience
    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';

    // Otherwise show full date
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Group history items by exact calendar date
 * @param {Array} historyItems - Array of history items with lastAccessed/viewedDate field
 * @returns {Object} Grouped history items by calendar date
 */
export const groupHistoryByDate = (historyItems) => {
    const groups = {};

    historyItems.forEach(item => {
        // Use viewedDate if available (new backend format), fallback to lastAccessed
        const dateToUse = item.viewedDate || item.lastAccessed || item.viewedAt;
        const date = new Date(dateToUse);
        const dateKey = formatDateHeader(date);

        if (!groups[dateKey]) {
            groups[dateKey] = [];
        }
        groups[dateKey].push(item);
    });

    // Sort items within each group by lastAccessed (most recent first)
    Object.keys(groups).forEach(dateKey => {
        groups[dateKey].sort((a, b) => {
            const dateA = new Date(a.lastAccessed || a.viewedAt);
            const dateB = new Date(b.lastAccessed || b.viewedAt);
            return dateB - dateA;
        });
    });

    return groups;
};

/**
 * Format time for display in cards
 * @param {Date|string} dateString - Date to format
 * @returns {string} Formatted time (e.g., "3:45 PM")
 */
export const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
    });
};

/**
 * Format time ago string
 * @param {Date|string} date - Date to format
 * @returns {string} Formatted string like "2 hours ago"
 */
export const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return past.toLocaleDateString();
};

export default {
    groupHistoryByDate,
    formatDateHeader,
    formatTime,
    formatTimeAgo,
    isSameDay,
};
