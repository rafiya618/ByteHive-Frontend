import React from 'react';

const SecondaryButton = ({ children, onClick, className = '', type = 'button', disabled = false, ...rest }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={"ds-btn ds-btn-secondary " + className}
      {...rest}
    >
      {children}
    </button>
  );
};

export default SecondaryButton;
