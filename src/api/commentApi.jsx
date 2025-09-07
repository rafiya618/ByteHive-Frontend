import axios from 'axios';

const API = axios.create({
  
  baseURL: import.meta.env.VITE_COMMENT_SERVICE_URL, // update if different
  // withCredentials: true, // if you're using cookies/auth
});

export const addComment = (commentPayload) => API.post(`/comment/add`, commentPayload);

export const getCommentsByPost = (postId, cursor, sortOrder = "latest") => API.get(`/comment/all/${postId}`, {
  params: {
      cursor,
      limit: 5,
      sort: sortOrder
    }
});

export const getcommentById = (commentId) => API.get(`/comment/${commentId}`);


export const getReplies = (postId, parentId) => API.get(`/comment/replies`, {
  params: { postId, parentId }
});

export const likeComment = (commentId, userId) => API.post(`/comment/like`, {
   commentId, userId 
});

export const dislikeComment = (commentId, userId) => API.post(`/comment/dislike`, {
   commentId, userId 
});
  
export const updateComment = (commentId, text) => API.post(`/comment/update`, {
   commentId, text
});

export const deleteComment = (commentId) => API.delete(`/comment/delete/${commentId}`)

