import React from 'react';

const SectionContainer = ({ children, className = '' }) => {
  return <section className={"ds-section " + className}>{children}</section>;
};

export default SectionContainer;
