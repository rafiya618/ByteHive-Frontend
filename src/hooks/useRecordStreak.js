import { useCallback } from 'react';
import { logActivity } from '../api/retentionApi';

export const useRecordStreak = () => {
  const recordActivityAction = useCallback(async (activityType, postId = null) => {
    try {
      await logActivity(activityType, postId);
      console.log(`✅ Activity logged: ${activityType}`);
    } catch (error) {
      console.error('❌ Error logging activity:', error);
      // Don't show error toast for activity recording to avoid spam
    }
  }, []);

  const recordRead = useCallback((postId) => {
    return recordActivityAction('read', postId);
  }, [recordActivityAction]);

  const recordView = useCallback((postId) => {
    return recordActivityAction('read', postId); // 'view' -> 'read'
  }, [recordActivityAction]);

  const recordPost = useCallback((postId) => {
    return recordActivityAction('read', postId); // 'post' -> 'read'
  }, [recordActivityAction]);

  const recordComment = useCallback((postId) => {
    return recordActivityAction('comment', postId);
  }, [recordActivityAction]);

  const recordLike = useCallback((postId) => {
    return recordActivityAction('upvote', postId); // 'like' -> 'upvote'
  }, [recordActivityAction]);

  const recordDownvote = useCallback((postId) => {
    return recordActivityAction('downvote', postId);
  }, [recordActivityAction]);

  const recordCommentView = useCallback((postId) => {
    return recordActivityAction('comment', postId);
  }, [recordActivityAction]);

  return {
    recordRead,
    recordView,
    recordPost,
    recordComment,
    recordLike,
    recordDownvote,
    recordCommentView,
    recordActivityAction
  };
};
