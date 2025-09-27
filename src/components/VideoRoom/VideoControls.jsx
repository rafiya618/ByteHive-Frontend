import React, { useState } from "react";

const VideoControls = () => {
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(false);

  return (
    <div className="flex items-center gap-4">
      {/* Mic Button */}
      <button
        onClick={() => setMicOn(!micOn)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          micOn 
            ? 'bg-navbar-bg hover:bg-gray-700 border border-gray-600' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        <span className="material-icons text-white text-xl">
          {micOn ? 'mic' : 'mic_off'}
        </span>
      </button>

      {/* Camera Button */}
      <button
        onClick={() => setCameraOn(!cameraOn)}
        className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
          cameraOn 
            ? 'bg-navbar-bg hover:bg-gray-700 border border-gray-600' 
            : 'bg-red-600 hover:bg-red-700'
        }`}
      >
        <span className="material-icons text-white text-xl">
          {cameraOn ? 'videocam' : 'videocam_off'}
        </span>
      </button>

      {/* Leave Call Button */}
      <button
        className="w-12 h-12 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
      >
        <span className="material-icons text-white text-xl">call_end</span>
      </button>
    </div>
  );
};

export default VideoControls;