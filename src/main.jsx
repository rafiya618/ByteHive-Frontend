import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router-dom"; // ✅ FIXED
import AppProviders from './context/provider.jsx';

createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>    {/* ✅ Router goes OUTSIDE providers */}
      <AppProviders>
        <App />
      </AppProviders>
    </BrowserRouter>
  // </StrictMode>
)
