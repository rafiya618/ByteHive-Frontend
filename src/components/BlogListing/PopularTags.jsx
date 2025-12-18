import React from "react";

const PopularTags = ({ posts = [] }) => {
  // Extract and count tags from posts
  const getPopularTags = () => {
    const tagCount = {};
    
    posts.forEach((post) => {
      if (Array.isArray(post.tags)) {
        post.tags.forEach((tag) => {
          if (tag && typeof tag === 'string') {
            tagCount[tag] = (tagCount[tag] || 0) + 1;
          }
        });
      }
    });

    // Sort by frequency and get top 6
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([tag]) => tag);
  };

  const tags = getPopularTags();

  return (
    <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-5 md:p-6 z-0">
      <h3 className="font-fenix text-xl text-white mb-4">Popular Tags</h3>
      {tags.length === 0 ? (
        <div className="text-periwinkle text-sm">No tags available</div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="bg-periwinkle/20 text-periwinkle text-sm font-medium px-3 py-1 rounded-xl cursor-pointer hover:bg-periwinkle/30 transition-colors"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PopularTags;
