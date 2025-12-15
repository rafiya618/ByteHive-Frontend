// src/components/GoogleConnect.js
import { useAuth } from "../context/AuthContext";

export default function GoogleConnect() {
  const { googleRefreshToken, setGoogleRefreshToken } = useAuth();

  const handleConnect = async () => {
    // TODO: Implement real Google OAuth flow.
    // After successful OAuth, you must obtain refresh_token and set it:
    const fakeToken = "FAKE_REFRESH_TOKEN_FROM_GOOGLE";
    setGoogleRefreshToken(fakeToken);
    alert("Google account connected for Calendar Sync ✅");
  };

  return (
    <button onClick={handleConnect} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
      {googleRefreshToken ? "Google Connected ✅" : "Connect Google Calendar"}
    </button>
  );
}
