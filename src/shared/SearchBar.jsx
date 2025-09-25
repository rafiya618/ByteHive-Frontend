import React, { useState, useEffect } from 'react';

const SearchBar = ({ 
  placeholder = "Search...", 
  onSearch, 
  initialValue = "",
  delay = 300 
}) => {
  const [searchValue, setSearchValue] = useState(initialValue);
  const [timeoutId, setTimeoutId] = useState(null);

  useEffect(() => {
    setSearchValue(initialValue);
  }, [initialValue]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchValue(value);

    // Clear previous timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    // Set new timeout for debounced search
    const newTimeoutId = setTimeout(() => {
      if (onSearch) {
        onSearch(value);
      }
    }, delay);

    setTimeoutId(newTimeoutId);
  };

  const handleClear = () => {
    setSearchValue("");
    if (onSearch) {
      onSearch("");
    }
    // Clear timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && onSearch) {
      // Clear timeout and search immediately on Enter
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      onSearch(searchValue);
    }
  };

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder={placeholder}
        value={searchValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        className="bg-transparent border border-[#393B5A] text-white rounded-[8px] h-[49px] pl-12 pr-12 w-full text-base focus:outline-none font-lato placeholder-periwinkle focus:border-periwinkle transition-colors"
      />
      <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-periwinkle text-xl">
        search
      </span>
      {searchValue && (
        <button
          onClick={handleClear}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-periwinkle hover:text-white transition-colors"
        >
          <span className="material-icons text-xl">clear</span>
        </button>
      )}
    </div>
  );
};

export default SearchBar;