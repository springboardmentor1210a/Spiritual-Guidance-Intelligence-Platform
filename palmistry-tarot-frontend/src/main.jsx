
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import { GuidanceRequestsProvider } from "./context/GuidanceRequestsContext.jsx";
import { ChatProvider } from "./context/ChatContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <GuidanceRequestsProvider>
        <ChatProvider>
          <App />
        </ChatProvider>
      </GuidanceRequestsProvider>
    </AuthProvider>
  </StrictMode>
);