// App.tsx
import React, { useState, useEffect } from "react";
import LoginPage from "./components/auth/LoginPage";
import DashboardLayout from "./components/dashboard/DashboardLayout";
import { checkBackendHealth } from "./services/api";
import { AppProvider } from "./components/dashboard/context/AppContext";

interface StoredUser {
  name: string;
  avatar: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // 🔴 CHANGED: make default name -> "Khansa Farooq"
  const [userName, setUserName] = useState<string>("Khansa Farooq");

  // 🔴 CHANGED: update avatar initials from AQ → KF
  const [userAvatar, setUserAvatar] = useState<string>(
    "https://ui-avatars.com/api/?name=KF"
  );

  const [backendOk, setBackendOk] = useState<boolean>(true);

  // 1) Check backend health once on mount
  useEffect(() => {
    const pingBackend = async () => {
      try {
        const ok = await checkBackendHealth();
        setBackendOk(ok);
      } catch (e) {
        console.error("Backend health check failed:", e);
        setBackendOk(false);
      }
    };

    pingBackend();
  }, []);

  // 2) Restore user session from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("aq_user");
      if (!raw) return;

      const parsed: StoredUser = JSON.parse(raw);
      if (parsed?.name) {
        setUserName(parsed.name);
        setUserAvatar(parsed.avatar || "https://ui-avatars.com/api/?name=KF");
        setIsAuthenticated(true);
      }
    } catch (err) {
      console.warn("Failed to parse aq_user from localStorage:", err);
      localStorage.removeItem("aq_user");
    }
  }, []);

  // 3) Login success handler
  const handleLoginSuccess = (name: string, avatar: string) => {
    setUserName(name);
    setUserAvatar(avatar || "https://ui-avatars.com/api/?name=KF");
    setIsAuthenticated(true);

    const stored: StoredUser = { name, avatar: avatar || "" };
    localStorage.setItem("aq_user", JSON.stringify(stored));
  };

  // 4) Logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("aq_user");
  };

  return (
    <div className="min-h-screen font-sans antialiased relative text-text bg-slate-50">
      {!backendOk && (
        <div className="bg-rose-100 text-rose-700 text-center py-2 text-sm">
          Backend is not responding. Some features may not work.
        </div>
      )}

      {isAuthenticated ? (
        <AppProvider>
          <DashboardLayout
            userName={userName}
            userAvatar={userAvatar}
            setUserName={setUserName}
            setUserAvatar={setUserAvatar}
            onLogout={handleLogout}
          />
        </AppProvider>
      ) : (
        <LoginPage onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
};

export default App;
