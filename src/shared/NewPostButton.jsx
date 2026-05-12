import React from "react";
import { useNavigate } from "react-router-dom";

const NewPostButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/create-post")}
      className="bh-gradient-btn ml-2 h-[49px] px-6 text-white text-base font-bold rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer"
      style={{
        minWidth: 132,
      }}
    >
      + New Post
    </button>
  );
};

export default NewPostButton;