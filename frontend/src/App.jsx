import { useLocation } from "react-router-dom";

import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import AIChatWidget from "./components/AIChatWidget";

import { ThemeProvider } from "./context/ThemeContext";


export default function App() {

  const location = useLocation();

  const publicRoutes = [
    "/",
    "/login",
    "/register",
  ];

  const showNavbar =
    !publicRoutes.includes(location.pathname);


  return (
    <ThemeProvider>

      <div className="app-shell">

        {showNavbar && <Navbar />}

        <main
          className={
            showNavbar
              ? "main-with-nav"
              : ""
          }
        >
          <AppRoutes />
        </main>

        {showNavbar && <AIChatWidget />}

      </div>

    </ThemeProvider>
  );
}