// Fixed Communities.jsx with PERSISTENT follow/unfollow state management using localStorage
import React, { useState, useEffect } from "react";
import SearchBar from "../shared/SearchBar";
import NewCommunityButton from "../shared/NewCommunityButton";
import Navbar from "../shared/Navbar";
import CommunityCard from "../components/CommunityListing/CommunityCard";
import CommunityFilterBar from "../components/CommunityListing/CommunityFilterBar";
import { communityApi } from "../services/communityApi";
import { initializeDummyAuth } from "../utils/auth";

const FILTERS = ["Your Communities", "Discover Communities"];

// DUMMY COMMUNITIES for Discover section
const DUMMY_DISCOVER_COMMUNITIES = [
  {
    _id: 'discover-1',
    community_name: "React Native Hub",
    description: "Mobile development community focused on React Native, sharing best practices and innovative solutions for cross-platform apps.",
    image: "https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?auto=format&fit=crop&w=600&q=80",
    no_of_followers: 6189,
    no_of_posts: 1834,
    user_id: '507f1f77bcf86cd799439013',
    members: [],
    community_tags: ["React Native", "Mobile", "JavaScript"],
    visible: "public"
  },
  {
    _id: 'discover-2',
    community_name: "Python Developers",
    description: "A vibrant community for Python enthusiasts, from beginners to advanced developers sharing code, tips, and best practices.",
    image: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=600&q=80",
    no_of_followers: 8742,
    no_of_posts: 2156,
    user_id: '507f1f77bcf86cd799439014',
    members: [],
    community_tags: ["Python", "Backend", "AI"],
    visible: "public"
  },
  {
    _id: 'discover-3',
    community_name: "Web3 & Blockchain",
    description: "Exploring the future of web technologies with blockchain, DeFi, NFTs, and decentralized applications development.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&q=80",
    no_of_followers: 4321,
    no_of_posts: 789,
    user_id: '507f1f77bcf86cd799439015',
    members: [],
    community_tags: ["Blockchain", "Web3", "Solidity"],
    visible: "public"
  },
  {
    _id: 'discover-4',
    community_name: "Vue.js Community",
    description: "Connect with Vue.js developers worldwide. Share components, discuss best practices, and build amazing apps together.",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80",
    no_of_followers: 3567,
    no_of_posts: 892,
    user_id: '507f1f77bcf86cd799439016',
    members: [],
    community_tags: ["Vue.js", "Frontend", "JavaScript"],
    visible: "public"
  },
  {
    _id: 'discover-5',
    community_name: "DevOps Engineers",
    description: "Infrastructure, CI/CD, containerization, and cloud technologies. Learn DevOps best practices from industry experts.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80",
    no_of_followers: 5234,
    no_of_posts: 1456,
    user_id: '507f1f77bcf86cd799439017',
    members: [],
    community_tags: ["DevOps", "AWS", "Docker"],
    visible: "public"
  }
];

