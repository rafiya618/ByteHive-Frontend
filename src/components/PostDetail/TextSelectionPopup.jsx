import { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getMeaning, searchBlogs, getRelatedBlogs, chatAboutWord, simplifyPost } from "../../api/smartReadingApi";
import toast from "react-hot-toast";
import { TEXT_SELECTION } from "../../utils/constants";
import { validateTextSelection, validateSearchQuery, stripHTML } from "../../utils/validation";
import { PrimaryButton, SecondaryButton } from '../UI';


const TextSelectionPopup = ({ selectedText, onClose }) => {
  const [activeTab, setActiveTab] = useState("search"); // Default to search, will adjust based on selection
  const [showContent, setShowContent] = useState(false);
  const [meaningData, setMeaningData] = useState(null);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [loadingMeaning, setLoadingMeaning] = useState(false);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [searchQuery, setSearchQuery] = useState(selectedText);
  const [chatMessages, setChatMessages] = useState([]);
  const [simplifiedContent, setSimplifiedContent] = useState(null);
  const [loadingSimplify, setLoadingSimplify] = useState(false);
  const [showSimplifyDialog, setShowSimplifyDialog] = useState(false);
  const [simplifyView, setSimplifyView] = useState("original"); // "original" or "simplified"
  const [validationError, setValidationError] = useState(null);
  const navigate = useNavigate();

  // Validate selected text on mount and set default tab
  useEffect(() => {
    const validation = validateTextSelection(selectedText);

    if (!validation.valid) {
      setValidationError(validation.error);
      setActiveTab(""); // No tab active on error
    } else {
      setValidationError(null);
      // Set default tab based on word count
      if (validation.wordCount === 1) {
        setActiveTab("meaning");
      } else {
        setActiveTab("search");
      }
    }
  }, [selectedText]);

  // Clear states when selected text changes
  useEffect(() => {
    setChatMessages([]);
    setSearchQuery(selectedText);
    setMeaningData(null);
    setRelatedBlogs([]);
    setSimplifiedContent(null);
    setSimplifyView("original");
    setShowSimplifyDialog(false);
  }, [selectedText]);

  const fetchMeaning = useCallback(async () => {
    try {
      setLoadingMeaning(true);
      const word = selectedText.split(" ")[0];
      const data = await getMeaning(word);
      setMeaningData(data);
    } catch (error) {
      console.error("Error fetching meaning:", error);
      // Show error state instead of placeholder
      setMeaningData({
        error: true,
        word: selectedText.split(" ")[0],
        message: error.message || 'Failed to fetch meaning from AI. Please try again.'
      });
    } finally {
      setLoadingMeaning(false);

      // Log word meaning activity
      try {
        const { logActivity } = await import('../../api/retentionApi');
        await logActivity('word_meaning', null); // No specific postId
        console.log('✅ [TEXT-SELECTION] Word meaning activity logged');
      } catch (error) {
        console.error('❌ [TEXT-SELECTION] Failed to log word meaning activity:', error);
      }
    }
  }, [selectedText]);

  const fetchRelatedBlogs = useCallback(async () => {
    const cacheKey = `relatedBlogs_${selectedText}`;
    const cachedData = localStorage.getItem(cacheKey);

    if (cachedData) {
      try {
        const { data, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        const cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds

        if (cacheAge < cacheExpiry) {
          // Safety check: ensure cached items have IDs
          const hasIds = data.every(p => p.postId || p.id);
          if (hasIds) {
            setRelatedBlogs(data);
            setLoadingBlogs(false);
            return;
          } else {
            console.warn('⚠️ [SMART-LOOKUP] Local cache missing IDs. Invalidate...');
            localStorage.removeItem(cacheKey);
          }
        } else {
          localStorage.removeItem(cacheKey);
        }
      } catch (error) {
        console.warn('Error parsing cached blogs:', error);
        localStorage.removeItem(cacheKey);
      }
    }

    try {
      setLoadingBlogs(true);
      const blogs = await getRelatedBlogs(selectedText);
      setRelatedBlogs(blogs);

      // Cache the result
      const cacheData = {
        data: blogs,
        timestamp: Date.now(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("Error fetching related blogs:", error);
      setRelatedBlogs([]);
    } finally {
      setLoadingBlogs(false);
    }
  }, [selectedText]);

  const handleOutsideClick = useCallback((e) => {
    if (!e.target.closest('.popup-content')) {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    setShowContent(true);
    // Fetch related blogs when popup opens so the Blogs tab has content immediately
    if (!validationError) {
      fetchRelatedBlogs();
    }
  }, [selectedText, fetchMeaning, fetchRelatedBlogs]);

  // Fetch meaning when meaning tab is active
  useEffect(() => {
    if (activeTab === "meaning" && !validationError) {
      fetchMeaning();
    }
  }, [activeTab, fetchMeaning, validationError]);

  // Fetch related blogs when blogs tab is active
  useEffect(() => {
    if (activeTab === "blogs" && !validationError) {
      fetchRelatedBlogs();
    }
  }, [activeTab, fetchRelatedBlogs, validationError]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    // Validate search query (15-word max)
    const searchValidation = validateSearchQuery(searchQuery);
    if (!searchValidation.valid) {
      toast.error(searchValidation.error);
      return;
    }

    try {
      setLoadingBlogs(true);

      // Get AI response
      const chatResponse = await chatAboutWord(selectedText.split(" ")[0], searchQuery);
      console.log('Chat response received:', chatResponse);

      // Handle different response structures
      let aiContent = '';
      if (typeof chatResponse === 'string') {
        aiContent = chatResponse;
      } else if (chatResponse && chatResponse.aiResponse) {
        aiContent = chatResponse.aiResponse;
      } else if (chatResponse && typeof chatResponse === 'object') {
        // Check for structured response
        if (chatResponse.summary || chatResponse.keyPoints) {
          aiContent = chatResponse; // Keep the object structure
        } else {
          // Try to find the response in any property
          aiContent = chatResponse.response || chatResponse.message || chatResponse.content || JSON.stringify(chatResponse);
        }
      }

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiContent,
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, aiMessage]);

      // Also search for blogs
      const blogs = await searchBlogs(searchQuery);
      setRelatedBlogs(blogs);
      setActiveTab("search");
      setSearchQuery(selectedText + " "); // Reset to selected word + space for next input

      // Activity recording removed
    } catch (error) {
      console.error("Error searching:", error);
      toast.error("Search failed");

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: {
          error: true,
          message: error.message || 'Failed to get AI response. Please try again.'
        },
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleSimplify = async () => {
    try {
      setLoadingSimplify(true);
      // For now, we'll simplify the selected text itself
      // In a real implementation, you'd get the full post content
      const simplified = await simplifyPost("temp-post-id", selectedText, "detailed_summary");
      setSimplifiedContent(simplified);
      setShowSimplifyDialog(true);
    } catch (error) {
      console.error("Error simplifying:", error);
      toast.error("Simplification failed");
    } finally {
      setLoadingSimplify(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [handleOutsideClick]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      style={{ display: showContent ? 'block' : 'none' }}
    >
      <div
        className="popup-content fixed bg-navbar-bg border border-navbar-border rounded-xl shadow-2xl w-96 max-w-sm 
             top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >

        {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-navbar-border">
          <div className="flex items-center space-x-2">
            <span className="material-icons text-periwinkle">auto_fix_high</span>
            <h3 className="font-semibold text-white">Smart Lookup</h3>
          </div>
          <SecondaryButton onClick={onClose} className="text-periwinkle hover:text-white p-1 rounded-lg hover:bg-periwinkle-light transition-colors">
            <span className="material-icons">close</span>
          </SecondaryButton>
        </div>

        {/* Validation Error Display */}
        {validationError && (
          <div className="p-4 bg-red-500/10 border-b border-red-500/30">
            <div className="flex items-start space-x-3">
              <span className="material-icons text-red-400 text-xl">error</span>
              <div className="flex-1">
                <p className="text-red-400 font-semibold text-sm">Selection Error</p>
                <p className="text-red-300 text-xs mt-1">{validationError}</p>
                <p className="text-red-200/70 text-xs mt-2">
                  Selected: {validateTextSelection(selectedText).wordCount} {validateTextSelection(selectedText).wordCount === 1 ? 'word' : 'words'}
                  {' '}(Max: {TEXT_SELECTION.MAX_WORDS} words)
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Text Display */}
        <div className="p-4 bg-rich-black-light border-b border-navbar-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex-1">
              <p className="text-periwinkle text-sm font-semibold mb-1">Selected Text:</p>
              <div className="min-h-8 flex items-center">
                {loadingSimplify ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin">
                      <span className="material-icons text-periwinkle">hourglass_top</span>
                    </div>
                    <span className="text-periwinkle text-sm">Simplifying...</span>
                  </div>
                ) : (
                  <p className="text-white italic">
                    "{simplifyView === "simplified" && simplifiedContent
                      ? simplifiedContent.simplifiedContent
                      : (() => {
                        const words = selectedText.split(' ');
                        const truncated = words.slice(0, 15).join(' ');
                        return truncated + (words.length > 15 ? '...' : '');
                      })()}"
                  </p>
                )}
              </div>
            </div>
            <PrimaryButton onClick={handleSimplify} disabled={loadingSimplify || validationError} className="px-3 py-2 text-sm">
              {loadingSimplify ? 'Simplifying...' : 'Simplify'}
            </PrimaryButton>
          </div>

          {/* View Toggle Buttons */}
          {simplifiedContent && !loadingSimplify && (
            <div className="flex space-x-2">
              <SecondaryButton onClick={() => setSimplifyView('original')} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${simplifyView === 'original' ? 'bg-periwinkle text-rich-black' : 'bg-rich-black text-periwinkle border border-periwinkle hover:bg-periwinkle-light'}`}>
                Original
              </SecondaryButton>
              <SecondaryButton onClick={() => setSimplifyView('simplified')} className={`px-3 py-1 rounded-lg text-sm font-semibold transition-colors ${simplifyView === 'simplified' ? 'bg-periwinkle text-rich-black' : 'bg-rich-black text-periwinkle border border-periwinkle hover:bg-periwinkle-light'}`}>
                Simplified
              </SecondaryButton>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-navbar-border">
          {validationError ? (
            // NO TABS if validation error (including >15 words)
            <div className="w-full p-4 text-center">
              <span className="material-icons text-red-400 text-2xl mb-2 block">error</span>
              <p className="text-red-400 font-semibold text-sm">Selection Error</p>
              <p className="text-red-300 text-xs mt-1">{validationError}</p>
            </div>
          ) : (
            <>
              {/* Meaning Tab - ONLY for single word selection */}
              {validateTextSelection(selectedText).wordCount === 1 && (
                <SecondaryButton onClick={() => setActiveTab('meaning')} className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'meaning' ? 'text-white bg-medium-slate-blue' : 'text-periwinkle hover:bg-periwinkle-light'}`}>
                  <div className="flex items-center justify-center space-x-2">
                    <span className="material-icons text-lg">book</span>
                    <span>Meaning</span>
                  </div>
                </SecondaryButton>
              )}

              {/* Search Tab - Always visible when no error */}
              <SecondaryButton onClick={() => setActiveTab('search')} className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'search' ? 'text-white bg-medium-slate-blue' : 'text-periwinkle hover:bg-periwinkle-light'}`}>
                <div className="flex items-center justify-center space-x-2">
                  <span className="material-icons text-lg">search</span>
                  <span>Search</span>
                </div>
              </SecondaryButton>

              {/* Blogs Tab - Always visible when no error */}
              <SecondaryButton onClick={() => setActiveTab('blogs')} className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === 'blogs' ? 'text-white bg-medium-slate-blue' : 'text-periwinkle hover:bg-periwinkle-light'}`}>
                <div className="flex items-center justify-center space-x-2">
                  <span className="material-icons text-lg">article</span>
                  <span>Blogs</span>
                </div>
              </SecondaryButton>
            </>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 max-h-80 overflow-y-auto">
          {activeTab === "meaning" && (
            <div className="space-y-4">
              {loadingMeaning ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin">
                    <span className="material-icons">hourglass_top</span>
                  </div>
                  <span className="ml-2 text-periwinkle">Loading definition...</span>
                </div>
              ) : meaningData ? (
                <>
                  {meaningData.error ? (
                    // Error State - AI service failed
                    <div className="text-center py-8 px-4">
                      <span className="material-icons text-5xl text-red-400 mb-3 block">error_outline</span>
                      <p className="text-red-400 font-semibold mb-2">AI Service Error</p>
                      <p className="text-periwinkle/80 text-sm">{meaningData.message}</p>
                      <PrimaryButton onClick={fetchMeaning} className="mt-4 px-4 py-2 text-sm">
                        Retry
                      </PrimaryButton>
                    </div>
                  ) : (
                    // Success State - AI data loaded
                    <div>
                      <h4 className="text-periwinkle font-semibold text-lg mb-2">
                        {meaningData.word}
                        {meaningData.partOfSpeech && (
                          <span className="text-sm font-normal ml-2 text-celadon">
                            {meaningData.partOfSpeech}
                          </span>
                        )}
                      </h4>
                      {meaningData.pronunciation && (
                        <p className="text-periwinkle/80 text-sm mb-3">
                          {meaningData.pronunciation}
                        </p>
                      )}
                      <p className="text-white leading-relaxed">
                        {meaningData.definition}
                      </p>
                      {meaningData.examples && meaningData.examples.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <p className="text-periwinkle text-xs font-semibold">Examples:</p>
                          {meaningData.examples.slice(0, 2).map((example, idx) => (
                            <p key={idx} className="text-white/80 text-sm italic">
                              "{example}"
                            </p>
                          ))}
                        </div>
                      )}
                      {meaningData.synonyms && meaningData.synonyms.length > 0 && (
                        <div className="mt-3">
                          <p className="text-periwinkle text-xs font-semibold mb-1">Synonyms:</p>
                          <p className="text-white/80 text-sm">
                            {meaningData.synonyms.join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-periwinkle/60">Unable to fetch definition</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const value = e.target.value;
                    const words = value.split(/\s+/).filter(word => word.length > 0);
                    if (words.length <= 15) {
                      setSearchQuery(value);
                    }
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full bg-rich-black-light border border-navbar-border rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-periwinkle"
                />
                <SecondaryButton onClick={handleSearch} disabled={loadingBlogs} className="absolute right-3 top-3 text-periwinkle hover:text-white disabled:opacity-50 p-1">
                  <span className="material-icons">send</span>
                </SecondaryButton>
              </div>


              <div className="space-y-3 max-h-60 overflow-y-auto">
                {loadingBlogs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin">
                      <span className="material-icons">hourglass_top</span>
                    </div>
                    <span className="ml-2 text-periwinkle">Thinking...</span>
                  </div>
                ) : (
                  <>
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} `}
                      >
                        <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-lg bg-rich-black-light border border-navbar-border text-white">
                          <div className="space-y-2">
                            {(() => {
                              const content = message.content;

                              // Handle structured object content
                              if (typeof content === 'object' && content !== null) {
                                if (content.error) {
                                  return (
                                    <div className="text-center py-4">
                                      <span className="material-icons text-red-400 text-2xl mb-2 block">error_outline</span>
                                      <p className="text-red-400 font-semibold text-sm mb-1">AI Response Error</p>
                                      <p className="text-red-300 text-xs">{content.message}</p>
                                    </div>
                                  );
                                }
                                return (
                                  <>
                                    {content.summary && (
                                      <div className="text-sm leading-relaxed mb-2 font-medium">
                                        {content.summary}
                                      </div>
                                    )}
                                    {content.keyPoints && Array.isArray(content.keyPoints) && content.keyPoints.length > 0 && (
                                      <ul className="space-y-1">
                                        {content.keyPoints.map((point, idx) => (
                                          <li key={idx} className="text-sm flex items-start">
                                            <span className="text-periwinkle mr-2">•</span>
                                            <span>{point}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                    {/* Fallback if object but empty props */}
                                    {!content.summary && !content.keyPoints && (
                                      <p className="text-sm">{JSON.stringify(content)}</p>
                                    )}
                                  </>
                                );
                              }

                              const lines = String(content).split('\n');
                              const summaryLines = [];
                              const bulletPoints = [];

                              let inSummary = false;
                              let inBullets = false;

                              for (const line of lines) {
                                const trimmed = line.trim();
                                if (trimmed.match(/^\d+\./) && !inSummary && !inBullets) {
                                  // Start of summary (numbered lines)
                                  inSummary = true;
                                  summaryLines.push(trimmed.replace(/^\d+\.\s*/, ''));
                                } else if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                                  // Bullet point
                                  inSummary = false;
                                  inBullets = true;
                                  bulletPoints.push(trimmed.replace(/^[-•]\s*/, ''));
                                } else if (inSummary && trimmed) {
                                  summaryLines.push(trimmed);
                                }
                              }

                              return (
                                <>
                                  {summaryLines.length > 0 && (
                                    <div className="text-sm leading-relaxed mb-2">
                                      {summaryLines.map((line, idx) => (
                                        <p key={idx} className="mb-1">{line}</p>
                                      ))}
                                    </div>
                                  )}
                                  {bulletPoints.length > 0 && (
                                    <ul className="space-y-1">
                                      {bulletPoints.map((point, idx) => (
                                        <li key={idx} className="text-sm flex items-start">
                                          <span className="text-periwinkle mr-2">•</span>
                                          <span>{point}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  {summaryLines.length === 0 && bulletPoints.length === 0 && (
                                    <p className="text-sm">{content}</p>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    ))}

                    {chatMessages.length === 0 && (
                      <div className="text-center py-8">
                        <p className="text-periwinkle/60 text-sm">
                          Start a conversation about "{selectedText.split(" ")[0]}"
                        </p>
                        <p className="text-periwinkle/40 text-xs mt-1">
                          The selected word is preserved in your questions
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === "blogs" && (
            <div className="space-y-4">
              <h4 className="text-periwinkle font-semibold mb-3">Related Articles</h4>
              {loadingBlogs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin">
                    <span className="material-icons">hourglass_top</span>
                  </div>
                  <span className="ml-2 text-periwinkle">Loading articles...</span>
                </div>
              ) : relatedBlogs && relatedBlogs.length > 0 ? (
                <>
                  {relatedBlogs.map((blog, index) => (
                    <Link
                      key={index}
                      to={`/post/${blog.postId || blog.id}`}
                      onClick={() => {
                        console.log('🔗 [SMART-LOOKUP] Navigating via Link to:', blog.postId || blog.id);
                        onClose();
                      }}
                      title={`Read "${blog.title}"`}
                      className="block bg-rich-black-light rounded-lg p-3 border border-navbar-border hover:border-periwinkle transition-all cursor-pointer hover:bg-rich-black-light/80 active:scale-95 group mb-3 last:mb-0"
                    >
                      <h5 className="text-white font-semibold text-sm mb-2 group-hover:text-periwinkle transition-colors">
                        {blog.title}
                      </h5>
                      <p className="text-periwinkle/80 text-xs mb-2">
                        {stripHTML(blog.snippet) || "No description available"}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-celadon text-xs">{blog.readTime}</span>
                        <div className="flex items-center text-periwinkle group-hover:translate-x-1 transition-transform">
                          <span className="text-xs mr-1">Read more</span>
                          <span className="material-icons text-sm">arrow_forward</span>
                        </div>
                      </div>
                    </Link>
                  ))}

                  <PrimaryButton className="w-full py-2 px-4">View All Related</PrimaryButton>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-periwinkle/60">
                    No related articles found for "{selectedText}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Simplify Dialog */}
      {showSimplifyDialog && simplifiedContent && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-navbar-bg border border-navbar-border rounded-xl shadow-2xl w-96 max-w-sm mx-4">
            <div className="flex items-center justify-between p-4 border-b border-navbar-border">
              <h3 className="font-semibold text-white">Simplified Content</h3>
              <SecondaryButton onClick={() => setShowSimplifyDialog(false)} className="text-periwinkle hover:text-white p-1 rounded-lg hover:bg-periwinkle-light transition-colors">
                <span className="material-icons">close</span>
              </SecondaryButton>
            </div>
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="text-periwinkle font-semibold mb-2">Key Takeaways:</h4>
                  <ul className="space-y-1">
                    {simplifiedContent.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="text-white text-sm flex items-start">
                        <span className="text-celadon mr-2">•</span>
                        {takeaway}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-periwinkle font-semibold mb-2">Simplified Text:</h4>
                  <p className="text-white text-sm leading-relaxed">
                    {simplifiedContent.simplifiedContent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextSelectionPopup;