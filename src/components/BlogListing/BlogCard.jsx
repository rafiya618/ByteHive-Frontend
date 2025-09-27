import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { getProfile } from "../../api/ProfileApi";
import { postsApi } from "../../api/postsApi";

const BlogCard = ({
  id,
  image,
  community,
  date,
  readTime,
  title,
  description,
  tags = [],
  author = { name: "Unknown", avatar: "" },
  upvotes: initialUpvotes = 0,
  downvotes: initialDownvotes = 0,
  comments = 0,
  views = 0,
  bookmarked = false,
  user_id,
}) => {
  const { auth } = useAuth();
  
  // State for toggles
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [voteLoading, setVoteLoading] = useState(false);
  
  // State for user profile
  const [userProfile, setUserProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Fetch user profile and vote status on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user_id) {
        console.log('No user_id provided for post:', id);
        return;
      }

      setProfileLoading(true);
      try {
        console.log(`Fetching profile for user_id: ${user_id} (Post: ${id})`);
        const response = await getProfile(user_id);
        console.log('Profile API response for user', user_id, ':', response);
        
        if (response && response.data) {
          setUserProfile(response.data);
          console.log('User profile data for BlogCard:', {
            user_id: user_id,
            profileData: response.data,
            name: response.data.name || response.data.user?.name || 'Unknown',
            profileImage: response.data.profileImage,
            username: response.data.username
          });
        } else {
          console.log('No profile data found for user:', user_id);
        }
      } catch (error) {
        console.error(`Error fetching profile for user ${user_id}:`, error);
        console.log('Profile fetch failed, will use fallback data');
      } finally {
        setProfileLoading(false);
      }
    };

    const fetchVoteStatus = async () => {
      if (!id || !auth?.user?._id) return;
      
      try {
        const voteResponse = await postsApi.getPostVoteStatus(id, auth.user._id);
        if (voteResponse.ok) {
          setUpvotes(voteResponse.upvotes);
          setDownvotes(voteResponse.downvotes);
          setIsUpvoted(voteResponse.userLiked);
          setIsDownvoted(voteResponse.userDisliked);
          
          console.log('Vote status loaded:', {
            postId: id,
            upvotes: voteResponse.upvotes,
            downvotes: voteResponse.downvotes,
            userLiked: voteResponse.userLiked,
            userDisliked: voteResponse.userDisliked
          });
        }
      } catch (error) {
        console.error('Error fetching vote status:', error);
      }
    };

    fetchUserProfile();
    fetchVoteStatus();
  }, [user_id, id, auth?.user?._id]);

  // Vote handlers
  const toggleUpvote = async (e) => {
    e.preventDefault();
    
    if (!auth?.token) {
      // Redirect to login if not authenticated
      return;
    }
    
    if (voteLoading) return;
    
    setVoteLoading(true);
    
    try {
      const response = await postsApi.likePost(id, auth.user._id);
      
      if (response.ok) {
        setUpvotes(response.upvotes);
        setDownvotes(response.downvotes);
        setIsUpvoted(response.userLiked);
        setIsDownvoted(response.userDisliked);
        
        console.log('Upvote response:', response);
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
      
      // Show alert for schema issues
      if (error.message.includes('outdated data format')) {
        alert('This post has an outdated format. Please refresh the page and try again.');
      } else {
        alert('Failed to update vote. Please try again.');
      }
    } finally {
      setVoteLoading(false);
    }
  };

  const toggleDownvote = async (e) => {
    e.preventDefault();
    
    if (!auth?.token) {
      // Redirect to login if not authenticated
      return;
    }
    
    if (voteLoading) return;
    
    setVoteLoading(true);
    
    try {
      const response = await postsApi.dislikePost(id, auth.user._id);
      
      if (response.ok) {
        setUpvotes(response.upvotes);
        setDownvotes(response.downvotes);
        setIsUpvoted(response.userLiked);
        setIsDownvoted(response.userDisliked);
        
        console.log('Downvote response:', response);
      }
    } catch (error) {
      console.error('Error toggling downvote:', error);
      
      // Show alert for schema issues
      if (error.message.includes('outdated data format')) {
        alert('This post has an outdated format. Please refresh the page and try again.');
      } else {
        alert('Failed to update vote. Please try again.');
      }
    } finally {
      setVoteLoading(false);
    }
  };

  // Handlers
  const toggleBookmark = (e) => {
    e.preventDefault(); // prevent navigation
    setIsBookmarked(!isBookmarked);
  };

  // Get author info from profile or fallback to props
  const getAuthorInfo = () => {
    if (userProfile) {
      const name = userProfile.name || userProfile.user?.name || userProfile.username || "Unknown";
      const avatar = userProfile.profileImage || 
        `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0D8ABC&color=fff`;
      
      return { name, avatar };
    }
    
    // Fallback to props or default
    return {
      name: author?.name || "Unknown",
      avatar: author?.avatar || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"
    };
  };

  const authorInfo = getAuthorInfo();
  const safeTags = Array.isArray(tags) ? tags : [];

  return (
    <Link
      to={`/post/${id}`}
      className="block bg-navbar-bg rounded-xl overflow-hidden border z-0 hover:bg-white/5 transition"
      style={{ border: "1px solid var(--navbar-border)" }}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 relative">
        {/* Blog Image */}
        <div className="md:col-span-1 flex items-center">
          <img
            alt={title}
            className="rounded-lg w-full h-full object-cover min-h-[140px] max-h-[210px]"
            src={image}
          />
        </div>

        {/* Blog Content */}
        <div className="md:col-span-2 flex flex-col">
          {/* Community, date, readTime */}
          <div className="flex items-center text-sm mb-2 font-lato">
            <span className="text-periwinkle px-3 py-1 rounded-xl font-semibold border-solid border-1">
              {community}
            </span>
            <span className="mx-2 text-periwinkle">·</span>
            <span className="text-periwinkle">
              {date} • {readTime} read
            </span>
          </div>

          {/* Title */}
          <h3 className="font-fenix text-2xl text-white mb-3">{title}</h3>

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
            {description}
          </p>

          {/* Tags */}
          <div className="flex items-center space-x-2 mb-4">
            {safeTags.map((tag, index) => (
              <span
                key={index}
                className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl"
              >
                #{tag}
              </span>
            ))}
          </div>

          {/* Author and actions */}
          <div className="flex justify-between items-center mt-auto">
            {/* Author - Using fetched profile data */}
            <div className="flex items-center space-x-3">
              {profileLoading ? (
                // Loading state for author
                <div className="w-8 h-8 rounded-full bg-gray-600 animate-pulse"></div>
              ) : (
                <img
                  alt={authorInfo.name}
                  className="w-8 h-8 rounded-full object-cover"
                  src={authorInfo.avatar}
                  onError={(e) => {
                    // Fallback image if profile image fails to load
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(authorInfo.name)}&background=0D8ABC&color=fff`;
                  }}
                />
              )}
              <span className="font-lato text-periwinkle text-sm">
                {profileLoading ? "Loading..." : authorInfo.name}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 text-periwinkle">
              {/* Upvote */}
              <button
                onClick={toggleUpvote}
                disabled={voteLoading}
                className={`flex items-center text-sm transition-colors ${
                  isUpvoted ? "text-green-500" : "hover:text-white"
                } ${voteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="material-icons text-base mr-1">
                  {voteLoading && (isUpvoted || (!isUpvoted && !isDownvoted)) ? "hourglass_empty" : "arrow_upward"}
                </span>
                {upvotes}
              </button>

              {/* Downvote */}
              <button
                onClick={toggleDownvote}
                disabled={voteLoading}
                className={`flex items-center text-sm transition-colors ${
                  isDownvoted ? "text-red-400" : "hover:text-white"
                } ${voteLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <span className="material-icons text-base mr-1">
                  {voteLoading && (isDownvoted || (!isUpvoted && !isDownvoted)) ? "hourglass_empty" : "arrow_downward"}
                </span>
                {downvotes}
              </button>

              {/* Comments */}
              <button className="flex items-center text-sm hover:text-white transition-colors">
                <span className="material-icons text-base mr-1">
                  chat_bubble_outline
                </span>
                {comments}
              </button>

              {/* Views */}
              <span className="flex items-center text-sm hover:text-white transition-colors">
                <span className="material-icons text-base mr-1">visibility</span>
                {views}
              </span>
            </div>
          </div>

          {/* Bookmark */}
          <button
            onClick={toggleBookmark}
            className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
              isBookmarked
                ? "text-periwinkle"
                : "text-periwinkle hover:text-white"
            }`}
          >
            <span className="material-icons">
              {isBookmarked ? "bookmark" : "bookmark_border"}
            </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
