import React, { useState, useRef, useEffect } from "react";
import ActionButton from "../../shared/ActionButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css";
import { communityApi } from "../../api/communityApi";
import { postsApi } from "../../api/postsApi";
import { getUserIdFromToken } from "../../utils/authUtils";
import { useAuth } from "../../context/auth";

const PostFormCard = () => {
  const { auth } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [smallDescription, setSmallDescription] = useState("");
  const [tags, setTags] = useState("");
  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [mediaInputs, setMediaInputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState("Blog");
  const [error, setError] = useState("");
  
  // Community-related state
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);

  const quillRef = useRef(null);

  // Fetch available communities on component mount
  useEffect(() => {
    fetchAvailableCommunities();
  }, []);

  const fetchAvailableCommunities = async () => {
    setLoadingCommunities(true);
    try {
      const currentUserId = getUserIdFromToken();
      
      // Get user's communities (owned, followed, moderated)
      const userCommunities = await communityApi.getUserCommunities();
      
      // Filter communities where user can post based on permissions
      const postableCommunities = [];
      
      // Add owned communities (admin can always post)
      if (userCommunities.owned) {
        userCommunities.owned.forEach(community => {
          postableCommunities.push({
            ...community,
            canPost: true,
            reason: 'Admin'
          });
        });
      }
      
      // Add followed/moderated communities based on their moderation settings
      if (userCommunities.followed) {
        userCommunities.followed.forEach(community => {
          const isOwner = (community.userId || community.user_id) === currentUserId;
          const isModerator = community.moderators && community.moderators.includes(currentUserId);
          const isFollower = community.members && community.members.includes(currentUserId);
          
          // Skip if already added as owned
          if (isOwner) return;
          
          let canPost = false;
          let reason = '';
          
          if (community.moderation === 'allow all' && isFollower) {
            canPost = true;
            reason = 'Member (All allowed)';
          } else if (community.moderation === 'allow moderators' && isModerator) {
            canPost = true;
            reason = 'Moderator';
          } else if (community.moderation === 'only admin' && isOwner) {
            canPost = true;
            reason = 'Admin only';
          }
          
          if (canPost) {
            postableCommunities.push({
              ...community,
              canPost: true,
              reason
            });
          }
        });
      }
      
      console.log('Available communities for posting:', postableCommunities);
      setAvailableCommunities(postableCommunities);
      
      // Auto-select first community if available
      if (postableCommunities.length > 0) {
        setSelectedCommunityId(postableCommunities[0]._id);
      }
      
    } catch (err) {
      console.error('Error fetching communities:', err);
      
      // Handle specific connection errors
      if (err.message.includes('Failed to fetch') || err.message.includes('ERR_CONNECTION_REFUSED')) {
        setError('Communities service is unavailable. Please make sure the communities API is running on port 5001, or contact support.');
      } else if (err.message.includes('401') || err.message.includes('authorization')) {
        setError('Please log in again to access your communities.');
      } else {
        setError('Failed to load communities. Please try again later.');
      }
      
      // Set empty communities list
      setAvailableCommunities([]);
    } finally {
      setLoadingCommunities(false);
    }
  };

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike", "code"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      [{ align: [] }],
      ["link", "image", "code-block"],
      ["clean"],
    ],
    clipboard: { matchVisual: false },
  };

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule("toolbar");
      toolbar.addHandler("image", () => {
        const input = document.createElement("input");
        input.setAttribute("type", "file");
        input.setAttribute("accept", "image/*");
        input.click();
        input.onchange = () => {
          const file = input.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result;
              setMediaInputs((prev) => [...prev, base64]);
              const range = quill.getSelection(true);
              quill.insertEmbed(range.index, "image", base64);
              quill.setSelection(range.index + 1);
            };
            reader.readAsDataURL(file);
          }
        };
      });
    }
  }, [quillRef]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setThumbnail(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePublish = async (e) => {
    e.preventDefault();
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    if (!selectedCommunityId) {
      setError("Please select a community to post in.");
      return;
    }

    // Find selected community details
    const selectedCommunity = availableCommunities.find(c => c._id === selectedCommunityId);
    if (!selectedCommunity) {
      setError("Selected community is invalid.");
      return;
    }

    setLoading(true);
    try {
      const postData = {
        post_title: title.trim(),
        small_description: smallDescription.trim(),
        post_description: content,
        category: postType.toLowerCase(),
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        community: selectedCommunity.community_name, // Send community name as required by Posts model
        thumbnail,
        mediaInputs,
      };

      console.log('Attempting to create post with data:', postData);
      console.log('Selected community details:', selectedCommunity);

      const response = await postsApi.createPost(postData);
      
      console.log('Post creation response:', response);
      
      if (response.ok) {
        console.log('Post created successfully, now updating community post count...');
        console.log('Community ID for post count update:', selectedCommunityId);
        console.log('Post ID for community update:', response.post._id);
        
        // After successful post creation, update the community's post count
        try {
          const communityUpdateResponse = await communityApi.addPostToCommunity(selectedCommunityId, response.post._id);
          console.log('Community post count updated successfully:', communityUpdateResponse);
        } catch (communityUpdateError) {
          console.error('Failed to update community post count:', communityUpdateError);
          console.error('Community update error details:', {
            communityId: selectedCommunityId,
            postId: response.post._id,
            error: communityUpdateError.message
          });
          
          // Show a warning but don't fail the whole operation
          console.warn('Post was created but community post count may not be updated');
        }

        // Reset form
        setTitle("");
        setSmallDescription("");
        setContent("");
        setTags("");
        setSelectedCommunityId("");
        setThumbnail(null);
        setMediaInputs([]);
        setPostType("Blog");
        setError("");
        
        alert("Post created successfully! It's being processed in the background.");
      }
    } catch (err) {
      console.error('Error creating post:', err);
      let errorMessage = err.message || "Failed to create post. Please try again.";
      
      // Handle specific error cases
      if (errorMessage.includes('Cast to Number failed')) {
        errorMessage = 'User authentication error. Please log out and log in again.';
      } else if (errorMessage.includes('Route not found') || errorMessage.includes('404')) {
        errorMessage = 'Posts service is not available. Please check if the posts API is running on port 5000.';
      } else if (errorMessage.includes('403') || errorMessage.includes('Access denied')) {
        errorMessage = 'You do not have permission to post in this community.';
      } else if (errorMessage.includes('401') || errorMessage.includes('authorization')) {
        errorMessage = 'Please log in to create a post.';
      } else if (errorMessage.includes('400')) {
        errorMessage = 'Please check that all required fields are filled correctly.';
      } else if (errorMessage.includes('Community not found')) {
        errorMessage = 'Selected community no longer exists. Please refresh and try again.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'Server error. Please try again later or contact support.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className="bg-navbar-bg border border-navbar-border rounded-2xl p-6 flex flex-col gap-6 w-full"
      onSubmit={handlePublish}
    >
      {error && (
        <div className="bg-[#D9467C22] border border-[#D9467C] text-[#D9467C] px-3 py-2 rounded-md text-sm">
          {error}
          {error.includes('port 5001') && (
            <div className="mt-2 text-xs">
              <p>Troubleshooting steps:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Check if the communities API server is running on port 5001</li>
                <li>Verify the API server is accessible at http://localhost:5001</li>
                <li>Check for any firewall or network issues</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Post Type */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Post Type</label>
        <select
          className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm placeholder:text-desc focus:outline-none focus:border-periwinkle"
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
        >
          <option value="blog">Blog</option>
          <option value="question">Question</option>
        </select>
      </div>

      {/* Community Selection */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Select a Community</label>
        {loadingCommunities ? (
          <div className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-desc text-sm">
            Loading communities...
          </div>
        ) : availableCommunities.length === 0 ? (
          <div className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-desc text-sm">
            {error && error.includes('service is unavailable') 
              ? "Communities service is unavailable. Please try again later."
              : "No communities available. Join or create a community to start posting."
            }
          </div>
        ) : (
          <select
            className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle"
            value={selectedCommunityId}
            onChange={(e) => setSelectedCommunityId(e.target.value)}
            required
          >
            <option value="">Choose a community...</option>
            {availableCommunities.map((community) => (
              <option key={community._id} value={community._id}>
                {community.community_name} ({community.reason})
              </option>
            ))}
          </select>
        )}
        {selectedCommunityId && (
          <p className="text-xs text-desc">
            {availableCommunities.find(c => c._id === selectedCommunityId)?.reason === 'Admin' 
              ? "You can post as the community admin"
              : availableCommunities.find(c => c._id === selectedCommunityId)?.reason === 'Moderator'
              ? "You can post as a community moderator"
              : "You can post as a community member"
            }
          </p>
        )}
        
        {/* Add retry button when communities service is unavailable */}
        {error && error.includes('service is unavailable') && (
          <button
            type="button"
            onClick={() => {
              setError("");
              fetchAvailableCommunities();
            }}
            className="mt-2 px-3 py-1 text-xs bg-periwinkle text-white rounded hover:bg-periwinkle/80 transition-colors"
          >
            Retry Loading Communities
          </button>
        )}
      </div>

      {/* Title */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Post Title</label>
        <input
          type="text"
          placeholder="Enter a catchy title"
          className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Small Description */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Short Description</label>
        <input
          type="text"
          placeholder="A short summary"
          className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle"
          value={smallDescription}
          onChange={(e) => setSmallDescription(e.target.value)}
        />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Your Content</label>
        <div className="rounded-lg border border-navbar-border overflow-hidden">
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={setContent}
            modules={modules}
            formats={[
              "header",
              "bold",
              "italic",
              "underline",
              "strike",
              "code",
              "list",
              "bullet",
              "indent",
              "script",
              "align",
              "link",
              "image",
              "code-block",
            ]}
            placeholder="Start writing..."
            theme="snow"
            className="custom-quill"
          />
        </div>
      </div>

      {/* Cover Image */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Cover Image</label>
        <div
          className="border border-dashed border-navbar-border rounded-lg p-5 text-center text-desc cursor-pointer hover:border-periwinkle"
          onClick={() => document.getElementById("cover-image-input").click()}
        >
          <span className="material-icons text-2xl text-periwinkle mb-1">
            image
          </span>
          <p className="text-sm">Drag & drop or click to browse</p>
          <p className="text-xs mt-1">PNG, JPG, GIF up to 10MB</p>
          {thumbnail && (
            <img
              src={thumbnail}
              alt="cover"
              className="mx-auto mt-2 rounded-md max-h-32"
            />
          )}
          <input
            id="cover-image-input"
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleThumbnailChange}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Tags</label>
        <input
          type="text"
          placeholder="Add up to 5 tags (comma separated)"
          className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white placeholder:text-desc text-sm focus:outline-none focus:border-periwinkle"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
        />
        <p className="text-xs text-desc">Separate tags with commas.</p>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <ActionButton variant="secondary" type="button">
          Save Draft
        </ActionButton>
        <ActionButton 
          variant="primary" 
          type="submit" 
          disabled={loading || loadingCommunities || (availableCommunities.length === 0 && !error)}
        >
          {loading ? "Publishing..." : "Publish"}
        </ActionButton>
      </div>
    </form>
  );
};

export default PostFormCard;
