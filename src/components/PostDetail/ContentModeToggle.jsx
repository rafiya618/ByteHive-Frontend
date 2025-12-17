import ToggleButton from '../UI/ToggleButton';

// Simplification level options
const SIMPLIFICATION_LEVELS = {
    SUMMARIZE: {
        value: 'summarize',
        label: 'Summarize',
        description: 'Brief overview of the content',
        icon: 'edit',
    },
    KEY_TAKEAWAYS: {
        value: 'key_takeaways',
        label: 'Key Takeaways',
        description: 'Important points in bullet form',
        icon: 'list',
    },
    CONCISE_SUMMARY: {
        value: 'concise_summary',
        label: 'Concise Summary',
        description: 'Short paragraph summary',
        icon: 'article',
    },
    DETAILED_SUMMARY: {
        value: 'detailed_summary',
        label: 'Detailed Summary',
        description: 'Comprehensive explanation',
        icon: 'library_books',
    },
};

/**
 * ContentModeToggle Component
 * Toggle between Simplify and Original reading modes with dropdown for simplification levels
 * 
 * @param {Object} props
 * @param {string} props.readingMode - Current reading mode ('original' or 'simplify')
 * @param {Function} props.setReadingMode - Setter for reading mode
 * @param {Function} props.handleSimplifyClick - Handler for simplification
 * @param {boolean} props.loadingSimplification - Loading state
 * @param {Object} props.post - The post object
 * @param {boolean} props.showSimplifyDropdown - Dropdown visibility state
 * @param {Function} props.setShowSimplifyDropdown - Setter for dropdown visibility
 * @param {string} props.simplificationLevel - Current simplification level
 * @param {Function} props.setSimplificationLevel - Setter for simplification level
 * @param {Object} props.simplifyDropdownRef - Ref for dropdown
 */
const ContentModeToggle = ({
    readingMode,
    setReadingMode,
    handleSimplifyClick,
    loadingSimplification,
    post,
    showSimplifyDropdown,
    setShowSimplifyDropdown,
    simplificationLevel,
    setSimplificationLevel,
    simplifyDropdownRef,
}) => {
    return (
        <div className="flex items-center space-x-3">
            {/* Simplify Button with Dropdown */}
            <div className="relative" ref={simplifyDropdownRef}>
                <ToggleButton
                    label="Simplify"
                    icon="auto_fix_high"
                    isActive={readingMode === 'simplify'}
                    onClick={() => {
                        if (readingMode === 'simplify') {
                            setReadingMode('original');
                            setShowSimplifyDropdown(false);
                        } else {
                            setShowSimplifyDropdown(!showSimplifyDropdown);
                        }
                    }}
                    disabled={!post?.post_description}
                    loading={loadingSimplification}
                    variant="primary"
                />

                {/* Dropdown Menu */}
                {showSimplifyDropdown && readingMode !== 'simplify' && (
                    <div className="absolute top-full mt-2 right-0 w-64 bg-navbar-bg border border-navbar-border rounded-lg shadow-xl z-50">
                        <div className="p-2">
                            <p className="text-xs text-periwinkle px-3 py-2 font-semibold">
                                Select Simplification Level
                            </p>
                            {Object.values(SIMPLIFICATION_LEVELS).map((level) => (
                                <button
                                    key={level.value}
                                    onClick={async () => {
                                        setShowSimplifyDropdown(false);
                                        setSimplificationLevel(level.value); // Update state for badge display
                                        await handleSimplifyClick(level.value); // Pass level directly to avoid race condition
                                    }}
                                    className="w-full flex items-start space-x-3 px-3 py-2.5 hover:bg-rich-black-light rounded-md transition-colors text-left"
                                >
                                    <span className="material-icons text-celadon text-xl mt-0.5">
                                        {level.icon}
                                    </span>
                                    <div className="flex-1">
                                        <p className="text-white font-semibold text-sm">{level.label}</p>
                                        <p className="text-periwinkle text-xs mt-0.5">{level.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Original Button */}
            <ToggleButton
                label="Original"
                icon="description"
                isActive={readingMode === 'original'}
                onClick={() => {
                    setReadingMode('original');
                    setShowSimplifyDropdown(false);
                }}
                variant="primary"
            />
        </div>
    );
};

export default ContentModeToggle;
export { SIMPLIFICATION_LEVELS };
