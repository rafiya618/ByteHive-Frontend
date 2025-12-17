import PropTypes from 'prop-types';

/**
 * ToggleButton Component - Reusable button for mode switching
 * Used for Simplify/Original toggle and other binary states
 * 
 * SINGLE SOURCE OF TRUTH for button styling and behavior
 */
const ToggleButton = ({
    label,
    icon,
    isActive,
    onClick,
    disabled = false,
    loading = false,
    className = '',
    activeColor = 'periwinkle',
    variant = 'primary', // 'primary' | 'secondary'
}) => {
    const baseStyles = 'flex items-center space-x-2 px-4 py-2 rounded-md font-lato text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed';

    const variantStyles = {
        primary: isActive
            ? `bg-linear-to-r from-purple-600 to-medium-slate-blue text-white shadow-lg shadow-purple-500/30 border border-purple-400`
            : `bg-rich-black-light text-${activeColor} hover:bg-${activeColor}-light border border-navbar-border hover:border-${activeColor}`,
        secondary: isActive
            ? `bg-${activeColor} text-rich-black`
            : `bg-rich-black text-${activeColor} border border-${activeColor} hover:bg-${activeColor}-light`,
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variantStyles[variant]} ${className}`}
            aria-pressed={isActive}
            aria-label={label}
        >
            {icon && (
                <span className="material-icons text-lg">
                    {loading ? 'hourglass_top' : icon}
                </span>
            )}
            <span>{loading ? 'Loading...' : label}</span>
        </button>
    );
};

ToggleButton.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.string,
    isActive: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    loading: PropTypes.bool,
    className: PropTypes.string,
    activeColor: PropTypes.string,
    variant: PropTypes.oneOf(['primary', 'secondary']),
};

export default ToggleButton;
