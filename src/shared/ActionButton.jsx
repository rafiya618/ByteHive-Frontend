import React from "react";
import { PrimaryButton, SecondaryButton } from "../components/UI";

const ActionButton = ({ children, variant = "primary", ...props }) => {
  if (variant === 'secondary') {
    return <SecondaryButton {...props}>{children}</SecondaryButton>;
  }

  return <PrimaryButton {...props}>{children}</PrimaryButton>;
};

export default ActionButton;
