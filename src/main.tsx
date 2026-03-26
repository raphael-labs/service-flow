import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Apply saved theme on load
const saved = JSON.parse(localStorage.getItem('satelite-theme') || '{}');
if (saved?.state?.theme === 'escuro') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById("root")!).render(<App />);
