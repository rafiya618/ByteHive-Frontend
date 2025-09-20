import React from "react";
import {
  FaLinkedin,
  FaXTwitter,
  FaGithub,
  FaYoutube,
  FaInstagram,
  FaFacebook,
  FaThreads,
  FaGlobe,
} from "react-icons/fa6";

const ProfileView = ({ profile, onEdit }) => {
  const socialIcons = {
    Linkedin: FaLinkedin,
    X: FaXTwitter,
    Github: FaGithub,
    Youtube: FaYoutube,
    Instagram: FaInstagram,
    Facebook: FaFacebook,
    Threads: FaThreads,
    Websites: FaGlobe,
  };

  return (
    <div className="bg-dark-navy-purple w-[90%] sm:w-full max-w-2xl mx-auto p-6 sm:p-8 rounded-xl shadow-lg border border-navbar-border text-white flex flex-col items-center gap-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <img
          src={profile?.profileImage}
          alt="Profile"
          className="w-28 h-28 rounded-full object-cover border-4 border-blue-600 shadow-md"
        />
        <h2 className="mt-4 text-2xl font-bold">{profile?.name}</h2>
        <p className="text-gray-300 text-center mt-1">{profile?.bio}</p>
      </div>

      {/* Social Links */}
      {profile.socialLinks && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full mt-4">
          {Object.entries(profile.socialLinks).map(([platform, url]) => {
            if (!url) return null;
            const Icon = socialIcons[platform];
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 bg-dark-indigo rounded-md hover:bg-[#2f2f4a] transition-colors"
              >
                {Icon && <Icon className="text-lg text-blue-400" />}
                <span className="text-sm truncate">{platform}</span>
              </a>
            );
          })}
        </div>
      )}

      {/* Edit Button */}
      <div className="w-full flex justify-end mt-6">
        <button
          onClick={onEdit}
          className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
