// Fixed src/components/BlogListing/BlogCard.jsx - With local removal callback
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSavedPosts, useNotifications } from "../../hooks/useContentCuration";
import SaveModal from "../UI/SaveModal";

const BlogCard = ({
  id = Math.random().toString(36).substr(2, 9),
  image,
  community,
  date,
  readTime,
  title,
  description,
  tags,
  author,
  upvotes,
  downvotes,
  comments,
  views,
  bookmarked: initialBookmarked = false,
  onLocalRemove, // NEW: Callback for immediate local removal
}) => {
  // Local state for UI interactions
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [showKebabMenu, setShowKebabMenu] = useState(false);
  const [isLocallyRemoved, setIsLocallyRemoved] = useState(false); // NEW: Track local removal
  
  const navigate = useNavigate();
  const location = useLocation();
  const kebabRef = useRef(null);
  
  // Content curation hooks
  const { savePost, removeSavedPost, isPostSaved } = useSavedPosts();
  const { showSuccess, showError } = useNotifications();

  // Check if we're on the saved items page
  const isOnSavedPage = location.pathname === '/saved-items' || location.pathname.startsWith('/saved');

  // Check saved status on mount and when saved posts change
  useEffect(() => {
    const savedStatus = isPostSaved(id);
    setIsBookmarked(savedStatus);
  }, [id, isPostSaved]);

  // Close kebab menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (kebabRef.current && !kebabRef.current.contains(event.target)) {
        setShowKebabMenu(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setShowKebabMenu(false);
      }
    };

    if (showKebabMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [showKebabMenu]);

  // Create blog data object for API calls
  const blogData = {
    id: id,
    title: title || 'Untitled Post',
    description: description || 'No description available',
    author: author || { name: 'Anonymous', avatar: '' },
    community: community || 'General',
    date: date || new Date().toLocaleDateString(),
    tags: tags || [],
    readTime: readTime || '5 min',
    upvotes: upvotes || 0,
    downvotes: downvotes || 0,
    comments: comments || 0,
    views: views || 0,
    image: image || ''
  };

  // Handle bookmark toggle with proper unsave functionality
  const toggleBookmark = async (e) => {
    e.stopPropagation();
    
    if (saveLoading) return;
    
    setSaveLoading(true);
    
    if (isBookmarked) {
      console.log('Removing saved post with ID:', id);
      
      // FIXED: Call local removal callback immediately for instant UI feedback
      if (onLocalRemove) {
        console.log('Calling onLocalRemove for immediate UI update');
        onLocalRemove(id);
        setIsLocallyRemoved(true);
      }
      
      const result = await removeSavedPost(id);
      
      if (result.success) {
        setIsBookmarked(false);
        showSuccess(result.message || 'Post removed from saved items');
      } else {
        showError(result.error || 'Failed to remove post');
        // Revert local removal if API failed
        if (onLocalRemove) {
          setIsLocallyRemoved(false);
        }
      }
    } else {
      setShowSaveModal(true);
      setSaveLoading(false);
      return;
    }
    
    setSaveLoading(false);
  };

  // FIXED: Handle remove from saved (kebab menu action) with immediate local feedback
  const handleRemoveFromSaved = async (e) => {
    e.stopPropagation();
    setShowKebabMenu(false);
    
    if (saveLoading) return;
    
    setSaveLoading(true);
    
    console.log('Removing saved post with ID (kebab menu):', id);
    
    // FIXED: Call local removal callback immediately for instant UI feedback
    if (onLocalRemove) {
      console.log('Calling onLocalRemove for immediate UI update (kebab)');
      onLocalRemove(id);
      setIsLocallyRemoved(true);
    }
    
    const result = await removeSavedPost(id);
    
    if (result.success) {
      setIsBookmarked(false);
      showSuccess(result.message || 'Post removed from saved items');
    } else {
      showError(result.error || 'Failed to remove post');
      // Revert local removal if API failed
      if (onLocalRemove) {
        setIsLocallyRemoved(false);
      }
    }
    
    setSaveLoading(false);
  };

  // Handle save with category selection
  const handleSaveWithCategory = async (category) => {
    setSaveLoading(true);
    setShowSaveModal(false);
    
    console.log('Saving blog post:', blogData);
    const result = await savePost(blogData, category);
    
    if (result.success) {
      setIsBookmarked(true);
      showSuccess(result.message || 'Post saved successfully');
    } else {
      showError(result.error || 'Failed to save post');
    }
    
    setSaveLoading(false);
  };

  // Handle upvote toggle
  const toggleUpvote = (e) => {
    e.stopPropagation();
    setIsUpvoted(!isUpvoted);
    if (isDownvoted) setIsDownvoted(false);
  };
  
  // Handle downvote toggle
  const toggleDownvote = (e) => {
    e.stopPropagation();
    setIsDownvoted(!isDownvoted);
    if (isUpvoted) setIsUpvoted(false);
  };

  // Handle card click
  const handleCardClick = () => {
    navigate(`/blog/${id}`);
  };

  const handleActionClick = (e) => {
    e.stopPropagation();
  };

  // Toggle kebab menu
  const toggleKebabMenu = (e) => {
    e.stopPropagation();
    if (!saveLoading) {
      setShowKebabMenu(!showKebabMenu);
    }
  };

  // FIXED: Hide card with animation if locally removed (only on saved page)
  if (isLocallyRemoved && isOnSavedPage) {
    return (
      <div 
        className="transition-all duration-300 ease-out transform scale-95 opacity-0 h-0 overflow-hidden"
        style={{ marginBottom: 0 }}
      >
        <div className="bg-navbar-bg rounded-xl p-6 border border-gray-600">
          <div className="text-center text-gray-500">
            <span className="material-icons">check_circle</span>
            <p className="text-sm mt-2">Item removed</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile backdrop for kebab menu */}
      {showKebabMenu && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setShowKebabMenu(false)}
        />
      )}

      <div
        data-card-id={id}
        onClick={handleCardClick}
        className={`bg-navbar-bg rounded-xl overflow-hidden border cursor-pointer hover:border-periwinkle transition-all duration-300 ${
          isLocallyRemoved ? 'opacity-50 pointer-events-none' : ''
        }`}
        style={{
          border: "1px solid var(--navbar-border)",
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 relative">
          {/* Blog Image */}
          <div className="md:col-span-1 flex items-center">
            <img
              alt={blogData.title}
              className="rounded-lg w-full h-full object-cover min-h-[140px] max-h-[210px]"
              src={blogData.image || `https://images.unsplash.com/photo-${1550000000000 + Math.floor(Math.random() * 100000000)}?w=600&h=300&fit=crop`}
              loading="lazy"
            />
          </div>

          {/* Blog Content */}
          <div className="md:col-span-2 flex flex-col">
            {/* Community, date, readTime */}
            <div className="flex items-center text-sm mb-2 font-lato">
              <span className="text-periwinkle px-3 py-1 rounded-xl font-semibold border-solid border-1">
                {blogData.community}
              </span>
              <span className="mx-2 text-periwinkle">·</span>
              <span className="text-periwinkle">
                {blogData.date} • {blogData.readTime} read
              </span>
            </div>

            {/* Title */}
            <h3 className="font-fenix text-2xl text-white mb-3 hover:text-periwinkle transition-colors">
              {blogData.title}
            </h3>

            {/* Description */}
            <p
              className="font-lato flex-grow mb-4 text-desc"
              style={{
                fontWeight: 400,
                fontSize: 18,
                lineHeight: "100%",
                letterSpacing: 0,
              }}
            >
              {blogData.description}
            </p>

            {/* Tags */}
            <div className="flex items-center space-x-2 mb-4 flex-wrap">
              {blogData.tags?.slice(0, 3).map((tag, i) => (
                <span
                  key={i}
                  className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl"
                >
                  #{tag}
                </span>
              ))}
              {blogData.tags?.length > 3 && (
                <span className="text-desc text-xs">
                  +{blogData.tags.length - 3} more
                </span>
              )}
            </div>

            {/* Author and actions */}
            <div className="flex justify-between items-center mt-auto">
              {/* Author */}
              <div className="flex items-center space-x-3">
                <img
                  alt={typeof blogData.author === 'string' ? blogData.author : blogData.author?.name}
                  className="w-8 h-8 rounded-full"
                  src={typeof blogData.author === 'string' 
                    ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                    : (blogData.author?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face")
                  }
                  loading="lazy"
                />
                <span className="font-lato text-periwinkle text-sm">
                  {typeof blogData.author === 'string' ? blogData.author : blogData.author?.name}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 text-periwinkle" onClick={handleActionClick}>
                {/* Upvote */}
                <button
                  onClick={toggleUpvote}
                  className={`flex items-center text-sm transition-colors ${
                    isUpvoted ? "text-green-500" : "hover:text-white"
                  }`}
                  aria-label={`${isUpvoted ? 'Remove upvote' : 'Upvote'} (${blogData.upvotes + (isUpvoted ? 1 : 0)})`}
                >
                  <span className="material-icons text-base mr-1">
                    arrow_upward
                  </span>
                  {blogData.upvotes + (isUpvoted ? 1 : 0)}
                </button>

                {/* Downvote */}
                <button
                  onClick={toggleDownvote}
                  className={`flex items-center text-sm transition-colors ${
                    isDownvoted ? "text-red-400" : "hover:text-white"
                  }`}
                  aria-label={`${isDownvoted ? 'Remove downvote' : 'Downvote'} (${blogData.downvotes + (isDownvoted ? 1 : 0)})`}
                >
                  <span className="material-icons text-base mr-1">
                    arrow_downward
                  </span>
                  {blogData.downvotes + (isDownvoted ? 1 : 0)}
                </button>

                {/* Comments */}
                <button 
                  className="flex items-center text-sm hover:text-white transition-colors"
                  aria-label={`View comments (${blogData.comments})`}
                >
                  <span className="material-icons text-base mr-1">
                    chat_bubble_outline
                  </span>
                  {blogData.comments}
                </button>

                {/* Views */}
                <span 
                  className="flex items-center text-sm"
                  aria-label={`${blogData.views} views`}
                >
                  <span className="material-icons text-base mr-1">
                    visibility
                  </span>
                  {blogData.views}
                </span>
              </div>
            </div>

            {/* Action Button - Bookmark or Kebab Menu */}
            {isOnSavedPage ? (
              // Kebab Menu for Saved Items Page
              <div className="absolute top-4 right-4" ref={kebabRef}>
                <button
                  onClick={toggleKebabMenu}
                  disabled={saveLoading}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    saveLoading
                      ? "text-gray-400 cursor-not-allowed" 
                      : showKebabMenu
                        ? "text-white bg-periwinkle bg-opacity-20"
                        : "text-periwinkle hover:text-white hover:bg-periwinkle hover:bg-opacity-10"
                  }`}
                  aria-label="More options"
                  aria-expanded={showKebabMenu}
                  aria-haspopup="true"
                >
                  <span className={`material-icons ${saveLoading ? 'animate-spin' : ''}`}>
                    {saveLoading ? "sync" : "more_vert"}
                  </span>
                </button>

                {/* Kebab Menu Dropdown */}
                {showKebabMenu && (
                  <div 
                    className="absolute right-0 top-12 bg-navbar-bg border border-navbar-border rounded-lg shadow-lg min-w-[180px] z-50"
                    role="menu"
                  >
                    <button
                      onClick={handleRemoveFromSaved}
                      disabled={saveLoading}
                      className="w-full px-4 py-3 text-left text-periwinkle hover:bg-periwinkle hover:bg-opacity-10 transition-colors flex items-center space-x-2 rounded-lg disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-periwinkle"
                      role="menuitem"
                      tabIndex={0}
                    >
                      <span className="material-icons text-sm">delete_outline</span>
                      <span className="text-sm font-medium">Remove from saved</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // Regular Bookmark Button for Other Pages
              <button
                onClick={toggleBookmark}
                disabled={saveLoading}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 ${
                  saveLoading 
                    ? "text-gray-400 cursor-not-allowed" 
                    : isBookmarked 
                      ? "text-periwinkle bg-periwinkle bg-opacity-20 shadow-sm hover:bg-opacity-30" 
                      : "text-periwinkle hover:text-white hover:bg-periwinkle hover:bg-opacity-10"
                }`}
                title={isBookmarked ? "Remove from saved" : "Save post"}
                aria-label={isBookmarked ? "Remove from saved" : "Save post"}
              >
                <span className={`material-icons ${saveLoading ? 'animate-spin' : ''}`}>
                  {saveLoading 
                    ? "sync" 
                    : isBookmarked 
                      ? "bookmark" 
                      : "bookmark_border"
                  }
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Save Modal */}
      {showSaveModal && (
        <SaveModal
          isOpen={showSaveModal}
          onClose={() => setShowSaveModal(false)}
          onSave={handleSaveWithCategory}
          postTitle={blogData.title}
        />
      )}
    </>
  );
};

export default BlogCard;