// context/Providers.jsx
import { AuthProvider } from "./auth"
import { ProfileProvider } from "./profileContext"
// import { CommunityProvider } from "./community"
// import { PostProvider } from "./post"

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ProfileProvider>
        {/* <CommunityProvider> */}
          {/* <PostProvider> */}
            {children}
          {/* </PostProvider> */}
        {/* </CommunityProvider> */}
      </ProfileProvider>
    </AuthProvider>
  );
};

export default AppProviders;
