import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import BlogListing from "./pages/BlogListing";
import CreatePost from "./pages/CreatePost";
import EventsListing from "./pages/EventsListing";
import SavedItems from "./pages/SavedItems";
import History from "./pages/History";
import BlogPost from "./pages/BlogPost";
import ContentCurationProvider from "./contexts/ContentCurationContext";

function App() {
  return (
    <ContentCurationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<BlogListing />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/events" element={<EventsListing />} />
          <Route path="/saved" element={<SavedItems />} />
          <Route path="/history" element={<History />} />
          <Route path="/blog/:id" element={<BlogPost />} />
        </Routes>
      </Router>
    </ContentCurationProvider>
  );
}

export default App;