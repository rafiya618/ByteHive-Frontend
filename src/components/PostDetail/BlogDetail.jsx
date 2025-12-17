import { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/auth';
import TextSelectionPopup from './TextSelectionPopup';
import Comment from './Comment/Comment';
import PostHeader from './PostHeader';
import ContentModeToggle from './ContentModeToggle';
import PostContent from './PostContent';
import VotingActions from './VotingActions';
import PostActions from './PostActions';
import { usePostData } from '../../hooks/usePostData';
import { useVoting } from '../../hooks/useVoting';
import { useBookmark } from '../../hooks/useBookmark';
import { useSimplification } from '../../hooks/useSimplification';
import Loader from '../shared/Loader';

export default function BlogDetail() {
  const { postId } = useParams();
  const { auth } = useAuth();
  const [readingMode, setReadingMode] = useState('original');
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const contentRef = useRef(null);

  // Custom hooks for data fetching and state management
  const {
    post,
    loading,
    error,
    isBookmarked,
    setIsBookmarked,
    savedCategory,
    setSavedCategory,
    upvotes,
    setUpvotes,
    downvotes,
    setDownvotes,
    isUpvoted,
    setIsUpvoted,
    isDownvoted,
    setIsDownvoted,
    currentUserId,
  } = usePostData(postId, auth);

  // Voting hook
  const { toggleUpvote, toggleDownvote, isVoting } = useVoting(
    postId,
    auth,
    { upvotes, downvotes, isUpvoted, isDownvoted },
    { setUpvotes, setDownvotes, setIsUpvoted, setIsDownvoted }
  );

  // Bookmark hook
  const {
    handleBookmark,
    handleSavePost,
    handleUnsavePost,
    showBookmarkMenu,
    setShowBookmarkMenu,
  } = useBookmark(postId, auth, isBookmarked, setIsBookmarked, savedCategory, setSavedCategory);

  // Simplification hook
  const {
    handleSimplifyClick,
    simplifiedContent,
    setSimplifiedContent,
    loadingSimplification,
    simplificationLevel,
    setSimplificationLevel,
    showSimplifyDropdown,
    setShowSimplifyDropdown,
    simplifyDropdownRef,
  } = useSimplification(postId, post, setReadingMode);

  // Text selection handler
  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setSelectedText(text);
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  // Loading and error states
  if (loading) return <div className="text-white text-center h-screen flex items-center justify-center">
    <Loader message='Loading post...' />
  </div>;
  if (error) return <div className="text-red-400 text-center">{error}</div>;
  if (!post) return <div className="text-white text-center">No post found.</div>;

  return (
    <div className="min-h-screen bg-rich-black relative">
      {/* Glow background */}
      <div
        className="absolute z-0"
        style={{
          width: 637,
          height: 300,
          top: -38,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1A1842B3',
          filter: 'blur(100px)',
          boxShadow: '0px 4px 100px 500px #00000066',
          borderRadius: 30,
          pointerEvents: 'none',
        }}
      />

      <div className="relative z-10 container mx-auto px-5 sm:px-7 lg:px-10 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section with Controls and Search */}
          <div className="flex items-center justify-between mb-6">
            {/* Content Mode Toggle (Simplify/Original) */}
            <ContentModeToggle
              readingMode={readingMode}
              setReadingMode={setReadingMode}
              handleSimplifyClick={handleSimplifyClick}
              loadingSimplification={loadingSimplification}
              post={post}
              showSimplifyDropdown={showSimplifyDropdown}
              setShowSimplifyDropdown={setShowSimplifyDropdown}
              simplificationLevel={simplificationLevel}
              setSimplificationLevel={setSimplificationLevel}
              simplifyDropdownRef={simplifyDropdownRef}
            />

            {/* Search */}
            <div className="relative search-input-container">
              <input
                type="text"
                placeholder="Search in article"
                className="bg-transparent border border-[#393B5A] text-white rounded-lg h-[49px] pl-12 w-96 text-base focus:outline-none font-lato placeholder-periwinkle"
              />
              <span className="material-icons search-icon text-periwinkle text-xl">
                search
              </span>
            </div>
          </div>

          {/* Post Header: Community, Title, Author, Tags, Thumbnail */}
          <PostHeader post={post} />

          {/* Blog Content */}
          <PostContent
            post={post}
            readingMode={readingMode}
            simplifiedContent={simplifiedContent}
            loadingSimplification={loadingSimplification}
            contentRef={contentRef}
            handleTextSelection={handleTextSelection}
            simplificationLevel={simplificationLevel}
            handleSimplifyClick={handleSimplifyClick}
            setReadingMode={setReadingMode}
            setSimplifiedContent={setSimplifiedContent}
          />

          {/* Separator */}
          <hr className="border-navbar-border mb-8" />

          {/* Action Bar */}
          <div className="flex items-center justify-between mb-8">
            {/* Voting Actions */}
            <VotingActions
              upvotes={upvotes}
              downvotes={downvotes}
              views={post.views}
              isUpvoted={isUpvoted}
              isDownvoted={isDownvoted}
              toggleUpvote={toggleUpvote}
              toggleDownvote={toggleDownvote}
            />

            {/* Post Actions: Share, Save, Edit, Delete */}
            <PostActions
              post={post}
              currentUserId={currentUserId}
              isBookmarked={isBookmarked}
              handleBookmark={handleBookmark}
              showBookmarkMenu={showBookmarkMenu}
              savedCategory={savedCategory}
              handleSavePost={handleSavePost}
              handleUnsavePost={handleUnsavePost}
              setShowBookmarkMenu={setShowBookmarkMenu}
            />
          </div>

          {/* Comments */}
          <Comment postId={postId} />
        </div>

        {/* Text Selection Popup */}
        {showPopup && (
          <TextSelectionPopup
            position={popupPosition}
            selectedText={selectedText}
            onClose={() => setShowPopup(false)}
          />
        )}
      </div>
    </div>
  );
}