const Communities = () => {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [userCommunities, setUserCommunities] = useState({ owned: [], followed: [] });
  const [availableDiscoverCommunities, setAvailableDiscoverCommunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isInitialized, setIsInitialized] = useState(false);

  const dummyUserId = '507f1f77bcf86cd799439011';

  // FIXED: Helper functions for localStorage persistence (instead of sessionStorage)
  const getFollowedCommunityIds = () => {
    try {
      const stored = localStorage.getItem('followedCommunities');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return [];
    }
  };

  const saveFollowedCommunityIds = (ids) => {
    try {
      localStorage.setItem('followedCommunities', JSON.stringify(ids));
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  const getFollowedCommunitiesData = () => {
    try {
      const stored = localStorage.getItem('followedCommunitiesData');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Error reading communities data from localStorage:', e);
      return [];
    }
  };

  const saveFollowedCommunitiesData = (communities) => {
    try {
      localStorage.setItem('followedCommunitiesData', JSON.stringify(communities));
    } catch (e) {
      console.error('Error saving communities data to localStorage:', e);
    }
  };

  // Initialize dummy auth on component mount
  useEffect(() => {
    initializeDummyAuth();
  }, []);

  // Initialize communities on component mount
  useEffect(() => {
    initializeCommunities();
  }, []);

  const initializeCommunities = () => {
    const followedIds = getFollowedCommunityIds();
    const followedData = getFollowedCommunitiesData();
    
    // Remove or comment out these debug logs in production
    // console.log('Initializing communities with followed IDs:', followedIds);
    // console.log('Followed communities data:', followedData);
    
    // Separate dummy communities into followed and available
    const availableCommunities = DUMMY_DISCOVER_COMMUNITIES.filter(
      community => !followedIds.includes(community._id)
    );
    
    // Get followed communities from stored data or filter from dummy data
    const followedCommunities = followedData.length > 0 
      ? followedData 
      : DUMMY_DISCOVER_COMMUNITIES.filter(community => followedIds.includes(community._id));
    
    // console.log('Available communities:', availableCommunities.length);
    // console.log('Followed communities:', followedCommunities.length);
    
    setAvailableDiscoverCommunities(availableCommunities);
    setUserCommunities(prev => ({
      ...prev,
      followed: followedCommunities
    }));
    
    setIsInitialized(true);
    
    // Fetch user's owned communities
    fetchUserCommunities();
  };

  const fetchUserCommunities = async () => {
    setLoading(true);
    setError(null);
    try {
      // Try real API call first
      const response = await communityApi.getUserCommunities(searchQuery);
      
      // Don't override followed communities - keep the persisted ones
      setUserCommunities(prev => ({
        owned: response.owned || [],
        followed: prev.followed // Keep existing followed communities
      }));
      
    } catch (err) {
      console.error('Error fetching user communities:', err);
      setError('Failed to load your communities');
      
      // Fallback dummy data for owned communities only
      setUserCommunities(prev => ({
        owned: [
          {
            _id: 'owned-1',
            community_name: "My Tech Hub",
            description: "A community I created for sharing technology insights and connecting with fellow developers.",
            image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
            no_of_followers: 245,
            no_of_posts: 56,
            user_id: dummyUserId,
            members: [dummyUserId],
            community_tags: ["Technology", "Programming"],
            visible: "public"
          }
        ],
        followed: prev.followed // Keep existing followed communities
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // FIXED FOLLOW/UNFOLLOW with localStorage persistence
  const handleFollowToggle = async (communityId, wasFollowing) => {
    // console.log('Follow toggle:', communityId, wasFollowing);
    
    try {
      if (wasFollowing) {
        // Unfollow - make API call
        await communityApi.unfollowCommunity(communityId);
        
        // Find the community being unfollowed
        const communityToUnfollow = userCommunities.followed.find(c => c._id === communityId);
        
        if (communityToUnfollow) {
          // Remove from followed communities
          const updatedFollowed = userCommunities.followed.filter(community => community._id !== communityId);
          setUserCommunities(prev => ({
            ...prev,
            followed: updatedFollowed
          }));
          
          // Update persistent storage
          const followedIds = getFollowedCommunityIds().filter(id => id !== communityId);
          const followedData = getFollowedCommunitiesData().filter(c => c._id !== communityId);
          saveFollowedCommunityIds(followedIds);
          saveFollowedCommunitiesData(followedData);
          
          // console.log('Updated storage after unfollow:', followedIds);
          
          // Add back to available discover communities if it's a dummy community
          if (communityId.startsWith('discover-')) {
            setAvailableDiscoverCommunities(prev => {
              // Check if it already exists
              const exists = prev.find(c => c._id === communityId);
              if (!exists) {
                return [...prev, communityToUnfollow].sort((a, b) => {
                  // Sort by the original order based on discover ID number
                  const aNum = parseInt(a._id.replace('discover-', ''));
                  const bNum = parseInt(b._id.replace('discover-', ''));
                  return aNum - bNum;
                });
              }
              return prev;
            });
          }
        }
        
      } else {
        // Follow - make API call
        await communityApi.followCommunity(communityId);
        
        // Find community in available discover communities
        const communityToFollow = availableDiscoverCommunities.find(c => c._id === communityId);
        
        if (communityToFollow) {
          // Update community with new follower count
          const updatedCommunity = { 
            ...communityToFollow, 
            members: [...(communityToFollow.members || []), dummyUserId],
            no_of_followers: communityToFollow.no_of_followers + 1
          };
          
          // Update followed communities
          const updatedFollowed = [...userCommunities.followed, updatedCommunity];
          setUserCommunities(prev => ({
            ...prev,
            followed: updatedFollowed
          }));
          
          // Update persistent storage
          const followedIds = [...getFollowedCommunityIds(), communityId];
          const followedData = [...getFollowedCommunitiesData(), updatedCommunity];
          saveFollowedCommunityIds(followedIds);
          saveFollowedCommunitiesData(followedData);
          
          // console.log('Updated storage after follow:', followedIds);
          
          // Remove from available discover communities
          setAvailableDiscoverCommunities(prev => 
            prev.filter(c => c._id !== communityId)
          );
          
          // console.log('Community successfully moved to followed:', communityId);
        } else {
          console.log('Community not found in discover list:', communityId);
        }
      }
      
    } catch (err) {
      console.error('Error in follow/unfollow API call:', err);
      setError(`Failed to ${wasFollowing ? 'unfollow' : 'follow'} community. Please try again.`);
      setTimeout(() => setError(null), 3000);
      throw err;
    }
  };

  // Delete community handler
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
      throw err;
    }
  };

  // Handle community update
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
    if (selectedFilter === "Your Communities") {
      // Combine owned and followed communities
      const ownedWithFlags = userCommunities.owned.map(community => ({
        ...community,
        isFollowing: true,
        isOwned: true,
        memberCount: community.no_of_followers,
        postCount: community.no_of_posts,
        name: community.community_name,
        id: community._id
      }));

      const followedWithFlags = userCommunities.followed.map(community => ({
        ...community,
        isFollowing: true,
        isOwned: false,
        memberCount: community.no_of_followers,
        postCount: community.no_of_posts,
        name: community.community_name,
        id: community._id
      }));

      let allCommunities = [...ownedWithFlags, ...followedWithFlags];

      // Apply search filter
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        allCommunities = allCommunities.filter(community =>
          community.community_name.toLowerCase().includes(searchLower) ||
          community.description.toLowerCase().includes(searchLower) ||
          community.community_tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return allCommunities;
      
    } else {
      // Show available discover communities (not followed yet)
      let filtered = availableDiscoverCommunities;

      // Apply search filter
      if (searchQuery.trim()) {
        const searchLower = searchQuery.toLowerCase();
        filtered = filtered.filter(community =>
          community.community_name.toLowerCase().includes(searchLower) ||
          community.description.toLowerCase().includes(searchLower) ||
          community.community_tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }

      return filtered.map(community => ({
        ...community,
        isFollowing: false,
        isOwned: false,
        memberCount: community.no_of_followers,
        postCount: community.no_of_posts,
        name: community.community_name,
        id: community._id
      }));
    }
  };

  // Don't render until initialized to prevent flashing
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

      {/* Background Glow */}
      <div
        className="absolute z-0"
        style={{
          width: 637,
          height: 300,
          top: -38,
          left: "50%",
          transform: "translateX(-50%)",
          background: "#1A1842B3",
          filter: "blur(100px)",
          boxShadow: "0px 4px 100px 500px #00000066",
          borderRadius: 30,
          pointerEvents: "none",
        }}
      />

      {/* Header */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-9">
          {/* Title */}
          <div className="z-10">
            <h2 className="font-fenix text-[28px] text-white font-normal text-center md:text-left">
              Communities
            </h2>
            <p className="text-desc font-lato text-center md:text-left">Connect with like-minded developers and tech enthusiasts.</p>
          </div>

          {/* Search + Create Community Button */}
          <div className="flex items-center gap-1 w-full md:w-[600px] z-10">
            <SearchBar 
              className="flex-1 max-w-xs sm:max-w-md" 
              placeholder="Search communities"
              onSearch={handleSearch}
            />
            <NewCommunityButton />
          </div>
        </div>

        {/* Filter */}
        <div className="mb-0">
          <CommunityFilterBar
            filters={FILTERS}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </div>
      </div>

      {/* Content */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 z-10 -mt-4">
        {/* Error Message */}
        {error && (
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-4 mb-6 text-red-400">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="text-white">Loading communities...</div>
          </div>
        )}

        {/* Communities Grid */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {getFilteredCommunities().map((community) => (
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

        {/* Empty State */}
        {!loading && getFilteredCommunities().length === 0 && (
          <div className="text-center py-12">
            <div className="text-desc text-lg mb-4">
              {selectedFilter === "Your Communities" 
                ? searchQuery 
                  ? `No communities found matching "${searchQuery}"`
                  : "You haven't joined any communities yet"
                : searchQuery
                  ? `No communities found matching "${searchQuery}"`
                  : "All available communities have been followed!"
              }
            </div>
            {selectedFilter === "Your Communities" && !searchQuery && (
              <p className="text-desc">
                Switch to "Discover Communities" to find and join new communities
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Communities;