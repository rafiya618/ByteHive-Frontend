
/**
 * OriginalView Component
 * Displays original post content with proper styling
 * 
 * @param {Object} props
 * @param {string} props.content - The HTML content to display
 */
const OriginalView = ({ content }) => {
    return (
        <div
            className="text-white space-y-4 
              prose-pre:bg-rich-black-light prose-pre:border prose-pre:border-navbar-border prose-pre:rounded-lg prose-pre:p-4 prose-pre:overflow-x-auto 
              prose-h2:text-3xl prose-h2:font-fenix prose-h2:font-bold prose-h2:text-white prose-h2:tracking-wide
              prose-p:leading-snug prose-p:font-lato"
            dangerouslySetInnerHTML={{ __html: content }}
        />
    );
};

export default OriginalView;
