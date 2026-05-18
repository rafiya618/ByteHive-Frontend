import { useState, createContext, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { AUTH_LOGOUT_EVENT, forceLogout } from "../utils/authUtils";
import { getRequiredUrl } from "../utils/env";

const AUTH_SERVICE_URL = getRequiredUrl("VITE_AUTH_SERVICE_URL");

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({ token: "", user: null });
  const [loading, setLoading] = useState(true); // new loading state

  useEffect(() => {
    const syncAuthFromStorage = () => {
      const storedData = localStorage.getItem("Auth");
      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          const decoded = jwtDecode(parsed.token);
          setAuth({ token: parsed.token, user: decoded });
          console.log(`token: ${parsed.token}, user: ${JSON.stringify(decoded)}`)
          return;
        } catch (error) {
          console.error("Invalid token", error);
        }
      }

      setAuth({ token: "", user: null });
    };

    const verifyCurrentUserStatus = async (token, userId) => {
      if (!token || !userId) return;

      try {
        const response = await fetch(`${AUTH_SERVICE_URL}/profile/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) return;

        let payload = {};
        try {
          payload = await response.json();
        } catch {
          payload = {};
        }

        const message = [payload?.message, payload?.error, payload?.details]
          .filter(Boolean)
          .join(' ');

        if (response.status === 403 || /\b(blocked|suspend|suspended|banned|ban)\b/i.test(message)) {
          forceLogout();
          setAuth({ token: "", user: null });
        }
      } catch (error) {
        console.warn('Failed to verify current user status:', error);
      }
    };

    syncAuthFromStorage();

    const storedData = localStorage.getItem("Auth");
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        const decoded = jwtDecode(parsed.token);
        const userId = decoded?._id || decoded?.id || decoded?.user_id || decoded?.userId;
        verifyCurrentUserStatus(parsed.token, userId);
      } catch (error) {
        console.warn('Unable to verify stored auth status:', error);
      }
    }

    const handleForcedLogout = () => {
      setAuth({ token: "", user: null });
    };

    const handleStorageChange = (event) => {
      if (event.key === "Auth") {
        syncAuthFromStorage();
      }
    };

    window.addEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(AUTH_LOGOUT_EVENT, handleForcedLogout);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  useEffect(() => {
    setLoading(false);
  }, [auth]);

  const logout = () => {
    forceLogout();
    setAuth({ token: "", user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

export { AuthProvider, useAuth };
