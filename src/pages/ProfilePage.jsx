import React, { useEffect, useState } from 'react';
import { getProfile, updateProfile } from '../api/ProfileApi';
import ProfileView from '../components/Profile/ProfileView';
import ProfileEdit from '../components/Profile/ProfileEdit';
import Layout from '../components/Layout/Layout'
import { useAuth } from '../context/auth';
import { jwtDecode } from 'jwt-decode';
import { useProfile } from '../context/profileContext';



const ProfilePage = () => {
  // const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [auth, setAuth] = useAuth()
  const { profile, setProfile, fetchProfile } = useProfile();
  
  const userId = auth?.token ? jwtDecode(auth.token)?.id : null;
  
  useEffect(() => {
    if (!profile && userId) {
      fetchProfile();
    }
  }, [userId]);
  
  const handleSave = async (formData) => {
    try {
      const res = await updateProfile(userId, formData);
      // setProfile(res.data);
      await fetchProfile();
      setEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Layout className="profile-page">
      <h1>User Profile</h1>
      <hr />
      {profile ? (
        editing ? (
          <ProfileEdit profile={profile} onSave={handleSave} onCancel={() => setEditing(false)} />
        ) : (
          <ProfileView profile={profile} onEdit={() => setEditing(true)} />
        )
      ) : (
        <p>Loading...</p>
      )}
    </Layout>
  );
};

export default ProfilePage;
