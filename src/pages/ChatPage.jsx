import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import ChatMessage from "../components/Chat/ChatMessage";
import ChatInput from "../components/Chat/ChatInput";
import VideoRoomButton from "../components/CommunityDetail/VideoRoomButton";
import ChatSidebar from "../components/Chat/ChatSidebar";

const COMMUNITY_DATA = {
  name: "Next.jsDevs Chat",
  avatar: "https://images.unsplash.com/photo-1513910210086-28d0b43e5e30?q=80&w=746&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  activeCount: "27 active now"
};

const CHAT_MESSAGES = [
  { id: 1, author: { name: "Allex johnson", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGFljVK_1YLiLqNE8SMU0zsD2LUOv_ZJClfdq_DWp5FLd8KsDvQMnl0VOe2aFfU8eqc6M6I9aJ-VCGtFzHlUS0P9bjYnTWHMI5UO-pnf_7H4DGlvVnCe8Bj212iSAhJEonp7QjXn4VZAVbIpKHMYo4M70ouLkfY0wZPHju90a2vQzdL6Es79mMQ8NwXMHcJmqQaWhUuBwfkisr2uii-p0d3iFFfq4_RPcfykChX-MAS__NVdhAo3TLJvD4_LSMPxI_TLnrD1Gi_oFK" }, 
    message: "Has anyone tried the new app Router Features in Next.js 15?", time: "2:43 pm", isCurrentUser: false },
  { id: 2, author: { name: "Mary Chen", avatar: "https://images.unsplash.com/photo-1696960181436-1b6d9576354e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHdvbWVuJTIwcHJvZmlsZSUyMHByb2Zlc3Npb25hbHxlbnwwfHwwfHx8MA%3D%3D" }, 
    message: "Yes! the new parallel routing is amazing.it's made our multi-tabbed dashboard so much easier to implement", time: "2:56 pm", isCurrentUser: false },
  { id: 3, author: { name: "John Smith", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0SOH_qdug48AdwWxvlB89VAMgWwLvCzU5nSDeh7sGBOxfkwtoGxXGFu3Q2JauQZWpKqk-GCgCttE6cJIsPEkbYBWNgz8qS6HIT-5Sz6LgHkDAzWnkSvAOUOk7CDaVV0qGaLh5TF5SZPN1EfhhvDKzelBH3komHVKuAU_sLPUdP82-LnV5uJEpBfaz0d1ZudZEkDGu7GEHq46ftKnljIDa0wEpEPuusxbFSIsOPoONgMi3EDnu1Bupe8IbBw6vKFxxdMaP6_2s5fii" }, 
    message: "I'm having an issue with client components in Server Actions.Can anyone help?", time: "2:55 pm", isCurrentUser: false },
  { id: 4, author: { name: "You", avatar: "https://images.unsplash.com/photo-1695927621677-ec96e048dce2?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" }, 
    message: "@John what specific issues are you having?I've working with Server Actions alot lately", time: "2:55 pm", isCurrentUser: true },
  { id: 5, author: { name: "John Smith", avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0SOH_qdug48AdwWxvlB89VAMgWwLvCzU5nSDeh7sGBOxfkwtoGxXGFu3Q2JauQZWpKqk-GCgCttE6cJIsPEkbYBWNgz8qS6HIT-5Sz6LgHkDAzWnkSvAOUOk7CDaVV0qGaLh5TF5SZPN1EfhhvDKzelBH3komHVKuAU_sLPUdP82-LnV5uJEpBfaz0d1ZudZEkDGu7GEHq46ftKnljIDa0wEpEPuusxbFSIsOPoONgMi3EDnu1Bupe8IbBw6vKFxxdMaP6_2s5fii" }, 
    message: "I'm trying to change state after a server action completes but i am getting a hydration error", time: "3:00 pm", isCurrentUser: false }
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(CHAT_MESSAGES);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSendMessage = (messageText) => {
    const newMessage = {
      id: messages.length + 1,
      author: { name: "You", avatar: "https://images.unsplash.com/photo-1695927621677-ec96e048dce2?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
      message: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isCurrentUser: true
    };
    setMessages([...messages, newMessage]);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-rich-black">
      {/* Navbar */}
      <Navbar />
      
      {/* Main Layout Container */}
      <div className="flex h-[calc(100vh-84px)] relative">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <ChatSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        </div>
        
        {/* Mobile Sidebar */}
        <div className="lg:hidden">
          <ChatSidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        </div>
        
        {/* Main Content */}
        <div className="flex flex-col flex-1 relative">
          {/* Background Blur Effect */}
          <div className="absolute z-0" style={{ width: 637, height: 300, top: -38, left: "50%", transform: "translateX(-50%)", 
               background: "#1A1842B3", filter: "blur(100px)", boxShadow: "0px 4px 100px 500px #00000066", 
               borderRadius: 30, pointerEvents: "none" }} />

          {/* Chat Header */}
          <div className="w-full pt-8 pb-12 relative z-10">
            <div className="w-full px-4 lg:px-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  {/* Mobile hamburger menu */}
                  <button 
                    onClick={toggleSidebar}
                    className="lg:hidden hover:text-periwinkle transition-colors flex-shrink-0"
                  >
                    <span className="material-icons text-white text-2xl">menu</span>
                  </button>
                  
                  <img src={COMMUNITY_DATA.avatar} alt={COMMUNITY_DATA.name} className="w-28 h-28 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <h1 className="font-fenix text-3xl md:text-4xl text-white font-normal mb-2">{COMMUNITY_DATA.name}</h1>
                    <p className="font-lato text-columbia-blue text-base">{COMMUNITY_DATA.activeCount}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <VideoRoomButton />
                  {['people', 'info'].map(icon => (
                    <button key={icon} className="text-white hover:text-periwinkle transition-colors">
                      <span className="material-icons text-2xl">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Chat Messages and Input */}
          <div className="flex-1 flex flex-col relative z-10 min-h-0">
            <div className="flex-1 overflow-y-auto space-y-4 pb-6 px-8 lg:px-16" style={{
              scrollbarWidth: 'thin',
              scrollbarColor: 'var(--rich-black) transparent'
            }}>
              {messages.map((message) => <ChatMessage key={message.id} {...message} />)}
            </div>
            <div className="px-8 lg:px-16">
              <ChatInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;