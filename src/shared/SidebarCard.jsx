import React from "react";

const SidebarCard = ({ title, description, buttonText, icon }) => {
  return (
    <div className="bh-elev-card bg-navbar-bg border border-navbar-border rounded-2xl p-5 flex flex-col gap-3">
      <h4 className="font-fenix text-white text-lg leading-tight">{title}</h4>
      <p className="text-desc text-sm">{description}</p>
      <button className="bh-action-btn bg-medium-slate-blue hover:bg-medium-slate-blue-dark text-white px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer font-bold mt-1">
        <span className="material-icons">{icon}</span> {buttonText}
      </button>
    </div>
  );
};

export default SidebarCard;
