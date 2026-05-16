import React from 'react';

const EmptyState = ({ title, description }) => {
  return (
    <div className="ds-empty">
      {title && <h3 style={{ marginBottom: 8 }}>{title}</h3>}
      {description && <p>{description}</p>}
    </div>
  );
};

export default EmptyState;
