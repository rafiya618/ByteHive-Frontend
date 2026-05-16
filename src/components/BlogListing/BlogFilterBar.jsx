import React from "react";
import { FilterBar } from "../../components/UI";

const BlogFilterBar = ({ filters = [], selected, onSelect }) => {
  return (
    <FilterBar className="justify-start">
      {filters.map((filter) => {
        const isSelected = selected === filter;
        return (
          <button
            key={filter}
            type="button"
            aria-pressed={isSelected}
            data-selected={isSelected}
            className="ds-filter-pill"
            onClick={() => onSelect(filter)}
          >
              {filter}
          </button>
        );
      })}
    </FilterBar>
  );
};

export default BlogFilterBar;
