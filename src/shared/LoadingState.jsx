import React from "react";
import { LoadingSpinner } from "../components/UI";

const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <h3 className="font-fenix text-2xl text-white mt-4">{message}</h3>
      </div>
    </div>
  );
};

export default LoadingState;