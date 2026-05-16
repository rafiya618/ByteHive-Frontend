import React from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../../components/UI";

const VideoRoomButton = () => {
  const navigate = useNavigate();

  return (
    <PrimaryButton onClick={() => navigate('/video-home')} className="h-[49px] px-6" style={{ minWidth: 148, borderColor: 'var(--periwinkle)' }}>
      <span className="material-icons text-base">videocam</span>
      Video Room
    </PrimaryButton>
  );
};

export default VideoRoomButton;