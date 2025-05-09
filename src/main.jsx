import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from "react-router";
import AppProviders from './context/provider.jsx';
// import {AuthProvider} from "./context/auth"
// import { AuthProvider } from "./context/auth.jsx"

createRoot(document.getElementById('root')).render(

  <StrictMode>
    <AppProviders>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AppProviders>
  </StrictMode>
)
