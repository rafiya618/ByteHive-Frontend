import React from "react";

const SearchBar = () => {
  return (
    <div className="relative flex-grow max-w-xl">
      {/* Search Icon (Left) */}
      <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-[#B0BAFF] text-xl">
        search
      </span>

      {/* Input */}
      <input
        type="text"
        placeholder="Search events"
        className="bg-transparent border border-[#393B5A] text-white 
                   rounded-[8px] h-[49px] pl-12 pr-4 w-full text-base 
                   focus:outline-none"
      />
    </div>
  );
};

export default SearchBar;
