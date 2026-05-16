import React from "react";
import { useNavigate } from "react-router-dom";
import { PrimaryButton } from "../UI";

const NewPostButton = () => {
  const navigate = useNavigate();

  return (
    <PrimaryButton
      onClick={() => navigate("/create-event")}
      className="ml-2 h-[49px]"
      style={{ minWidth: 132 }}
    >
      + Create Event
    </PrimaryButton>
  );
};

export default NewPostButton;