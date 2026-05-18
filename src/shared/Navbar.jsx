import { useState, useEffect } from "react";
import Logo from "../assets/BytehiveLogo.png";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../context/profileContext";
import { useNotifications } from "../context/NotificationContext";
import { useAuth } from "../context/auth";
import { useTheme } from "../context/ThemeContext";
import StreakDropdown from "../components/Retention/StreakDropdown";
import { PrimaryButton, SecondaryButton } from "../components/UI";
import { getUserStreak } from "../api/retentionApi";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [streakDropdownOpen, setStreakDropdownOpen] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);
  const { profile } = useProfile()
  const { auth } = useAuth()
  const { notifications, markAllAsRead } = useNotifications()
  const { logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isAdmin = auth?.user?.role === "admin"

  useEffect(() => {
    fetchCurrentStreak();
    // Refresh streak every 10 seconds to get real-time updates
    const streakInterval = setInterval(() => {
      fetchCurrentStreak();
    }, 10000);
    return () => clearInterval(streakInterval);
  }, []);

  const fetchCurrentStreak = async () => {
    try {
      const streakData = await getUserStreak();
      // Handle different response structures
      const streakValue = streakData?.streak?.current_streak ||
        streakData?.current_streak ||
        streakData?.data?.current_streak ||
        0;
      setCurrentStreak(streakValue);
    } catch (error) {
      console.error('Error fetching streak:', error);
      setCurrentStreak(0);
    }
  };

  return (
    <header className="bg-navbar-bg backdrop-blur-sm sticky top-0 z-50 border-b border-navbar-border">
      <div className="container mx-auto px-5 sm:px-7 lg:px-10">
        <div className="flex justify-between items-center py-3">
          {/* LOGO + TITLE */}
          <div className="flex items-center space-x-1">
            <img src={Logo} alt="ByteHive Logo" className="w-14 h-14 object-contain" />
            <a href="/" >
              <h1 className="font-fenix text-3xl tracking-wide text-white">
                Bytehive
              </h1>
            </a>

          </div>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center space-x-3">
            <nav className="flex items-center space-x-3 text-xl">
              <SecondaryButton title="Explore" onClick={() => navigate('/events')} className="text-columbia-blue hover:text-white p-0 rounded-md font-fenix">
                <span className="material-icons text-4xl hover:text-white transition-transform hover:scale-105">grid_view</span>
              </SecondaryButton>
              <SecondaryButton title="Saved" onClick={() => navigate('/saved')} className="text-columbia-blue hover:text-white p-0 font-fenix">
                <span className="material-icons text-4xl hover:text-white transition-transform hover:scale-105">bookmark</span>
              </SecondaryButton>
              <SecondaryButton title="Communities" onClick={() => navigate('/communities')} className="text-columbia-blue hover:text-white p-0 rounded-md font-fenix">
                <span className="material-icons text-4xl hover:text-white transition-transform hover:scale-105">groups</span>
              </SecondaryButton>
            </nav>

            {/* Right side (desktop) */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <SecondaryButton title="Streak" onClick={() => setStreakDropdownOpen(!streakDropdownOpen)} className="flex items-center text-pinkish hover:text-pinkish-dark transition-colors group relative p-0">
                  <span className="material-icons text-4xl text-pinkish-important hover:scale-105 transition-transform">local_fire_department</span>
                  <span className="text-columbia-blue text-sm font-bold ml-1">{currentStreak}</span>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-rich-black-light text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-navbar-border">
                    View Streak
                  </div>
                </SecondaryButton>
                {streakDropdownOpen && <StreakDropdown isOpen={true} onClose={() => setStreakDropdownOpen(false)} />}
              </div>

              <SecondaryButton title="Notifications" onClick={async () => { try { await markAllAsRead(); } catch (e) { console.warn('markAllAsRead failed', e); } navigate('/notifications'); }} className="text-columbia-blue hover:text-white p-0 rounded-md relative flex items-center justify-center">
                <span className="material-icons text-4xl hover:scale-105 transition-transform">notifications</span>
                {notifications && notifications.some(n => n.status === 'unread') && (
                  <span className="absolute top-0 right-0 min-w-5 h-5 flex items-center justify-center rounded-full bg-medium-slate-blue text-white text-xs font-bold px-1" style={{ transform: 'translate(25%, -25%)' }}>
                    {(() => {
                      const count = notifications.filter(n => n.status === 'unread').length;
                      return count > 99 ? '99+' : count;
                    })()}
                  </span>
                )}
              </SecondaryButton>

              {/* Theme Toggle Button */}
              <SecondaryButton title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'} onClick={toggleTheme} className="text-columbia-blue hover:text-white p-0 rounded-md flex items-center justify-center">
                <span className="material-icons text-4xl hover:scale-105 transition-transform">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
              </SecondaryButton>

              <div className="flex items-center justify-center relative cursor-pointer" onClick={() => setProfileDropdown(!profileDropdown)}>
                <img
                  alt="User avatar"
                  className="w-11 h-11 rounded-full border-2 border-transparent hover:border-periwinkle transition-all cursor-pointer"
                  src={profile?.profileImage}
                />

                {/* Profile Dropdown */}
                {profileDropdown && (
                  <div className="absolute top-full right-0 mt-2 bg-rich-black-light border border-navbar-border rounded-md shadow-lg z-50 min-w-48">
                    <PrimaryButton
                      onClick={() => {
                        navigate("/history");
                        setProfileDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 text-columbia-blue hover:text-white hover:bg-periwinkle-light transition-colors"
                    >
                      <span className="material-icons text-2xl">history</span>
                      <span>History</span>
                    </PrimaryButton>
                    <PrimaryButton
                      onClick={() => {
                        navigate("/profile");
                        setProfileDropdown(false);
                      }}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 text-columbia-blue hover:text-white hover:bg-periwinkle-light transition-colors border-t border-navbar-border"
                    >
                      <span className="material-icons text-2xl">account_circle</span>
                      <span>Profile</span>
                    </PrimaryButton>
                    {isAdmin && (
                        <PrimaryButton
                        onClick={() => {
                          navigate("/admin/dashboard");
                          setProfileDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center space-x-3 text-columbia-blue hover:text-white hover:bg-periwinkle-light transition-colors border-t border-navbar-border"
                      >
                        <span className="material-icons text-2xl">admin_panel_settings</span>
                        <span>Admin Panel</span>
                      </PrimaryButton>
                    )}
                    <PrimaryButton
                      onClick={() => {
                        logout();
                        setProfileDropdown(false);
                        navigate("/");
                      }}
                      className="w-full px-4 py-3 text-left flex items-center space-x-3 text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors border-t border-navbar-border"
                    >
                      <span className="material-icons text-2xl">logout</span>
                      <span>Logout</span>
                    </PrimaryButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE MENU BUTTON */}
          <div className="md:hidden flex items-center">
            <SecondaryButton onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-columbia-blue hover:text-white p-0 rounded-md">
              <span className="material-icons text-4xl">{mobileMenuOpen ? 'close' : 'menu'}</span>
            </SecondaryButton>
          </div>
        </div>
      </div>

      {/* MOBILE DROPDOWN */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navbar-bg border-t border-navbar-border px-4 py-4 space-y-2 text-lg">
            <SecondaryButton onClick={() => navigate("/communities")} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl">groups</span>
            <span>Communities</span>
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate("/events")} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl">event</span>
            <span>Events</span>
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate("/saved")} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl">bookmark</span>
            <span>Saved</span>
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate("/history")} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl">history</span>
            <span>History</span>
          </SecondaryButton>
          <SecondaryButton onClick={() => setStreakDropdownOpen(!streakDropdownOpen)} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl text-pinkish-important">local_fire_department</span>
            <span>Streak ({currentStreak})</span>
          </SecondaryButton>
          <SecondaryButton onClick={() => navigate("/profile")} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl">account_circle</span>
            <span>Profile</span>
          </SecondaryButton>
          {/* Mobile Theme Toggle */}
          <SecondaryButton onClick={toggleTheme} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left hover:bg-white/5 font-fenix">
            <span className="material-icons text-2xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </SecondaryButton>
          <SecondaryButton onClick={() => {
            logout();
            navigate("/");
          }} className="w-full justify-start gap-4 px-4 py-3 rounded-xl text-left text-red-300 hover:bg-red-900/20 hover:text-red-200 font-fenix">
            <span className="material-icons text-2xl">logout</span>
            <span>Logout</span>
          </SecondaryButton>
        </div>
      )}

      {/* Streak Dropdown */}
      {streakDropdownOpen && !mobileMenuOpen && (
        <div className="hidden md:block">
          {/* Dropdown is now rendered inside the relative div on desktop */}
        </div>
      )}
    </header>
  );
}