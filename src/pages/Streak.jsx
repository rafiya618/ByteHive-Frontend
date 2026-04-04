import { useState, useEffect } from 'react';
import { getUserStreak, getUserStats, getLeaderboard } from '../api/retentionApi';
import toast from 'react-hot-toast';

// Import Badge Assets
import L1Badge from '../assets/badges/NoviceExplorer.png';
import L2Badge from '../assets/badges/ActiveContributor.png';
import L3Badge from '../assets/badges/EngagedMember.png';
import L4Badge from '../assets/badges/CommunityChampion.png';
import L5Badge from '../assets/badges/MasterScholar.png';

export default function StreakPage() {
  const [streak, setStreak] = useState(null);
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    try {
      const [streakData, statsData, leaderboardData] = await Promise.all([
        getUserStreak(),
        getUserStats(),
        getLeaderboard()
      ]);
      
      setStreak(streakData?.streak || streakData);
      setStats(statsData?.stats || statsData);
      setLeaderboard(leaderboardData?.leaderboard || leaderboardData || []);
    } catch (error) {
      console.error('Error fetching streak data:', error);
      toast.error('Failed to load streak data');
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      1: 'bg-blue-500',
      2: 'bg-purple-500',
      3: 'bg-pink-500',
      4: 'bg-orange-500',
      5: 'bg-red-500'
    };
    return colors[level] || colors[1];
  };

  const getLevelName = (level) => {
    const names = {
      1: 'Novice Explorer',
      2: 'Active Contributor',
      3: 'Engaged Member',
      4: 'Community Champion',
      5: 'Master Scholar'
    };
    return names[level] || 'Novice Explorer';
  };

  const getBadgeImage = (level) => {
    const images = {
      1: L1Badge,
      2: L2Badge,
      3: L3Badge,
      4: L4Badge,
      5: L5Badge
    };
    return images[level] || L1Badge;
  };

  const getBadgeIcon = (badgeName) => {
    const badges = {
      'First Step': 'flag',
      'Weekly Warrior': 'local_fire_department',
      'Monthly Milestone': 'emoji_events',
      'Read Master': 'menu_book',
      'Post Prodigy': 'create',
      'Comment King': 'chat',
      'Like Legend': 'favorite',
      'Consistency Champion': 'local_fire_department',
      'Community Champion': L4Badge,
      'Unstoppable': 'flash',
      'Novice Explorer': L1Badge,
      'Active Contributor': L2Badge,
      'Engaged Member': L3Badge,
      'Master Scholar': L5Badge,
      // Legacy names mapping
      'Apprentice Adventurer': L2Badge,
      'Expert Navigator': L3Badge,
      'Master Voyager': L4Badge,
      'Legendary Pioneer': L5Badge
    };
    return badges[badgeName] || 'military_tech';
  };

  return (
    <div className="min-h-screen bg-rich-black pt-24 pb-12">
      <div className="container mx-auto px-5 sm:px-7 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <span className="material-icons text-6xl">local_fire_department</span>
            <div>
              <h1 className="text-4xl font-bold text-white">Your Streak</h1>
              <p className="text-columbia-blue">Track your daily engagement and climb the ranks</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-navbar-border mb-6 gap-2 overflow-x-auto pb-3">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-b-2 border-pinkish text-pinkish'
                : 'text-columbia-blue hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'stats'
                ? 'border-b-2 border-pinkish text-pinkish'
                : 'text-columbia-blue hover:text-white'
            }`}
          >
            Stats
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`py-2 px-4 font-semibold transition-colors whitespace-nowrap ${
              activeTab === 'leaderboard'
                ? 'border-b-2 border-pinkish text-pinkish'
                : 'text-columbia-blue hover:text-white'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              {/* Streak Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Current Streak */}
                <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-lg p-8 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-5xl">🔥</span>
                    <span className="text-sm font-semibold bg-black bg-opacity-30 px-3 py-1 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-sm opacity-90 mb-2">Current Streak</p>
                  <p className="text-6xl font-bold">{streak?.current_streak || 0}</p>
                  <p className="text-sm opacity-75 mt-2">days in a row</p>
                </div>

                {/* Longest Streak */}
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-8 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <span className="material-icons text-5xl">emoji_events</span>
                    <span className="text-sm font-semibold bg-black bg-opacity-30 px-3 py-1 rounded-full">
                      Record
                    </span>
                  </div>
                  <p className="text-sm opacity-90 mb-2">Longest Streak</p>
                  <p className="text-6xl font-bold">{streak?.longest_streak || 0}</p>
                  <p className="text-sm opacity-75 mt-2">all time</p>
                </div>
              </div>

              {/* Level and Progress */}
              <div className="bg-periwinkle-light rounded-lg p-8">
                <div className="flex items-center space-x-6 mb-6">
                  <div className="flex items-center justify-center">
                    <img 
                      src={getBadgeImage(streak?.current_level)} 
                      alt={getLevelName(streak?.current_level)} 
                      className="w-32 h-32 object-contain"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-columbia-blue uppercase tracking-wider">Current Level</p>
                    <p className="text-4xl font-bold text-white">{getLevelName(streak?.current_level)}</p>
                    <p className="text-sm text-columbia-blue mt-2">
                      {streak?.current_streak || 0} / 30 days to next level
                    </p>
                  </div>
                </div>
                <div className="bg-rich-black-light rounded-full h-3 overflow-hidden">
                  <div
                    className={`${getLevelColor(streak?.current_level)} h-full transition-all duration-500`}
                    style={{ width: `${Math.min((streak?.current_streak / 30) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Total Days Active */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-8 text-white">
                <p className="text-sm opacity-90 mb-2">Total Days Active</p>
                <p className="text-5xl font-bold">{streak?.total_days_active || 0}</p>
                <p className="text-sm opacity-75 mt-2">days on ByteHive</p>
              </div>

              {/* Badges */}
              {streak?.badge_details && streak.badge_details.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
                    <span className="material-icons">military_tech</span>
                    <span>Earned Badges</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {streak.badge_details.map((badge, index) => {
                      const icon = getBadgeIcon(badge.badge_name);
                      const isImage = typeof icon !== 'string' || icon.startsWith('data:') || icon.includes('/');
                      
                      return (
                        <div key={index} className="bg-periwinkle-light rounded-lg p-6 text-center hover:bg-periwinkle-light hover:shadow-lg transition-all flex flex-col items-center">
                          {isImage ? (
                            <img src={icon} alt={badge.badge_name} className="w-20 h-20 object-contain mb-3" />
                          ) : (
                            <span className="material-icons text-4xl mb-3">{icon}</span>
                          )}
                          <p className="text-sm font-semibold text-white mb-2">{badge.badge_name}</p>
                          <p className="text-xs text-columbia-blue">{badge.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(!streak?.badge_details || streak.badge_details.length === 0) && (
                <div className="bg-periwinkle-light rounded-lg p-8 text-center">
                  <p className="text-columbia-blue text-lg">Keep building your streak to earn badges! <span className="material-icons text-lg align-middle">military_tech</span></p>
                </div>
              )}
            </>
          )}

          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Posts */}
                <div className="bg-periwinkle-light rounded-lg p-6">
                  <div className="material-icons text-4xl mb-3">create</div>
                  <p className="text-xs text-columbia-blue uppercase mb-2 font-semibold">Posts</p>
                  <p className="text-4xl font-bold text-white">{streak?.total_posts || stats?.total_posts || 0}</p>
                </div>

                {/* Reads */}
                <div className="bg-periwinkle-light rounded-lg p-6">
                  <div className="material-icons text-4xl mb-3">menu_book</div>
                  <p className="text-xs text-columbia-blue uppercase mb-2 font-semibold">Reads</p>
                  <p className="text-4xl font-bold text-white">{streak?.total_reads || stats?.total_reads || 0}</p>
                </div>

                {/* Comments */}
                <div className="bg-periwinkle-light rounded-lg p-6">
                  <div className="material-icons text-4xl mb-3">chat</div>
                  <p className="text-xs text-columbia-blue uppercase mb-2 font-semibold">Comments</p>
                  <p className="text-4xl font-bold text-white">{streak?.total_comments || stats?.total_comments || 0}</p>
                </div>

                {/* Likes */}
                <div className="bg-periwinkle-light rounded-lg p-6">
                  <div className="material-icons text-4xl mb-3">favorite</div>
                  <p className="text-xs text-columbia-blue uppercase mb-2 font-semibold">Likes</p>
                  <p className="text-4xl font-bold text-white">{streak?.total_likes || stats?.total_likes || 0}</p>
                </div>
              </div>

              {/* Reset Count */}
              <div className="bg-periwinkle-light rounded-lg p-6">
                <p className="text-sm text-columbia-blue uppercase mb-3 font-semibold">Streak Resets</p>
                <p className="text-4xl font-bold text-white">{streak?.reset_count || 0}</p>
                <p className="text-sm text-columbia-blue mt-2">Times your streak has reset</p>
              </div>
            </div>
          )}

          {/* LEADERBOARD TAB */}
          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
              {leaderboard.length > 0 ? (
                <div className="space-y-2">
                  {leaderboard.map((user, index) => (
                    <div
                      key={user.user_id}
                      className="bg-periwinkle-light rounded-lg p-6 flex items-center justify-between hover:bg-periwinkle-light transition-colors"
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className={`${getLevelColor(user.current_level)} rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-lg">{user.user_name || `User ${user.user_id}`}</p>
                          <p className="text-sm text-columbia-blue">{getLevelName(user.current_level)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-orange-500">
                          <span className="material-icons text-2xl">local_fire_department</span>
                          <span className="font-bold text-xl">{user.current_streak}</span>
                        </div>
                        <p className="text-sm text-columbia-blue">streak</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-periwinkle-light rounded-lg p-8 text-center">
                  <p className="text-columbia-blue text-lg">No leaderboard data available yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
