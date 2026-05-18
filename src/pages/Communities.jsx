// Removed hardcoded data and integrated real communities fetching from backend APIs
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";
import SearchBar from "../shared/SearchBar";
import NewCommunityButton from "../shared/NewCommunityButton";
import Navbar from "../shared/Navbar";
import { Card } from "../components/UI";
import CommunityCard from "../components/CommunityListing/CommunityCard";
import CommunityFilterBar from "../components/CommunityListing/CommunityFilterBar";
import PopularCommunities from "../components/BlogListing/PopularCommunties";
import UpcomingEvents from "../components/BlogListing/UpcomingEvents";
import { communityApi } from "../api/communityApi";

const FILTERS = ["Your Communities", "Discover Communities"];

const Communities = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth, loading: authLoading } = useAuth();

  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [userCommunities, setUserCommunities] = useState({ owned: [], followed: [] });
  const [discoverCommunities, setDiscoverCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const fetchUserCommunities = React.useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const response = await communityApi.getUserCommunities(searchQuery, forceRefresh);

      setUserCommunities({
        owned: response.owned || [],
        followed: response.followed || []
      });
    } catch (err) {
      console.error('Error fetching user communities:', err);
      setError('Failed to load your communities. Please try again.');
      setUserCommunities({ owned: [], followed: [] });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, auth.user]);

  const fetchDiscoverCommunities = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await communityApi.discoverCommunities({
        search: searchQuery,
        page: 1,
        limit: 20
      });
      setDiscoverCommunities(response.communities || []);
    } catch (err) {
      console.error('Error fetching discover communities:', err);
      setError('Failed to load communities. Please try again.');
      setDiscoverCommunities([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  // Check authentication and initialize
  useEffect(() => {
    if (!authLoading && !auth?.token) {
      navigate('/login', {
        state: { from: '/communities' },
        replace: true
      });
      return;
    }

    if (!authLoading && auth?.token) {
      setIsInitialized(true);
    }
  }, [auth, authLoading, navigate]);

  // Handle refresh trigger from community creation
  useEffect(() => {
    if (location.state?.refreshCommunities && isInitialized) {
      // Force refresh of user communities to show the newly created community
      if (selectedFilter === "Your Communities") {
        fetchUserCommunities(true); // Force refresh
      } else {
        fetchDiscoverCommunities();
      }
      // Clear the navigation state to prevent repeated refreshes
      navigate('/communities', { replace: true, state: {} });
    }
  }, [location.state, isInitialized, selectedFilter, fetchUserCommunities, fetchDiscoverCommunities, navigate]);

  // Fetch data when component mounts or filter/search changes
  useEffect(() => {
    if (isInitialized && auth?.token) {
      if (selectedFilter === "Your Communities") {
        fetchUserCommunities();
      } else {
        fetchDiscoverCommunities();
      }
    }
  }, [isInitialized, selectedFilter, searchQuery, auth?.token, fetchUserCommunities, fetchDiscoverCommunities]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleFollowToggle = async (communityId, wasFollowing) => {
    try {
      if (wasFollowing) {
        await communityApi.unfollowCommunity(communityId);

        // Update local state - remove from followed
        setUserCommunities(prev => ({
          ...prev,
          followed: prev.followed.filter(community => community._id !== communityId)
        }));

        // Clear requested state in discover communities results
        setDiscoverCommunities(prev => prev.map(c =>
          c._id === communityId ? { ...c, hasRequested: false } : c
        ));

        // If we're on discover view, refresh to show the unfollowed community
        if (selectedFilter === "Discover Communities") {
          fetchDiscoverCommunities();
        }

      } else {
        const res = await communityApi.followCommunity(communityId);

        if (res.status === 'requested') {
          // Update discover communities locally to show requested state
          setDiscoverCommunities(prev => prev.map(c =>
            c._id === communityId ? { ...c, hasRequested: true } : c
          ));
          return res;
        }

        // Update local state - find community and add to followed
        const communityToFollow = discoverCommunities.find(c => c._id === communityId);
        if (communityToFollow) {
          const updatedCommunity = {
            ...communityToFollow,
            members: [...(communityToFollow.members || []), auth.user?._id],
            no_of_followers: (communityToFollow.no_of_followers || 0) + 1
          };

          setUserCommunities(prev => ({
            ...prev,
            followed: [...prev.followed, updatedCommunity]
          }));
        }

        // Refresh discover communities to remove the followed one
        if (selectedFilter === "Discover Communities") {
          fetchDiscoverCommunities();
        }
        return res;
      }

    } catch (err) {
      console.error('Error in follow/unfollow:', err);

      // Check for pending request error - fetch based error message
      if (err.message === 'Join request already pending') {
        setDiscoverCommunities(prev => prev.map(c =>
          c._id === communityId ? { ...c, hasRequested: true } : c
        ));
      } else {
        setError(`Failed to ${wasFollowing ? 'unfollow' : 'follow'} community. Please try again.`);
        setTimeout(() => setError(null), 3000);
      }
    }
  };

  const handleDeleteCommunity = async (communityId) => {
    try {
      await communityApi.deleteCommunity(communityId);

      // Remove from owned communities
      setUserCommunities(prev => ({
        ...prev,
        owned: prev.owned.filter(community => community._id !== communityId)
      }));

    } catch (err) {
      console.error('Error deleting community:', err);
      setError('Failed to delete community. Please try again.');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateCommunity = async (communityId, updatedCommunity) => {
    // Update in owned communities
    setUserCommunities(prev => ({
      ...prev,
      owned: prev.owned.map(community =>
        community._id === communityId ? { ...community, ...updatedCommunity } : community
      )
    }));
  };

  // Get filtered communities based on selected filter
  const getFilteredCommunities = () => {
    const currentUserId = auth.user?._id || auth.user?.id;

    if (selectedFilter === "Your Communities") {
      // Only show communities owned by the authenticated user
      const ownedWithFlags = (userCommunities.owned || [])
        .filter(community => {
          // Only check user_id field as per backend model
          const isOwner = community.user_id === currentUserId;
          return isOwner;
        })
        .map(community => ({
          ...community,
          isFollowing: true,
          isOwned: true,
          hasRequested: false, // Owner is already "joined"
          memberCount: community.no_of_followers,
          postCount: community.no_of_posts,
          name: community.community_name,
          id: community._id
        }));

      // Only show communities followed by the authenticated user
      const followedWithFlags = (userCommunities.followed || [])
        .filter(community => {
          // Ensure this community is actually followed by the current user
          const isFollowed = community.members?.includes(currentUserId);
          return isFollowed;
        })
        .map(community => ({
          ...community,
          isFollowing: true,
          isOwned: false,
          hasRequested: false, // Already following
          memberCount: community.no_of_followers,
          postCount: community.no_of_posts,
          name: community.community_name,
          id: community._id
        }));

      const result = [...ownedWithFlags, ...followedWithFlags];
      return result;

    } else {
      // Show discover communities (exclude user's own communities and ones user already follows)
      return discoverCommunities
        .filter(community => {
          // Exclude communities owned by the user
          const isOwnedByUser = community.user_id === currentUserId ||
            community.owner_id === currentUserId ||
            community.created_by === currentUserId;

          // Exclude communities the user already follows
          const isFollowedByUser = (userCommunities.followed || []).some(fc => fc._id === community._id) ||
            (community.members && community.members.includes(currentUserId));

          return !isOwnedByUser && !isFollowedByUser;
        })
        .map(community => {
          // Check if user is already following this community (should be false because we filtered them out,
          // but keep the check for safety if userCommunities is out-of-date)
          const isFollowing = (userCommunities.followed || []).some(fc => fc._id === community._id);

          return {
            ...community,
            isFollowing,
            isOwned: false, // These are not owned by the user
            hasRequested: community.hasRequested || (community.joinRequests && community.joinRequests.includes(currentUserId)),
            memberCount: community.no_of_followers,
            postCount: community.no_of_posts,
            name: community.community_name,
            id: community._id
          };
        });
    }
  };

  const visibleCommunities = getFilteredCommunities();
  const ownedCount = userCommunities.owned.length;
  const followedCount = userCommunities.followed.length;
  const visibleCount = visibleCommunities.length;

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!auth?.token) {
    return null;
  }

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-rich-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-rich-black flex flex-col relative">
      <Navbar />

      <div className="relative z-10 flex-1 px-4 sm:px-6 lg:px-8 py-10">
        <div className="mx-auto w-full max-w-7xl flex flex-col gap-6">
          <div className="flex shrink-0 flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div>
              <h2 className="font-fenix text-[28px] text-white font-normal text-center xl:text-left">
                Communities
              </h2>
              <p className="text-desc font-lato text-center xl:text-left">
                Connect with like-minded developers and tech enthusiasts.
              </p>
            </div>

            <div className="flex items-center gap-3 w-full xl:w-[620px]">
              <SearchBar
                className="flex-1"
                placeholder="Search communities"
                onSearch={handleSearch}
              />
              <NewCommunityButton />
            </div>
          </div>

          <CommunityFilterBar
            filters={FILTERS}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />

          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px] gap-6">
            <main className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="p-5">
                  <p className="text-desc text-xs uppercase tracking-[0.18em] mb-2">Owned</p>
                  <div className="text-3xl font-fenix text-white">{ownedCount}</div>
                  <p className="text-desc text-sm mt-1">Communities you manage</p>
                </Card>
                <Card className="p-5">
                  <p className="text-desc text-xs uppercase tracking-[0.18em] mb-2">Following</p>
                  <div className="text-3xl font-fenix text-white">{followedCount}</div>
                  <p className="text-desc text-sm mt-1">Communities you follow</p>
                </Card>
                <Card className="p-5">
                  <p className="text-desc text-xs uppercase tracking-[0.18em] mb-2">Visible</p>
                  <div className="text-3xl font-fenix text-white">{visibleCount}</div>
                  <p className="text-desc text-sm mt-1">Communities in the current view</p>
                </Card>
              </div>

              {error && (
                <div className="bg-red-600/20 border border-red-600/30 rounded-2xl p-4 text-red-400">
                  {error}
                </div>
              )}

              {loading && (
                <div className="flex justify-center items-center py-12 text-white">
                  Loading communities...
                </div>
              )}

              {!loading && visibleCommunities.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {visibleCommunities.map((community) => (
                    <CommunityCard
                      key={community.id || community._id}
                      {...community}
                      onFollowToggle={handleFollowToggle}
                      onDelete={handleDeleteCommunity}
                      onUpdate={handleUpdateCommunity}
                    />
                  ))}
                </div>
              )}

              {!loading && visibleCommunities.length === 0 && (
                <div className="text-center py-14 rounded-2xl border border-navbar-border bg-navbar-bg/70">
                  <div className="text-desc text-lg mb-3">
                    {selectedFilter === "Your Communities"
                      ? searchQuery
                        ? `No communities found matching "${searchQuery}"`
                        : "You haven't joined any communities yet"
                      : searchQuery
                        ? `No communities found matching "${searchQuery}"`
                        : "No communities available to discover"
                    }
                  </div>
                  {selectedFilter === "Your Communities" && !searchQuery && (
                    <p className="text-desc">
                      Switch to "Discover Communities" to find and join new communities
                    </p>
                  )}
                </div>
              )}
            </main>

            <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <Card className="p-5">
                <p className="text-desc text-xs uppercase tracking-[0.18em] mb-2">Community Hub</p>
                <h3 className="font-fenix text-[22px] text-white mb-2">Trending now</h3>
                <p className="text-desc text-sm leading-relaxed">
                  Discover active communities and upcoming events that match your interests.
                </p>
              </Card>

              <PopularCommunities />
              <UpcomingEvents />
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Communities;