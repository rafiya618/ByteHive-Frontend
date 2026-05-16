import React from 'react';

const Card = ({ children, className = '' }) => {
  return <div className={"ds-card " + className}>{children}</div>;
};

export default Card;
