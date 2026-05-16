import React from 'react';

const Input = ({ value, onChange, placeholder, name, id, type = 'text', required, className = '', ...rest }) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={"ds-input " + className}
      {...rest}
    />
  );
};

export default Input;
