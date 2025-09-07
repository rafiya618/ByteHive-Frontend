import dayjs from 'dayjs';
import React, { forwardRef } from 'react'
import relativeTime from 'dayjs/plugin/relativeTime'

const CommentBlock = forwardRef(({
  c,
  decoded,
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
  isReply = false
}, ref) => (

  <div id={`comment-${c._id}`} key={c._id} style={{ display: "flex", alignItems: "flex-start", marginBottom: "1.5rem" }}>
    {/* ✅ Show profile image */}
    <img
      src={c.user.profileImage || "/default-avatar.png"}
      alt="Profile"
      style={{
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover",
        marginRight: "10px"
      }}
    />

    <div>
      <div ref={(el) => { if (c._id === triggerId) ref.current = el; }}>
        {
          editingComment[c._id] == c._id ? (
            <>
              <input
                type="text"
                onChange={(e) => setEditingText(prev => ({ ...prev, [c._id]: e.target.value }))}
                value={editingText[c._id] ?? ""}
              />
              <button onClick={() => handleUpdateComment(c._id)}>Post</button>
              <button onClick={() => {
                setEditingComment(prev => ({...prev, [c._id]: ""}))
                setEditingText(prev => ({ ...prev, [c._id]: "" }))
              }}>Cancel</button>
            </>
          ) :
            <>
              <p style={{ margin: 0 }}>
                <strong>{c.user.username}  {c._id}</strong> &middot; <small>{dayjs(c.createdAt).fromNow()}</small>
              </p>

              <p style={{ margin: "5px 0" }}>{c.text}</p>
              <p>
                <span onClick={() => handleLike(c._id, decoded?._id)} style={{ cursor: "pointer", marginRight: "35px" }}>👍   {c.likes?.length || 0}</span>
                <span onClick={() => handleDislike(c._id, decoded?._id)} style={{ cursor: "pointer", marginRight: "35px" }}>👎   {c.dislikes?.length || 0}</span>
                <span onClick={() => {
                  setReplyingTo(prev => ({...prev, [c._id]: c._id}))
                  setReply(prev => ({...prev, [c._id]: `@${c.user.username} `}))
                  }} style={{ cursor: "pointer", marginRight: "35px" }}>reply</span>
                <span onClick={() => {
                  setEditingText(prev => ({ ...prev, [c._id]: c.text }))
                  setEditingComment(prev => ({...prev, [c._id]: c._id}))
                }}
                  style={{ cursor: "pointer", marginRight: "35px"  }}>Edit</span>
                <span style={{ cursor: "pointer"}} onClick={() =>  handleDelete(c._id)} >Delete</span>
              </p>
            </>

        }


      </div>

      {
        replyingTo[c._id] == c._id &&
        <>
          <input
            type="text"
            value={reply?.[c._id] ?? ""}
            placeholder="Write a reply..."
            onChange={(e) => setReply(prev => ({...prev, [c._id]: e.target.value }))}
          />
          <button onClick={(e) => handleAddComment(e, c)}>Post</button>
          <button onClick={ ()=> {
            setReply(prev => ({...prev, [c._id]: ""}))
            setReplyingTo(prev => ({...prev, [c._id]: null}))
          }}>Cancel</button>
        </>
      }



      { !isReply && c.replyCount > 0 && (
        expandReplies[c._id] ? (<div onClick={() => setExpandReplies(prev => ({ ...prev, [c._id]: false }))} style={{ cursor: "pointer" }}>Hide Replies </div>) : (<div onClick={() => handleReplies(c._id)} style={{ cursor: "pointer" }}>View Replies ({c.replyCount})</div>)
      )}

      {expandReplies[c._id] &&
        <div style={{ marginLeft: "20px", marginTop: "25px" }}>
          {replies[c._id]?.map((c) => <CommentBlock
            key={c._id}
            c={c}
            ref={c._id === triggerId ? ref : null}
            triggerId={triggerId}
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
            isReply={true}


          />)}
        </div>
      }
    </div>
  </div>
))

export default CommentBlock
