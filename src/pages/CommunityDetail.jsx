import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/auth";
import Navbar from "../shared/Navbar";
import CommunityFilterBar from "../components/CommunityDetail/CommunityFilterBar";
import BlogCard from "../components/BlogListing/BlogCard";
import MemberCard from "../components/CommunityDetail/MemberCard";
import JoinChatButton from "../components/CommunityDetail/JoinChatButton";
import VideoRoomButton from "../components/CommunityDetail/VideoRoomButton";
import NewPostButton from "../shared/NewPostButton";
import { Card, PrimaryButton, SecondaryButton } from "../components/UI";
import { communityApi } from "../api/communityApi";
import { postsApi } from "../api/postsApi";
import { getProfile } from "../api/ProfileApi";

const FILTERS = ["Posts", "Members", "About"];
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80";

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { auth, loading: authLoading } = useAuth(); // Use auth context directly

  const [selectedFilter, setSelectedFilter] = useState("Posts");
  const [community, setCommunity] = useState(null);
  const [moderatorInput, setModeratorInput] = useState("");
  const [modActionLoading, setModActionLoading] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [memberProfiles, setMemberProfiles] = useState({});
  const [membersLoading, setMembersLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Helper to get userId from auth user object robustly
  const getUserId = useCallback(() => {
    const user = auth?.user;
    if (!user) return null;
    return user._id || user.id || user.user_id || user.userId;
  }, [auth?.user]);

  const fetchCommunityData = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const userId = getUserId();
      console.log('🔍 Fetching community details for user:', userId);
      const response = await communityApi.getCommunityDetails(id, userId);
      console.log('📦 Community details response:', response);
      setCommunity(response.community);

      if (response.community?.hasRequested) {
        console.log('✅ Community hasRequested is true');
      }

      // Check if user is following this community
      const isUserFollowing = response.community.members?.includes(auth.user?._id);
      setIsFollowing(isUserFollowing);

    } catch (err) {
      console.error('Error fetching community details:', err);
      setError('Failed to load community details. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id, auth?.user?._id, getUserId]);

  const fetchCommunityPosts = useCallback(async () => {
    if (!id) return;

    setPostsLoading(true);
    try {
      console.log('=== Starting fetchCommunityPosts ===');
      console.log('Community ID:', id);
      console.log('Current community data:', community);

      // Step 1: Try to get the community's post IDs using the posts endpoint
      let postIds = [];

      try {
        console.log('Step 1: Attempting to get posts via getCommunityPosts API...');
        const userId = auth.user?._id;
        const communityPostsResponse = await communityApi.getCommunityPosts(id, userId);
        console.log('getCommunityPosts response:', communityPostsResponse);
        postIds = communityPostsResponse.community?.posts || [];
        console.log('Post IDs from API:', postIds);
      } catch (apiError) {
        console.warn('getCommunityPosts API failed, trying fallback:', apiError);
      }

      // Step 1.5: Fallback - if no posts from API, try using community data we already have
      if (postIds.length === 0 && community?.posts) {
        console.log('Fallback: Using posts from existing community data:', community.posts);
        postIds = community.posts;
      }

      // Step 1.75: Last resort fallback - refresh community details and get posts
      if (postIds.length === 0) {
        try {
          const userId = auth.user?._id;
          const freshCommunityResponse = await communityApi.getCommunityDetails(id, userId);
          console.log('Fresh community response:', freshCommunityResponse);

          if (freshCommunityResponse.community?.posts) {
            postIds = freshCommunityResponse.community.posts;
            console.log('Post IDs from fresh community details:', postIds);

            // Update the community state with fresh data
            setCommunity(freshCommunityResponse.community);
          }
        } catch (fallbackError) {
          console.error('Fresh community details fetch failed:', fallbackError);
        }
      }

      console.log('Final post IDs to fetch:', postIds);

      if (postIds.length === 0) {
        console.log('No post IDs found, setting empty posts array');
        setPosts([]);
        return;
      }

      // Step 2: Fetch full post details for each post ID
      console.log('Step 2: Fetching full post details...');
      const postPromises = postIds.map(async (postId, index) => {
        try {
          console.log(`Fetching post ${index + 1}/${postIds.length}: ${postId}`);
          const response = await postsApi.getPostById(postId, { includeUnapproved: true });
          console.log(`Post ${postId} response:`, response);
          return response.ok ? response.post : null;
        } catch (error) {
          console.error(`Error fetching post ${postId}:`, error);
          return null;
        }
      });

      const postResponses = await Promise.all(postPromises);
      const validPosts = postResponses.filter(post => post !== null);

      console.log('Valid posts fetched:', validPosts.length);
      console.log('Post details:', validPosts);

      // Step 3: Transform posts to match BlogCard expected format
      const transformedPosts = validPosts.map((post) => {
        const transformed = {
          id: post._id,
          image: post.thumbnail || DEFAULT_IMAGE,
          community: post.community || community?.community_name || "",
          date: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "",
          readTime: post.read_time || "6 min",
          title: post.post_title || "",
          description: post.small_description || "",
          tags: Array.isArray(post.tags) ? post.tags : [],
          // Leave author unknown so BlogCard fetches profile via user_id
          author: {
            name: "Unknown",
            avatar: "",
          },
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
          comments: post.comments || 0,
          views: post.views || 0,
          bookmarked: false,
          user_id: post.user_id // Pass user_id to BlogCard for profile fetching
        };
        console.log('Transformed post with user_id:', transformed);
        return transformed;
      });

      console.log('Final transformed posts with user_id:', transformedPosts);
      setPosts(transformedPosts);
      console.log('=== fetchCommunityPosts completed ===');

    } catch (err) {
      console.error('Error in fetchCommunityPosts:', err);
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }, [id, community, auth?.user?._id]);

  const fetchMemberProfiles = useCallback(async () => {
    if (!community?.members || community.members.length === 0) {
      console.log('No members to fetch profiles for');
      return;
    }

    setMembersLoading(true);
    try {
      console.log('Fetching profiles for community members:', community.members);

      const memberIds = community.members.filter(Boolean);

      if (memberIds.length === 0) {
        console.log('No valid member IDs found');
        return;
      }

      const profilePromises = memberIds.map(async (memberId) => {
        try {
          console.log(`Fetching profile for member: ${memberId}`);
          // Use getProfile by passing an object with user_id as requested
          const profileRes = await getProfile({ userId: memberId });
          console.log(`Profile response for member ${memberId}:`, profileRes);

          const profile = profileRes?.data;

          if (profile) {
            return {
              id: memberId,
              ...profile,
              name: profile.name || profile.user?.name || profile.username || "Unknown User",
              avatar: profile.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || profile.username || 'User')}&background=0D8ABC&color=fff`,
              bio: profile.bio || "No bio available",
              joinDate: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "Unknown",
              email: profile.user?.email || profile.email || "Email not available"
            };
          } else {
            console.log(`No profile data found for member: ${memberId}`);
            return {
              id: memberId,
              name: "Unknown User",
              avatar: `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`,
              bio: "Profile unavailable",
              joinDate: "Unknown",
              email: "Email not available"
            };
          }
        } catch (error) {
          // Handle 404 (not found) and other errors gracefully
          if (error?.response?.status === 404) {
            console.warn(`Profile not found for member ${memberId}:`, error.response?.data);
          } else {
            console.error(`Error fetching profile for member ${memberId}:`, error);
          }
          return {
            id: memberId,
            name: "Unknown User",
            avatar: `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`,
            bio: "Profile unavailable",
            joinDate: "Unknown",
            email: "Email not available"
          };
        }
      });

      const memberProfilesData = await Promise.all(profilePromises);
      const profilesMap = {};

      memberProfilesData.forEach(profile => {
        profilesMap[profile.id] = profile;
      });

      console.log('Member profiles loaded:', profilesMap);
      setMemberProfiles(profilesMap);
    } catch (error) {
      console.error('Error fetching member profiles:', error);
    } finally {
      setMembersLoading(false);
    }
  }, [community?.members]);

  // Initialize auth check and fetch community data
  useEffect(() => {
    if (!authLoading && !auth?.token) {
      navigate('/login', {
        state: { from: `/community/${id}` },
        replace: true
      });
      return;
    }

    if (!authLoading && auth?.token) {
      fetchCommunityData();
    }
  }, [id, auth, authLoading, navigate, fetchCommunityData]);

  // Fetch community posts when community is loaded or filter changes to Posts
  useEffect(() => {
    if (community && selectedFilter === "Posts") {
      fetchCommunityPosts();
    }
  }, [community, selectedFilter, fetchCommunityPosts]);

  // Fetch member profiles when community loads or Members tab is selected
  useEffect(() => {
    const isOwnerOrAdmin = community?.user_id === auth?.user?._id || community?.user_id?._id === auth?.user?._id || auth?.user?.role === 'admin';
    if (community && (selectedFilter === "Members" || isOwnerOrAdmin) && community.members && community.members.length > 0) {
      fetchMemberProfiles();
    }
  }, [community, selectedFilter, auth?.user, fetchMemberProfiles]);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (isFollowing || community?.hasRequested) {
        await communityApi.unfollowCommunity(id);
        setIsFollowing(false);
        // Update local community data
        setCommunity(prev => ({
          ...prev,
          members: prev.members?.filter(memberId => memberId !== auth.user._id) || [],
          hasRequested: false, // Ensure this is cleared
          no_of_followers: isFollowing ? Math.max(0, (prev.no_of_followers || 1) - 1) : prev.no_of_followers
        }));
      } else {
        const res = await communityApi.followCommunity(id);

        if (res.status === 'requested') {
          setCommunity(prev => ({ ...prev, hasRequested: true }));
          return; // Don't set isFollowing yet
        }

        setIsFollowing(true);
        // Update local community data with auth.user._id
        setCommunity(prev => ({
          ...prev,
          members: [...(prev.members || []), auth.user._id],
          no_of_followers: (prev.no_of_followers || 0) + 1,
          hasRequested: false
        }));
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      // Check if error message is "Join request already pending"
      if (err.message === 'Join request already pending') {
        setCommunity(prev => ({ ...prev, hasRequested: true }));
      } else {
        setError(`Failed to ${isFollowing || community?.hasRequested ? 'unfollow' : 'follow'} community. Please try again.`);
        setTimeout(() => setError(null), 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditCommunity = () => {
    if (!community) return;
    navigate('/create-community', { state: { editCommunity: community } });
  };

  const handleDeleteCommunity = async () => {
    if (!community || deleting) return;
    const confirmed = window.confirm('Are you sure you want to delete this community? This cannot be undone.');
    if (!confirmed) return;

    try {
      setDeleting(true);
      await communityApi.deleteCommunity(community._id);
      navigate('/communities', { state: { refreshCommunities: true } });
    } catch (err) {
      console.error('Error deleting community:', err);
      setError(err.message || 'Failed to delete community. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  // Admin: add/remove moderators
  const handleAddModeratorAdmin = async () => {
    if (!community || !moderatorInput.trim()) return;
    try {
      setModActionLoading(true);
      await communityApi.addModerator(community._id, moderatorInput.trim());
      const userId = getUserId();
      const updated = await communityApi.getCommunityDetails(community._id, userId);
      setCommunity(updated.community);
      setModeratorInput("");
    } catch (err) {
      console.error('Add moderator failed:', err);
      alert(err.message || 'Failed to add moderator');
    } finally {
      setModActionLoading(false);
    }
  };

  const handleRemoveModeratorAdmin = async (userId) => {
    try {
      setModActionLoading(true);
      await communityApi.removeModerator(community._id, userId);
      const currentUserId = getUserId();
      const updated = await communityApi.getCommunityDetails(community._id, currentUserId);
      setCommunity(updated.community);
    } catch (err) {
      console.error('Remove moderator failed:', err);
      alert(err.message || 'Failed to remove moderator');
    } finally {
      setModActionLoading(false);
    }
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!auth?.token) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-white text-lg">Loading community...</div>
      </div>
    );
  }

  // Error state
  if (error && !community) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
          <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <div className="flex justify-center">
            <PrimaryButton onClick={fetchCommunityData} className="px-4 py-2.5">Try Again</PrimaryButton>
          </div>
        </div>
      </div>
    );
  }

  // No community found
  if (!community) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-desc text-lg mb-4">Community not found</div>
        </div>
      </div>
    );
  }

  const currentUserId = getUserId();
  const isOwner = String(community?.user_id?._id || community?.user_id) === String(currentUserId);
  const memberPreview = (community?.members || []).slice(0, 5);
  const joinedAtLabel = community?.createdAt
    ? new Date(community.createdAt).toLocaleDateString()
    : "Recently";
  const ownerName = community?.user_id?.name || community?.user_id?.username || "Bot";
  const topicPreview = Array.isArray(community?.community_tags)
    ? community.community_tags.slice(0, 6)
    : [];

  const canPost = () => {
    if (!community || !auth?.user) return false;
    const userId = auth.user._id || auth.user.id;
    const commOwnerId = community.user_id?._id || community.user_id;
    
    const isAdmin = String(commOwnerId) === String(userId);
    const isModerator = community.moderators?.map(String).includes(String(userId));
    const isMember = community.members?.map(String).includes(String(userId));
    
    const moderation = String(community.moderation || 'only admin').toLowerCase();
    
    if (moderation === 'only admin') return isAdmin;
    if (moderation === 'allow moderators') return isAdmin || isModerator;
    if (moderation === 'allow all') return isAdmin || isModerator || isMember;
    
    return isAdmin;
  };

  const renderContent = () => {
    switch (selectedFilter) {
      case "Posts":
        return (
          <div className="flex flex-col gap-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="font-fenix text-3xl md:text-4xl text-white font-normal">Community Posts</h2>
              {canPost() && <NewPostButton />}
            </div>

            {postsLoading ? (
              <div className="text-center text-desc py-8">
                Loading posts...
              </div>
            ) : (
              <div className="flex flex-col gap-7">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <BlogCard
                      key={post.id}
                      {...post}
                    />
                  ))
                ) : (
                  <div className="text-center text-desc py-8">
                    No posts found in this community.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      case "Members":
        return (
          <div className="flex flex-col gap-6 pb-12">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <h2 className="font-fenix text-3xl md:text-4xl text-white font-normal">Community Members</h2>
              {membersLoading && (
                <div className="text-desc text-sm">Loading member profiles...</div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {community.members && community.members.length > 0 ? (
                // Sort members: Admin first, then moderators, then regular members
                community.members
                  .map(memberId => {
                    const memberProfile = memberProfiles[memberId];
                    const isAdmin = community.user_id === memberId || community.user_id?._id === memberId;
                    const isModerator = community.moderators && community.moderators.includes(memberId);

                    return {
                      memberId,
                      memberProfile,
                      isAdmin,
                      isModerator,
                      sortOrder: isAdmin ? 0 : (isModerator ? 1 : 2) // Admin = 0, Moderator = 1, Member = 2
                    };
                  })
                  .sort((a, b) => a.sortOrder - b.sortOrder) // Sort by role priority
                  .map(({ memberId, memberProfile, isAdmin, isModerator }) => (
                    <MemberCard
                      key={memberId}
                      id={memberId}
                      name={memberProfile?.name || (membersLoading ? "Loading..." : "Unknown User")}
                      avatar={memberProfile?.avatar || "https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff"}
                      username={memberProfile?.username || ""}
                      isAdmin={isAdmin}
                      isModerator={isModerator}
                      loading={membersLoading && !memberProfile}
                    />
                  ))
              ) : (
                <div className="col-span-full text-center text-desc py-8">
                  No members found in this community.
                </div>
              )}
            </div>
          </div>
        );

      case "About":
        return (
          <div className="pb-12">
            <h2 className="font-fenix text-3xl md:text-4xl text-white font-normal mb-8">About the Community</h2>
            <div
              className="bg-navbar-bg rounded-2xl p-8 border"
              style={{
                border: "1px solid var(--navbar-border)",
              }}
            >
              <div className="space-y-6 text-columbia-blue">
                <p className="font-lato text-lg leading-relaxed">
                  {community.description}
                </p>

                <div>
                  <h4 className="font-lato font-semibold text-white text-lg mb-3">Community Settings</h4>
                  <ul className="space-y-2 font-lato">
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      Visibility: {community.visible === 'public' ? 'Public' : 'Private'}
                    </li>
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      Moderation: {community.moderation}
                    </li>
                    {community.community_tags && community.community_tags.length > 0 && (
                      <li className="flex items-start">
                        <span className="text-periwinkle mr-2">•</span>
                        Tags: {community.community_tags.join(', ')}
                      </li>
                    )}
                  </ul>
                </div>

                <div>
                  <h4 className="font-lato font-semibold text-white text-lg mb-3">Community Admin</h4>
                  <p className="font-lato leading-relaxed">
                    Created by {ownerName}
                    {community.createdAt && ` on ${new Date(community.createdAt).toLocaleDateString()}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-rich-black flex flex-col relative">
      <Navbar />

      {/* Error Message */}
      {error && (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-600/20 border border-red-600/30 rounded-2xl p-4 text-red-400">
            {error}
          </div>
        </div>
      )}

      {/* Community Header */}
      <div className="w-full flex justify-center pt-8 pb-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-7xl">
          {/* Community Info */}
          <div className="mb-6 rounded-3xl border border-navbar-border bg-navbar-bg/70 p-6 md:p-7">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-8 flex-1">
                <div className="relative flex-shrink-0">
                  <img
                    src={community?.image || DEFAULT_IMAGE}
                    alt={community?.community_name}
                    className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border border-navbar-border"
                  />
                  {community?.visible === 'private' && (
                    <div className="absolute bottom-1 right-1 bg-black/40 backdrop-blur-sm rounded-full w-8 h-8 flex items-center justify-center border border-white/20">
                      <span className="material-icons text-white text-lg">lock</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
                    <h1 className="font-fenix text-3xl md:text-4xl text-white font-normal mb-0">
                      {community?.community_name}
                    </h1>

                    {/* Action Buttons - positioned at title level */}
                    <div className="flex flex-wrap gap-3 flex-shrink-0">
                      {isOwner && (
                        <>
                          <SecondaryButton onClick={handleEditCommunity} className="px-4 py-2.5 rounded-full text-sm">Edit</SecondaryButton>
                          <SecondaryButton onClick={handleDeleteCommunity} className="px-4 py-2.5 rounded-full text-sm text-red-300 border-red-400" disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete'}
                          </SecondaryButton>
                        </>
                      )}
                      <button
                        onClick={handleFollowToggle}
                        disabled={loading}
                        className={`ds-btn px-4 py-2.5 rounded-xl font-lato font-semibold text-sm border transition-all ${isFollowing
                          ? isOwner
                            ? "border-periwinkle bg-transparent text-periwinkle cursor-default"
                            : "border-periwinkle bg-transparent text-periwinkle hover:bg-periwinkle/10"
                          : community?.hasRequested
                            ? "border-yellow-500 bg-transparent text-yellow-500 cursor-pointer hover:border-red-500 hover:text-red-400" // Requested state
                            : "border-white bg-transparent text-white hover:bg-white/10"
                          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="flex items-center">
                          <span className="material-icons text-base mr-1">
                            {isFollowing ? "check" : (community?.hasRequested ? "hourglass_empty" : "add")}
                          </span>
                          {isFollowing ? (isOwner ? "Admin" : "Following") : (community?.hasRequested ? "Requested" : "Follow")}
                        </span>
                      </button>
                      <JoinChatButton />
                      <VideoRoomButton />
                    </div>
                  </div>

                  {/* Description spans full width under buttons */}
                  <p className="font-lato text-columbia-blue text-base md:text-lg leading-relaxed mb-4 pr-4 max-w-4xl">
                    {community?.description}
                  </p>

                  <div className="flex flex-wrap gap-2 text-xs sm:text-sm">
                    <span className="px-3 py-1 rounded-full border border-navbar-border bg-rich-black-light/70 text-columbia-blue">
                      Started {joinedAtLabel}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-navbar-border bg-rich-black-light/70 text-columbia-blue">
                      Curated by @{ownerName}
                    </span>
                    <span className="px-3 py-1 rounded-full border border-navbar-border bg-rich-black-light/70 text-columbia-blue">
                      {community?.visible === 'public' ? 'Open Community' : 'Private Circle'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex justify-center px-4 lg:px-8 pb-10">
        <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-4 items-start">
          <main className="min-w-0 space-y-4">
            {/* Community owner or global admin: moderator management panel */}
            {(isOwner || auth?.user?.role === 'admin') && String(community?.moderation || "").toLowerCase() === "allow moderators" && (
              <Card className="p-5 md:p-6">
                <h4 className="text-white font-fenix text-lg mb-3">Moderator Management</h4>
                <div className="flex flex-col md:flex-row gap-3 md:items-center">
                  <select
                    value={moderatorInput}
                    onChange={(e) => setModeratorInput(e.target.value)}
                    className="flex-1 bg-navbar-bg border border-navbar-border rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-periwinkle"
                  >
                    <option value="">Select a member to add as moderator</option>
                    {community?.members?.filter(mId => {
                      const ownerId = community.user_id?._id || community.user_id;
                      const moderators = community.moderators || [];
                      return !moderators.map(String).includes(String(mId)) && String(mId) !== String(ownerId);
                    }).map(mId => (
                      <option key={mId} value={mId}>
                        {memberProfiles[mId]?.name || memberProfiles[mId]?.username || `User ${mId.substring(0, 5)}...`}
                      </option>
                    ))}
                  </select>
                  <PrimaryButton onClick={handleAddModeratorAdmin} disabled={modActionLoading || !moderatorInput.trim()} className="px-4 py-2.5">
                    {modActionLoading ? 'Adding...' : 'Add Moderator'}
                  </PrimaryButton>
                </div>
                {community?.moderators?.length > 0 && (
                  <div className="mt-4">
                    <p className="text-desc mb-2">Current Moderators:</p>
                    <div className="flex flex-wrap gap-2">
                      {community.moderators.map((mId) => {
                        const profile = memberProfiles[mId];
                        return (
                          <div key={mId} className="flex items-center gap-2 bg-chip/50 border border-periwinkle/30 text-periwinkle px-3 py-1.5 rounded-xl hover:bg-chip transition-colors group">
                            <span className="text-sm font-medium">{profile?.name || profile?.username || `User ${mId.substring(0, 5)}...`}</span>
                            <button
                              onClick={() => handleRemoveModeratorAdmin(mId)}
                              disabled={modActionLoading}
                              title="Remove Moderator"
                              className="text-pinkish/70 hover:text-pinkish transition-colors flex items-center justify-center"
                            >
                              <span className="material-icons text-[18px]">cancel</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </Card>
            )}

            <CommunityFilterBar
              filters={FILTERS}
              selected={selectedFilter}
              onSelect={setSelectedFilter}
            />

            {community.isPrivateAndNotJoined ? (
              <div className="flex flex-col items-center justify-center py-20 bg-navbar-bg/50 rounded-2xl border border-white/5">
                <span className="material-icons text-6xl text-gray-500 mb-4">lock</span>
                <h3 className="text-2xl font-bold text-white mb-2">Private Community</h3>
                <p className="text-gray-400 mb-8">Follow this community to request access.</p>
              </div>
            ) : (
              renderContent()
            )}
          </main>

          <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <Card className="p-5 md:p-6 space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={community?.image || DEFAULT_IMAGE}
                  alt={community?.community_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-navbar-border shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-desc text-xs uppercase tracking-[0.18em] mb-1">Community</p>
                  <h3 className="font-fenix text-[22px] text-white leading-tight break-words">{community?.community_name}</h3>
                  <p className="text-desc text-sm mt-2 line-clamp-3">{community?.description}</p>
                </div>
              </div>

              <div className="rounded-xl border border-navbar-border bg-rich-black-light/70 p-4 space-y-3">
                <p className="text-xs uppercase tracking-wide text-desc">What to expect here</p>
                <ul className="space-y-2 text-sm text-columbia-blue">
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-base text-periwinkle">forum</span>
                    Member-driven discussions and knowledge sharing
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-base text-periwinkle">tips_and_updates</span>
                    Practical posts and real-world experiences
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="material-icons text-base text-periwinkle">groups</span>
                    A focused space around shared interests
                  </li>
                </ul>
              </div>
            </Card>

            <Card className="p-5 md:p-6 space-y-3">
              <h4 className="font-fenix text-[20px] text-white">Community Notes</h4>
              <div className="space-y-2 text-sm text-desc">
                <p><span className="text-white">Created by:</span> @{ownerName}</p>
                <p><span className="text-white">Started:</span> {joinedAtLabel}</p>
                <p><span className="text-white">Space type:</span> {community?.visible === 'public' ? 'Open to discover' : 'Private by request'}</p>
              </div>
              {topicPreview.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {topicPreview.map((tag) => (
                    <span key={tag} className="bg-chip text-periwinkle text-xs font-semibold px-3 py-1 rounded-xl">#{tag}</span>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5 md:p-6 space-y-3">
              <h4 className="font-fenix text-[20px] text-white">Top Members</h4>
              {memberPreview.length > 0 ? (
                <div className="space-y-3">
                  {memberPreview.map((memberId) => {
                    const profile = memberProfiles[memberId];
                    return (
                      <div key={memberId} className="flex items-center gap-3 rounded-xl border border-navbar-border bg-rich-black-light/60 px-3 py-2">
                        <img
                          src={profile?.avatar || `https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff`}
                          alt={profile?.name || 'Member'}
                          className="w-10 h-10 rounded-full object-cover border border-navbar-border"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-white text-sm truncate">{profile?.name || profile?.username || `User ${String(memberId).slice(0, 6)}...`}</p>
                          <p className="text-desc text-xs truncate">{profile?.bio || 'Community member'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-desc text-sm">No members to preview yet.</p>
              )}
            </Card>

          </aside>
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;