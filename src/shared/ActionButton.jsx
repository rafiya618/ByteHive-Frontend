import React from "react";

const ActionButton = ({ children, variant = "primary", ...props }) => {
  const base = "bh-action-btn inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-lato font-semibold transition-all duration-200 cursor-pointer";
  const styles =
    variant === "primary"
      ? "bg-medium-slate-blue text-white hover:bg-medium-slate-blue-dark"
      : "bg-transparent border border-navbar-border text-periwinkle hover:text-white hover:border-periwinkle";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
};

export default ActionButton;
