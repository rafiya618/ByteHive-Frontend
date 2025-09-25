import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../../shared/SearchBar";
import BlogCard from "../BlogListing/BlogCard";
import { useViewHistory, useSearch, useNotifications } from "../../hooks/useContentCuration";
import LoadingSpinner from "../UI/LoadingSpinner";

const HistoryPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const [selectionMode, setSelectionMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const navigate = useNavigate();

  // Content curation hooks
  const {
    viewHistory,
    loading,
    error,
    pagination,
    selectedItems,
    loadViewHistory,
    removeMultipleHistoryItems,
    toggleItemSelection,
    selectAllItems,
    clearSelection,
  } = useViewHistory();

  const {
    searchResults,
    searchLoading,
    searchError,
    searchViewHistory,
    clearSearch,
  } = useSearch();

  const { showSuccess, showError } = useNotifications();

  // Load view history on mount
  useEffect(() => {
    if (!searchQuery) {
      loadViewHistory();
    }
  }, [loadViewHistory, searchQuery]);

  // Handle search
  const handleSearch = async (query) => {
    setSearchQuery(query);
    setIsSearching(true);

    if (!query.trim()) {
      clearSearch();
      setIsSearching(false);
      await loadViewHistory();
      return;
    }

    await searchViewHistory(query);
    setIsSearching(false);
  };



  // Handle multiple items removal
  const handleRemoveSelected = async () => {
    const selectedArray = Array.from(selectedItems);
    const result = await removeMultipleHistoryItems(selectedArray);
    
    if (result.success) {
      showSuccess(result.message);
      setSelectionMode(false);
    } else {
      showError(result.error);
    }
    
    setShowDeleteConfirm(false);
  };

  // Toggle selection mode
  const handleToggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      clearSelection();
    }
  };

  // Group items by date
  const groupItemsByDate = (items) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      lastWeek: [],
      thisMonth: [],
      older: []
    };
    
    items.forEach(item => {
      const itemDate = new Date(item.viewedAt || item.timestamp);
      const diffTime = today - itemDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        groups.today.push(item);
      } else if (diffDays === 1) {
        groups.yesterday.push(item);
      } else if (diffDays <= 7) {
        groups.thisWeek.push(item);
      } else if (diffDays <= 14) {
        groups.lastWeek.push(item);
      } else if (diffDays <= 30) {
        groups.thisMonth.push(item);
      } else {
        groups.older.push(item);
      }
    });
    
    return groups;
  };

  // Format relative time
  const formatRelativeTime = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get data to display
  const displayData = searchQuery ? searchResults : viewHistory;
  const displayLoading = searchQuery ? searchLoading : loading;
  const displayError = searchQuery ? searchError : error;
  
  // Group data by date when not searching
  const groupedData = searchQuery ? null : groupItemsByDate(displayData);

  // Handle load more
  const handleLoadMore = async () => {
    if (searchQuery) {
      await searchViewHistory(searchQuery, pagination.currentPage + 1);
    } else {
      await loadViewHistory(pagination.currentPage + 1);
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
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="font-fenix text-[28px] text-white mb-1">
                    History
                  </h1>
                  <p className="text-desc text-base">
                    Your recently viewed posts
                    {displayData.length > 0 && (
                      <span className="ml-2 text-periwinkle">
                        ({displayData.length} item{displayData.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </p>
                </div>
                
                {/* HeaderSelect Button */}
                {viewHistory.length > 0 && !searchQuery && !selectionMode && (
                  <button
                    onClick={handleToggleSelectionMode}
                    className="mt-2 text-periwinkle hover:text-white transition-colors text-sm font-medium flex items-center space-x-1.5 group px-3 py-1.5 border border-periwinkle border-opacity-30 rounded-md hover:border-opacity-60"
                  >
                    <span className="material-icons text-lg group-hover:scale-110 transition-transform">
                      checklist
                    </span>
                    <span>Select Items</span>
                  </button>
                )}
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="flex items-center gap-4 w-full md:w-[500px]">
              <SearchBar 
                placeholder="Search history..."
                onSearch={handleSearch}
              />
            </div>
          </div>

          {/* Selection Mode Controls */}
          {selectionMode && (
            <div className="mb-4 p-4 bg-navbar-bg rounded-lg border border-navbar-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-white font-medium">
                    {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={selectAllItems}
                    className="text-periwinkle hover:text-white transition-colors text-sm font-medium"
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearSelection}
                    className="text-periwinkle hover:text-white transition-colors text-sm font-medium"
                  >
                    Clear Selection
                  </button>
                  <button
                    onClick={handleToggleSelectionMode}
                    className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium"
                  >
                    Done
                  </button>
                </div>
                
                <div className="flex items-center space-x-3">
                  {selectedItems.size > 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-lato flex items-center space-x-2"
                    >
                      <span className="material-icons text-sm">delete</span>
                      <span>Delete Selected</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Search Status */}
          {searchQuery && (
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <p className="text-desc text-sm">
                  {isSearching 
                    ? "Searching..." 
                    : `Search results for "${searchQuery}" in your history`
                  }
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    clearSearch();
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

        {/* Loading State */}
        {displayLoading && (
          <div className="flex justify-center py-12">
            <LoadingSpinner text="Loading history..." />
          </div>
        )}

        {/* Error State */}
        {displayError && (
          <div className="text-center py-12">
            <span className="material-icons text-6xl text-red-400 mb-4 block">
              error_outline
            </span>
            <h3 className="font-fenix text-2xl text-white mb-2">
              {searchQuery ? "Search Failed" : "Failed to Load History"}
            </h3>
            <p className="text-red-400 mb-4">
              {displayError}
            </p>
            <button
              onClick={() => {
                if (searchQuery) {
                  handleSearch(searchQuery);
                } else {
                  loadViewHistory();
                }
              }}
              className="px-4 py-2 bg-periwinkle text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* History Items Grid */}
        {!displayLoading && !displayError && (
          <>
            {searchQuery ? (
              // Search results - no grouping
              <div className="space-y-6">
                {displayData.map((item, index) => (
                  <div key={`${item.id}_${item.historyId}_${index}`} className="relative">
                    {/* Selection checkbox */}
                    {selectionMode && (
                      <div className="absolute top-4 left-4 z-20">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(item.historyId)}
                          onChange={() => toggleItemSelection(item.historyId)}
                          className="w-5 h-5 text-periwinkle bg-transparent border-2 border-periwinkle rounded focus:ring-periwinkle focus:ring-2"
                        />
                      </div>
                    )}

                    {/* Blog Card */}
                    <div className={selectionMode ? 'ml-8' : ''}>
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
                        bookmarked={item.bookmarked}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Grouped history items
              <div className="space-y-8">
                {Object.entries(groupedData).map(([period, items]) => {
                  if (items.length === 0) return null;
                  
                  const periodLabels = {
                    today: 'Today',
                    yesterday: 'Yesterday',
                    thisWeek: 'This week',
                    lastWeek: 'Last week',
                    thisMonth: 'This month',
                    older: 'Older'
                  };
                  
                  return (
                    <div key={period} className="space-y-4">
                      {/* Date Section Header */}
                      <div className="flex items-center space-x-4 mb-6">
                        <h2 className="text-white font-semibold text-lg font-lato">
                          {periodLabels[period]}
                        </h2>
                        <div className="flex-1 h-px bg-navbar-border"></div>
                        <span className="text-desc text-sm">
                          {items.length} item{items.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      {/* Items in this period */}
                      <div className="space-y-6">
                        {items.map((item, index) => (
                          <div key={`${item.id}_${item.historyId}_${index}`} className="relative">
                            {/* Selection checkbox */}
                            {selectionMode && (
                              <div className="absolute top-4 left-4 z-20">
                                <input
                                  type="checkbox"
                                  checked={selectedItems.has(item.historyId)}
                                  onChange={() => toggleItemSelection(item.historyId)}
                                  className="w-5 h-5 text-periwinkle bg-transparent border-2 border-periwinkle rounded focus:ring-periwinkle focus:ring-2"
                                />
                              </div>
                            )}

                            {/* Blog Card */}
                            <div className={selectionMode ? 'ml-8' : ''}>
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
                                bookmarked={item.bookmarked}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

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
                  No posts in your history match "{searchQuery}"
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    clearSearch();
                  }}
                  className="px-4 py-2 border border-periwinkle text-periwinkle rounded-md hover:bg-periwinkle hover:text-white transition-colors"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <span className="material-icons text-6xl text-columbia-blue mb-4 block">
                  history
                </span>
                <h3 className="font-fenix text-2xl text-white mb-2">
                  No history yet
                </h3>
                <p className="text-columbia-blue">
                  Start reading posts to see your history here
                </p>
              </>
            )}
          </div>
        )}



        {/* Delete Selected Confirmation Modal */}
        {showDeleteConfirm && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={() => setShowDeleteConfirm(false)}
            />
            
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div 
                className="bg-navbar-bg rounded-lg p-6 w-full max-w-md border shadow-xl"
                style={{ borderColor: "var(--navbar-border)" }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center mb-4">
                  <span className="material-icons text-red-400 mr-3 text-2xl">
                    delete
                  </span>
                  <h2 className="font-fenix text-xl text-white">
                    Delete Selected Items
                  </h2>
                </div>

                <p className="text-desc mb-6">
                  Are you sure you want to delete {selectedItems.size} selected item{selectedItems.size !== 1 ? 's' : ''} from your history? This action cannot be undone.
                </p>

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-4 py-2 text-periwinkle border border-periwinkle rounded-md hover:bg-periwinkle hover:bg-opacity-10 transition-colors font-lato"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRemoveSelected}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors font-lato"
                  >
                    Delete {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;