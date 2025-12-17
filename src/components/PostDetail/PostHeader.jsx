
/**
 * PostHeader Component
 * Displays community badge, publication date, read time, title, author info, and tags
 * 
 * @param {Object} props
 * @param {Object} props.post - The post object
 */
const PostHeader = ({ post }) => {
    return (
        <>
            {/* Community + Meta Info */}
            <div className="flex items-center text-sm mb-4 font-lato">
                <span className="text-periwinkle px-3 py-1 rounded-xl font-semibold border border-navbar-border">
                    {post.community || 'General'}
                </span>
                <span className="mx-2 text-periwinkle">·</span>
                <span className="text-periwinkle">
                    {new Date(post.createdAt).toLocaleDateString()} • {post.read_time || '6 min'} read
                </span>
            </div>

            {/* Title */}
            <h1 className="font-fenix text-3xl md:text-4xl text-white mb-6 leading-tight">
                {post.post_title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
                <img
                    src={post.author?.avatar || 'https://ui-avatars.com/api/?name=User'}
                    alt={post.author?.name || 'Author'}
                    className="w-12 h-12 rounded-full"
                />
                <div>
                    <div className="text-white font-lato font-medium text-base">
                        {post.author?.name || 'Unknown'}
                    </div>
                    <div className="text-periwinkle text-sm font-lato">Author</div>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
                {post.tags?.map((tag, i) => (
                    <span
                        key={i}
                        className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl font-lato"
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {/* Thumbnail */}
            {post.thumbnail && (
                <div className="mb-8 rounded-lg overflow-hidden">
                    <img
                        src={post.thumbnail}
                        alt="Thumbnail"
                        className="w-full h-80 object-cover"
                    />
                </div>
            )}
        </>
    );
};

export default PostHeader;
