import React, { useState } from "react";

const FollowingButton = () => {
  const [isFollowing, setIsFollowing] = useState(true);

  const toggleFollow = () => {
    setIsFollowing(!isFollowing);
  };

  return (
    <button
      onClick={toggleFollow}
      className="h-[49px] px-6 text-white text-base font-medium rounded-[5px] transition-colors duration-200 flex items-center gap-2 border"
      style={{
        minWidth: 120,
        borderRadius: "5px",
        backgroundColor: isFollowing ? "transparent" : "var(--medium-slate-blue)",
        borderColor: isFollowing ? "var(--periwinkle)" : "var(--medium-slate-blue)",
      }}
    >
      {isFollowing && (
        <span className="material-icons text-base text-periwinkle">
          check
        </span>
      )}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
};

export default FollowingButton;