import React from "react";

const JoinChatButton = () => {
  return (
    <button
      className="h-[49px] px-6 bg-navbar-bg text-white text-base font-medium rounded-[5px] transition-colors duration-200 flex items-center gap-2 border hover:border-periwinkle"
      style={{
        minWidth: 120,
        borderRadius: "5px",
        borderColor: "var(--periwinkle)",
      }}
    >
      <span className="material-icons text-base">
        chat_bubble_outline
      </span>
      Join Chat
    </button>
  );
};

export default JoinChatButton;