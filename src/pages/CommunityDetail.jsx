import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../shared/Navbar";
import CommunityFilterBar from "../components/CommunityDetail/CommunityFilterBar";
import BlogCard from "../components/BlogListing/BlogCard";
import MemberCard from "../components/CommunityDetail/MemberCard";
import FollowingButton from "../components/CommunityDetail/FollowingButton";
import JoinChatButton from "../components/CommunityDetail/JoinChatButton";
import VideoRoomButton from "../components/CommunityDetail/VideoRoomButton";
import NewPostButton from "../shared/NewPostButton";

// Dummy data for the community
const COMMUNITY_DATA = {
  name: "Next.jsDevs Chat",
  description: "A community for Next.js developers to share knowledge, ask questions, and collaborate on projects. Join us to learn, grow, and connect with fellow developers passionate about building modern web applications.",
  avatar: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
  stats: {
    members: "5,284 members",
    posts: "1,482 posts", 
    views: "248,653 views",
    upvotes: "62,947 upvotes"
  }
};

// Dummy blogs for Posts tab
const DUMMY_BLOGS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=600&q=80",
    community: "Next.js Devs",
    date: "Mar 10, 2025",
    readTime: "6 min",
    title: "Building Modern Web Applications with Next.js and the TypeScript",
    description: "Learn how to leverage the power of Next.js and TypeScript to create robust, type-safe web applications with excellent developer experience.",
    tags: ["Next.js", "Typescript", "WebDevelopment"],
    author: {
      name: "Alex Johnson",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCGFljVK_1YLiLqNE8SMU0zsD2LUOv_ZJClfdq_DWp5FLd8KsDvQMnl0VOe2aFfU8eqc6M6I9aJ-VCGtFzHlUS0P9bjYnTWHMI5UO-pnf_7H4DGlvVnCe8Bj212iSAhJEonp7QjXn4VZAVbIpKHMYo4M70ouLkfY0wZPHju90a2vQzdL6Es79mMQ8NwXMHcJmqQaWhUuBwfkisr2uii-p0d3iFFfq4_RPcfykChX-MAS__NVdhAo3TLJvD4_LSMPxI_TLnrD1Gi_oFK"
    },
    upvotes: 142,
    downvotes: 16,
    comments: 24,
    views: 1850,
    bookmarked: false
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=600&q=80",
    community: "Next.js Devs",
    date: "Mar 10, 2025", 
    readTime: "6 min",
    title: "Building Modern Web Applications with Next.js and the TypeScript",
    description: "Learn how to leverage the power of Next.js and TypeScript to create robust, type-safe web applications with excellent developer experience.",
    tags: ["Next.js", "Typescript", "WebDevelopment"],
    author: {
      name: "Alex Johnson",
      avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0SOH_qdug48AdwWxvlB89VAMgWwLvCzU5nSDeh7sGBOxfcwtoGxXGFu3Q2JauQZWpKqk-GCgCttE6cJIsPEkbYBWNgz8qS6HIT-5Sz6LgHkDAzWnkSvAOUOk7CDaVV0qGaLh5TF5SZPN1EfhhvDKzelBH3komHVKuAU_sLPUdP82-LnV5uJEpBfaz0d1ZudZEkDGu7GEHq46ftKnljIDa0wEpEPuusxbFSIsOPoONgMi3EDnu1Bupe8IbBw6vKFxxdMaP6_2s5fii"
    },
    upvotes: 142,
    downvotes: 16, 
    comments: 24,
    views: 1850,
    bookmarked: false
  }
];

// Dummy members data
const DUMMY_MEMBERS = [
  {
    id: 1,
    name: "Alex Johnson",
    role: "Member",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 2,
    name: "Mary Chen", 
    role: "Member",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 3,
    name: "John Smith",
    role: "Member", 
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 4,
    name: "Sarah Kim",
    role: "Member",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
  },
  {
    id: 5,
    name: "David Lee",
    role: "Member", 
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80"
  }
];

const FILTERS = ["Posts", "Members", "About"];

const CommunityDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState("Posts");

  const handleBackClick = () => {
    navigate(-1); // Navigate to previous page
  };

  const renderContent = () => {
    switch (selectedFilter) {
      case "Posts":
        return (
          <div className="flex flex-col gap-6 pb-12">
            <div className="flex justify-between items-center">
              <h2 className="font-fenix text-3xl md:text-4xl text-white font-normal">Community Posts</h2>
              <NewPostButton />
            </div>
            <div className="flex flex-col gap-7">
              {DUMMY_BLOGS.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>
          </div>
        );
      case "Members":
        return (
          <div className="flex flex-col gap-6 pb-12">
            <h2 className="font-fenix text-3xl md:text-4xl text-white font-normal">Community Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DUMMY_MEMBERS.map((member) => (
                <MemberCard key={member.id} {...member} />
              ))}
            </div>
          </div>
        );
      case "About":
        return (
          <div className="pb-12">
            <h2 className="font-fenix text-3xl md:text-4xl text-white font-normal mb-8">About the Community</h2>
            <div 
              className="bg-navbar-bg rounded-xl p-8 border"
              style={{
                border: "1px solid var(--navbar-border)",
              }}
            >
              <div className="space-y-6 text-columbia-blue">
                <p className="font-lato text-lg leading-relaxed">
                  Welcome to the Next.js Devs community! We're a group of passionate developers who love working with Next.js and related technologies.
                </p>
                
                <div>
                  <h4 className="font-lato font-semibold text-white text-lg mb-3">Community Guidelines</h4>
                  <ul className="space-y-2 font-lato">
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      Be respectful and kind to fellow members
                    </li>
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      Share valuable content and knowledge
                    </li>
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      Ask questions and help others
                    </li>
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      No self-promotion without providing value
                    </li>
                    <li className="flex items-start">
                      <span className="text-periwinkle mr-2">•</span>
                      Keep discussions relevant to Next.js and web development
                    </li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-lato font-semibold text-white text-lg mb-3">Community History</h4>
                  <p className="font-lato leading-relaxed">
                    This community was founded in 2023 by a group of Next.js enthusiasts who wanted to create a space for collaboration and knowledge sharing. Since then, we've grown to over 5,000 members and continue to help developers learn and grow.
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

      {/* Community Header */}
      <div className="w-full flex justify-center pt-8 pb-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-7xl">
          {/* Community Info */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: Back Button + Avatar + Info */}
              <div className="flex items-start gap-6 flex-1">
                {/* Back Button */}
                <button
                  onClick={handleBackClick}
                  className="mt-2 hover:text-periwinkle transition-colors flex-shrink-0"
                >
                  <span className="material-icons text-white text-2xl">arrow_back</span>
                </button>

                {/* Avatar */}
                <img
                  src={COMMUNITY_DATA.avatar}
                  alt={COMMUNITY_DATA.name}
                  className="w-32 h-32 md:w-36 md:h-36 rounded-full object-cover flex-shrink-0"
                />
                
                {/* Community Info */}
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                    <h1 className="font-fenix text-3xl md:text-4xl text-white font-normal mb-4 lg:mb-0">
                      {COMMUNITY_DATA.name}
                    </h1>
                    
                    {/* Action Buttons - positioned at title level */}
                    <div className="flex gap-3 flex-shrink-0">
                      <FollowingButton />
                      <JoinChatButton />
                      <VideoRoomButton />
                    </div>
                  </div>
                  
                  {/* Description spans full width under buttons */}
                  <p className="font-lato text-columbia-blue text-base md:text-lg leading-relaxed mb-6 pr-4">
                    {COMMUNITY_DATA.description}
                  </p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-6 text-periwinkle font-lato text-sm flex-wrap">
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-base">people</span>
                      <span>{COMMUNITY_DATA.stats.members}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-base">article</span>
                      <span>{COMMUNITY_DATA.stats.posts}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-base">visibility</span>
                      <span>{COMMUNITY_DATA.stats.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="material-icons text-base">thumb_up</span>
                      <span>{COMMUNITY_DATA.stats.upvotes}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex justify-center px-4 lg:px-8">
        <div className="w-full max-w-7xl">
          {/* Filter Bar */}
          <div className="mb-8">
            <CommunityFilterBar
              filters={FILTERS}
              selected={selectedFilter}
              onSelect={setSelectedFilter}
            />
          </div>

          {/* Dynamic Content */}
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetail;