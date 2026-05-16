import React from "react";
import BlogFilterBar from "../BlogListing/BlogFilterBar";

const CommunityFilterBar = ({ filters = [], selected, onSelect }) => {
  return <BlogFilterBar filters={filters} selected={selected} onSelect={onSelect} />;
};

export default CommunityFilterBar;