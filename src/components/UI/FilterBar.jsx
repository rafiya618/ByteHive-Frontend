import React from 'react';

const FilterBar = ({ children, className = '' }) => {
  return <div className={"ds-filterbar " + className}>{children}</div>;
};

export default FilterBar;
