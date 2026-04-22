import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../api/ProfileApi";
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

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [errors, setErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [communities, setCommunities] = useState({ owned: [], followed: [] });
  const [prefs, setPrefs] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    email: "",
    password: "",
    comment: true,
    reply: true,
    community: true,
    event: true,
  });
  const { auth } = useAuth();
  const { profile, fetchProfile, loading } = useProfile();
  const navigate = useNavigate();

  const userId = auth?.user?._id;

  const safeProfile = profile || {};
  const socialLinks = safeProfile?.socialLinks || {};

  const profileEmail =
    safeProfile?.user?.email || auth?.user?.email || settingsForm.email || "";

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
    if (userId && !profile && !loading) {
      fetchProfile();
    }
  }, [userId, profile, loading, fetchProfile]);

  useEffect(() => {
    if (!userId) return;

    const loadDashboardData = async () => {
      setProfileLoading(true);
      setContentLoading(true);

      try {
        const [postsRes, savedRes, communitiesRes, prefsRes] = await Promise.all([
          postsApi.getPosts({ user_id: userId, limit: 20 }),
          getSavedPosts(),
          communityApi.getUserCommunities(""),
          getPreferences(userId).catch(() => null),
        ]);

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

        const prefData = prefsRes?.data || null;
        setPrefs(prefData);

        setSettingsForm((prev) => ({
          ...prev,
          email: safeProfile?.user?.email || auth?.user?.email || "",
          comment: !!prefData?.perType?.activities?.comment?.push,
          reply: !!prefData?.perType?.activities?.reply?.push,
          community: !!prefData?.perType?.updates?.newPost?.push,
          event: !!prefData?.perType?.updates?.eventInvite?.push,
        }));
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

  const handleSaveSettings = async () => {
    if (!userId) return;

    const nextPrefs = prefs
      ? {
          ...prefs,
          perType: {
            ...prefs.perType,
            activities: {
              ...prefs.perType.activities,
              comment: {
                ...prefs.perType.activities.comment,
                push: settingsForm.comment,
              },
              reply: {
                ...prefs.perType.activities.reply,
                push: settingsForm.reply,
              },
            },
            updates: {
              ...prefs.perType.updates,
              newPost: {
                ...prefs.perType.updates.newPost,
                push: settingsForm.community,
              },
              eventInvite: {
                ...prefs.perType.updates.eventInvite,
                push: settingsForm.event,
              },
            },
          },
        }
      : null;

    try {
      if (nextPrefs) {
        await updatePreferences(userId, nextPrefs);
        setPrefs(nextPrefs);
      }

      if (settingsForm.password.trim()) {
        toast("Password change is not wired to a profile endpoint yet.", {
          icon: "ℹ️",
        });
      }

      toast.success("Settings saved");
      setSettingsForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast.error("Could not save settings");
    }
  };

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

            <button
              onClick={() => setEditing(true)}
              className="absolute right-3 top-3 sm:right-5 sm:top-5 bg-medium-slate-blue hover:bg-medium-slate-blue-dark text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-semibold transition cursor-pointer shadow-lg"
            >
              <span className="material-icons text-base align-middle mr-1">edit</span>
              Edit Profile
            </button>
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
              <div className="mb-3">
                <h2 className="font-fenix text-[22px] leading-none text-periwinkle">
                  {safeProfile?.name || "User"}
                </h2>
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

              <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1.5 text-periwinkle text-sm">
                {Object.entries(socialLinks)
                  .filter(([, value]) => !!value)
                  .map(([key, value]) => (
                    <a
                      key={key}
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition capitalize"
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
              <p className="text-white text-base sm:text-lg mb-2">Your Communities</p>
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
            <div className="flex items-center gap-5 text-lg mb-2 overflow-x-auto pb-1">
              <button className={tabClass("posts")} onClick={() => setActiveTab("posts")}>Posts</button>
              <button className={tabClass("saved")} onClick={() => setActiveTab("saved")}>Saved</button>
              <button className={tabClass("settings")} onClick={() => setActiveTab("settings")}>Settings</button>
            </div>

            {editing ? (
              <div className="mt-4">
                <ProfileEdit
                  profile={safeProfile}
                  onSave={handleSave}
                  onCancel={() => setEditing(false)}
                  errors={errors}
                />
              </div>
            ) : (
              <>
                {activeTab === "posts" && (
                  <div className="space-y-2">
                    <h2 className="font-fenix text-[28px] leading-none text-white">Your Posts</h2>
                    {renderPostList(userPosts, "You have not posted yet.")}
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
                    <h2 className="font-fenix text-[28px] leading-none text-white">Account Settings</h2>

                    <div className="border border-navbar-border rounded-2xl p-4 sm:p-6 bg-navbar-bg/70">
                      <div className="space-y-3 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-3">
                          <label className="text-lg sm:text-xl text-white">Email Address</label>
                          <input
                            type="email"
                            value={settingsForm.email}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({ ...prev, email: e.target.value }))
                            }
                            className="w-full rounded-xl border border-navbar-border bg-dark-indigo px-4 py-2.5 text-base sm:text-lg text-white"
                            readOnly
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] items-center gap-3">
                          <label className="text-lg sm:text-xl text-white">Change Password</label>
                          <input
                            type="password"
                            value={settingsForm.password}
                            onChange={(e) =>
                              setSettingsForm((prev) => ({ ...prev, password: e.target.value }))
                            }
                            className="w-full rounded-xl border border-navbar-border bg-dark-indigo px-4 py-2.5 text-base sm:text-lg text-white"
                            placeholder="Enter new password"
                          />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-2xl sm:text-3xl font-semibold mb-3">Notification Preference</h3>
                        <div className="space-y-2.5 text-sm sm:text-lg text-columbia-blue">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsForm.comment}
                              onChange={(e) =>
                                setSettingsForm((prev) => ({ ...prev, comment: e.target.checked }))
                              }
                              className="w-4 h-4 accent-medium-slate-blue"
                            />
                            New comments on your posts
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsForm.reply}
                              onChange={(e) =>
                                setSettingsForm((prev) => ({ ...prev, reply: e.target.checked }))
                              }
                              className="w-4 h-4 accent-medium-slate-blue"
                            />
                            Replies to your comments
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsForm.community}
                              onChange={(e) =>
                                setSettingsForm((prev) => ({ ...prev, community: e.target.checked }))
                              }
                              className="w-4 h-4 accent-medium-slate-blue"
                            />
                            Community updates
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settingsForm.event}
                              onChange={(e) =>
                                setSettingsForm((prev) => ({ ...prev, event: e.target.checked }))
                              }
                              className="w-4 h-4 accent-medium-slate-blue"
                            />
                            Event reminders
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={handleSaveSettings}
                        className="mt-6 bg-medium-slate-blue hover:bg-medium-slate-blue-dark text-white text-base sm:text-lg font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
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
