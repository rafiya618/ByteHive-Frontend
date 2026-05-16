import React from 'react';

const TextArea = ({ value, onChange, placeholder, name, id, rows = 4, required, className = '', ...rest }) => {
  return (
    <textarea
      id={id}
      name={name}
      rows={rows}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={"ds-textarea " + className}
      {...rest}
    />
  );
};

export default TextArea;
