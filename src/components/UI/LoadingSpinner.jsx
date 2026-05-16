import React from 'react';

const LoadingSpinner = ({ className = '' }) => {
  return <div className={"ds-spinner " + className} aria-hidden="true" />;
};

export default LoadingSpinner;
