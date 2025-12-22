import React from "react";
import { reGetTrendingCommunities } from "../../api/reApi";
import { communityApi } from "../../api/communityApi";

const PopularCommunities = () => {
  const [items, setItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Fetch trending communities from RE
        const trending = await reGetTrendingCommunities(8);
        
        // Fetch all communities to map names to IDs
        const allCommunitiesData = await communityApi.getAllCommunities();
        const allCommunities = allCommunitiesData?.communities || [];
        console.log('All communities fetched:', allCommunities.length);
        console.log('Available community names:', allCommunities.map(c => c.community_name || c.name));
        
        // Map trending community names to their MongoDB IDs
        const details = trending.map(t => {
          console.log('Looking for trending community:', t.communityId);
          
          // Try different field combinations for matching
          let community = allCommunities.find(
            c => (c.community_name === t.communityId || 
                  c.name === t.communityId ||
                  c._id === t.communityId)
          );
          
          // If no exact match, try case-insensitive
          if (!community) {
            community = allCommunities.find(
              c => (c.community_name?.toLowerCase() === t.communityId?.toLowerCase() || 
                    c.name?.toLowerCase() === t.communityId?.toLowerCase())
            );
          }
          
          // Always use the actual MongoDB _id, never fallback to communityId (which is a name)
          const communityId = community?._id;
          if (!communityId) {
            console.warn('Could not find MongoDB ID for community:', t.communityId, 
                        'Available:', allCommunities.map(c => ({ name: c.community_name, id: c._id })));
          } else {
            console.log('✅ Found community ID for', t.communityId, ':', communityId);
          }
          
          return {
            id: communityId,
            name: t.communityId,
            score: t.score
          };
        }).filter(item => item.id); // Filter out items without valid IDs
        
        if (!cancelled) setItems(details);
      } catch (e) {
        console.error('Trending communities error:', e);
        if (!cancelled) setErr(e?.message || 'Failed to load trending communities');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-5 md:p-6 z-0">
      <div className="flex justify-between items-baseline mb-6 gap-16">
        <h3 className="font-fenix text-xl text-white">Trending Communities</h3>
      </div>

      {loading ? (
        <div className="text-periwinkle text-sm">Loading...</div>
      ) : err ? (
        <div className="text-red-400 text-sm">{err}</div>
      ) : (
        <ul className="space-y-4">
          {items.map((community) => (
            <li key={community.id} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--periwinkle)] text-rich-black font-semibold">
                  {community.name.charAt(0)}
                </div>
                <span className="text-desc font-lato font-medium  text-[16px]">{community.name}</span>
              </div>

              <a
                href={`/community/${community.id}`}
                className="px-5 py-1 rounded-xl border-2 border-navbar-border text-periwinkle text-[15px] hover:text-white hover:border-periwinkle transition-colors"
              >
                View
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PopularCommunities;