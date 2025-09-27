import React, { useState } from "react";

const ChatInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="pt-4 pb-6">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        <img src="https://images.unsplash.com/photo-1695927621677-ec96e048dce2?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
             alt="Your avatar" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
        
        <div className="flex-1 relative">
          <div className="bg-navbar-bg rounded-lg border px-6 flex items-center gap-3 h-12" 
               style={{ borderColor: "var(--navbar-border)" }}>
            <input type="text" value={message} onChange={(e) => setMessage(e.target.value)} 
                   onKeyPress={handleKeyPress} placeholder="Type a message"
                   className="flex-1 bg-transparent text-white placeholder-columbia-blue outline-none font-lato text-base" />
            <button type="button" className="text-columbia-blue hover:text-white transition-colors">
              <span className="material-icons text-xl">sentiment_satisfied</span>
            </button>
          </div>
        </div>

        <button type="submit" disabled={!message.trim()}
                className="disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 font-lato text-base font-medium h-12"
                style={{ background: "linear-gradient(135deg, #6866FF 0%, #5755D6 100%)" }}>
          <span className="material-icons text-lg">send</span>
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;