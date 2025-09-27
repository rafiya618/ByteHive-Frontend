import React from "react";
import { useNavigate } from "react-router-dom";
import ActionButton from "../../shared/ActionButton";

const CommunityFormCard = () => {
  const navigate = useNavigate();

  const handleCreateCommunity = () => {
    navigate("/community/1");
  };

  return (
    <div className="bg-navbar-bg border border-navbar-border rounded-2xl p-6 flex flex-col gap-6 w-full">
      {/* Community Name */}
      <div>
        <label className="block text-white font-fenix mb-2">Community Name</label>
        <input
          type="text"
          placeholder="Choose a unique name for your community"
          className="w-full bg-transparent border border-navbar-border rounded-lg px-4 py-2 text-white placeholder:text-desc focus:outline-none focus:border-periwinkle"
        />
        <p className="text-xs text-desc mt-1">This will be used as your community's URL: bytehive.com/communities/</p>
      </div>

      {/* Community Guidelines */}
      <div>
        <label className="block text-white font-fenix mb-2">Community Guidelines <span className="text-desc text-sm">(optional)</span></label>
        <textarea
          placeholder="Select guideline for your community members"
          rows={4}
          className="w-full bg-transparent border border-navbar-border rounded-lg px-4 py-2 text-white placeholder:text-desc focus:outline-none focus:border-periwinkle"
        />
      </div>

      {/* Community Description */}
      <div>
        <label className="block text-white font-fenix mb-2">Community Description</label>
        <textarea
          placeholder="Describe what your community is about"
          rows={6}
          className="w-full bg-transparent border border-navbar-border rounded-lg px-4 py-2 text-white placeholder:text-desc focus:outline-none focus:border-periwinkle"
        />
      </div>

      {/* Community Avatar */}
      <div>
        <label className="block text-white font-fenix mb-2">Community Avatar</label>
        <div className="border border-dashed border-navbar-border rounded-lg p-6 text-center text-desc cursor-pointer hover:border-periwinkle transition">
          <span className="material-icons text-3xl block mb-2 text-periwinkle">add_photo_alternate</span>
          <p>Click to upload or drag and drop</p>
          <p className="text-xs mt-1">SVG, PNG, JPG or GIF (MAX. 2MB)</p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <ActionButton variant="secondary">Save Draft</ActionButton>
        <ActionButton variant="primary" onClick={handleCreateCommunity}>Create Community</ActionButton>
      </div>
    </div>
  );
};

export default CommunityFormCard;