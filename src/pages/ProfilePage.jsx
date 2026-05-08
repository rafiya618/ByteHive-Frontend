import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfile, updateProfile } from "../api/ProfileApi";
import ProfileEdit from "../components/Profile/ProfileEdit";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/auth";
import { useProfile } from "../context/profileContext";
import { postsApi } from "../api/postsApi";
import { getSavedPosts } from "../api/curationApi";
import { communityApi } from "../api/communityApi";
import { getPreferences, updatePreferences } from "../api/notificationApi";
import BlogCard from "../components/BlogListing/BlogCard";
import toast from "react-hot-toast";
import { registerPush } from "../helpers/registerPush";
import Modal from "../components/Modal/Modal";

const ProfilePage = () => {
  const { id: paramId } = useParams();
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [errors, setErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [communities, setCommunities] = useState({ owned: [], followed: [] });
  const [prefs, setPrefs] = useState(null);
  const [activeChannel, setActiveChannel] = useState("push");
  const [pendingPrefs, setPendingPrefs] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [viewedProfile, setViewedProfile] = useState(null);
  const { auth } = useAuth();
  const { profile: globalProfile, fetchProfile, loading: globalLoading } = useProfile();
  const navigate = useNavigate();

  const loggedInUserId = auth?.user?._id;
  const isMyProfile = !paramId || paramId === loggedInUserId;
  const userId = isMyProfile ? loggedInUserId : paramId;

  const profile = isMyProfile ? globalProfile : viewedProfile;
  const loading = isMyProfile ? globalLoading : profileLoading;

  const safeProfile = profile || {};
  const socialLinks = safeProfile?.socialLinks || {};

  const profileEmail =
    safeProfile?.user?.email || auth?.user?.email || "";

  const username =
    safeProfile?.username || safeProfile?.user?.username || auth?.user?.username || "";

  const postsCount = userPosts.length;
  const followingCount = communities.followed.length;
  const followersCount = safeProfile?.followersCount || safeProfile?.followers || 0;

  const allCommunities = useMemo(() => {
    const owned = (communities.owned || []).map((c) => ({
      id: c._id || c.id,
      name: c.community_name || c.name || "Community",
      type: "owned",
    }));
    const followed = (communities.followed || []).map((c) => ({
      id: c._id || c.id,
      name: c.community_name || c.name || "Community",
      type: "followed",
    }));
    return [...owned, ...followed];
  }, [communities]);

  const handleCommunityClick = (communityId) => {
    if (!communityId) return;
    navigate(`/community/${communityId}`);
  };

  useEffect(() => {
    if (isMyProfile) {
      if (userId && !globalProfile && !globalLoading) {
        fetchProfile();
      }
    } else if (userId && !viewedProfile && !profileLoading) {
      // Fetch other user's profile
      const fetchOtherProfile = async () => {
        setProfileLoading(true);
        try {
          const res = await getProfile(userId);
          setViewedProfile(res?.data);
        } catch (err) {
          console.error("Failed to fetch viewed profile:", err);
          toast.error("Could not load profile");
        } finally {
          setProfileLoading(false);
        }
      };
      fetchOtherProfile();
    }
  }, [userId, globalProfile, globalLoading, fetchProfile, isMyProfile, viewedProfile, profileLoading]);

  useEffect(() => {
    if (!userId) return;

    const loadDashboardData = async () => {
      setProfileLoading(true);
      setContentLoading(true);

      try {
        const promises = [
          postsApi.getPosts({ user_id: userId, limit: 20 }),
          communityApi.getUserCommunities("", false, userId) // Pass userId to get that user's communities
        ];

        if (isMyProfile) {
          promises.push(getSavedPosts());
          promises.push(getPreferences(userId).catch(() => null));
        }

        const results = await Promise.all(promises);
        const postsRes = results[0];
        const communitiesRes = results[1];
        const savedRes = isMyProfile ? results[2] : null;
        const prefsRes = isMyProfile ? results[3] : null;

        const postItems = postsRes?.posts || postsRes?.data?.posts || [];
        const normalizedPosts = Array.isArray(postItems)
          ? postItems.map((post) => ({
              id: post._id,
              image:
                post.thumbnail ||
                "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
              community: post.community || "General",
              date: post.createdAt
                ? new Date(post.createdAt).toLocaleDateString()
                : "",
              readTime: post.read_time ? `${post.read_time} min read` : "6 min read",
              title: post.post_title || "Untitled Post",
              description: post.small_description || "",
              tags: Array.isArray(post.tags) ? post.tags : [],
              author: {
                name: safeProfile?.name || auth?.user?.name || "You",
                avatar: safeProfile?.profileImage || "",
              },
              user_id: post.user_id || userId,
              upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : post.upvotes || 0,
              downvotes: Array.isArray(post.downvotes)
                ? post.downvotes.length
                : post.downvotes || 0,
              comments: Array.isArray(post.comments)
                ? post.comments.length
                : post.comments || 0,
              views: post.views || 0,
            }))
          : [];

        const savedItems = savedRes?.data || savedRes || [];
        const normalizedSaved = Array.isArray(savedItems)
          ? savedItems.map((savedItem) => {
              const post = savedItem.postDetails || savedItem;
              return {
                id: post._id || post.postId,
                image:
                  post.thumbnail ||
                  post.image ||
                  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
                community: post.community?.name || post.community || "General",
                date: new Date(
                  savedItem.savedAt || post.createdAt || Date.now()
                ).toLocaleDateString(),
                readTime: post.readTime || "6 min read",
                title: post.post_title || post.title || "Untitled Post",
                description:
                  post.small_description ||
                  (post.post_description || "").replace(/<[^>]*>/g, "") ||
                  "",
                tags: Array.isArray(post.tags) ? post.tags : [],
                author: post.author || {
                  name: "Unknown",
                  avatar: "",
                },
                user_id: post.user_id || post.userId,
                upvotes: Array.isArray(post.upvotes) ? post.upvotes.length : post.upvotes || 0,
                downvotes: Array.isArray(post.downvotes)
                  ? post.downvotes.length
                  : post.downvotes || 0,
                comments: Array.isArray(post.comments)
                  ? post.comments.length
                  : post.comments || 0,
                views: post.views || 0,
              };
            })
          : [];

        setUserPosts(normalizedPosts);
        setSavedPosts(normalizedSaved);
        setCommunities({
          owned: communitiesRes?.owned || [],
          followed: communitiesRes?.followed || [],
        });

        if (isMyProfile) {
          const prefData = prefsRes?.data || null;
          setPrefs(prefData);
          setPendingPrefs(prefData ? JSON.parse(JSON.stringify(prefData)) : null);

          setSettingsForm((prev) => ({
            ...prev,
            email: safeProfile?.user?.email || auth?.user?.email || "",
            comment: !!prefData?.perType?.activities?.comment?.push,
            reply: !!prefData?.perType?.activities?.reply?.push,
            community: !!prefData?.perType?.updates?.newPost?.push,
            likePost: !!prefData?.perType?.activities?.likePost?.push,
            likeComment: !!prefData?.perType?.activities?.likeComment?.push,
          }));
        }
      } catch (err) {
        console.error("Failed to load profile dashboard data:", err);
      } finally {
        setProfileLoading(false);
        setContentLoading(false);
      }
    };

    loadDashboardData();
  }, [userId, auth?.user?.email, auth?.user?.name, safeProfile?.name, safeProfile?.profileImage, safeProfile?.user?.email]);

  const handleSave = async (formData) => {
    try {
      if (!userId) return;
      setErrors({});

      await updateProfile(userId, formData);
      await fetchProfile();

      toast.success("Profile updated successfully!");
      setEditing(false);
    } catch (err) {
      console.error("Profile update failed:", err);

      if (err.response?.data?.field) {
        setErrors({
          [err.response.data.field]: err.response.data.message,
        });
      } else {
        toast.error("Failed to update profile. Try again.");
      }
    }
  };

  const updatePendingPrefs = (next) => {
    const base = pendingPrefs || prefs || {};
    const newPrefs = typeof next === "function" ? next(base) : next;
    setPendingPrefs(newPrefs);
    setIsDirty(JSON.stringify(newPrefs) !== JSON.stringify(prefs));
  };

  const handleSavePreferences = async () => {
    if (!userId || !pendingPrefs) return;
    setIsSaving(true);
    try {
      await updatePreferences(userId, pendingPrefs);
      setPrefs(pendingPrefs);
      setIsDirty(false);
      toast.success("Preferences updated");
    } catch (err) {
      console.error("Failed to update preferences:", err);
      toast.error("Could not save preferences");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePushToggle = async (checked) => {
    if (!currentPrefs) return;

    if (checked) {
      const result = await registerPush(userId);

      if (!result?.success) {
        if (result?.reason === "denied") {
          toast.error("Browser notification permission was denied.");
        } else if (result?.reason === "unsupported") {
          toast.error("This browser does not support push notifications.");
        } else {
          toast.error("Could not enable browser notifications.");
        }
        return;
      }
    }

    updatePendingPrefs({
      ...currentPrefs,
      global: { ...(currentPrefs.global || {}), [activeChannel]: checked },
    });
  };

  const currentPrefs = pendingPrefs || prefs;

  const tabClass = (tab) =>
    `text-[18px] font-semibold pb-1 border-b-2 transition whitespace-nowrap ${
      activeTab === tab
        ? "text-white border-periwinkle"
        : "text-columbia-blue/80 border-transparent hover:text-white"
    }`;

  const renderPostList = (items, emptyMessage) => {
    if (contentLoading) {
      return <div className="text-desc text-lg">Loading posts...</div>;
    }

    if (!items.length) {
      return (
        <div className="text-desc border border-navbar-border rounded-xl p-6 text-center text-sm sm:text-base">
          {emptyMessage}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {items.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            image={post.image}
            community={post.community}
            date={post.date}
            readTime={post.readTime}
            title={post.title}
            description={post.description}
            tags={post.tags}
            author={post.author}
            user_id={post.user_id}
            upvotes={post.upvotes}
            downvotes={post.downvotes}
            comments={post.comments}
            views={post.views}
          />
        ))}
      </div>
    );
  };

  return (
    <Layout>
      <div className="max-w-[1220px] mx-auto px-3 sm:px-4 pb-8 sm:pb-10">
        <section className="relative mt-4 sm:mt-5">
          <div className="relative rounded-2xl overflow-hidden border border-navbar-border">
            <div
              className="h-[128px] sm:h-[162px] bg-cover bg-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1600&q=80)",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/25 to-black/50" />

            {isMyProfile && (
              <button
                onClick={() => setEditing(true)}
                className="absolute right-3 top-3 sm:right-5 sm:top-5 bg-medium-slate-blue hover:bg-medium-slate-blue-dark text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg"
              >
                <span className="material-icons text-base align-middle mr-1">edit</span>
                Edit Profile
              </button>
            )}
          </div>

          <img
            src={safeProfile?.profileImage || "https://ui-avatars.com/api/?name=User&background=11101E&color=B0BAFF&size=256"}
            alt="profile"
            className="absolute bottom-[-28px] left-5 sm:left-6 w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-rich-black-light shadow-xl"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-[292px_1fr] gap-4 mt-9 sm:mt-10">
          <aside className="space-y-3">
            <div className="bg-navbar-bg border border-navbar-border rounded-xl p-4 relative">
              <div className="mb-3 flex items-center gap-3">
                <h2 className="font-fenix text-[22px] leading-none text-periwinkle">
                  {safeProfile?.name || "User"}
                </h2>
                {username && (
                  <span className="text-columbia-blue text-sm ml-2 opacity-70">@{username}</span>
                )}
              </div>

              <p className="text-desc text-sm leading-relaxed mb-3 max-w-[250px]">
                {safeProfile?.bio || "No bio added yet."}
              </p>

              <div className="space-y-1.5 text-columbia-blue text-[15px]">
                <p className="flex items-center gap-2">
                  <span className="material-icons text-base">mail</span>
                  {profileEmail || "No email"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-icons text-base">groups</span>
                  Joined {safeProfile?.createdAt ? new Date(safeProfile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently"}
                </p>
                <p className="flex items-center gap-2">
                  <span className="material-icons text-base">local_fire_department</span>
                  {safeProfile?.streakDays || 0} days streak
                </p>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-periwinkle text-sm">
                {Object.entries(socialLinks)
                  .filter(([, value]) => !!value)
                  .map(([key, value]) => (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={key}
                      className="inline-flex items-center gap-2 px-3 py-1 border border-navbar-border rounded-md text-columbia-blue text-sm hover:bg-white/5 transition-capitalize"
                    >
                      {key}
                    </a>
                  ))}
              </div>
            </div>

              <div className="bg-navbar-bg border border-navbar-border rounded-xl p-4">
              <h3 className="font-fenix text-[22px] text-periwinkle mb-2.5">Stats</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[22px] sm:text-[24px] font-bold text-periwinkle">{postsCount}</p>
                  <p className="text-columbia-blue text-xs sm:text-sm">Posts</p>
                </div>
                <div>
                  <p className="text-[22px] sm:text-[24px] font-bold text-periwinkle">{followingCount}</p>
                  <p className="text-columbia-blue text-xs sm:text-sm">Following</p>
                </div>
                <div>
                  <p className="text-[22px] sm:text-[24px] font-bold text-periwinkle">{followersCount}</p>
                  <p className="text-columbia-blue text-xs sm:text-sm">Followers</p>
                </div>
              </div>
            </div>

            <div className="bg-navbar-bg border border-navbar-border rounded-xl p-4">
              <h3 className="font-fenix text-[22px] text-periwinkle mb-2.5">Communities</h3>
              <p className="text-white text-base sm:text-lg mb-2">{isMyProfile ? 'Your' : 'Member'} Communities</p>
              <div className="space-y-2 mb-4">
                {allCommunities
                  .filter((community) => community.type === "owned")
                  .map((community) => (
                    <button
                      key={community.id}
                      type="button"
                      onClick={() => handleCommunityClick(community.id)}
                      className="w-full flex items-center gap-3 text-columbia-blue text-sm sm:text-base text-left hover:text-white transition cursor-pointer"
                    >
                      <span className="w-7 h-7 rounded-full bg-rich-black-light border border-navbar-border flex items-center justify-center text-xs">
                        {(community.name || "C").charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{community.name}</span>
                    </button>
                  ))}
              </div>

              <p className="text-white text-base sm:text-lg mb-2">Following</p>
              <div className="space-y-2">
                {allCommunities
                  .filter((community) => community.type === "followed")
                  .map((community) => (
                    <button
                      key={community.id}
                      type="button"
                      onClick={() => handleCommunityClick(community.id)}
                      className="w-full flex items-center gap-3 text-columbia-blue text-sm sm:text-base text-left hover:text-white transition cursor-pointer"
                    >
                      <span className="w-7 h-7 rounded-full bg-rich-black-light border border-navbar-border flex items-center justify-center text-xs">
                        {(community.name || "C").charAt(0).toUpperCase()}
                      </span>
                      <span className="truncate">{community.name}</span>
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          <section className="bg-rich-black/70 border border-navbar-border rounded-xl p-4 sm:p-5">
            <div className="flex items-center gap-5 text-lg mb-4 overflow-x-auto pb-1">
              <button className={tabClass("posts")} onClick={() => setActiveTab("posts")}>Posts</button>
              {isMyProfile && (
                <>
                  <button className={tabClass("saved")} onClick={() => setActiveTab("saved")}>Saved</button>
                  <button className={tabClass("settings")} onClick={() => setActiveTab("settings")}>Settings</button>
                </>
              )}
            </div>

            {editing ? (
              <Modal isOpen={editing} onClose={() => setEditing(false)}>
                <ProfileEdit
                  profile={safeProfile}
                  onSave={handleSave}
                  onCancel={() => setEditing(false)}
                  errors={errors}
                />
              </Modal>
            ) : (
              <>
                {activeTab === "posts" && (
                  <div className="space-y-2">
                    <h2 className="font-fenix text-[28px] leading-none text-white">{isMyProfile ? 'Your' : 'Member'} Posts</h2>
                    {renderPostList(userPosts, isMyProfile ? "You have not posted yet." : "This member has not posted yet.")}
                  </div>
                )}

                {activeTab === "saved" && (
                  <div className="space-y-2">
                    <h2 className="font-fenix text-[28px] leading-none text-white">Saved Posts</h2>
                    {renderPostList(savedPosts, "You have not saved any post yet.")}
                  </div>
                )}

                {activeTab === "settings" && (
                  <div className="space-y-2">
                    <h2 className="font-fenix text-[28px] leading-none text-white">Notification Preferences</h2>

                    {prefs ? (
                      <div className="border border-navbar-border rounded-2xl p-4 sm:p-6 bg-navbar-bg/70">
                        {/* Tabs for Push / Email */}
                        <div className="flex gap-4 mb-6 border-b border-navbar-border pb-4">
                          {["push", "email"].map((ch) => {
                            const isSelected = activeChannel === ch;
                            return (
                              <button
                                key={ch}
                                onClick={() => setActiveChannel(ch)}
                                className="font-semibold text-base sm:text-lg pb-1 transition-all cursor-pointer"
                                style={{
                                  color: isSelected ? "#B0BAFF" : "#77A3D4",
                                  borderBottom: isSelected ? "2px solid #B0BAFF" : "none",
                                  opacity: isSelected ? 1 : 0.85,
                                }}
                              >
                                {ch.charAt(0).toUpperCase() + ch.slice(1)}
                              </button>
                            );
                          })}
                        </div>

                        {/* Global toggle */}
                        <div className="flex items-center justify-between p-4 rounded-xl bg-dark-indigo/50 border border-navbar-border mb-6">
                          <span className="capitalize font-medium text-base sm:text-lg text-white">
                            Enable {activeChannel} Notifications
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={currentPrefs?.global?.[activeChannel]}
                              onChange={(e) =>
                                activeChannel === "push"
                                  ? handlePushToggle(e.target.checked)
                                  : updatePendingPrefs({
                                      ...currentPrefs,
                                      global: { ...(currentPrefs?.global || {}), [activeChannel]: e.target.checked },
                                    })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-gray-600 rounded-full transition-colors shadow-inner peer-checked:bg-medium-slate-blue"></div>
                            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 peer-checked:shadow-[0_0_10px_2px_rgba(168,85,247,0.7)]"></div>
                          </label>
                        </div>

                        {/* Per-type preferences grouped */}
                        <div className="space-y-6">
                          {["activities", "network", "updates"].map((group) => (
                            <div key={group}>
                              <h3 className="capitalize font-semibold mb-3 text-base sm:text-lg text-purple-300">
                                {group === "activities" ? "Social Interactions" : group === "network" ? "Connections" : "Content Updates"}
                              </h3>
                              <div className="space-y-2">
                                {Object.keys(currentPrefs?.perType?.[group] || {}).map((type) => {
                                  const typeDescriptions = {
                                    likePost: "Likes on your post",
                                    likeComment: "Likes on your comment",
                                    comment: "Comments on your post",
                                    reply: "Replies on your comment",
                                    mention: "Mentions of your username",
                                    follow: "Started following you",
                                    friendRequest: "Sent you a friend request",
                                    connectionAccepted: "Accepted your connection request",
                                    newPost: "Posted a new post",
                                    storyUpdate: "Updated their story",
                                    liveStream: "Started a live stream",
                                    eventInvite: "Sent you an event invite",
                                  };

                                  return (
                                    <div
                                      key={type}
                                      className={`p-4 rounded-xl border border-navbar-border transition-all ${
                                        currentPrefs?.global?.[activeChannel]
                                          ? "bg-dark-indigo/30 hover:bg-dark-indigo/50"
                                          : "bg-dark-indigo/10 opacity-50 cursor-not-allowed"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-sm sm:text-base text-columbia-blue">
                                          {typeDescriptions[type] || type}
                                        </span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={currentPrefs?.perType?.[group]?.[type]?.[activeChannel]}
                                            disabled={!currentPrefs?.global?.[activeChannel]}
                                            onChange={(e) =>
                                              updatePendingPrefs({
                                                ...currentPrefs,
                                                perType: {
                                                  ...(currentPrefs?.perType || {}),
                                                  [group]: {
                                                    ...(currentPrefs?.perType?.[group] || {}),
                                                    [type]: {
                                                      ...(currentPrefs?.perType?.[group]?.[type] || {}),
                                                      [activeChannel]: e.target.checked,
                                                    },
                                                  },
                                                },
                                              })
                                            }
                                            className="sr-only peer"
                                          />
                                          <div className="w-12 h-6 bg-gray-600 rounded-full transition-colors shadow-inner peer-checked:bg-medium-slate-blue peer-disabled:bg-gray-700"></div>
                                          <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-6 peer-checked:shadow-[0_0_10px_2px_rgba(168,85,247,0.7)] peer-disabled:cursor-not-allowed"></div>
                                        </label>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6 flex items-center justify-between">
                          <div>
                            {!currentPrefs?.global?.[activeChannel] && (
                              <p className="text-center text-columbia-blue italic mt-1 text-sm sm:text-base">
                                Turn on global {activeChannel} to enable these preferences.
                              </p>
                            )}
                          </div>
                          <div>
                            <button
                              onClick={handleSavePreferences}
                              disabled={!isDirty || isSaving}
                              className={`ml-2 bg-medium-slate-blue hover:bg-medium-slate-blue-dark text-white text-sm sm:text-base font-semibold px-4 py-2 rounded-xl transition ${(!isDirty || isSaving) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-columbia-blue py-8">Loading preferences...</div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>
        </div>

        {(loading || profileLoading) && (
          <p className="text-center text-columbia-blue mt-5">Loading profile...</p>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
