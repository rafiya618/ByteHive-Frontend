import React from 'react';

const PrimaryButton = ({ children, onClick, className = '', type = 'button', disabled = false, ...rest }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={"ds-btn ds-btn-primary " + className}
      {...rest}
    >
      {children}
    </button>
  );
};

export default PrimaryButton;
