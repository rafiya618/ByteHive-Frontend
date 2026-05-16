import React from 'react';
import DSInput from '../components/UI/Input';
import DSTextArea from '../components/UI/TextArea';

const InputField = ({
  type,
  value,
  onChange,
  placeholder,
  name,
  id,
  accept,
  required,
  rows = 3, // default for textarea
  className = '',
  ...rest
}) => {
  if (type === 'textarea') {
    return (
      <DSTextArea
        name={name}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        className={className}
        {...(required !== undefined ? { required } : {})}
        {...rest}
      />
    );
  }

  if (type === 'file') {
    return (
      <input
        type="file"
        onChange={onChange}
        name={name}
        id={id}
        accept={accept}
        className={className}
        {...(required !== undefined ? { required } : {})}
        {...rest}
      />
    );
  }

  return (
    <DSInput
      type={type}
      value={value}
      onChange={onChange}
      name={name}
      id={id}
      placeholder={placeholder}
      className={className}
      {...(required !== undefined ? { required } : {})}
      {...rest}
    />
  );
};

export default InputField;
