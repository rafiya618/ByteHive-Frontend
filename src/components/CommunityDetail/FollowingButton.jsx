import React, { useState } from "react";

const FollowingButton = ({ isFollowing: initialFollowing = false, onToggle }) => {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  // Update local state if prop changes
  React.useEffect(() => {
    setIsFollowing(initialFollowing);
  }, [initialFollowing]);

  const toggleFollow = async () => {
    if (loading) return;

    setLoading(true);
    try {
      if (onToggle) {
        await onToggle();
        setIsFollowing(!isFollowing);
      } else {
        // Fallback for local state only
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
      // Revert optimistic update on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={toggleFollow}
      disabled={loading}
      className={`bh-action-btn h-[49px] px-6 text-white text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      style={{
        minWidth: 148,
        backgroundColor: isFollowing ? "transparent" : "var(--medium-slate-blue)",
        borderColor: isFollowing ? "var(--periwinkle)" : "var(--medium-slate-blue)",
      }}
    >
      {loading ? (
        <span className="material-icons text-base animate-spin">hourglass_empty</span>
      ) : (
        isFollowing && (
          <span className="material-icons text-base text-periwinkle">check</span>
        )
      )}
      {loading ? "..." : isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowingButton;