// context/Providers.jsx
import { AuthProvider } from "./auth"
import { NotificationProvider } from "./NotificationContext";
import { ProfileProvider } from "./profileContext"
// import { CommunityProvider } from "./community"
// import { PostProvider } from "./post"

const AppProviders = ({ children }) => {
  return (
    <AuthProvider>
      <ProfileProvider>
        <NotificationProvider>

        {/* <CommunityProvider> */}
          {/* <PostProvider> */}
            {children}
          {/* </PostProvider> */}
        {/* </CommunityProvider> */}
        </NotificationProvider>
      </ProfileProvider>
    </AuthProvider>
  );
};

export default AppProviders;
