import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

 window.BASE_URL = "https://localhost:7048";
//window.BASE_URL = "https://inovruzov810asp-001-site1.ltempurl.com";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>, 
)
