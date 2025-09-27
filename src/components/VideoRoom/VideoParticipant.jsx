import React from "react";

const VideoParticipant = ({ participant }) => {
  const { name, avatar, cameraOn, videoSrc } = participant;

  return (
    <div 
      className="relative rounded-2xl overflow-hidden"
      style={{
        height: '400px',
        backgroundColor: cameraOn ? 'transparent' : '#000000',
        border: '2px solid rgba(255, 255, 255, 0.1)',
      }}
    >
      {cameraOn ? (
        // Video feed background
        <div 
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: `url('https://plus.unsplash.com/premium_photo-1661763714352-79327575ebda?q=80&w=1032&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')`
          }}
        >
          {/* Participant overlay for video */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-lato text-white text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              {name}
            </span>
          </div>
        </div>
      ) : (
        // Camera off view
        <div className="w-full h-full flex flex-col items-center justify-center relative">
          <div className="text-center mb-6">
            <p className="font-lato text-white text-lg mb-4">Your Camera is off</p>
          </div>
          
          {/* Avatar */}
          <img
            src="https://images.unsplash.com/photo-1695927621677-ec96e048dce2?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt={name}
            className="w-24 h-24 rounded-full object-cover mb-4"
          />
          
          {/* Name with active indicator  */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-lato text-white text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
              {name}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoParticipant;