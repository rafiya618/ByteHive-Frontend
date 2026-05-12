import React from "react";

const CommunityFilterBar = ({ filters = [], selected, onSelect }) => {
  return (
    <div className="flex gap-2 flex-wrap items-center">
      {filters.map((filter) => {
        const isSelected = selected === filter;
        return (
          <button
            key={filter}
            className="font-lato text-sm md:text-base px-4 py-2 rounded-full border transition-all"
            style={{
              fontWeight: isSelected ? 700 : 500,
              color: isSelected ? "var(--periwinkle)" : "var(--columbia-blue)",
              borderColor: isSelected ? "var(--periwinkle)" : "var(--navbar-border)",
              background: isSelected ? "rgba(105, 114, 255, 0.16)" : "rgba(255,255,255,0.02)",
              opacity: isSelected ? 1 : 0.85, //  selected always fully visible
            }}
            onClick={() => onSelect(filter)}
          >
            {filter}
          </button>
        );
      })}
    </div>
  );
};

export default CommunityFilterBar;