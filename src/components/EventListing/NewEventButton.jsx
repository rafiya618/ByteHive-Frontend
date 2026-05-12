import React from "react";
import { useNavigate } from "react-router-dom";

const NewPostButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/create-event")}
      className="events-new-btn ml-2 h-[49px] px-6 text-white text-base font-semibold rounded-xl transition-all duration-200 flex items-center justify-center"
      style={{
        minWidth: 148,
      }}
    >
      + Create Event
    </button>
  );
};

export default NewPostButton;