import React from "react";
import Navbar from "../../shared/Navbar";
import { PrimaryButton } from "../../components/UI";
import InputField from "../../shared/InputField";

function HomePage() {
  const [roomLink, setRoomLink] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  function generateRoomId() {
    return Math.random().toString(36).substring(2, 10);
  }

  const createRoom = () => {
    const roomId = generateRoomId();
    const link = `${import.meta.env.VITE_FRONTEND_URL}/room/${roomId}`;
    setRoomLink(link);
    setCopied(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(roomLink);
    setCopied(true);
  };

  return (
    <div className="min-h-screen bg-rich-black flex flex-col events-page">
      <Navbar />
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="events-hero max-w-lg w-full bg-navbar-bg border border-navbar-border rounded-3xl shadow-lg p-8 flex flex-col items-center">
          <div className="flex items-center gap-3 mb-6">
            <span className="material-icons text-periwinkle text-4xl">videocam</span>
            <h1 className="font-fenix text-3xl text-white">ByteHive Video Rooms</h1>
          </div>
          <PrimaryButton onClick={createRoom} className="mb-6 flex items-center gap-2">
            <span className="material-icons text-lg">add_circle</span>
            Create Room
          </PrimaryButton>
          {roomLink && (
            <div className="w-full mt-4 flex flex-col items-center">
              <div className="text-columbia-blue mb-2 font-lato">Sharable Room Link:</div>
              <div className="flex w-full gap-2">
                <InputField value={roomLink} readOnly className="flex-1" />
                <PrimaryButton onClick={copyLink} className="flex items-center gap-1">
                  <span className="material-icons text-base">content_copy</span>
                  Copy
                </PrimaryButton>
                {copied && (
                  <span className="text-green-400 flex items-center gap-1 ml-2">
                    <span className="material-icons text-base">check_circle</span>
                    Copied!
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
