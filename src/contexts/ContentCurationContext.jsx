import React, { createContext, useContext } from 'react';
import { useContentCuration } from '../hooks/useContentCuration';
import NotificationSystem from '../components/UI/NotificationSystem';

const ContentCurationContext = createContext();

export const useContentCurationContext = () => {
  const context = useContext(ContentCurationContext);
  if (!context) {
    throw new Error('useContentCurationContext must be used within ContentCurationProvider');
  }
  return context;
};

export const ContentCurationProvider = ({ children }) => {
  const contentCuration = useContentCuration();

  return (
    <ContentCurationContext.Provider value={contentCuration}>
      {children}

      {/* Global Notification System */}
      <NotificationSystem
        notifications={contentCuration.notifications.notifications}
        onRemove={contentCuration.notifications.removeNotification}
      />
    </ContentCurationContext.Provider>
  );
};

export default ContentCurationProvider;