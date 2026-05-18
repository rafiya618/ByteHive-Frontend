import { createRoot } from 'react-dom/client';
import './index.css';
import './styles/design-system.css';
import App from './App.jsx';
import './styles/variables.css';
import AppProviders from './context/provider.jsx';
import { HashRouter } from "react-router-dom";

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <AppProviders>
      <App />
    </AppProviders>
  </HashRouter>
  
)
