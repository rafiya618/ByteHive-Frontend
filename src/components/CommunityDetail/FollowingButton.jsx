import React, { useState } from "react";
import { PrimaryButton, SecondaryButton } from "../../components/UI";

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
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow status:', error);
    } finally {
      setLoading(false);
    }
  };

  const commonStyle = { minWidth: 148 };

  if (isFollowing) {
    return (
      <SecondaryButton onClick={toggleFollow} disabled={loading} className="h-[49px] px-6" style={commonStyle}>
        {loading ? <span className="material-icons text-base animate-spin">hourglass_empty</span> : <span className="material-icons text-base text-periwinkle">check</span>}
        {loading ? '...' : 'Following'}
      </SecondaryButton>
    );
  }

  return (
    <PrimaryButton onClick={toggleFollow} disabled={loading} className="h-[49px] px-6" style={commonStyle}>
      {loading ? <span className="material-icons text-base animate-spin">hourglass_empty</span> : null}
      {loading ? '...' : 'Follow'}
    </PrimaryButton>
  );
};

export default FollowingButton;