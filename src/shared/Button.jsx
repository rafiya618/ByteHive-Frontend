// src/components/Button.jsx
const Button = ({ onClick, type = "button", children, className = "" }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bh-button w-full py-2.5 rounded-xl font-semibold transition-all duration-200 cursor-pointer inline-flex items-center justify-center ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
