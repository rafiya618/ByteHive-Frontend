import React, { useEffect, useState } from "react";
import { updateProfile } from "../api/ProfileApi";
import ProfileView from "../components/Profile/ProfileView";
import ProfileEdit from "../components/Profile/ProfileEdit";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/auth";
import { jwtDecode } from "jwt-decode";
import { useProfile } from "../context/profileContext";

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);
  const { auth } = useAuth();
  const { profile, fetchProfile } = useProfile();

  const userId = auth;

  useEffect(() => {
    if (!profile && userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleSave = async (formData) => {
    try {
      await updateProfile(userId, formData);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center gap-6 mt-6">
        <h1 className="text-2xl font-bold">User Profile</h1>
        {profile ? (
          editing ? (
            <ProfileEdit
              profile={profile}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
            />
          ) : (
            <ProfileView
              profile={profile}
              onEdit={() => setEditing(true)}
            />
          )
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </Layout>
  );
};

export default ProfilePage;
