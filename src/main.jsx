import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./Context/AuthContext.jsx";
import { Analytics } from "@vercel/analytics/react";
import RoommateFinderDetails from './pages/RoommateFinderDetails.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Analytics /> {/* 👈 This is what actually enables tracking */}
    </AuthProvider>
  </StrictMode>
);
