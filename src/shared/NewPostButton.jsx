import React from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/UI";

const NewPostButton = () => {
  const navigate = useNavigate();

  return (
    <PrimaryButton onClick={() => navigate('/create-post')} className="ml-2 h-[49px]" style={{ minWidth: 132 }}>
      + New Post
    </PrimaryButton>
  );
};

export default NewPostButton;