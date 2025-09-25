import React, { useState, useEffect } from "react";
import SavedFilterBar from "./SavedFilterBar";
import SearchBar from "../../shared/SearchBar";
import BlogCard from "../BlogListing/BlogCard";
import { useSavedPosts, useSearch } from "../../hooks/useContentCuration";
import LoadingSpinner from "../UI/LoadingSpinner";
import { useNavigate } from "react-router-dom";

const SavedPage = () => {
  const [selectedFilter, setSelectedFilter] = useState("All Items");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  // re-render state
  const [localRemovedItems, setLocalRemovedItems] = useState(new Set());
  
  const navigate = useNavigate();
  const filters = ["All Items", "Saved", "Watch Later"];
  
  // Content curation hooks
  const {
    savedPosts,
    loading,
    error,
    pagination,
    loadSavedPosts,
  } = useSavedPosts();

  const {
    searchResults,
    searchLoading,
    searchError,
    searchSavedContent,
    clearSearch,
  } = useSearch();

  // Load saved posts when filter changes
  useEffect(() => {
    const categoryMap = {
      "All Items": null,
      "Saved": "Saved",
      "Watch Later": "Watch Later"
    };
    
    if (!searchQuery) {
      console.log('Loading saved posts for filter:', selectedFilter);
      loadSavedPosts(categoryMap[selectedFilter]);
      // Clear local removed items when switching filters
      setLocalRemovedItems(new Set());
    }
  }, [selectedFilter, loadSavedPosts, searchQuery]);

  // Debug effect to track savedPosts changes
  useEffect(() => {
    console.log('SavedPage: savedPosts updated, length:', savedPosts.length);
    console.log('SavedPage: current savedPosts:', savedPosts.map(p => ({ id: p.id, title: p.title })));
    console.log('SavedPage: localRemovedItems:', Array.from(localRemovedItems));
  }, [savedPosts, localRemovedItems]);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);
    // Clear local removed items when searching
    setLocalRemovedItems(new Set());

    if (!query.trim()) {
      clearSearch();
      setIsSearching(false);
      // Reload saved posts for current filter
      const categoryMap = {
        "All Items": null,
        "Saved": "Saved",
        "Watch Later": "Watch Later"
      };
      await loadSavedPosts(categoryMap[selectedFilter]);
      return;
    }

    // Search within saved content
    const searchCategory = selectedFilter === "All Items" ? null : selectedFilter;
    await searchSavedContent(query, searchCategory);
    setIsSearching(false);
  };

  // F Filter out removed items 
  const getFilteredData = (data) => {
    return data.filter(item => !localRemovedItems.has(String(item.id)));
  };

  // Get data to display with local filtering
  const rawDisplayData = searchQuery ? searchResults : savedPosts;
  const displayData = getFilteredData(rawDisplayData);
  const displayLoading = searchQuery ? searchLoading : loading;
  const displayError = searchQuery ? searchError : error;

  // Handle local item removal for immediate UI feedback
  const handleLocalItemRemoval = (itemId) => {
    console.log('Locally removing item:', itemId);
    setLocalRemovedItems(prev => new Set([...prev, String(itemId)]));
  };

  // Handle load more
  const handleLoadMore = async () => {
    if (searchQuery) {
      const searchCategory = selectedFilter === "All Items" ? null : selectedFilter;
      await searchSavedContent(searchQuery, searchCategory, pagination.currentPage + 1);
    } else {
      const categoryMap = {
        "All Items": null,
        "Saved": "Saved",
        "Watch Later": "Watch Later"
      };
      await loadSavedPosts(categoryMap[selectedFilter], pagination.currentPage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-rich-black text-white relative">
      {/* Background Glow Effect */}
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
      
      <div className="container mx-auto px-5 sm:px-7 lg:px-10 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
            <div>
              <h1 className="font-fenix text-[28px] text-white mb-1">
                Saved Items
              </h1>
              <p className="text-desc text-base">
                Access your bookmarked content anytime
                {displayData.length > 0 && (
                  <span className="ml-2 text-periwinkle">
                    ({displayData.length} item{displayData.length !== 1 ? 's' : ''})
                  </span>
                )}

              
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-4 w-full md:w-[500px]">
              <SearchBar 
                placeholder="Search saved posts..."
                onSearch={handleSearch}
              />
            </div>
          </div>

          {/* Search Status */}
          {searchQuery && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-desc text-sm">
                  {isSearching 
                    ? "Searching..." 
                    : `Search results for "${searchQuery}" in ${selectedFilter}`
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    clearSearch();
                    setLocalRemovedItems(new Set()); // Clear local removals
                  }}
                  className="text-periwinkle hover:text-white transition-colors text-sm flex items-center space-x-1"
                >
                  <span className="material-icons text-sm">clear</span>
                  <span>Clear search</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Filter Bar */}
        <div className="mb-8">
          <SavedFilterBar 
            filters={filters}
            selected={selectedFilter}
            onSelect={setSelectedFilter}
          />
        </div>

        {/* Loading State */}
        {displayLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        )}

        {/* Error State */}
        {displayError && (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-red-400 mb-4 block">
              error_outline
            </span>
            <h3 className="font-fenix text-2xl text-white mb-2">
              {searchQuery ? "Search Failed" : "Failed to Load"}
            </h3>
            <p className="text-red-400 mb-4">
              {displayError}
            </p>
            <button
              onClick={() => {
                if (searchQuery) {
                  handleSearch(searchQuery);
                } else {
                  const categoryMap = {
                    "All Items": null,
                    "Saved": "Saved",
                    "Watch Later": "Watch Later"
                  };
                  loadSavedPosts(categoryMap[selectedFilter]);
                }
              }}
              className="px-4 py-2 bg-periwinkle text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Saved Items Grid */}
        {!displayLoading && !displayError && (
          <>
            <div className="space-y-6">
              {displayData.map((item, index) => (
                <div key={`${item.id}_${item.savedAt || item.timestamp || index}`}>
                  <BlogCard
                    id={item.id}
                    image={item.image}
                    community={item.community}
                    date={item.date}
                    readTime={item.readTime}
                    title={item.title}
                    description={item.description}
                    tags={item.tags}
                    author={item.author}
                    upvotes={item.upvotes}
                    downvotes={item.downvotes}
                    comments={item.comments}
                    views={item.views}
                    bookmarked={true} // All items in saved page are bookmarked
                    // Pass callback for immediate local removal
                    onLocalRemove={handleLocalItemRemoval}
                  />
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {pagination?.hasNext && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={displayLoading}
                  className="px-6 py-3 border border-periwinkle text-periwinkle rounded-md hover:bg-periwinkle hover:text-white transition-colors disabled:opacity-50"
                >
                  {displayLoading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!displayLoading && !displayError && displayData.length === 0 && (
          <div className="text-center py-16">
            {searchQuery ? (
              <>
                <span className="material-icons text-6xl text-columbia-blue mb-4 block">
                  search_off
                </span>
                <h3 className="font-fenix text-2xl text-white mb-2">
                  No search results found
                </h3>
                <p className="text-columbia-blue mb-4">
                  No saved posts match "{searchQuery}" in {selectedFilter}
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    clearSearch();
                    setLocalRemovedItems(new Set());
                  }}
                  className="px-4 py-2 border border-periwinkle text-periwinkle rounded-md hover:bg-periwinkle hover:text-white transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <span className="material-icons text-6xl text-columbia-blue mb-4 block">
                  {selectedFilter === "Watch Later" ? "schedule" : "bookmark_border"}
                </span>
                <h3 className="font-fenix text-2xl text-white mb-2">
                  No {selectedFilter.toLowerCase()} items yet
                </h3>
                <p className="text-columbia-blue mb-6">
                  {selectedFilter === "Watch Later" 
                    ? "Posts saved to 'Watch Later' will appear here"
                    : selectedFilter === "Saved"
                      ? "Posts saved to 'Saved' will appear here"
                      : "Start bookmarking posts to see them here"
                  }
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="px-6 py-3 bg-periwinkle text-white rounded-md hover:bg-opacity-90 transition-colors"
                >
                  Discover Posts
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPage;