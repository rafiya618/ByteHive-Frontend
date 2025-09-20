import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import React, { forwardRef } from "react";
import InputField from "../../shared/InputField";

dayjs.extend(relativeTime);

const CommentBlock = forwardRef(
  (
    {
      c,
      auth,
      triggerId,
      editingComment,
      setEditingComment,
      editingText,
      setEditingText,
      handleUpdateComment,
      replyingTo,
      setReplyingTo,
      reply,
      setReply,
      handleAddComment,
      handleLike,
      handleDislike,
      replies,
      expandReplies,
      setExpandReplies,
      handleReplies,
      handleDelete,
      isReply = false,
    },
    ref
  ) => (
    <div
      id={`comment-${c._id}`}
      className={`flex flex-col sm:flex-row gap-3 mb-2 ${c.parentId ? "ml-6 sm:ml-12" : ""
        }`}
    >
      {/* Profile Image */}
      <img
        src={c.user.profileImage || "/default-avatar.png"}
        alt="Profile"
        className="w-10 h-10 rounded-full object-cover"
      />

      {/* Comment Content */}
      <div className={`flex-1 ${!c.parentId ? "bg-dark-indigo border border-faint-greyish-overlay rounded-md p-3" : ""}`}>
        {/* <div className={`${!c.parentId ? "bg-dark-indigo p-3" : ""}`}> */}

        <div ref={(el) => c._id === triggerId && (ref.current = el)} >
          {/* Editing Mode */}

          {editingComment[c._id] === c._id ? (
            <div className="flex flex-col sm:flex-row gap-2 ">
              <InputField
                type="text"
                value={editingText[c._id] ?? ""}
                onChange={(e) =>
                  setEditingText((prev) => ({ ...prev, [c._id]: e.target.value }))
                }
                placeholder="Edit your comment..."
              />
              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => handleUpdateComment(c._id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition"
                >
                  Post
                </button>
                <button
                  onClick={() => {
                    setEditingComment((prev) => ({ ...prev, [c._id]: "" }));
                    setEditingText((prev) => ({ ...prev, [c._id]: "" }));
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm sm:text-base mb-1">
                <strong>{c.user.username}</strong>{" "}
                <span className="text-gray-400 text-xs sm:text-sm">
                  &middot; {dayjs(c.createdAt).fromNow()}
                </span>
              </p>
              <p className="mb-2">{c.text}</p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-300 mt-2">
                <span
                  onClick={() => handleLike(c._id, auth?.user?._id)}
                  className="cursor-pointer hover:text-blue-400 transition"
                >
                  👍 {c.likes?.length || 0}
                </span>
                <span
                  onClick={() => handleDislike(c._id, auth?.user?._id)}
                  className="cursor-pointer hover:text-red-400 transition"
                >
                  👎 {c.dislikes?.length || 0}
                </span>
                <span
                  onClick={() => {
                    setReplyingTo((prev) => ({ ...prev, [c._id]: c._id }));
                    setReply((prev) => ({ ...prev, [c._id]: `@${c.user.username} ` }));
                  }}
                  className="cursor-pointer hover:text-green-400 transition"
                >
                  Reply
                </span>
                {c.userId === auth.user._id && (
                  <>
                    <span
                      onClick={() => {
                        setEditingText((prev) => ({ ...prev, [c._id]: c.text }));
                        setEditingComment((prev) => ({ ...prev, [c._id]: c._id }));
                      }}
                      className="cursor-pointer hover:text-yellow-400 transition"
                    >
                      Edit
                    </span>
                    <span
                      onClick={() => handleDelete(c._id)}
                      className="cursor-pointer hover:text-red-500 transition"
                    >
                      Delete
                    </span>
                  </>
                )

                }
              </div>
            </>
          )}
        </div>
        {/* </div> */}

        {/* Reply Input */}
        {replyingTo[c._id] === c._id && (
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            <InputField
              type="text"
              value={reply?.[c._id] ?? ""}
              onChange={(e) =>
                setReply((prev) => ({ ...prev, [c._id]: e.target.value }))
              }
              placeholder="Write a reply..."
            />
            <div className="flex gap-2 mt-2 sm:mt-0">
              <button
                onClick={(e) => handleAddComment(e, c)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white transition"
              >
                Post
              </button>
              <button
                onClick={() => {
                  setReply((prev) => ({ ...prev, [c._id]: "" }));
                  setReplyingTo((prev) => ({ ...prev, [c._id]: null }));
                }}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* View/Hide Replies */}
        {!isReply && c.replyCount > 0 && (
          <div
            onClick={() =>
              expandReplies[c._id]
                ? setExpandReplies((prev) => ({ ...prev, [c._id]: false }))
                : handleReplies(c._id)
            }
            className="mt-2 text-sm text-blue-400 cursor-pointer hover:underline"
          >
            {expandReplies[c._id] ? "Hide Replies" : `View Replies (${c.replyCount})`}
          </div>
        )}

        {/* Nested Replies */}
        {expandReplies[c._id] && (
          <div className="mt-4">
            {replies[c._id]?.map((replyComment) => (
              <CommentBlock
                key={replyComment._id}
                c={replyComment}
                ref={replyComment._id === triggerId ? ref : null}
                triggerId={triggerId}
                auth={auth}
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
                isReply={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
);

export default CommentBlock;
