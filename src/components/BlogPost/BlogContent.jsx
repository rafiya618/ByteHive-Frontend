// Updated src/components/BlogContent/BlogContent.jsx
import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TextSelectionPopup from "./TextSelectionPopup";
import CommentSection from "./CommentSection";
import SaveModal from "../UI/SaveModal";
import { useSavedPosts, useViewHistory, useNotifications } from "../../hooks/useContentCuration";
import { getBlogById } from "../../services/blogDataService";

const BlogContent = () => {
  const { id: postId } = useParams();
  const navigate = useNavigate();
  const [readingMode, setReadingMode] = useState("original");
  const [showPopup, setShowPopup] = useState(false);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [upvotes, setUpvotes] = useState(120);
  const [downvotes, setDownvotes] = useState(5);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightedText, setHighlightedText] = useState("");
  const [blogData, setBlogData] = useState(null);
  
  const contentRef = useRef(null);

  // Content curation hooks
  const { savePost, removeSavedPost, isPostSaved } = useSavedPosts();
  const { trackPostView } = useViewHistory();
  const { showSuccess, showError } = useNotifications();

  // Load blog data using shared service
  useEffect(() => {
    if (postId) {
      const data = getBlogById(postId);
      setBlogData(data);
      
      // Set initial vote states based on the blog data
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    }
  }, [postId]);

  // Track view on component mount
  useEffect(() => {
    let isMounted = true;
    
    const trackView = async () => {
      if (postId && blogData && isMounted) {
        console.log('Tracking view for post:', postId);
        await trackPostView(blogData);
      }
    };
    
    if (blogData) {
      const timeoutId = setTimeout(trackView, 100);
      
      return () => {
        isMounted = false;
        clearTimeout(timeoutId);
      };
    }
  }, [postId, blogData, trackPostView]);

  // Check if post is saved
  useEffect(() => {
    if (postId) {
      setIsBookmarked(isPostSaved(postId));
    }
  }, [postId, isPostSaved]);

  const handleTextSelection = () => {
    const selection = window.getSelection();
    const text = selection.toString().trim();
    
    if (text.length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      setSelectedText(text);
      setPopupPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setShowPopup(true);
    } else {
      setShowPopup(false);
    }
  };

  // Handle save/bookmark
  const handleSave = async () => {
    if (isBookmarked) {
      setSaveLoading(true);
      const result = await removeSavedPost(postId);
      
      if (result.success) {
        setIsBookmarked(false);
        showSuccess(result.message);
      } else {
        showError(result.error);
      }
      setSaveLoading(false);
    } else {
      setShowSaveModal(true);
    }
  };

  // Handle save with category
  const handleSaveWithCategory = async (category) => {
    setSaveLoading(true);
    setShowSaveModal(false);
    
    const result = await savePost(blogData, category);
    
    if (result.success) {
      setIsBookmarked(true);
      showSuccess(result.message);
    } else {
      showError(result.error);
    }
    
    setSaveLoading(false);
  };

  const toggleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(upvotes - 1);
      setIsUpvoted(false);
    } else {
      setUpvotes(upvotes + 1);
      setIsUpvoted(true);
      if (isDownvoted) {
        setDownvotes(downvotes - 1);
        setIsDownvoted(false);
      }
    }
  };

  const toggleDownvote = () => {
    if (isDownvoted) {
      setDownvotes(downvotes - 1);
      setIsDownvoted(false);
    } else {
      setDownvotes(downvotes + 1);
      setIsDownvoted(true);
      if (isUpvoted) {
        setUpvotes(upvotes - 1);
        setIsUpvoted(false);
      }
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term) {
      setHighlightedText(term);
    } else {
      setHighlightedText("");
    }
  };

  const highlightSearchTerm = (text) => {
    if (!highlightedText) return text;
    
    const regex = new RegExp(`(${highlightedText})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-300 text-black">$1</mark>');
  };

  // Show loading state while blog data is being fetched
  if (!blogData) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-white text-lg font-lato">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-rich-black relative">
        {/* Background Glow Effect */}
        <div
          className="absolute z-0"
          style={{
            width: 637,
            height: 300,
            top: -38,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#1A1842B3",
            filter: "blur(100px)",
            boxShadow: "0px 4px 100px 500px #00000066",
            borderRadius: 30,
            pointerEvents: "none",
          }}
        />
        
        <div className="relative z-10 container mx-auto px-5 sm:px-7 lg:px-10 py-6">
          <div className="max-w-4xl mx-auto">
            
            {/* Back Button */}
            <div className="mb-6">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-white hover:text-periwinkle transition-colors"
              >
                <span className="material-icons">arrow_back</span>
                <span className="text-xl font-fenix">Back</span>
              </button>
            </div>

            {/* Header Section with Buttons and Search */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setReadingMode("simplified")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-lato text-sm font-medium transition-all duration-200 ${
                    readingMode === "simplified"
                      ? "bg-medium-slate-blue text-white shadow-lg shadow-medium-slate-blue/30"
                      : "bg-rich-black-light text-periwinkle hover:bg-periwinkle-light border border-navbar-border"
                  }`}
                >
                  <span className="material-icons text-lg">auto_fix_high</span>
                  <span>Simplify</span>
                </button>
                
                <button
                  onClick={() => setReadingMode("original")}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-lato text-sm font-medium transition-all duration-200 ${
                    readingMode === "original"
                      ? "bg-medium-slate-blue text-white shadow-lg shadow-medium-slate-blue/30"
                      : "bg-rich-black-light text-periwinkle hover:bg-periwinkle-light border border-navbar-border"
                  }`}
                >
                  <span className="material-icons text-lg">description</span>
                  <span>Original</span>
                </button>
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search in article"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="bg-transparent border border-[#393B5A] text-white rounded-[8px] h-[49px] pl-12 pr-4 w-96 text-base focus:outline-none font-lato placeholder-periwinkle focus:border-periwinkle transition-colors"
                />
                <span className="material-icons absolute left-4 top-1/2 -translate-y-1/2 text-periwinkle text-xl">
                  search
                </span>
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setHighlightedText("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-periwinkle hover:text-white transition-colors"
                  >
                    <span className="material-icons text-xl">clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Category and Meta Info */}
            <div className="flex items-center text-sm mb-4 font-lato">
              <span className="text-periwinkle px-3 py-1 rounded-xl font-semibold border border-solid border-navbar-border">
                {blogData.community}
              </span>
              <span className="mx-2 text-periwinkle">·</span>
              <span className="text-periwinkle">{blogData.date} • {blogData.readTime} read</span>
            </div>

            {/* Title */}
            <h1 className="font-fenix text-3xl md:text-4xl text-white mb-6 leading-tight">
              {blogData.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
              <img
                src={blogData.author.avatar}
                alt={blogData.author.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <div className="text-white font-lato font-medium text-base">{blogData.author.name}</div>
                <div className="text-periwinkle text-sm font-lato">Author</div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {blogData.tags.map((tag, index) => (
                <span key={index} className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl font-lato">
                  #{tag}
                </span>
              ))}
            </div>

            {/* Blog Image */}
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={blogData.image}
                alt={blogData.title}
                className="w-full h-80 object-cover"
              />
            </div>

            {/* Blog Content */}
            <div 
              ref={contentRef}
              className="mb-8"
              onMouseUp={handleTextSelection}
            >
              <div className="prose prose-invert max-w-none">
                {readingMode === "original" ? (
                  <div className="text-white space-y-4">
                    {blogData.content.split('\n\n').map((paragraph, index) => {
                      if (paragraph.trim().startsWith('##')) {
                        const headingText = paragraph.replace('##', '').trim();
                        return (
                          <h2 key={index} className="text-2xl font-fenix text-white mt-8 mb-4 font-semibold"
                              dangerouslySetInnerHTML={{ __html: highlightSearchTerm(headingText) }} />
                        );
                      }
                      if (paragraph.trim().startsWith('```')) {
                        const codeContent = paragraph.replace(/```\w*\n?/, '').replace(/```$/, '');
                        return (
                          <div key={index} className="bg-rich-black-light rounded-lg p-4 my-6 border border-navbar-border">
                            <pre className="text-white text-sm overflow-x-auto font-mono">
                              <code dangerouslySetInnerHTML={{ __html: highlightSearchTerm(codeContent) }} />
                            </pre>
                          </div>
                        );
                      }
                      if (paragraph.trim().startsWith('•')) {
                        const items = paragraph.split('•').filter(item => item.trim());
                        return (
                          <ul key={index} className="list-disc list-inside space-y-2 text-white font-lato text-base">
                            {items.map((item, i) => (
                              <li key={i} className="ml-4" 
                                  dangerouslySetInnerHTML={{ __html: highlightSearchTerm(item.trim()) }} />
                            ))}
                          </ul>
                        );
                      }
                      if (paragraph.trim().startsWith('**') && paragraph.trim().endsWith('**')) {
                        const boldText = paragraph.replace(/\*\*/g, '');
                        return (
                          <p key={index} className="text-base leading-snug font-lato text-white font-bold"
                             dangerouslySetInnerHTML={{ __html: highlightSearchTerm(boldText) }} />
                        );
                      }
                      return paragraph.trim() ? (
                        <p key={index} className="text-base leading-snug font-lato text-white"
                           dangerouslySetInnerHTML={{ __html: highlightSearchTerm(paragraph.trim()) }} />
                      ) : null;
                    })}
                  </div>
                ) : (
                  <div className="text-white space-y-4">
                    {blogData.simplified.split('\n\n').map((section, index) => {
                      if (section.trim().startsWith('**') && section.trim().endsWith('**')) {
                        const headingText = section.replace(/\*\*/g, '');
                        return (
                          <h2 key={index} className="text-2xl font-fenix text-white mb-4 font-semibold"
                              dangerouslySetInnerHTML={{ __html: highlightSearchTerm(headingText) }} />
                        );
                      }
                      if (section.trim().startsWith('•')) {
                        const items = section.split('•').filter(item => item.trim());
                        return (
                          <ul key={index} className="list-disc list-inside space-y-2 text-base">
                            {items.map((item, i) => (
                              <li key={i} className="ml-4 text-white font-lato" 
                                  dangerouslySetInnerHTML={{ __html: highlightSearchTerm(item.trim()) }} />
                            ))}
                          </ul>
                        );
                      }
                      return section.trim() ? (
                        <p key={index} className="text-base leading-snug font-lato text-white"
                           dangerouslySetInnerHTML={{ __html: highlightSearchTerm(section.trim()) }} />
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Separator Line */}
            <hr className="border-navbar-border mb-8" />

            {/* Action Bar */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-6">
                <button
                  onClick={toggleUpvote}
                  className={`flex items-center space-x-2 transition-colors ${
                    isUpvoted ? "text-white" : "text-periwinkle hover:text-white"
                  }`}
                >
                  <span className="material-icons text-lg">thumb_up</span>
                  <span className="font-lato font-medium">{upvotes}</span>
                </button>

                <button
                  onClick={toggleDownvote}
                  className={`flex items-center space-x-2 transition-colors ${
                    isDownvoted ? "text-white" : "text-periwinkle hover:text-white"
                  }`}
                >
                  <span className="material-icons text-lg">thumb_down</span>
                  <span className="font-lato font-medium">{downvotes}</span>
                </button>

                <div className="flex items-center space-x-2 text-periwinkle">
                  <span className="material-icons text-lg">visibility</span>
                  <span className="font-lato font-medium">{blogData.views}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <button className="flex items-center space-x-2 px-4 py-2 border border-periwinkle text-periwinkle rounded-md hover:bg-periwinkle-light transition-colors font-lato">
                  <span className="material-icons text-lg">share</span>
                  <span>Share</span>
                </button>

                {/* Save button with unsave functionality */}
                <button 
                  onClick={handleSave}
                  disabled={saveLoading}
                  className={`flex items-center space-x-2 px-4 py-2 border rounded-md transition-colors font-lato ${
                    isBookmarked
                      ? "border-periwinkle bg-periwinkle text-white hover:bg-opacity-90"
                      : "border-periwinkle text-periwinkle hover:bg-periwinkle-light"
                  } ${saveLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="material-icons text-lg">
                    {saveLoading 
                      ? "sync" 
                      : isBookmarked 
                        ? "bookmark" 
                        : "bookmark_border"
                    }
                  </span>
                  <span>{isBookmarked ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {/* Comments Section */}
            {typeof CommentSection !== 'undefined' && <CommentSection />}
          </div>
        </div>

        {/* Text Selection Popup */}
        {showPopup && typeof TextSelectionPopup !== 'undefined' && (
          <TextSelectionPopup
            position={popupPosition}
            selectedText={selectedText}
            onClose={() => setShowPopup(false)}
          />
        )}
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

export default BlogContent;