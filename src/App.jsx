import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Homepage from "./pages/homepage";
import Register from "./pages/Auth/Register/Register";
import Login from "./pages/Auth/Login";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import GoogleAuth from "./pages/Auth/GoogleAuth";
import toast, { Toaster } from "react-hot-toast";
import ProfilePage from "./pages/ProfilePage";
import PageNotFound from "./pages/PageNotFound";
import CommentPage from "./pages/CommentPage";
import NotificationPage from "./pages/NotificationPage";
import ProfileSetupPage from "./pages/Auth/Register/ProfileSetupPage";
import TagSelectionPage from "./pages/Auth/Register/TagSelectionPage";
import { useAuth } from "./context/auth";
import PreferencesPage from "./pages/PreferencesPage";
import EnableNotifications from "./pages/EnableNotifications";

function App() {
  return (
    <>
      <Toaster />
      <Routes>
        <Route path="/" element={<RequireStep minStep={4}><Homepage /></RequireStep>} />
        <Route path="/register" element={<Register />} />
        <Route path="/setup-profile" element={<RequireStep minStep={2}><ProfileSetupPage /></RequireStep>} />
        <Route path="/select-tags" element={<RequireStep minStep={3}><TagSelectionPage /></RequireStep>} />
        <Route path="/login" element={<Login />} />
        <Route path="/google-auth" element={<GoogleAuth />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/profile" element={<RequireStep minStep={4}><ProfilePage /></RequireStep>} />
        <Route path="/comment" element={<RequireStep minStep={4}><CommentPage /></RequireStep>} />
        <Route path="/notification" element={<RequireStep minStep={4}><NotificationPage /></RequireStep>} />
        <Route path="/preferences" element={<RequireStep minStep={4}><PreferencesPage /></RequireStep>} />
        <Route path="/enable-notifications" element={<EnableNotifications />} />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

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
    return <div>Loading...</div>; // show spinner/loader until auth is ready
  }

  const userStep = auth?.token ? auth?.user?.onboardingStep : 1;
  if (userStep < minStep) {
    return <Navigate to={getRedirectPath(userStep)} />;
  }
  return children;
}

export default App;
