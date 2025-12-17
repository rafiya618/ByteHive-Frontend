/**
 * Application-wide Constants
 * SINGLE SOURCE OF TRUTH for validation rules and configuration
 */

// ========== VALIDATION RULES ==========

/**
 * Text Selection Constraints
 */
export const TEXT_SELECTION = {
    MAX_WORDS: 15,
    ERROR_MESSAGE: 'Selection cannot exceed 15 words.',
    VALIDATION_REGEX: /\S+/g, // Matches words (non-whitespace sequences)
};

/**
 * Search Input Constraints
 */
export const SEARCH_INPUT = {
    MAX_WORDS: 15,
    ERROR_MESSAGE: 'Search query cannot exceed 15 words.',
    PLACEHOLDER: 'Type your question...',
};

// ========== SIMPLIFICATION DROPDOWN ==========

/**
 * Simplification Levels - MUST match backend enum
 * Source of truth: smart-reading-service/models/Simplification.js
 */
export const SIMPLIFICATION_LEVELS = {
    SUMMARIZE: {
        value: 'summarize',
        label: 'Summarize',
        description: 'Brief overview of the content',
        icon: 'edit',
    },
    KEY_TAKEAWAYS: {
        value: 'key_takeaways',
        label: 'Key Takeaways',
        description: 'Important points in bullet form',
        icon: 'target',
    },
    CONCISE_SUMMARY: {
        value: 'concise_summary',
        label: 'Concise Summary',
        description: 'Short paragraph summary',
        icon: 'article',
    },
    DETAILED_SUMMARY: {
        value: 'detailed_summary',
        label: 'Detailed Summary',
        description: 'Comprehensive explanation',
        icon: 'library_books',
    },
};

// Array format for dropdown rendering
export const SIMPLIFICATION_OPTIONS = Object.values(SIMPLIFICATION_LEVELS);

// Default simplification level
export const DEFAULT_SIMPLIFICATION_LEVEL = SIMPLIFICATION_LEVELS.DETAILED_SUMMARY.value;

// ========== ACTIVITY TYPES ==========

/**
 * Activity Type Constants - MUST match backend
 * Source of truth: retention-service/controllers/activityController.js
 */
export const ACTIVITY_TYPES = {
    READ: 'read',
    LIKE: 'like',
    UPVOTE: 'upvote',
    COMMENT: 'comment',
    SIMPLIFY: 'simplify',
    WORD_MEANING: 'word_meaning',
    SEARCH: 'search',
};

// ========== BADGE SYSTEM ==========

/**
 * Badge Level Constants
 * Source of truth: retention-service/helpers/retentionHelper.js
 */
export const BADGE_LEVELS = {
    MIN: 1,
    MAX: 5, // Exactly 5 badges maximum
};

// ========== HISTORY GROUPING ==========

/**
 * Time-based grouping for History page
 */
export const HISTORY_TIME_GROUPS = {
    TODAY: 'Today',
    YESTERDAY: 'Yesterday',
    THIS_WEEK: 'This Week',
    LAST_WEEK: 'Last Week',
    THIS_MONTH: 'This Month',
    OLDER: 'Older',
};

// ========== UI CONSTANTS ==========

/**
 * Reusable UI messages
 */
export const UI_MESSAGES = {
    LOADING: 'Loading...',
    ERROR_GENERIC: 'Something went wrong. Please try again.',
    SUCCESS_SAVED: 'Saved successfully!',
    CONFIRM_DELETE: 'Are you sure you want to delete this?',
};

/**
 * Toast notification durations (ms)
 */
export const TOAST_DURATION = {
    SHORT: 2000,
    MEDIUM: 3000,
    LONG: 5000,
};

export default {
    TEXT_SELECTION,
    SEARCH_INPUT,
    SIMPLIFICATION_LEVELS,
    SIMPLIFICATION_OPTIONS,
    DEFAULT_SIMPLIFICATION_LEVEL,
    ACTIVITY_TYPES,
    BADGE_LEVELS,
    HISTORY_TIME_GROUPS,
    UI_MESSAGES,
    TOAST_DURATION,
};
