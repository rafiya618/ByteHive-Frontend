import React from 'react';

const PageContainer = ({ children, className = '' }) => {
  return <div className={"ds-page " + className}>{children}</div>;
};

export default PageContainer;
