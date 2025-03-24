
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

// Set default body style for Windows 95 theme
document.body.classList.add('bg-chelas-window-bg');

createRoot(document.getElementById("root")!).render(<App />);
