// ============================
// 🔹 Profile Setup Page
// ============================

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/auth";
import toast from "react-hot-toast";
import { createProfile } from "../../../api/ProfileApi";
import { jwtDecode } from "jwt-decode";
import InputField from "../../../shared/InputField";
import { validateName, validateUsername } from "../../../helpers/validators"; // ✅ Reuse validators

const ProfileSetupPage = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    username: "",
  });

  // ============================
  // 🔹 Handle Submit
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validate Name
    const nameError = validateName(formData.name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    // ✅ Validate Username
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      toast.error(usernameError);
      return;
    }

    try {
      const { data } = await createProfile(auth?.user?._id, formData);

      toast.success("Profile saved!");

      // ✅ Save new token & update auth state
      const decoded = jwtDecode(data.token);
      localStorage.removeItem("Auth");
      localStorage.setItem("Auth", JSON.stringify({ token: data.token }));

      setAuth({ token: data.token, user: decoded?.user });

      // ✅ Redirect to next step
      navigate("/");
    } catch (err) {
      toast.error("Error saving profile");
    }
  };

  // ============================
  // 🔹 JSX
  // ============================
  return (
    <div className="bg-navbar-bg text-white w-full min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md bg-dark-navy-purple rounded-xl shadow-lg border border-navbar-border p-6 sm:p-8 flex flex-col items-center transition-all">
        
        <h1 className="text-2xl font-semibold mb-6 text-center">
          Complete Your Profile
        </h1>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          <InputField
            type="text"
            placeholder="Enter name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />

          <InputField
            type="text"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors shadow-md hover:shadow-lg"
          >
            Save & Continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
