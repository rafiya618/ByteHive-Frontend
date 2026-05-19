import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { jwtDecode } from "jwt-decode";
import BlogListing from "./pages/BlogListing";
import CreatePost from "./pages/CreatePost";
import EventsListing from "./pages/EventsListing";
import CreateEvent from "./pages/CreateEvent";
import BlogDetailPage from "./pages/BlogDetailPage";
import Register from "./pages/Auth/Register/Register";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import GoogleAuth from "./pages/Auth/GoogleAuth";
import PageNotFound from "./pages/PageNotFound";
import NotificationPage from "./pages/Notification/NotificationPage";
import { Toaster } from "react-hot-toast";
import ProfilePage from "./pages/ProfilePage";
import ProfileSetupPage from "./pages/Auth/Register/ProfileSetupPage";
import TagSelectionPage from "./pages/Auth/Register/TagSelectionPage";
import { useAuth } from "./context/auth";
import CreateCommunity from "./pages/CreateCommunity";
import Communities from "./pages/Communities";
import CommunityDetail from "./pages/CommunityDetail";
import CommentPage from "./pages/CommentPage";
import ProtectedRoute from "./components/Routes/ProtectedRoute";
import PublicRoute from "./components/Routes/PublicRoute";
import ChatPage from "./pages/ChatPage";
import SavedItems from "./pages/SavedItems";
import History from "./pages/History";
import Streak from "./pages/Streak";
import { useParams } from "react-router-dom";
import HomePage from "./pages/VideoCall/HomePage";
import Room from "./pages/VideoCall/Room";
import Dashboard from "./pages/Admin/Dashboard";
import Users from "./pages/Admin/Users";
import Posts from "./pages/Admin/Posts";
import AdminCommunities from "./pages/Admin/Communities";
import Reports from "./pages/Admin/Reports";
import Announcements from "./pages/Admin/Announcements";
import AdminCommunityDetail from "./pages/Admin/CommunityDetailAdmin";
import SystemAnnouncementPage from "./pages/Notification/SystemAnnouncementPage";

function RoomWrapper() {
  const { roomId } = useParams();
  return <Room roomId={roomId} />;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setAuth } = useAuth();

  const replaceHashRoute = (path) => {
    window.history.replaceState({}, "", `${window.location.origin}/#${path}`);
  };

  useEffect(() => {
    const search = window.location.search || location.search || "";
    const params = new URLSearchParams(search);
    const token = params.get("token");
    const error = params.get("error");
    const message = params.get("message");

    if (!token && !error) return;

    if (error) {
      toast.error(message || error);
      replaceHashRoute("/login");
      navigate("/login", { replace: true });
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("Auth", JSON.stringify({ token }));
        setAuth({ token, user: decoded });

        if (message) toast.success(message);
        else toast.success("Authentication successful!");

        const nextRoute = Number(decoded?.onboardingStep) === 2 ? "/setup-profile" : "/";
        replaceHashRoute(nextRoute);
        navigate(nextRoute, { replace: true });
      } catch {
        toast.error("Invalid authentication token.");
        replaceHashRoute("/login");
        navigate("/login", { replace: true });
      }
    }
  }, [location.search, navigate, setAuth]);

  return (
    <>
      <Toaster />
      <Routes>
        {/* Public routes */}
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/google-auth" element={<PublicRoute><GoogleAuth /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />

        {/* Everything else is protected */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                {/* <Route path="/google-auth" element={<GoogleAuth />} /> */}
                <Route path="/setup-profile" element={<RequireStep minStep={2}><ProfileSetupPage /></RequireStep>} />
                <Route path="/select-tags" element={<RequireStep minStep={3}><TagSelectionPage /></RequireStep>} />
                <Route path="/profile" element={<RequireStep minStep={4}><ProfilePage /></RequireStep>} />
                <Route path="/profile/:id" element={<RequireStep minStep={4}><ProfilePage /></RequireStep>} />
                <Route path="/" element={<RequireStep minStep={4}><BlogListing /></RequireStep>} />
                <Route path="/create-post" element={<CreatePost />} />
                <Route path="/events" element={<EventsListing />} />
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/comment" element={<RequireStep minStep={4}><CommentPage /></RequireStep>} />
                <Route path="/post/:postId" element={<BlogDetailPage />} />
                <Route path="/post" element={<BlogDetailPage postId="1" />} />
                <Route path="/create-community" element={<CreateCommunity />} />
                <Route path="/communities" element={<Communities />} />
                <Route path="/community/:id" element={<CommunityDetail />} />
                <Route path="/chat/:communityId" element={<ChatPage />} />
                <Route path="/room1/:roomId" element={<ChatPage />} />
                <Route path="/saved" element={<RequireStep minStep={4}><SavedItems /></RequireStep>} />
                <Route path="/streak" element={<RequireStep minStep={4}><Streak /></RequireStep>} />
                <Route path="/history" element={<RequireStep minStep={4}><History /></RequireStep>} />
                <Route path="/video-home" element={<HomePage />} />
                <Route path="/room/:roomId" element={<RoomWrapper />} />
                <Route path="/notifications" element={<RequireStep minStep={4}><NotificationPage /></RequireStep>} />
                
                {/* Admin Routes */}
                <Route path="/admin/dashboard" element={<AdminRoute><Dashboard /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminRoute><Users /></AdminRoute>} />
                <Route path="/admin/posts" element={<AdminRoute><Posts /></AdminRoute>} />
                <Route path="/admin/communities" element={<AdminRoute><AdminCommunities /></AdminRoute>} />
                <Route path="/admin/communities/:id" element={<AdminRoute><AdminCommunityDetail /></AdminRoute>} />
                <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
                <Route path="/admin/announcements" element={<AdminRoute><Announcements /></AdminRoute>} />
                <Route path="/system/announcement/:announcementId" element={<RequireStep minStep={4}><SystemAnnouncementPage /></RequireStep>} />
                
                <Route path="*" element={<PageNotFound />} />
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

// Same RequireStep as before
function getRedirectPath(step) {
  if (!step) return "/login";
  if (step === 1) return "/register";
  if (step === 2) return "/setup-profile";
  if (step === 3) return "/select-tags";
  return "/";
}

function RequireStep({ minStep, children }) {
  const { auth, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const userStep = auth?.token ? auth?.user?.onboardingStep : 1;
  if (userStep < minStep) {
    return <Navigate to={getRedirectPath(userStep)} />;
  }
  return children;
}

// Restrict admin-only routes; non-admins are redirected home
function AdminRoute({ children }) {
  const { auth, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  const role = auth?.user?.role;
  if (!auth?.token || role !== "admin") {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default App;
