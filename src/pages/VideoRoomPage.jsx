import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import VideoCall from "../components/VideoRoom/VideoCall";
import ParticipantsList from "../components/VideoRoom/ParticipantsList";
import VideoControls from "../components/VideoRoom/VideoControls";
import JoinChatButton from "../components/CommunityDetail/JoinChatButton";

// Mock data for the video room
const VIDEO_ROOM_DATA = {
  name: "Next.jsDevs Video Room",
  participantCount: 3,
  avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80"
};

const VideoRoomPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showParticipants, setShowParticipants] = useState(false);

  const handleBackClick = () => {
    navigate(`/community/${id}`);
  };

  return (
    <div className="min-h-screen bg-rich-black flex flex-col relative">
      <Navbar />

      {/* Background Glow */}
      <div
        className="absolute z-0"
        style={{
          width: 637,
          height: 300,
          top: -38,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1842B3",
          filter: "blur(100px)",
          boxShadow: "0px 4px 100px 500px #00000066",
          borderRadius: 30,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div className="w-full flex justify-center pt-8 pb-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-6">
              {/* Back Button */}
              <button
                onClick={handleBackClick}
                className="hover:text-periwinkle transition-colors"
              >
                <span className="material-icons text-white text-2xl">arrow_back</span>
              </button>

              {/* Community Avatar */}
              <img
                src="https://images.unsplash.com/photo-1513910210086-28d0b43e5e30?q=80&w=746&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Community"
                className="w-28 h-28 rounded-full object-cover"
              />
              
              {/* Room Info */}
              <div>
                <h1 className="font-fenix text-3xl md:text-4xl text-white font-normal mb-2">
                  {VIDEO_ROOM_DATA.name}
                </h1>
                <p className="font-lato text-columbia-blue text-base">
                  {VIDEO_ROOM_DATA.participantCount} participants
                </p>
              </div>
            </div>

            {/* Right Side Buttons */}
            <div className="flex items-center gap-3">
              <JoinChatButton />
              <button
                onClick={() => setShowParticipants(!showParticipants)}
                className="h-[49px] px-6 bg-navbar-bg text-white text-base font-medium rounded-[5px] transition-colors duration-200 flex items-center gap-2 border hover:border-periwinkle"
                style={{
                  minWidth: 120,
                  borderRadius: "5px",
                  borderColor: "var(--periwinkle)",
                }}
              >
                <span className="material-icons text-base">people</span>
                Participants ({VIDEO_ROOM_DATA.participantCount})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Content */}
      <div className="flex-1 w-full flex justify-center px-4 lg:px-8 pb-8 relative z-10">
        <div className="w-full max-w-7xl flex gap-6">
          {/* Main Video Area */}
          <div className="flex-1">
            <VideoCall />
          </div>

          {/* Participants Panel */}
          {showParticipants && (
            <div className="w-80">
              <ParticipantsList />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="w-full flex justify-center pb-8 relative z-10">
        <VideoControls />
      </div>
    </div>
  );
};

export default VideoRoomPage;