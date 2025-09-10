import React, { useState, useEffect, useRef } from 'react';
import socket from '../../../Socket';
import { useAuth } from '../../context/auth';
import {
  addComment,
  deleteComment,
  dislikeComment,
  getcommentById,
  getCommentsByPost,
  getReplies,
  likeComment,
  updateComment
} from '../../api/commentApi';
import { jwtDecode } from 'jwt-decode';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useProfile } from '../../context/profileContext';
import CommentBlock from './CommentBlock';
import { useLocation } from 'react-router-dom';
import { useParams } from "react-router-dom";
import "./comment.css"
import InputField from "../../shared/InputField";

dayjs.extend(relativeTime);

const Comment = ({ postId = 34534903493030330 }) => {
  // console.log("🔥 postId prop received in Comment component:", postId);
  // console.log("🟢 Comment component rendered with props:", props);

  const [msg, setMsg] = useState("");
  const { auth } = useAuth();
  const { profile } = useProfile();
  const [decoded, setDecoded] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyingTo, setReplyingTo] = useState({});
  const [reply, setReply] = useState({});
  const [replies, setReplies] = useState({});
  const [expandReplies, setExpandReplies] = useState({});
  const [editingComment, setEditingComment] = useState({});
  const [editingText, setEditingText] = useState({});
  const loaderRef = useRef(null);
  const observerRef = useRef(null);
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [sortOrder, setSortOrder] = useState("latest"); // latest | oldest
  const location = useLocation();
  const targetRef = useRef(null);

  // ⬅️ added: extract query params
  let { triggerType, triggerId, entityId, isAggregation } = location.state || {};
  // console.log('triggerId in comment', triggerId)
  // const searchParams = new URLSearchParams(location.search);
  // const triggerType = searchParams.get("triggerType");
  // const entityId = searchParams.get("entityId");
  // const triggerId = searchParams.get("triggerId");

  useEffect(() => {
    if (!entityId) return;

    const loadComment = async () => {
      try {
        console.log('triggerType', triggerType)
        if (triggerType == "reply") {
          const { data } = await getcommentById(entityId);
          console.log("data in target reply", data);
          setComments((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            const uniqueData = [data.comment].filter((c) => !existingIds.has(c._id));
            return [...prev, ...uniqueData];
          });

          if (data.replies) {
            setReplies((prev) => ({ ...prev, [entityId]: data.replies }));
            setExpandReplies((prev) => ({ ...prev, [entityId]: true }));
          }
          // if (isAggregation) {
          //   console.log('triggerId', triggerId)
          //   triggerId = entityId
          //   console.log('triggerId', triggerId)
          // }

        } else {
          const { data } = await getcommentById(triggerId);
          console.log("data in target comment", data);
          setComments((prev) => {
            const existingIds = new Set(prev.map((c) => c._id));
            const uniqueData = [data.comment].filter((c) => !existingIds.has(c._id));
            return [...prev, ...uniqueData];
          })
        }
        // If it's a reply, load replies


        // 🔑 Wait a tick so React finishes rendering
        setTimeout(() => {
          if (targetRef.current) {
            targetRef.current.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
            targetRef.current.classList.add("highlight");
            setTimeout(
              () => targetRef.current.classList.remove("highlight"),
              2000
            );
          }
        }, 50);
      } catch (err) {
        console.error("Error fetching comment for scroll:", err);
      }
    };

    loadComment();
  }, [entityId, triggerType, triggerId]);


  // Decode JWT
  useEffect(() => {
    if (auth?.token) {
      try {
        const decodedToken = jwtDecode(auth?.token);
        setDecoded(decodedToken);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [auth?.token]);

  // Socket listeners
  useEffect(() => {
    const handleNewComment = (newComment) => {
      if (newComment.postId === postId) {
        if (newComment.parentId) {
          setReplies((prev) => ({
            ...prev,
            [newComment.parentId]: [
              newComment,
              ...(prev[newComment.parentId] || [])
            ]
          }));
          setComments(prev =>
            prev.map(c =>
              c._id === newComment.parentId
                ? { ...c, replyCount: c.replyCount + 1 }
                : c
            )
          );
        } else {
          setComments((prev) => [newComment, ...prev]);
        }

      }
    };

    const handleLikeAndDislike = (comment) => {
      if (comment.parentId) {
        setReplies((prev) => ({
          ...prev,
          [comment.parentId]: prev[comment.parentId]?.map(c =>
            c._id == comment._id ? { ...c, likes: comment.likes, dislikes: comment.dislikes } : c
          )
        }));
      } else {
        setComments((prev) =>
          prev.map(c =>
            c._id === comment._id ? { ...c, likes: comment.likes, dislikes: comment.dislikes } : c
          )
        );
      }
    };

    const handleUpdatedComment = (updatedComment) => {
      if (updatedComment.parentId) {
        setReplies(prev => ({
          ...prev,
          [updatedComment.parentId]: prev[updatedComment.parentId]?.map(c =>
            c._id === updatedComment._id
              ? { ...c, text: updatedComment.text }
              : c
          )
        }));
      } else {
        setComments(prev =>
          prev.map(c =>
            c._id == updatedComment._id
              ? { ...c, text: updatedComment.text }
              : c
          )
        );
      }
    };

    const handleDeleteComment = (comment) => {
      console.log('🗑️ Comment received in delete socket:', comment);

      if (comment.parentId) {
        // Handle reply deletion
        setReplies(prev => ({
          ...prev,
          [comment.parentId]: prev[comment.parentId]?.filter(
            c => c._id !== comment._id
          )
        }));
        setComments(prev =>
          prev.map(c =>
            c._id === comment.parentId
              ? { ...c, replyCount: c.replyCount - 1 }
              : c
          )
        );
      } else {
        // Handle top-level comment deletion
        console.log('📂 All parent IDs in replies object:', Object.keys(replies));

        const repliesForThisComment = replies[comment._id];
        if (repliesForThisComment && repliesForThisComment.length > 0) {
          console.log(`💬 Replies for deleted comment ${comment._id}:`);
          repliesForThisComment.forEach((reply, i) => {
            console.log(` ↳ Reply ${i + 1}:`, reply);
          });
        } else {
          console.log(`⚠️ No replies found for deleted comment ${comment._id}.`);
        }

        setComments(prev => prev.filter(c => c._id !== comment._id));
      }
    };

    socket.emit("joinRoom", { type: "post", id: postId });
    socket.on("comment:new", handleNewComment);
    socket.on("comment:LikeAndDislike", handleLikeAndDislike);
    socket.on("comment:update", handleUpdatedComment);
    socket.on("comment:delete", handleDeleteComment);

    return () => {
      socket.emit("leaveRoom", { type: "post", id: postId });
      socket.off("comment:new", handleNewComment);
      socket.off("comment:LikeAndDislike", handleLikeAndDislike);
      socket.off("comment:update", handleUpdatedComment);
      socket.off("comment:delete", handleDeleteComment);
    };
  }, [postId]);

  // Reset comments when post changes
  useEffect(() => {
    setComments([]);
    setCursor(null);
    setHasMore(true);
    fetchTopComments();
  }, [postId]);


  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        console.log('Observer callback called!');
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          console.log('The loader is visible!');
          fetchTopComments();
        }
      },
      { threshold: 1.0 }
    );

    observerRef.current = observer;
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loaderRef, hasMore, isLoading]);

  // Add new comment or reply
  const handleAddComment = async (e, comment) => {
    e.preventDefault();

    if (!decoded?._id || !(comment ? (reply[comment._id]?.trim()) : msg.trim())) {
      console.warn("Missing user ID or empty message.");
      return;
    }
    const commentPayload = {
      postId: postId,
      parentId: comment
        ? (comment.parentId ? comment.parentId : comment._id)
        : null,
      user: {
        _id: decoded._id,
        username: profile?.username,
        profileImage: profile?.profileImage
      },
      text: comment ? reply[comment._id] : msg,
      receiverId: comment ? comment.user._id : "postId",
      receiverName: comment ? comment.user.username : "post_owner",
      entityId: comment ? comment._id : postId
    };

    console.log('commentPayload', commentPayload);

    try {
      const { data } = await addComment(commentPayload);
      console.log("Comment submitted:", data);

      if (comment) {
        setReply(prev => ({ ...prev, [comment._id]: "" }));
        setReplyingTo(prev => ({ ...prev, [comment._id]: null }));
      } else {
        setMsg("");
      }
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  // Fetch top-level comments
  const fetchTopComments = async (order = sortOrder) => {
    try {
      if (isLoading || !hasMore) return;
      setIsLoading(true);

      const { data } = await getCommentsByPost(postId, cursor, order);
      console.log('data', data)
      if (data.length === 0) {
        setHasMore(false);
        if (observerRef.current && loaderRef.current) {
          observerRef.current.unobserve(loaderRef.current);
        }
      } else {
        setComments((prev) => {
          const existingIds = new Set(prev.map(c => c._id));
          const uniqueData = data.filter(c => !existingIds.has(c._id));
          return [...prev, ...uniqueData];
        });
        setCursor(data[data.length - 1]._id);
      }
    } catch (error) {
      console.log('Error: ', error);
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch replies for a comment
  const handleReplies = async (parentId) => {
    try {
      const { data } = await getReplies(postId, parentId);
      console.log('data', data)
      setReplies(prev => ({ ...prev, [parentId]: data }));
      setReply(prev => ({ ...prev, [parentId]: "" }));
      setExpandReplies(prev => ({ ...prev, [parentId]: true }));
      console.log('replies: ', data);
    } catch (error) {
      console.log('Error: ', error);
    }
  };

  // Like a comment
  const handleLike = async (commentId, userId) => {
    try {
      await likeComment(commentId, userId);
    } catch (error) {
      console.log('Error in handle like: ', error);
    }
  };

  const handleDislike = async (commentId, userId) => {
    try {
      await dislikeComment(commentId, userId);
    } catch (error) {
      console.log('Error in handle like: ', error);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId) => {
    try {
      const { data } = await updateComment(commentId, editingText[commentId]);
      console.log('updated comment', data);
      setEditingComment(prev => ({ ...prev, [commentId]: "" }));
      setEditingText(prev => ({ ...prev, [commentId]: "" }));
    } catch (error) {
      console.log('Error in updating comment', error);
    }
  };

  // Delete comment
  const handleDelete = async (commentId) => {
    try {
      console.log('commentId in handle delete', commentId);
      await deleteComment(commentId);
    } catch (error) {
      console.log('Error in handle Delete', error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-6 px-4 sm:px-6">
      {/* Sort Dropdown */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className="text-sm font-medium">Sort by:</label>
        <select
          value={sortOrder}
          onChange={(e) => {
            setSortOrder(e.target.value);
            setMsg("");
            fetchTopComments(e.target.value);
          }}
          className="px-3 py-2 rounded-md bg-dark-indigo border border-faint-greyish-overlay text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="latest">Latest Comments</option>
          <option value="oldest">Oldest Comments</option>
        </select>
      </div>

      {/* Input Section */}
      <div className="flex flex-col sm:flex-row gap-2 mb-6">
        <InputField
          type="text"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Add a comment..."
        />
        <div className="flex gap-2 mt-2 sm:mt-0">
          <button
            onClick={(e) => handleAddComment(e, null)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition"
          >
            Post
          </button>
          {/* <button
            onClick={() => setMsg("")}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white transition"
          >
            Cancel
          </button> */}
        </div>
      </div>

      {/* Comments List */}
      <div className="flex flex-col gap-4">
        {isLoading && <p className="text-center text-gray-400">Loading more...</p>}

        {comments.map((c) => (
          <CommentBlock
            key={c._id}
            c={c}
            ref={targetRef}
            decoded={decoded}
            editingComment={editingComment}
            setEditingComment={setEditingComment}
            editingText={editingText}
            setEditingText={setEditingText}
            handleUpdateComment={handleUpdateComment}
            replyingTo={replyingTo}
            setReplyingTo={setReplyingTo}
            reply={reply}
            setReply={setReply}
            handleAddComment={handleAddComment}
            handleLike={handleLike}
            handleDislike={handleDislike}
            replies={replies}
            expandReplies={expandReplies}
            setExpandReplies={setExpandReplies}
            handleReplies={handleReplies}
            handleDelete={handleDelete}
          />
        ))}

        <div ref={loaderRef} style={{ height: "1px" }}></div>
        {!hasMore && <p className="text-center text-gray-400">No more comments.</p>}
      </div>
    </div>

  );
};

export default Comment;

