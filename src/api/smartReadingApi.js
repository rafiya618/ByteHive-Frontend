import axios from 'axios';
import { isValidSimplificationLevel } from '../utils/validation';

const SMART_READING_BASE_URL = 'http://127.0.0.1:5008/smart-reading';

// Create axios instance with default config
const smartReadingClient = axios.create({
  baseURL: SMART_READING_BASE_URL,
  timeout: 60000, // 60 seconds for AI processing (increased from 10s)
});

// Add request interceptor to include JWT token
smartReadingClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('Auth');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Get meaning/definition of a word
 * @param {string} word - The word to lookup
 * @returns {Promise<Object>} Meaning data with definition, pronunciation, examples, etc.
 */
export async function getMeaning(word) {
  try {
    const response = await smartReadingClient.get('/meanings', {
      params: { word },
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching meaning:', error.message);
    throw error;
  }
}

/**
 * Search for meanings matching a query
 * @param {string} query - The search query
 * @returns {Promise<Array>} Array of matching meanings
 */
export async function searchMeanings(query) {
  try {
    console.log(`🔎 Searching meanings for: "${query}"`);
    const response = await smartReadingClient.get('/meanings/search', {
      params: { query },
    });
    console.log(`✅ Found ${response.data.count} meanings`);
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Error searching meanings:', error.message);
    throw error;
  }
}

/**
 * Simplify post content using AI
 * @param {string} postId - The post ID
 * @param {string} content - The content to simplify
 * @param {string} level - Simplification level: 'summarize', 'key_takeaways', 'concise_summary', or 'detailed_summary'
 * @returns {Promise<Object>} Simplified content, summaries, and key takeaways
 */
export async function simplifyPost(postId, content, level = 'detailed_summary', forceRefresh = false) {
  try {
    // Validate simplification level (SINGLE SOURCE OF TRUTH)
    if (!isValidSimplificationLevel(level)) {
      throw new Error(`Invalid simplification level: "${level}". Must be one of: summarize, key_takeaways, concise_summary, detailed_summary`);
    }

    console.log(`📤 Simplifying post ${postId} with level: ${level}`);

    const response = await smartReadingClient.post('/simplify', {
      postId,
      content,
      simplificationLevel: level, // Use correct parameter name expected by backend
    });

    console.log('✅ Simplification response:', response.data);
    return response.data; // Return the full response data
  } catch (error) {
    console.error('❌ Error simplifying post:', error.message);
    console.error('Response status:', error.response?.status);
    console.error('Response data:', error.response?.data);

    // Re-throw the error so the component can handle it
    // Do NOT return placeholder data
    throw error;
  }
};

/**
 * Get cached simplification for a post
 * @param {string} postId - The post ID
 * @param {string} level - Simplification level: 'summarize', 'key_takeaways', 'concise_summary', or 'detailed_summary'
 * @returns {Promise<Object|null>} Simplified content or null if not found
 */
export async function getSimplification(postId, level = 'detailed_summary') {
  try {
    // Validate simplification level
    if (!isValidSimplificationLevel(level)) {
      console.warn(`⚠️ Invalid simplification level: "${level}". Using default 'detailed_summary'`);
      level = 'detailed_summary';
    }

    console.log(
      `📖 Fetching simplification for post: ${postId} (${level})`
    );
    const response = await smartReadingClient.get('/simplification', {
      params: { postId, level },
    });
    console.log('✅ Simplification fetched successfully');
    return response.data.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️ Simplification not found (not cached yet)');
      return null;
    }
    console.error('❌ Error fetching simplification:', error.message);
    throw error;
  }
}

/**
 * Search for related blogs based on a keyword
 * @param {string} keyword - The keyword to search for
 * @returns {Promise<Array>} Array of related blog posts
 */
export async function searchBlogs(keyword) {
  try {
    const response = await smartReadingClient.get('/search', {
      params: { keyword },
    });
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Error searching blogs:', error.message);
    return []; // Return empty array on error to not break UI
  }
}

/**
 * Get cached related blogs for a keyword
 * @param {string} keyword - The keyword
 * @returns {Promise<Array>} Array of related blog posts
 */
export async function getRelatedBlogs(keyword) {
  try {
    console.log(`📚 Fetching related blogs for: "${keyword}"`);
    const response = await smartReadingClient.get('/related-blogs', {
      params: { keyword },
    });
    console.log(`✅ Fetched ${response.data.data.length} related blogs`);
    return response.data.data || [];
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('ℹ️ No cached related blogs found');
      return [];
    }
    console.error('❌ Error fetching related blogs:', error.message);
    return [];
  }
}

/**
 * Chat about a word with AI
 * @param {string} word - The word to chat about
 * @param {string} message - The user's message
 * @returns {Promise<Object>} Chat response with AI answer
 */
export async function chatAboutWord(word, message) {
  try {
    const response = await smartReadingClient.post('/chat', {
      word,
      message,
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error chatting about word:', error.message);
    throw error;
  }
}
