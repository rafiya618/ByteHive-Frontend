import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CommunityCard = ({
  id = 1,
  image,
  name,
  description,
  memberCount,
  postCount,
  isFollowing = false,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const navigate = useNavigate();

  const handleFollowToggle = (e) => {
    e.stopPropagation();
    setFollowing(!following);
  };

  const handleViewCommunity = () => {
    // Navigate to community detail page
    navigate(`/community/${id}`);
  };

  return (
    <div
      className="bg-navbar-bg rounded-xl overflow-hidden border cursor-pointer hover:border-periwinkle transition-colors relative"
      style={{
        border: "1px solid var(--navbar-border)",
      }}
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          {/* Community Image */}
          <div className="flex-shrink-0">
            <img
              alt={name}
              className="rounded-lg w-32 h-32 object-cover"
              src={image}
            />
          </div>

          {/* Content */}
          <div className="flex-grow min-w-0">
            {/* Community Name */}
            <h3 className="font-fenix text-xl text-white mb-2 hover:text-periwinkle transition-colors">
              {name}
            </h3>

            {/* Description */}
            <p
              className="font-lato mb-3 text-desc"
              style={{
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "140%",
                letterSpacing: 0,
              }}
            >
              {description}
            </p>

            {/* Stats */}
            <div className="flex items-center space-x-4 mb-4 text-sm font-lato" style={{ color: "#8B93D1" }}>
              <div className="flex items-center">
                <span className="material-icons text-base mr-1 text-periwinkle">people</span>
                <span>{memberCount.toLocaleString()} members</span>
              </div>
              <div className="flex items-center">
                <span className="material-icons text-base mr-1 text-periwinkle">article</span>
                <span>{postCount.toLocaleString()} posts</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              {/* View Community Button */}
              <button
                onClick={handleViewCommunity}
                className="px-0 py-2 bg-transparent text-white hover:text-periwinkle transition-colors font-lato font-normal text-sm"
              >
                View Community →
              </button>
              
              {/* Follow Button - Bottom right with improved hover effect */}
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-1 rounded-lg font-lato font-medium text-sm border transition-colors ${
                  following
                    ? "border-white bg-transparent text-white hover:bg-[var(--card-button-bg)] hover:border-[var(--card-button-bg)]"
                    : "border-white bg-transparent text-white hover:bg-[var(--card-button-bg)] hover:border-[var(--card-button-bg)]"
                }`}
              >
                <span className="flex items-center">
                  <span className="material-icons text-base mr-1">
                    {following ? "check" : "add"}
                  </span>
                  {following ? "Following" : "Follow"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityCard;