import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ActionButton from "../../shared/ActionButton";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css"; // 👈 add this
import { useAuth } from "../../context/auth";
import { communityApi } from "../../api/communityApi";
import { postsApi } from "../../api/postsApi";

const PostFormCard = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [smallDescription, setSmallDescription] = useState("");
  const [tags, setTags] = useState("");
  const [community, setCommunity] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [mediaInputs, setMediaInputs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [postType, setPostType] = useState("blog");
  const [error, setError] = useState("");
  const [allowedCommunities, setAllowedCommunities] = useState([]);
  const [loadingCommunities, setLoadingCommunities] = useState(true);
  const { auth } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const editPost = location.state?.editPost || null;
  const isEdit = Boolean(editPost && editPost._id);

  const quillRef = useRef(null);

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

  // Prefill when editing
  useEffect(() => {
    if (isEdit && editPost) {
      setTitle(editPost.post_title || "");
      setSmallDescription(editPost.small_description || "");
      setContent(editPost.post_description || "");
      setTags(Array.isArray(editPost.tags) ? editPost.tags.join(', ') : (editPost.tags || ""));
      setCommunity(editPost.community || "");
      setThumbnail(editPost.thumbnail || null);
      setPostType(editPost.category || "blog");
    }
  }, [isEdit, editPost]);

  // Fetch user's allowed communities on mount
  useEffect(() => {
    const fetchAllowedCommunities = async () => {
      try {
        setLoadingCommunities(true);

        if (!auth?.user) {
          setLoadingCommunities(false);
          return;
        }

        // communityApi.getUserCommunities extracts userId from JWT internally
        const response = await communityApi.getUserCommunities();

        // Determine permissions based on moderation settings
        const currentUserId = (
          auth?.user?._id ?? auth?.user?.id ?? auth?.user?.user_id ?? auth?.user?.sub ?? auth?.user?.userId ?? null
        );

        const uniqueById = (arr) => {
          const map = new Map();
          arr.forEach((c) => { if (c && c._id) map.set(c._id, c); });
          return Array.from(map.values());
        };

        const combined = uniqueById([...(response.owned || []), ...(response.followed || [])]);

        const isUserAllowedToPost = (comm) => {
          if (!comm) return false;
          const moderation = String(comm.moderation || 'only admin').toLowerCase();
          const owner = String(comm.user_id || '');
          const moderators = Array.isArray(comm.moderators) ? comm.moderators.map(String) : [];
          const members = Array.isArray(comm.members) ? comm.members.map(String) : [];
          const me = String(currentUserId || '');

          const isOwner = owner === me;
          if (isOwner) return true;

          if (moderation.includes('moderator')) {
            return moderators.includes(me);
          }
          if (moderation.includes('all')) {
            // allow if member/follower
            return members.includes(me);
          }
          // default "only admin"
          return false;
        };

        let allowed = combined.filter(isUserAllowedToPost);

        // If editing, ensure the original community is selectable even if not in allowed by moderation (owner-only edit path)
        if (isEdit && editPost?.community) {
          const exists = allowed.some(c => c.community_name === editPost.community);
          if (!exists) {
            // synthesize a minimal option for the existing community name
            allowed = [{ _id: 'current', community_name: editPost.community }, ...allowed];
          }
        }
        setAllowedCommunities(allowed);

        // Set first allowed community as default if available
        if (!isEdit) {
          if (allowed.length > 0) {
            setCommunity(allowed[0].community_name);
          } else {
            setCommunity("");
          }
        }
      } catch (err) {
        console.error("Failed to fetch communities:", err);
        setError("Failed to load communities. Please refresh.");
      } finally {
        setLoadingCommunities(false);
      }
    };

    if (auth?.user) {
      fetchAllowedCommunities();
    }
  }, [auth, isEdit, editPost?.community]);

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

    if (!community) {
      setError("Please select a community for your post.");
      return;
    }

    // Ensure selected community is still allowed
    const selectedAllowed = allowedCommunities.some(c => c.community_name === community);
    if (!selectedAllowed) {
      setError("You are not allowed to post in the selected community.");
      return;
    }

    setLoading(true);
    try {
      const userId = auth?.user?._id ?? auth?.user?.id ?? auth?.user?.user_id ?? auth?.user?.sub ?? auth?.user?.userId ?? 1;
      const payload = {
        post_title: title,
        small_description: smallDescription,
        post_description: content,
        category: postType,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        community,
        user_id: userId,
        thumbnail,
        mediaInputs,
      };

      let response;
      if (isEdit && editPost?._id) {
        response = await postsApi.updatePost(editPost._id, payload);
      } else {
        response = await postsApi.createPost(payload);
      }

      // If created a new post, sync it to the selected community
      if (!isEdit && response && response.ok && response.post && response.post._id) {
        try {
          const selected = allowedCommunities.find(c => c && c.community_name === community);
          const communityId = selected?._id;
          if (communityId && communityId !== 'current') {
            await communityApi.addPostToCommunity(communityId, response.post._id);
          }
        } catch (syncErr) {
          console.warn('Failed to add post to community list:', syncErr);
        }
      }

      // If editing, and community changed, move post between communities
      if (isEdit && response && response.ok && response.post && response.post._id) {
        const oldCommunityName = editPost?.community;
        const newCommunityName = community;
        if (oldCommunityName && newCommunityName && String(oldCommunityName).toLowerCase() !== String(newCommunityName).toLowerCase()) {
          try {
            // Helper to resolve community id by name
            const resolveCommunityIdByName = async (name) => {
              // Try from allowedCommunities first
              const fromAllowed = allowedCommunities.find(c => String(c?.community_name || '').toLowerCase() === String(name).toLowerCase());
              if (fromAllowed?._id && fromAllowed._id !== 'current') return fromAllowed._id;
              // Fallback to all communities
              const all = await communityApi.getAllCommunities();
              const list = all?.communities || all?.data || all;
              const matched = Array.isArray(list)
                ? list.find(c => String(c?.community_name || '').toLowerCase() === String(name).toLowerCase())
                : null;
              return matched?._id || null;
            };

            const [oldId, newId] = await Promise.all([
              resolveCommunityIdByName(oldCommunityName),
              resolveCommunityIdByName(newCommunityName)
            ]);

            if (oldId) {
              await communityApi.removePostFromCommunity(oldId, response.post._id);
            }
            if (newId) {
              await communityApi.addPostToCommunity(newId, response.post._id);
            }
          } catch (moveErr) {
            console.warn('Failed to move post between communities:', moveErr);
          }
        }
      }



      setLoading(false);
      setTitle("");
      setSmallDescription("");
      setContent("");
      setTags("");
      setCommunity(allowedCommunities.length > 0 ? allowedCommunities[0].community_name : "");
      setThumbnail(null);
      setMediaInputs([]);
      setPostType("blog");
      setError("");
      if (isEdit) {
        alert("Post updated!");
        navigate(`/post/${editPost._id}`);
      } else {
        alert("Post created!");
      }
    } catch (err) {
      setLoading(false);
      setError(
        err?.response?.data?.error ||
          err?.message ||
          "Failed to create post. Please try again."
      );
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

      {/* Community */}
      <div className="flex flex-col gap-1">
        <label className="text-white/90 font-fenix">Select a Community</label>
        <select
          className="w-full bg-navbar-bg border border-navbar-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-periwinkle"
          value={community}
          onChange={(e) => setCommunity(e.target.value)}
          disabled={loadingCommunities}
        >
          {loadingCommunities ? (
            <option value="">Loading communities...</option>
          ) : allowedCommunities.length === 0 ? (
            <option value="">No communities available</option>
          ) : (
            <>
              <option value="">-- Select a community --</option>
              {allowedCommunities.map((comm) => (
                <option key={comm._id} value={comm.community_name}>
                  {comm.community_name}
                </option>
              ))}
            </>
          )}
        </select>
        {!loadingCommunities && allowedCommunities.length === 0 && (
          <p className="text-xs text-desc">You must join or create a community first.</p>
        )}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-2">
        <ActionButton variant="secondary" type="button">
          Save Draft
        </ActionButton>
        <ActionButton variant="primary" type="submit" disabled={loading}>
          {loading ? "Publishing..." : "Publish"}
        </ActionButton>
      </div>
    </form>
  );
};

export default PostFormCard;
