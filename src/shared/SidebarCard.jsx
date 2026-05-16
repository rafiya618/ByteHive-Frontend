import React from "react";
import { PrimaryButton } from "../components/UI";

const SidebarCard = ({ title, description, buttonText, icon }) => {
  return (
    <div className="bh-elev-card bg-navbar-bg border border-navbar-border rounded-2xl p-5 flex flex-col gap-3">
      <h4 className="font-fenix text-white text-lg leading-tight">{title}</h4>
      <p className="text-desc text-sm">{description}</p>
      <PrimaryButton className="mt-2 inline-flex items-center gap-2">
        <span className="material-icons">{icon}</span>
        {buttonText}
      </PrimaryButton>
    </div>
  );
};

export default SidebarCard;
