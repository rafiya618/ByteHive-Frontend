
/**
 * VotingActions Component
 * Displays upvote, downvote, and view count buttons
 * 
 * @param {Object} props
 * @param {number} props.upvotes - Upvote count
 * @param {number} props.downvotes - Downvote count
 * @param {number} props.views - View count
 * @param {boolean} props.isUpvoted - Whether user has upvoted
 * @param {boolean} props.isDownvoted - Whether user has downvoted
 * @param {Function} props.toggleUpvote - Handler for upvote toggle
 * @param {Function} props.toggleDownvote - Handler for downvote toggle
 */
const VotingActions = ({
    upvotes,
    downvotes,
    views,
    isUpvoted,
    isDownvoted,
    toggleUpvote,
    toggleDownvote,
}) => {
    return (
        <div className="flex items-center space-x-6">
            {/* Upvote */}
            <button
                onClick={toggleUpvote}
                className={`flex items-center space-x-2 transition-colors ${isUpvoted ? 'text-green-400' : 'text-periwinkle hover:text-white'
                    }`}
            >
                <span className="material-icons text-lg">arrow_upward</span>
                <span className="font-lato font-medium">{upvotes}</span>
            </button>

            {/* Downvote */}
            <button
                onClick={toggleDownvote}
                className={`flex items-center space-x-2 transition-colors ${isDownvoted ? 'text-red-400' : 'text-periwinkle hover:text-white'
                    }`}
            >
                <span className="material-icons text-lg">arrow_downward</span>
                <span className="font-lato font-medium">{downvotes}</span>
            </button>

            {/* Views */}
            <div className="flex items-center space-x-2 text-periwinkle">
                <span className="material-icons text-lg">visibility</span>
                <span className="font-lato font-medium">{views || 0}</span>
            </div>
        </div>
    );
};

export default VotingActions;
