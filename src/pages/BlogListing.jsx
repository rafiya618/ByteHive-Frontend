import React, { useState } from "react";
import SearchBar from "../shared/SearchBar";
import NewPostButton from "../shared/NewPostButton";
import Navbar from "../shared/Navbar";
import BlogCard from "../components/BlogListing/BlogCard";
import BlogFilterBar from "../components/BlogListing/BlogFilterBar";
import PopularTags from "../components/BlogListing/PopularTags";
import PopularCommunities from "../components/BlogListing/PopularCommunties";
import UpcomingEvents from "../components/BlogListing/UpcomingEvents";
import { generateSampleBlogs } from "../services/blogDataService";


// Blog Listing Page - Updated to use shared blog service

const FILTERS = ["All", "Popular", "Newest"];

const BlogListing = () => {
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const blogs = generateSampleBlogs(12);

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
      <div className="w-full flex justify-center pt-8 pb-6 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="w-full max-w-7xl z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h2 className="font-fenix text-[28px] text-white font-normal text-center md:text-left">
            Your Feed
          </h2>

          <div className="flex items-center gap-4">
  <div className="w-full md:w-[500px]">
    <SearchBar
      placeholder="Search blog posts..."
    />
  </div>
  <NewPostButton />
</div>
        </div>
      </div>

      {/* Content */}
      <div className="w-full flex justify-center px-4 lg:px-8">
        <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-8">
          {/* Left Column */}
          <div className="flex-1 lg:max-w-3xl">
            <div className="mb-6">
              <BlogFilterBar
                filters={FILTERS}
                selected={selectedFilter}
                onSelect={setSelectedFilter}
              />
            </div>
            <div className="flex flex-col gap-7 pb-12">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} {...blog} />
              ))}
            </div>
          </div>

          {/* Right Column */}
          <aside className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 flex flex-col gap-6">
            <PopularTags />
            <PopularCommunities />
            <UpcomingEvents />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default BlogListing;