import React, { useState, useEffect } from "react";

const SearchBar = ({ 
  className = "", 
  placeholder = "Search...", 
  onSearch = () => {}, 
  value = "",
  disabled = false 
}) => {
  const [searchValue, setSearchValue] = useState(value);

  // Update internal state when external value changes
  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchValue(newValue);
    onSearch(newValue);
  };

  const handleClear = () => {
    setSearchValue("");
    onSearch("");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onSearch(searchValue);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        disabled={disabled}
        className="bg-transparent border border-[#393B5A] text-white rounded-[8px] h-[49px] pl-12 pr-10 w-full text-base focus:outline-none focus:border-periwinkle transition-colors font-lato placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      
      {/* Search Icon */}
      <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-periwinkle text-xl">
        search
      </span>

      {/* Clear Button */}
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-periwinkle hover:text-white transition-colors p-1 rounded-full hover:bg-periwinkle/10"
          title="Clear search"
        >
          <span className="material-icons text-lg">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;

