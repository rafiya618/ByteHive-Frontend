import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { postsApi } from "../../api/postsApi";
import { getCommentsByPost } from "../../api/commentApi";
import { savePost, unsavePost, checkSavedStatus } from "../../api/curationApi";
import { ReportPostModal } from "../posts/ReportPostModal";
import { PrimaryButton } from "../../components/UI";
import toast from "react-hot-toast";

const BlogCard = ({
  id,
  image,
  community,
  date,
  readTime,
  title,
  description,
  tags,
  author,
  user_id,
  upvotes,
  downvotes,
  comments,
  views,
  bookmarked = false,
}) => {
  const [authorInfo, setAuthorInfo] = useState(author || { name: 'Unknown', avatar: '' });

  // Fetch author profile if missing and user_id available
  React.useEffect(() => {
    let mounted = true;
    const loadAuthor = async () => {
      try {
        const hasName = !!authorInfo?.name && authorInfo.name !== 'Unknown';
        if (hasName || !user_id) return;
        const { getProfile } = await import('../../api/ProfileApi.jsx');
        const res = await getProfile({ userId: user_id });
        const data = res?.data || res?.profile || {};
        const name = data.fullName || data.username || data.name || [data.firstName, data.lastName].filter(Boolean).join(' ') || 'Unknown';
        const avatar = data.profileImage || data.avatar || data.image || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(name);
        if (mounted) setAuthorInfo({ name, avatar });
      } catch (err) {
        // Don't log 404 errors as they are expected for users without profiles
        if (err?.response?.status !== 404) {
          console.warn('Failed to load author profile:', err?.message || err);
        }
      }
    };
    loadAuthor();
    return () => { mounted = false; };
  }, [user_id, authorInfo?.name]);
  // State for toggles
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [showBookmarkMenu, setShowBookmarkMenu] = useState(false);
  const [savedCategory, setSavedCategory] = useState(null);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const location = useLocation();
  const toCount = (v) => {
    if (Array.isArray(v)) return v.length;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
    return 0;
  };

  const [localUpvotes, setLocalUpvotes] = useState(toCount(upvotes));
  const [localDownvotes, setLocalDownvotes] = useState(toCount(downvotes));
  const [localCommentsCount, setLocalCommentsCount] = useState(toCount(comments));
  const [isVoting, setIsVoting] = useState(false); // Prevent concurrent vote requests
  // fetch current user's vote status (if logged in)
  React.useEffect(() => {
    let mounted = true;
    // Fetch comments count helper
    const commentFetch = async () => {
      try {
        if (toCount(comments) > 0) return;

        // Try using comment API helper first (axios)
        try {
          const res = await getCommentsByPost(id, null, 'latest');
          const fetched = res?.data?.comments;
          if (mounted && Array.isArray(fetched)) {
            setLocalCommentsCount(fetched.length);
            if (fetched.length < 5) return;
          }
        } catch (err) {
          // Don't log 401 errors as they are expected for unauthenticated users
          if (err?.response?.status !== 401) {
            console.warn('getCommentsByPost failed, falling back to direct fetch:', err?.message || err);
          }
        }

        // Fallback: direct fetch with large limit
        try {
          const base = import.meta.env.VITE_COMMENT_SERVICE_URL || 'http://localhost:5002';
          const url = `${base.replace(/\/$/, '')}/comment/all/${id}?limit=1000&sort=latest`;
          const headers = {};
          if (auth?.token) {
            headers['Authorization'] = `Bearer ${auth.token}`;
          }
          const direct = await fetch(url, { headers });
          if (!direct.ok) {
            return;
          }
          const json = await direct.json();
          const arr = json?.comments;
          if (!mounted) return;
          if (Array.isArray(arr)) setLocalCommentsCount(arr.length);
        } catch (err) {
          // Don't log 401 errors as they are expected for unauthenticated users
          if (err?.status !== 401 && err?.response?.status !== 401) {
            console.warn('Direct fetch fallback failed:', err?.message || err);
          }
        }
      } catch (err) {
        console.warn('Error fetching comments count:', err?.message || err);
      }
    };

    const init = async () => {
      if (!auth?.token) return;
      try {
        const userId = auth.user?._id ?? auth.user?.id ?? auth.user?.user_id ?? auth.user?.sub ?? auth.user?.userId;
        const normalizedUserId = String(userId); // Ensure consistent string format
        const status = await postsApi.getPostVoteStatus(id, normalizedUserId);
        if (!mounted) return;
        if (status) {
          if (status.upvotes !== undefined) setLocalUpvotes(toCount(status.upvotes));
          if (status.downvotes !== undefined) setLocalDownvotes(toCount(status.downvotes));
          if (typeof status.userLiked === 'boolean') setIsUpvoted(status.userLiked);
          if (typeof status.userDisliked === 'boolean') setIsDownvoted(status.userDisliked);
        }
      } catch (err) {
        console.warn('Error fetching vote status:', err?.message || err);
      }
    };

    init();
    // Always attempt to fetch comments count regardless of vote-status outcome
    commentFetch();
    return () => { mounted = false; };
  }, [auth?.token, id, auth.user, comments]);

  // Check if post is saved
  React.useEffect(() => {
    const checkSaved = async () => {
      try {
        const status = await checkSavedStatus(id);
        if (status?.isSaved) {
          setIsBookmarked(true);
          setSavedCategory(status.category || "Saved");
        }
      } catch (err) {
        console.warn("Error checking saved status:", err?.message || err);
      }
    };

    if (auth?.token) {
      checkSaved();
    }
  }, [auth?.token, id]);

  // Handlers
  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowBookmarkMenu(!showBookmarkMenu);
  };

  const handleSavePost = async (category) => {
    if (!auth?.token) {
      navigate("/login", { state: { from: `/post/${id}` } });
      return;
    }

    try {
      await savePost(id, category);
      setIsBookmarked(true);
      setSavedCategory(category);
      setShowBookmarkMenu(false);
      toast.success(`Post saved to ${category}!`);
    } catch (err) {
      console.error("Error saving post:", err);
      const errorMsg = typeof err === 'string' ? err : err?.message || 'Failed to save post';
      toast.error(errorMsg);
    }
  };

  const handleUnsavePost = async () => {
    try {
      await unsavePost(id);
      setIsBookmarked(false);
      setSavedCategory(null);
      setShowBookmarkMenu(false);
      toast.success("Post removed from saved");
    } catch (err) {
      console.error("Error unsaving post:", err);
      toast.error("Failed to unsave post");
    }
  };
  const toggleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth?.token) {
      navigate(`/login`, { state: { from: `/post/${id}` } });
      return;
    }

    // Prevent concurrent requests
    if (isVoting) return;

    setIsVoting(true);
    // optimistic update + precise reconciliation
    const prev = { localUpvotes, localDownvotes, isUpvoted, isDownvoted };
    // toggle logic: if currently upvoted -> remove like, else add like (and remove downvote if present)
    if (isUpvoted) {
      setLocalUpvotes((v) => Math.max(0, v - 1));
      setIsUpvoted(false);
    } else {
      setLocalUpvotes((v) => v + 1);
      setIsUpvoted(true);
      if (isDownvoted) {
        setLocalDownvotes((v) => Math.max(0, v - 1));
        setIsDownvoted(false);
      }
    }

    try {
      const userId = auth.user?._id ?? auth.user?.id ?? auth.user?.user_id ?? auth.user?.sub ?? auth.user?.userId;
      const normalizedUserId = String(userId); // Ensure consistent string format
      const res = await postsApi.likePost(id, normalizedUserId);
      if (res) {
        if (res.upvotes !== undefined) setLocalUpvotes(toCount(res.upvotes));
        if (res.downvotes !== undefined) setLocalDownvotes(toCount(res.downvotes));
        if (typeof res.userLiked === 'boolean') setIsUpvoted(res.userLiked);
        if (typeof res.userDisliked === 'boolean') setIsDownvoted(res.userDisliked);
      }

      // ✅ Log upvote activity - ONLY when upvote is ADDED (not removed)
      // This ensures Activity Metrics tracks upvotes from main index page
      if (!prev.isUpvoted && res.userLiked) {
        try {
          console.log('📝 [BLOG-CARD] Logging upvote activity for post:', id);
          console.log('📝 [BLOG-CARD] User ID:', normalizedUserId);
          const { logActivity } = await import('../../api/retentionApi');
          await logActivity('upvote', id);
          console.log('✅ [BLOG-CARD] Upvote activity logged successfully to userActivity');
          try {
            const { reTrackEvent } = await import('../../api/reApi');
            await reTrackEvent({ userId: String(normalizedUserId), action: 'upvote', entityType: 'post', entityId: id });
          } catch (error) {
            void error;
          }
        } catch (error) {
          console.error('❌ [BLOG-CARD] Failed to log upvote activity:', error);
          console.error('❌ [BLOG-CARD] Error details:', error.message, error.response?.data);
          // Don't block the UI if activity logging fails
        }
      } else if (prev.isUpvoted && !res.userLiked) {
        // Remove from userActivity
        console.log('🗑️ [BLOG-CARD] Upvote removed - removing from userActivity');
        try {
          const { removeActivity } = await import('../../api/retentionApi');
          await removeActivity('upvote', id);
          console.log('✅ [BLOG-CARD] Upvote removed from userActivity');
        } catch (error) {
          console.error('❌ [BLOG-CARD] Failed to remove upvote activity:', error);
        }
      }

    } catch (err) {
      console.error('Failed to toggle upvote:', err);
      // rollback
      setLocalUpvotes(prev.localUpvotes);
      setLocalDownvotes(prev.localDownvotes);
      setIsUpvoted(prev.isUpvoted);
      setIsDownvoted(prev.isDownvoted);
    } finally {
      setIsVoting(false);
    }
  };

  const toggleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth?.token) {
      navigate(`/login`, { state: { from: `/post/${id}` } });
      return;
    }

    // Prevent concurrent requests
    if (isVoting) return;

    setIsVoting(true);
    const prev = { localUpvotes, localDownvotes, isUpvoted, isDownvoted };
    if (isDownvoted) {
      setLocalDownvotes((v) => Math.max(0, v - 1));
      setIsDownvoted(false);
    } else {
      setLocalDownvotes((v) => v + 1);
      setIsDownvoted(true);
      if (isUpvoted) {
        setLocalUpvotes((v) => Math.max(0, v - 1));
        setIsUpvoted(false);
      }
    }

    try {
      const userId = auth.user?._id ?? auth.user?.id ?? auth.user?.user_id ?? auth.user?.sub ?? auth.user?.userId;
      const normalizedUserId = String(userId); // Ensure consistent string format
      const res = await postsApi.dislikePost(id, normalizedUserId);
      if (res) {
        if (res.upvotes !== undefined) setLocalUpvotes(toCount(res.upvotes));
        if (res.downvotes !== undefined) setLocalDownvotes(toCount(res.downvotes));
        if (typeof res.userLiked === 'boolean') setIsUpvoted(res.userLiked);
        if (typeof res.userDisliked === 'boolean') setIsDownvoted(res.userDisliked);
      }

      // ✅ Log downvote activity - ONLY when downvote is ADDED (not removed)
      // This ensures Activity Metrics tracks downvotes from main index page
      if (!prev.isDownvoted && res.userDisliked) {
        try {
          console.log('📝 [BLOG-CARD] Logging downvote activity for post:', id);
          console.log('📝 [BLOG-CARD] User ID:', normalizedUserId);
          const { logActivity } = await import('../../api/retentionApi');
          await logActivity('downvote', id);
          console.log('✅ [BLOG-CARD] Downvote activity logged successfully to userActivity');
        } catch (error) {
          console.error('❌ [BLOG-CARD] Failed to log downvote activity:', error);
          console.error('❌ [BLOG-CARD] Error details:', error.message, error.response?.data);
        }
      } else if (prev.isDownvoted && !res.userDisliked) {
        // Remove from userActivity
        console.log('🗑️ [BLOG-CARD] Downvote removed - removing from userActivity');
        try {
          const { removeActivity } = await import('../../api/retentionApi');
          await removeActivity('downvote', id);
          console.log('✅ [BLOG-CARD] Downvote removed from userActivity');
        } catch (error) {
          console.error('❌ [BLOG-CARD] Failed to remove downvote activity:', error);
        }
      }

    } catch (err) {
      console.error('Failed to toggle downvote:', err);
      setLocalUpvotes(prev.localUpvotes);
      setLocalDownvotes(prev.localDownvotes);
      setIsUpvoted(prev.isUpvoted);
      setIsDownvoted(prev.isDownvoted);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <div className="relative">
      {/* Bookmark Button - Outside Link */}
      <div className="absolute top-4 right-4 z-20">
        <PrimaryButton
          onClick={toggleBookmark}
          className={`p-2 transition-colors bg-navbar-bg hover:bg-gray-800 ${isBookmarked
            ? "text-desc"
            : "text-desc hover:text-white"
            }`}
        >
          <span className="material-icons">
            {isBookmarked ? "bookmark" : "bookmark_border"}
          </span>
        </PrimaryButton>

        {/* Bookmark Dropdown Menu */}
        {showBookmarkMenu && (
          <div className="absolute top-full right-0 mt-2 bg-dark-navy-purple border border-navbar-border rounded-lg shadow-lg z-50 min-w-[200px] py-2">
            {isBookmarked ? (
              <>
                <PrimaryButton
                  onClick={() => handleSavePost("Saved")}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2 ${savedCategory === "Saved" ? "text-periwinkle" : "text-white"
                    }`}
                >
                  <span className="material-icons text-sm">check</span>
                  Saved
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => handleSavePost("Watch Later")}
                  className={`w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors flex items-center gap-2 ${savedCategory === "Watch Later" ? "text-periwinkle" : "text-white"
                    }`}
                >
                  <span className="material-icons text-sm">
                    {savedCategory === "Watch Later" ? "check" : ""}
                  </span>
                  Watch Later
                </PrimaryButton>
                <hr className="my-2 border-gray-600" />
                <PrimaryButton
                  onClick={handleUnsavePost}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400 flex items-center gap-2"
                >
                  <span className="material-icons text-sm">close</span>
                  Remove
                </PrimaryButton>
              </>
            ) : (
              <>
                <PrimaryButton
                  onClick={() => handleSavePost("Saved")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white flex items-center gap-2"
                >
                  <span className="material-icons text-sm">bookmark</span>
                  Saved
                </PrimaryButton>
                <PrimaryButton
                  onClick={() => handleSavePost("Watch Later")}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-white flex items-center gap-2"
                >
                  <span className="material-icons text-sm">schedule</span>
                  Watch Later
                </PrimaryButton>
                <hr className="my-2 border-gray-600" />
                <PrimaryButton
                  onClick={() => {
                    setShowBookmarkMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-700 transition-colors text-red-400 flex items-center gap-2"
                >
                  <span className="material-icons text-sm">flag</span>
                  Report Post
                </PrimaryButton>
              </>
            )}
          </div>
        )}
      </div>

      <Link
        to={`/post/${id}`}
        state={
          (auth?.user?.role === 'admin' || location.pathname.startsWith('/community'))
            ? { includeUnapproved: true }
            : undefined
        }
        onClick={async () => {
          try {
            const userId = auth?.user?._id ?? auth?.user?.id ?? auth?.user?.user_id ?? auth?.user?.sub ?? auth?.user?.userId;
            if (!userId) return;
            const { reTrackEvent } = await import('../../api/reApi');
            await reTrackEvent({ userId: String(userId), action: 'read', entityType: 'post', entityId: id, metadata: { source: 'listing' } });
          } catch (error) {
            void error;
          }
        }}
        className="block bg-navbar-bg rounded-xl overflow-hidden border z-0 hover:bg-white/5 hover:translate-y-0.5 transform-gpu transition-all cursor-pointer blog-card"
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
            <div className="flex items-center text-sm mb-2 font-lato text-desc">
              <span className="px-3 py-1 rounded-xl font-semibold community-badge border border-navbar-border text-desc">
                {community}
              </span>
              <span className="mx-2 text-desc">·</span>
              <span className="text-desc">
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
              {(Array.isArray(tags) ? tags : []).map((tag, i) => (
                <span
                  key={i}
                  className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Author and actions */}
            <div className="flex justify-between items-center mt-auto">
              {/* Author */}
              <div className="flex items-center space-x-3">
                <img
                  alt={authorInfo?.name || 'Author'}
                  className="w-8 h-8 rounded-full"
                  src={authorInfo?.avatar || 'https://via.placeholder.com/40'}
                />
                <span className="font-lato text-desc text-sm">
                  {authorInfo?.name || 'Unknown'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-4 text-desc">
                {/* Upvote */}
                <button
                  title={isUpvoted ? 'Remove Upvote' : 'Upvote'}
                  onClick={toggleUpvote}
                  className={`flex items-center text-sm hover:text-white transition-colors cursor-pointer ${isUpvoted ? "text-green-500" : ""}`}
                >
                  <span className="material-icons text-base mr-1 text-desc">arrow_upward</span>
                  {localUpvotes}
                </button>

                {/* Downvote */}
                <button
                  title={isDownvoted ? 'Remove Downvote' : 'Downvote'}
                  onClick={toggleDownvote}
                  className={`flex items-center text-sm hover:text-white transition-colors cursor-pointer ${isDownvoted ? "text-red-400" : ""}`}
                >
                  <span className="material-icons text-base mr-1 text-desc">arrow_downward</span>
                  {localDownvotes}
                </button>

                {/* Comments */}
                <button title="Comments" className="flex items-center text-sm hover:text-white transition-colors cursor-pointer">
                  <span className="material-icons text-base mr-1 text-desc">chat_bubble_outline</span>
                  {localCommentsCount}
                </button>

                {/* Views */}
                <span className="flex items-center text-sm hover:text-white transition-colors">
                  <span className="material-icons text-base mr-1 text-desc">visibility</span>
                  {views}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      {/* Report Post Modal */}
      <ReportPostModal
        post={{ id, title }}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSuccess={() => {
          setShowReportModal(false);
        }}
      />
    </div>
  );
};

export default BlogCard;
