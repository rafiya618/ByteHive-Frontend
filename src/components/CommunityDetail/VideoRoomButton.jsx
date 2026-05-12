import React from "react";
import { useNavigate } from "react-router-dom";

const VideoRoomButton = () => {
  const navigate = useNavigate();

  return (
    <button
      className="bh-action-btn h-[49px] px-6 bg-navbar-bg text-white text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border hover:border-periwinkle"
      style={{
        minWidth: 148,
        borderColor: "var(--periwinkle)",
      }}
      onClick={() => navigate("/video-home")}
    >
      <span className="material-icons text-base">
        videocam
      </span>
      Video Room
    </button>
  );
};

export default VideoRoomButton;