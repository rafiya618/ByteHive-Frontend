import React, { useState, useCallback } from "react";

const SearchBar = ({ placeholder = "Search events", onSearch, className = "" }) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Debounce search to avoid too many API calls
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(null, args), delay);
    };
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (onSearch) {
        onSearch(query);
      }
    }, 500), // 500ms delay
    [onSearch]
  );

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (onSearch) {
        onSearch(searchQuery);
      }
    }
  };

  return (
    <div className={`relative flex-grow max-w-xl ${className}`}>
      {/* Search Icon (Left) */}
      <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-[#B0BAFF] text-xl">
        search
      </span>

      {/* Input */}
      <input 
        type="text" 
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="bg-transparent border border-[#393B5A] text-white rounded-[8px] h-[49px] pl-12 pr-4 w-full text-base focus:outline-none focus:border-periwinkle transition-colors" 
      />
    </div>
  );
};

export default SearchBar;