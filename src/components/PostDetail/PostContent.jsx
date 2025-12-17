import SimplifiedView from './SimplifiedView';
import OriginalView from './OriginalView';

/**
 * PostContent Component
 * Container for content rendering with loading state and mode switching
 * 
 * @param {Object} props
 * @param {Object} props.post - The post object
 * @param {string} props.readingMode - Current reading mode ('original' or 'simplify')
 * @param {Object} props.simplifiedContent - The simplified content object
 * @param {boolean} props.loadingSimplification - Loading state for simplification
 * @param {Object} props.contentRef - Ref for the content container
 * @param {Function} props.handleTextSelection - Handler for text selection
 * @param {string} props.simplificationLevel - Current simplification level
 * @param {Function} props.handleSimplifyClick - Handler for retry
 * @param {Function} props.setReadingMode - Setter for reading mode
 * @param {Function} props.setSimplifiedContent - Setter for simplified content
 */
const PostContent = ({
    post,
    readingMode,
    simplifiedContent,
    loadingSimplification,
    contentRef,
    handleTextSelection,
    simplificationLevel,
    handleSimplifyClick,
    setReadingMode,
    setSimplifiedContent,
}) => {
    // Select which content to show
    let contentToRender = post.post_description;

    if (readingMode === 'simplify') {
        if (simplifiedContent) {
            contentToRender = simplifiedContent.simplifiedContent || post.post_description;
        } else {
            contentToRender = post.simplified_description || post.post_description;
        }
    }

    return (
        <div ref={contentRef} onMouseUp={handleTextSelection} className="mb-8">
            <div className="prose prose-invert max-w-none">
                {readingMode === 'simplify' && loadingSimplification && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <div className="animate-spin mb-4">
                                <span className="material-icons text-4xl text-periwinkle">hourglass_top</span>
                            </div>
                            <p className="text-periwinkle text-lg font-medium">Simplifying content...</p>
                            <p className="text-periwinkle/60 text-sm mt-2">This may take a few moments</p>
                        </div>
                    </div>
                )}

                {!loadingSimplification && (
                    <>
                        {/* SIMPLIFIED VIEW: Show error or simplified content */}
                        {readingMode === 'simplify' && simplifiedContent ? (
                            <SimplifiedView
                                simplifiedContent={simplifiedContent}
                                simplificationLevel={simplificationLevel}
                                onRetry={() => {
                                    setSimplifiedContent(null);
                                    handleSimplifyClick();
                                }}
                                onBackToOriginal={() => {
                                    setReadingMode('original');
                                    setSimplifiedContent(null);
                                }}
                            />
                        ) : (
                            /* ORIGINAL VIEW: Show full blog content */
                            <OriginalView content={contentToRender} />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PostContent;
