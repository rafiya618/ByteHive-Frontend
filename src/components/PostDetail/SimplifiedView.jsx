import { SIMPLIFICATION_LEVELS } from './ContentModeToggle';

/**
 * SimplifiedView Component
 * Displays simplified content or error state
 */
const SimplifiedView = ({
    simplifiedContent,
    simplificationLevel,
    onRetry,
    onBackToOriginal,
}) => {
    // Error State - Show when simplification fails
    if (simplifiedContent.error) {
        return (
            <div className="py-12 px-8">
                <div className="max-w-2xl mx-auto text-center">
                    <span className="material-icons text-6xl text-red-400 mb-4 block">
                        error_outline
                    </span>
                    <h3 className="text-2xl font-bold text-red-400 mb-3">Simplification Failed</h3>
                    <p className="text-red-300 text-lg mb-2">{simplifiedContent.message}</p>
                    <p className="text-gray-400 text-sm mb-6">{simplifiedContent.details}</p>
                    <div className="flex items-center justify-center space-x-4">
                        <button
                            onClick={onRetry}
                            className="bg-periwinkle text-rich-black px-6 py-3 rounded-lg hover:bg-periwinkle-light transition-colors font-semibold flex items-center space-x-2"
                        >
                            <span className="material-icons">refresh</span>
                            <span>Try Again</span>
                        </button>
                        <button
                            onClick={onBackToOriginal}
                            className="bg-rich-black-light border border-navbar-border text-periwinkle px-6 py-3 rounded-lg hover:bg-rich-black transition-colors font-semibold"
                        >
                            Back to Original
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Helper to render content based on type
    const renderContent = () => {
        if (simplifiedContent.data?.keyTakeaways && Array.isArray(simplifiedContent.data.keyTakeaways)) {
            return (
                <ul className="space-y-3">
                    {simplifiedContent.data.keyTakeaways.map((point, index) => (
                        <li key={index} className="flex items-start space-x-3 text-white/90">
                            <span className="material-icons text-purple-400 mt-1 flex-shrink-0 text-sm">
                                circle
                            </span>
                            <span>{point}</span>
                        </li>
                    ))}
                </ul>
            );
        }

        const textContent =
            simplifiedContent.data?.detailedSummary ||
            simplifiedContent.data?.conciseSummary ||
            simplifiedContent.data?.summarize;

        if (textContent) {
            return (
                <div
                    className="space-y-4 text-base leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: textContent }}
                />
            );
        }

        return (
            <div className="text-red-400 p-4 border border-red-400/30 rounded-lg">
                <p className="font-semibold">⚠️ No simplified content available</p>
                <p className="text-sm mt-2">Please try generating again.</p>
            </div>
        );
    };

    // Success State - Show simplified content
    return (
        <div className="space-y-6">
            {/* Simplified Content Badge */}
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-600/20 border border-purple-400 rounded-lg">
                <span className="material-icons text-sm text-purple-400">auto_fix_high</span>
                <span className="text-purple-300 text-sm font-semibold">
                    Simplified -{' '}
                    {Object.values(SIMPLIFICATION_LEVELS).find((l) => l.value === simplificationLevel)
                        ?.label || 'Detailed Summary'}
                </span>
            </div>

            {/* Render simplified content */}
            <div className="text-white/90 leading-relaxed prose prose-invert max-w-none">
                {renderContent()}
            </div>
        </div>
    );
};

export default SimplifiedView;
