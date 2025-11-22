import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import { postsApi } from "../../api/postsApi";
import { getCommentsByPost } from "../../api/commentApi";

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
  upvotes,
  downvotes,
  comments,
  views,
  bookmarked = false,
}) => {
  // State for toggles
  const [isBookmarked, setIsBookmarked] = useState(bookmarked);
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [isDownvoted, setIsDownvoted] = useState(false);
  const navigate = useNavigate();
  const { auth } = useAuth();
  const toCount = (v) => {
    if (Array.isArray(v)) return v.length;
    if (typeof v === 'number') return v;
    if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
    return 0;
  };

  const [localUpvotes, setLocalUpvotes] = useState(toCount(upvotes));
  const [localDownvotes, setLocalDownvotes] = useState(toCount(downvotes));
  const [localCommentsCount, setLocalCommentsCount] = useState(toCount(comments));
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
          console.log('getCommentsByPost response for', id, res);
          const fetched = res?.data?.comments;
          if (mounted && Array.isArray(fetched)) {
            setLocalCommentsCount(fetched.length);
            console.log('Fetched comments count for post', id, fetched.length);
            if (fetched.length < 5) return;
          }
        } catch (err) {
          console.warn('getCommentsByPost failed, falling back to direct fetch:', err?.message || err);
        }

        // Fallback: direct fetch with large limit
        try {
          const base = import.meta.env.VITE_COMMENT_SERVICE_URL || 'http://localhost:5002';
          const url = `${base.replace(/\/$/, '')}/comment/all/${id}?limit=1000&sort=latest`;
          console.log('Fallback fetching comments count from', url);
          const direct = await fetch(url);
          if (!direct.ok) {
            console.warn('Direct fetch for comments failed:', direct.status);
            return;
          }
          const json = await direct.json();
          const arr = json?.comments;
          if (!mounted) return;
          if (Array.isArray(arr)) setLocalCommentsCount(arr.length);
        } catch (err) {
          console.warn('Direct fetch fallback failed:', err?.message || err);
        }
      } catch (err) {
        console.warn('Error fetching comments count:', err?.message || err);
      }
    };

    const init = async () => {
      if (!auth?.token) return;
      try {
        const userId = auth.user?._id ?? auth.user?.id ?? auth.user?.user_id ?? auth.user?.sub ?? auth.user?.userId;
        const status = await postsApi.getPostVoteStatus(id, userId);
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
  }, [auth?.token, id, auth.user]);

  // Handlers
  const toggleBookmark = (e) => {
    e.preventDefault(); // prevent navigation
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
  };
  const toggleUpvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth?.token) {
      navigate(`/login`, { state: { from: `/post/${id}` } });
      return;
    }
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
      const res = await postsApi.likePost(id, userId);
      if (res) {
        if (res.upvotes !== undefined) setLocalUpvotes(toCount(res.upvotes));
        if (res.downvotes !== undefined) setLocalDownvotes(toCount(res.downvotes));
        if (typeof res.userLiked === 'boolean') setIsUpvoted(res.userLiked);
        if (typeof res.userDisliked === 'boolean') setIsDownvoted(res.userDisliked);
      }
    } catch (err) {
      console.error('Failed to toggle upvote:', err);
      // rollback
      setLocalUpvotes(prev.localUpvotes);
      setLocalDownvotes(prev.localDownvotes);
      setIsUpvoted(prev.isUpvoted);
      setIsDownvoted(prev.isDownvoted);
    }
  };

  const toggleDownvote = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!auth?.token) {
      navigate(`/login`, { state: { from: `/post/${id}` } });
      return;
    }
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
      const res = await postsApi.dislikePost(id, userId);
      if (res) {
        if (res.upvotes !== undefined) setLocalUpvotes(toCount(res.upvotes));
        if (res.downvotes !== undefined) setLocalDownvotes(toCount(res.downvotes));
        if (typeof res.userLiked === 'boolean') setIsUpvoted(res.userLiked);
        if (typeof res.userDisliked === 'boolean') setIsDownvoted(res.userDisliked);
      }
    } catch (err) {
      console.error('Failed to toggle downvote:', err);
      setLocalUpvotes(prev.localUpvotes);
      setLocalDownvotes(prev.localDownvotes);
      setIsUpvoted(prev.isUpvoted);
      setIsDownvoted(prev.isDownvoted);
    }
  };

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
                alt={author?.name || 'Author'}
                className="w-8 h-8 rounded-full"
                src={author?.avatar || 'https://via.placeholder.com/40'}
              />
              <span className="font-lato text-periwinkle text-sm">
                {author?.name || 'Unknown'}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4 text-periwinkle">
              {/* Upvote */}
              <button
                onClick={toggleUpvote}
                className={`flex items-center text-sm transition-colors ${
                  isUpvoted ? "text-green-500" : "hover:text-white"
                }`}
              >
                <span className="material-icons text-base mr-1">
                  arrow_upward
                </span>
                {localUpvotes}
              </button>

              {/* Downvote */}
              <button
                onClick={toggleDownvote}
                className={`flex items-center text-sm transition-colors ${
                  isDownvoted ? "text-red-400" : "hover:text-white"
                }`}
              >
                <span className="material-icons text-base mr-1">
                  arrow_downward
                </span>
                {localDownvotes}
              </button>

              {/* Comments */}
              <button className="flex items-center text-sm hover:text-white transition-colors">
                <span className="material-icons text-base mr-1">
                  chat_bubble_outline
                </span>
                {localCommentsCount}
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
