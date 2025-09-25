// src/components/UI/LoadingSpinner.jsx
import React from "react";

const LoadingSpinner = ({ size = "md", text = "" }) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16"
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-2 border-periwinkle border-t-transparent rounded-full animate-spin`}
      />
      {text && (
        <p className="mt-3 text-periwinkle text-sm font-lato">
          {text}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;