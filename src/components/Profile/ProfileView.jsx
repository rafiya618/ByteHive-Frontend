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
  FaFire,
  FaEnvelope,
  FaUserGroup,
} from "react-icons/fa6";

const ProfileView = ({ profile = {
  profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=Momina",
  name: "Momina",
  bio: "Cybersecurity enthusiast and developer",
  user: { email: "222696@students.au.edu.pk" },
  createdAt: "2025-12-01",
  socialLinks: {
    Github: "https://github.com",
    Linkedin: "https://linkedin.com"
  }
}, onEdit = () => {} }) => {
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
    <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 w-full max-w-md mx-auto p-6 rounded-xl shadow-2xl border border-blue-900/30 text-white overflow-hidden">
      
      {/* Cybersecurity Background Effect - Behind everything */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-8 left-8 text-6xl text-blue-400">🔒</div>
        <div className="absolute top-12 right-12 text-7xl text-red-500">🔓</div>
        <div className="absolute bottom-16 left-16 text-5xl text-blue-300">🔐</div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-red-500/5"></div>
        
        {/* Binary code effect */}
        <div className="absolute top-0 left-0 w-full h-full text-[10px] font-mono text-blue-400/20 leading-tight overflow-hidden">
          <div className="whitespace-pre">
            {Array(15).fill(null).map((_, i) => (
              <div key={i}>
                {Array(50).fill(null).map((_, j) => Math.random() > 0.5 ? '1' : '0').join(' ')}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Above the background effect */}
      <div className="relative z-10 flex flex-col gap-4">
        {/* Profile Picture */}
        <div className="flex justify-center">
          <img
            src={profile?.profileImage}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-blue-500/30"
          />
        </div>

        {/* Name and Bio */}
        <div className="flex flex-col items-start mt-2">
          <h2 className="text-2xl font-bold text-blue-300 drop-shadow-lg">
            {profile?.name}
          </h2>
          <p className="mt-2 text-white/90 text-lg drop-shadow font-normal">
            {profile?.bio}
          </p>
        </div>

        <div className="flex flex-col items-start mt-2 ml-3 gap-3">
          {/* Email */}
          <div className="flex items-center gap-3">
            <FaEnvelope className="w-5 h-5 text-blue-400" />
            <span className="text-white text-base drop-shadow font-light">
              {profile.user.email}
            </span>
          </div>

          {/* Joined Date */}
          <div className="flex items-center gap-3">
            <FaUserGroup className="w-5 h-5 text-blue-400" />
            <span className="text-white text-base drop-shadow font-light">
              Joined{" "}
              {new Date(profile.createdAt).toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Streak 
          <div className="flex items-center gap-3">
            <FaFire className="w-5 h-5 text-orange-500" />
            <span className="text-white text-base drop-shadow font-light">
              34 streak 
            </span>
          </div> */}
        </div> 

        {/* Social Links */}
        {profile.socialLinks && (
          <div className="grid grid-cols-2 gap-3 w-full mt-3">
            {Object.entries(profile.socialLinks).map(([platform, url]) => {
              if (!url) return null;
              const Icon = socialIcons[platform];
              return (
                <a
                  key={platform}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-3 py-2 
                   bg-slate-900/50 backdrop-blur-sm rounded-lg border border-blue-900/50 
                   transition-all duration-200 text-sm
                   hover:bg-blue-900/30 hover:border-blue-400 hover:text-blue-300
                   hover:shadow-lg hover:shadow-blue-500/20"
                >
                  {Icon && (
                    <Icon className="text-base text-blue-400 group-hover:text-blue-300 transition-colors" />
                  )}
                  <span className="truncate">{platform}</span>
                </a>
              );
            })}
          </div>
        )}

        {/* Edit Button */}
        <div className="w-full flex justify-end mt-4">
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;