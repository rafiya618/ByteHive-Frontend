import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import AdminSidebar from "../../components/admin/AdminSidebar";
import { adminCommunityApi } from "../../api/adminCommunityApi";
import BlogCard from "../../components/BlogListing/BlogCard";

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";

const Pill = ({ label, value }) => (
  <div className="flex items-center gap-2 px-3 py-2 bg-navbar-bg border border-navbar-border rounded-full text-sm text-white">
    <span className="text-desc">{label}:</span>
    <span className="font-semibold">{value}</span>
  </div>
);

const CommunityDetailAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [postsLoading, setPostsLoading] = useState(false);
  const [posts, setPosts] = useState([]);

  const ownerDisplay = community?.owner_username
    || community?.owner_name
    || community?.user_id?.username
    || community?.created_by?.username
    || "Unknown owner";

  const createdDate = community?.createdAt
    ? new Date(community.createdAt).toLocaleString()
    : "-";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await adminCommunityApi.get(id);
        setCommunity(res.community || res.data || null);
        setError("");
      } catch (err) {
        setError(err.message || "Failed to load community");
      } finally {
        setLoading(false);
      }
    };

    const fetchPosts = async () => {
      try {
        setPostsLoading(true);
        const res = await adminCommunityApi.posts(id, { page: 1, limit: 10 });
        const postList = res?.community?.posts || res?.posts || [];
        setPosts(Array.isArray(postList) ? postList : []);
      } catch (err) {
        console.error("Admin posts fetch failed", err);
        setPosts([]);
      } finally {
        setPostsLoading(false);
      }
    };

    fetchData();
    fetchPosts();
  }, [id]);

  const renderPosts = () => {
    if (postsLoading) {
      return <div className="text-desc">Loading posts...</div>;
    }

    if (!posts || posts.length === 0) {
      return <div className="text-desc">No posts available for this community.</div>;
    }

    // Normalize posts for BlogCard component
    const normalizedPosts = posts.map((post) => ({
      id: post._id,
      image: post.thumbnail || DEFAULT_IMAGE,
      community: post.community || "",
      date: post.date ? new Date(post.date).toLocaleDateString() : 
            post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "",
      readTime: post.read_time ? `${post.read_time} min` : "2 min",
      title: post.post_title || "",
      description: post.small_description || "",
      tags: post.tags || [],
      author: post.author || {
        name: post.author_username || "Unknown",
        avatar: "https://ui-avatars.com/api/?name=" + encodeURIComponent(post.author_username || "User"),
      },
      user_id: post.user_id || post.userId || post.author_id || null,
      upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : post.upvotes || 0,
      downvotes: Array.isArray(post.downvotes) ? post.downvotes.length : post.downvotes || 0,
      comments: Array.isArray(post.comments) ? post.comments.length : post.comments || 0,
      views: post.views || 0,
      bookmarked: false,
    }));

    return (
      <div className="space-y-4">
        {normalizedPosts.map((post) => (
          <div key={post.id} className="w-full">
            <BlogCard key={post.id} {...post} />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-rich-black flex">
      <AdminSidebar />
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-fenix text-[28px] text-white font-normal mb-2">Community Details</h2>
            <p className="text-gray-400 text-sm">Admin view with familiar cards</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-navbar-border rounded-lg text-white hover:bg-white/10"
          >
            Back
          </button>
        </div>

        {loading ? (
          <div className="text-desc">Loading...</div>
        ) : error ? (
          <div className="text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-4">{error}</div>
        ) : !community ? (
          <div className="text-desc">Community not found.</div>
        ) : (
          <div className="space-y-8">
            <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-6 flex flex-col md:flex-row gap-6 shadow-lg shadow-black/40">
              <img
                src={community.image || DEFAULT_IMAGE}
                alt={community.community_name}
                className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover"
              />
              <div className="flex-1 flex flex-col gap-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="text-white font-fenix text-3xl mb-1">{community.community_name}</h3>
                    <p className="text-desc text-sm">Owner: <span className="text-periwinkle font-semibold">{ownerDisplay}</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Pill label="Visibility" value={community.visible || "-"} />
                    <Pill label="Moderation" value={community.moderation || "-"} />
                    <Pill label="Created" value={createdDate} />
                  </div>
                </div>
                <p className="text-desc leading-relaxed">{community.description}</p>
                {community.community_tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {community.community_tags.map((tag) => (
                      <span key={tag} className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl">#{tag}</span>
                    ))}
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <Pill label="Followers" value={community.no_of_followers ?? 0} />
                  <Pill label="Posts" value={community.no_of_posts ?? 0} />
                  <Pill label="Views" value={community.no_of_views ?? 0} />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-fenix text-2xl">Community Posts</h3>
              </div>
              <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-5 shadow-lg shadow-black/30">
                {renderPosts()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityDetailAdmin;
