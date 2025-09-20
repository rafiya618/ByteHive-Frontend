import React, { useState } from "react";
import InputField from "../../shared/InputField";
import {
  validateName,
  validateBio,
  validateURL,
} from "../../helpers/validators";
import toast from "react-hot-toast";

const ProfileEdit = ({ profile, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: profile.name || "",
    username: profile.username || "",
    bio: profile.bio || "",
    profileImage: null,
    socialLinks: {
      Linkedin: profile.socialLinks?.Linkedin || "",
      X: profile.socialLinks?.X || "",
      Github: profile.socialLinks?.Github || "",
      Youtube: profile.socialLinks?.Youtube || "",
      Instagram: profile.socialLinks?.Instagram || "",
      Facebook: profile.socialLinks?.Facebook || "",
      Threads: profile.socialLinks?.Threads || "",
      Websites: profile.socialLinks?.Websites || "",
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("socials.")) {
      setFormData({
        ...formData,
        socialLinks: {
          ...formData.socialLinks,
          [name.split(".")[1]]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profileImage: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // ✅ Validate Name
    const nameError = validateName(formData.name);
    if (nameError) {
      toast.error(nameError);
      return;
    }

    // ✅ Validate Bio
    const bioError = validateBio(formData.bio);
    if (bioError) {
      toast.error(bioError);
      return;
    }

    // ✅ Validate Social Links
    for (let [platform, link] of Object.entries(formData.socialLinks)) {
      const urlError = validateURL(link);
      if (urlError) {
        toast.error(`${platform}: ${urlError}`);
        return;
      }
    }

    // Prepare FormData for backend
    const updatedForm = new FormData();
    updatedForm.append("name", formData.name);
    updatedForm.append("username", formData.username);
    updatedForm.append("bio", formData.bio);
    if (formData.profileImage) {
      updatedForm.append("profileImage", formData.profileImage);
    }
    Object.entries(formData.socialLinks).forEach(([platform, link]) => {
      updatedForm.append(`socialLinks[${platform}]`, link);
    });

    onSave(updatedForm);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-dark-navy-purple w-[90%] sm:w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-navbar-border text-white flex flex-col gap-5"
    >
      <h2 className="text-xl md:text-2xl font-bold text-center">Edit Profile</h2>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <InputField
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Your Name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <InputField
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Your username"
        />
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium mb-1">Bio</label>
        <InputField
          type="textarea"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Tell us about yourself"
          rows={4}
        />
      </div>

      {/* Profile Image Preview */}
      <div className="flex flex-col items-center">
        <img
          src={
            formData.profileImage
              ? URL.createObjectURL(formData.profileImage)
              : profile.profileImage || "/default-profile.png"
          }
          alt="Profile Preview"
          className="w-28 h-28 rounded-full object-cover border-2 border-blue-600 shadow-md mb-3"
        />
      </div>

      {/* Profile Image Input */}
      <div>
        <label className="block text-sm font-medium mb-1">Profile Image</label>
        <InputField
          type="file"
          id="profileImage"
          onChange={handleFileChange}
          accept="image/*"
        />
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.keys(formData.socialLinks).map((platform) => (
          <div key={platform}>
            <label className="block text-sm font-medium mb-1">
              {platform} URL
            </label>
            <InputField
              type="text"
              name={`socials.${platform}`}
              value={formData.socialLinks[platform]}
              onChange={handleChange}
              placeholder={`https://${platform.toLowerCase()}.com/yourhandle`}
            />
          </div>
        ))}
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 text-white font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default ProfileEdit;
