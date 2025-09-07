// pages/ProfileSetupPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import toast from "react-hot-toast";
import { createProfile } from "../../../api/ProfileApi";
import { jwtDecode } from "jwt-decode";

const ProfileSetupPage = () => {
  const {auth, setAuth} = useAuth();
  const navigate = useNavigate();
  console.log('auth?.user', auth?.user)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.username.trim()) {
      toast.error("Both name and username are required");
      return;
    }

    try {
      const {data} = await createProfile(auth?.user?._id, formData);
      console.log('auth?.user?.onboardingStep', auth?.user?.onboardingStep)
      toast.success("Profile saved!");
      console.log('data', data)
      const decoded = jwtDecode(data.token);
      localStorage.removeItem('Auth')
      localStorage.setItem('Auth', JSON.stringify(data.token))
      // const decoded = jwtDecode(data.token);
      setAuth({token: data.token, user: decoded?.user})
      console.log('', )
      navigate("/select-tags"); // ✅ Step 3
    } catch (err) {
      toast.error("Error saving profile");
    }
  };

  return (
    <div>
      auth?.user: { JSON.stringify(auth?.user) }
      <h1>Complete Your Profile</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter name"
          value={formData.name}
          onChange={(e) =>
            setFormData({ ...formData, name: e.target.value })
          }
        />
        <br />
        <input
          type="text"
          placeholder="Enter username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
        />
        <br />
        <button type="submit">Save & Continue</button>
      </form>
    </div>
  );
};

export default ProfileSetupPage;
