import { useCallback } from "react";
import { logActivity } from "../api/retentionApi";

/**
 * Custom hook for recording user activities to streak system
 * Usage: const recordActivity = useRecordActivity();
 *        recordActivity("read", "postId123");
 */
export const useRecordActivity = () => {
  const recordActivity = useCallback(async (activityType, postId = null) => {
    try {
      const result = await logActivity(activityType, postId);
      return result;
    } catch (error) {
      console.error(`Failed to log ${activityType} activity:`, error);
      // Silently fail to not disrupt user experience
      return null;
    }
  }, []);

  return recordActivity;
};

export default useRecordActivity;
