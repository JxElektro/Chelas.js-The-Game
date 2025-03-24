
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './App.css'

// Set default body style for Windows 95 theme
document.body.classList.add('bg-chelas-window-bg');
document.body.style.margin = '0';
document.body.style.padding = '0';
document.body.style.overflow = 'hidden';

createRoot(document.getElementById("root")!).render(<App />);
