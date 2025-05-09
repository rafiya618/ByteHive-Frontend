import React, { useState } from 'react';
import './ProfileEdit.css'; // optional: if you're using external CSS

const ProfileEdit = ({ profile, onSave, onCancel }) => {

  const [formData, setFormData] = useState({
    name: profile.name || '',
    bio: profile.bio || '',
    profileImage: null,
    socialLinks: {
      Linkedin: profile.socialLinks?.Linkedin || '',
      X: profile.socialLinks?.X || '',
      Github: profile.socialLinks?.Github || '',
      Youtube: profile.socialLinks?.Youtube || '',
      Instagram: profile.socialLinks?.Instagram || '',
      Facebook: profile.socialLinks?.Facebook || '',
      Threads: profile.socialLinks?.Threads || '',
      Websites: profile.socialLinks?.Websites || '',
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("socials.")) {
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [name.split(".")[1]]: value }
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
    const updatedForm = new FormData();
    updatedForm.append('name', formData.name);
    updatedForm.append('bio', formData.bio);
    if (formData.profileImage) {
      updatedForm.append('profileImage', formData.profileImage);
    }
    Object.entries(formData.socialLinks).forEach(([platform, link]) => {
      updatedForm.append(`socialLinks[${platform}]`, link);
    });
    onSave(updatedForm);
  };

  return (
    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-group">
        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className="form-control"
          placeholder="Your Name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          className="form-control"
          placeholder="Tell us about yourself"
        />
      </div>

      <div className="form-group">
        <label htmlFor="profileImage">Profile Image</label>
        <input
          id="profileImage"
          type="file"
          onChange={handleFileChange}
          className="form-control"
          accept='image/*'
        />
      </div>

      <div className="form-group">
        <label htmlFor="Linkedin">Linkedin URL</label>
        <input
          id="Linkedin"
          type="text"
          name="socials.Linkedin"
          value={formData.socialLinks.Linkedin}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Linkedin.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="X">X URL</label>
        <input
          id="X"
          type="text"
          name="socials.X"
          value={formData.socialLinks.X}
          onChange={handleChange}
          className="form-control"
          placeholder="https://X.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="Github">GitHub URL</label>
        <input
          id="Github"
          type="text"
          name="socials.Github"
          value={formData.socialLinks.Github}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Github.com/yourusername"
        />
      </div>

      <div className="form-group">
        <label htmlFor="Youtube">Youtube URL</label>
        <input
          id="Youtube"
          type="text"
          name="socials.Youtube"
          value={formData.socialLinks.Youtube}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Youtube.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="Instagram">Instagram URL</label>
        <input
          id="Instagram"
          type="text"
          name="socials.Instagram"
          value={formData.socialLinks.Instagram}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Instagram.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="Facebook">Facebook URL</label>
        <input
          id="Facebook"
          type="text"
          name="socials.Facebook"
          value={formData.socialLinks.Facebook}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Facebook.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="Threads">Threads URL</label>
        <input
          id="Threads"
          type="text"
          name="socials.Threads"
          value={formData.socialLinks.Threads}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Threads.com/yourhandle"
        />
      </div>

      <div className="form-group">
        <label htmlFor="Websites">Websites URL</label>
        <input
          id="Websites"
          type="text"
          name="socials.Websites"
          value={formData.socialLinks.Websites}
          onChange={handleChange}
          className="form-control"
          placeholder="https://Websites.com/yourhandle"
        />
      </div>


      

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">Save</button>
      </div>
    </form>
  );
};

export default ProfileEdit;