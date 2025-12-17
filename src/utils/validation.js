import { TEXT_SELECTION, SEARCH_INPUT } from './constants';

/**
 * Validation Utilities
 * Centralized validation logic to avoid duplication
 */

/**
 * Count words in a string
 * @param {string} text - Text to count words in
 * @returns {number} Word count
 */
export const countWords = (text) => {
    if (!text || typeof text !== 'string') return 0;
    const matches = text.trim().match(TEXT_SELECTION.VALIDATION_REGEX);
    return matches ? matches.length : 0;
};

/**
 * Validate text selection length
 * @param {string} text - Selected text
 * @returns {{ valid: boolean, wordCount: number, error: string | null }}
 */
export const validateTextSelection = (text) => {
    const wordCount = countWords(text);

    if (wordCount === 0) {
        return {
            valid: false,
            wordCount: 0,
            error: 'Please select some text.',
        };
    }

    if (wordCount > TEXT_SELECTION.MAX_WORDS) {
        return {
            valid: false,
            wordCount,
            error: TEXT_SELECTION.ERROR_MESSAGE,
        };
    }

    return {
        valid: true,
        wordCount,
        error: null,
    };
};

/**
 * Validate search query length
 * @param {string} query - Search query
 * @returns {{ valid: boolean, wordCount: number, error: string | null }}
 */
export const validateSearchQuery = (query) => {
    const wordCount = countWords(query);

    if (wordCount === 0) {
        return {
            valid: true, // Empty search is allowed
            wordCount: 0,
            error: null,
        };
    }

    if (wordCount > SEARCH_INPUT.MAX_WORDS) {
        return {
            valid: false,
            wordCount,
            error: SEARCH_INPUT.ERROR_MESSAGE,
        };
    }

    return {
        valid: true,
        wordCount,
        error: null,
    };
};

/**
 * Sanitize HTML content to prevent XSS
 * @param {string} html - HTML string to sanitize
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
    if (!html || typeof html !== 'string') return '';

    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.textContent = html;

    return temp.innerHTML;
};

/**
 * Check if content is valid HTML
 * @param {string} content - Content to check
 * @returns {boolean}
 */
export const isHTML = (content) => {
    if (!content || typeof content !== 'string') return false;
    return /<[^>]+>/.test(content);
};

/**
 * Strip HTML tags from content
 * @param {string} html - HTML string
 * @returns {string} Plain text
 */
export const stripHTML = (html) => {
    if (!html || typeof html !== 'string') return '';

    const temp = document.createElement('div');
    temp.innerHTML = html;

    return temp.textContent || temp.innerText || '';
};

/**
 * Validate simplification level
 * @param {string} level - Simplification level to validate
 * @returns {boolean}
 */
export const isValidSimplificationLevel = (level) => {
    const validLevels = ['summarize', 'key_takeaways', 'concise_summary', 'detailed_summary'];
    return validLevels.includes(level);
};

export default {
    countWords,
    validateTextSelection,
    validateSearchQuery,
    sanitizeHTML,
    isHTML,
    stripHTML,
    isValidSimplificationLevel,
};
