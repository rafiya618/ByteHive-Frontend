import React from "react";

// Mock participants data
const ALL_PARTICIPANTS = [
  {
    id: 1,
    name: "Alex Johnson",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    micOn: true,
    cameraOn: false
  },
  {
    id: 2,
    name: "Mary Chen",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80",
    micOn: true,
    cameraOn: true
  },
  {
    id: 3,
    name: "John Smith",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    micOn: false,
    cameraOn: false
  }
];

const ParticipantsList = () => {
  return (
    <div 
      className="rounded-xl p-6 border h-fit"
      style={{
        backgroundColor: 'var(--navbar-bg)',
        borderColor: 'var(--navbar-border)',
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-fenix text-xl text-white">
          Participants ({ALL_PARTICIPANTS.length})
        </h3>
      </div>

      <div className="space-y-4">
        {ALL_PARTICIPANTS.map((participant) => (
          <div key={participant.id} className="flex items-center gap-3">
            {/* Avatar */}
            <img
              src={participant.avatar}
              alt={participant.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            
            {/* Name and Status */}
            <div className="flex-1">
              <p className="font-lato text-white text-sm font-medium">
                {participant.name}
              </p>
            </div>

            {/* Status Icons */}
            <div className="flex items-center gap-1">
              <span 
                className={`material-icons text-sm ${
                  participant.micOn ? 'text-gray-400' : 'text-red-500'
                }`}
              >
                {participant.micOn ? 'mic' : 'mic_off'}
              </span>
              <span 
                className={`material-icons text-sm ${
                  participant.cameraOn ? 'text-gray-400' : 'text-red-500'
                }`}
              >
                {participant.cameraOn ? 'videocam' : 'videocam_off'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ParticipantsList;