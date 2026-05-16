import React from 'react';
import PrimaryButton from '../components/UI/PrimaryButton';
import SecondaryButton from '../components/UI/SecondaryButton';

// Backwards-compatible Button wrapper used across the app.
const Button = ({ onClick, type = 'button', children, className = '', variant = 'primary', disabled = false, ...rest }) => {
  if (variant === 'secondary') {
    return (
      <SecondaryButton type={type} onClick={onClick} className={className} disabled={disabled} {...rest}>
        {children}
      </SecondaryButton>
    );
  }

  return (
    <PrimaryButton type={type} onClick={onClick} className={className} disabled={disabled} {...rest}>
      {children}
    </PrimaryButton>
  );
};

export default Button;
