import React from 'react';

const ProfileView = ({ profile, onEdit }) => {

  
  return (
    <div className="profile-view" >
      <h2>Profile Picture</h2>
      <img src={profile.profileImage} alt="Profile" width={150} style={{ borderRadius: '90px', objectFit: 'cover', height:"125px", width:"125px"}} />
      <h2>Name</h2>
      <p>{profile.name}</p>
      <h2>Bio</h2>
      <p>{profile.bio}</p>
      <h2>Profile Social Links</h2>
      <div>
        {profile.socialLinks && Object.entries(profile.socialLinks).map(([platform, url]) => (
          url && (
            <div>
              <a key={platform} href={url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginBottom: "8px"}}>
                {platform} : {url}
                <br />
              </a>
            </div>
          )
        ))}
      </div>
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  );
};

export default ProfileView;
