import React from "react";

const ChatMessage = ({ author, message, time, isCurrentUser }) => {
  const messageStyle = isCurrentUser 
    ? { background: "linear-gradient(135deg, #6866FF 0%, #5755D6 100%)" }
    : { backgroundColor: "var(--navbar-bg)", borderColor: "var(--navbar-border)" };

  const containerClass = `flex items-start gap-4 ${isCurrentUser ? 'justify-end' : ''}`;
  const messageClass = `px-4 py-3 rounded-lg ${isCurrentUser ? '' : 'border'}`;
  const textColor = isCurrentUser ? 'text-white' : 'text-columbia-blue';

  return (
    <div className={containerClass}>
      {!isCurrentUser && (
        <img src={author.avatar} alt={author.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
      )}
      <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : ''}`}>
        <div className={messageClass} style={messageStyle}>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-lato text-white text-xs font-medium">{author.name}</span>
            <span className="font-lato text-xs" style={{ color: "var(--periwinkle)" }}>{time}</span>
          </div>
          <p className={`font-lato ${textColor} text-sm leading-relaxed`}>{message}</p>
        </div>
      </div>
      {isCurrentUser && (
        <img src={author.avatar} alt={author.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
      )}
    </div>
  );
};

export default ChatMessage;