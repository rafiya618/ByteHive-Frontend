import React from "react";
import VideoParticipant from "./VideoParticipant";

// Mock participants data
const PARTICIPANTS = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    cameraOn: false,
    isActive: true
  },
  {
    id: 2,
    name: "Mary Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80", 
    cameraOn: true,
    videoSrc: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?auto=format&fit=crop&w=800&q=80",
    isActive: false
  }
];

const VideoCall = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {PARTICIPANTS.map((participant) => (
        <VideoParticipant key={participant.id} participant={participant} />
      ))}
    </div>
  );
};

export default VideoCall;