import React from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../components/UI";

const NewCommunityButton = () => {
  const navigate = useNavigate();

  return (
    <PrimaryButton onClick={() => navigate('/create-community')} className="ml-2 h-[49px]" style={{ minWidth: 160 }}>
      + Create Community
    </PrimaryButton>
  );
};

export default NewCommunityButton;