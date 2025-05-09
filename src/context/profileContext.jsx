// src/context/ProfileContext.js
import { createContext, useContext, useEffect, useState } from "react";
import { getProfile } from '../api/ProfileApi';
import axios from "axios";
import { useAuth } from "./auth";
import { jwtDecode } from 'jwt-decode';

const ProfileContext = createContext();

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [auth] = useAuth();

  let userId = null;
  try {
    userId = auth?.token ? jwtDecode(auth.token)?.id : null;
  } catch (err) {
    console.error("Invalid token", err);
  }
  const fetchProfile = async () => {
    try {
      if (!userId) return;
  
      setLoading(true);
      const res = await getProfile(userId);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth?.token) {
      fetchProfile();
    }
  }, [auth]);

  return (
    <ProfileContext.Provider value={{ profile, setProfile, loading, fetchProfile }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
