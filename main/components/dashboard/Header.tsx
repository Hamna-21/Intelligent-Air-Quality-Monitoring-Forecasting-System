// components/dashboard/Header.tsx
import React, { useContext, useState, useEffect, useRef } from "react";
import { AppContext } from "./context/AppContext";
import ProfileModal from "./ProfileModal";
import { View } from "../../types";
import { LocationSearchBar } from "./LocationSearchBar";

interface HeaderProps {
  userName: string;
  userAvatar: string;
  setUserName: (name: string) => void;
  setUserAvatar: (avatar: string) => void;
}

/* ---------------------------------------------------------
   NOTIFICATION DROPDOWN
--------------------------------------------------------- */
const NotificationDropdown: React.FC<{ onClose: () => void }> = ({
  onClose,
}) => {
  const context = useContext(AppContext);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleManageSettings = () => {
    context?.setCurrentView(View.Settings);
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-12 right-0 mt-2 w-80 bg-white rounded-xl shadow-card-hover border border-slate-100 z-50 animate-fade-in"
    >
      <div className="p-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm">Notifications</h3>
      </div>

      <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
        <div className="flex items-start p-4 hover:bg-slate-50 cursor-pointer transition-colors border-b border-slate-50 last:border-0">
          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-rose-50 flex items-center justify-center mr-3 text-rose-500 border border-rose-100">
            <svg className="w-4 h-4" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>

          <div>
            <p className="text-sm text-slate-800 font-semibold">
              High AQI Alert
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Air quality is Unhealthy. Stay indoors.
            </p>
            <p className="text-[10px] text-slate-400 mt-1.5 uppercase tracking-wide">
              2 hours ago
            </p>
          </div>
        </div>
      </div>

      <div className="p-2 border-t border-slate-100 bg-slate-50 rounded-b-xl">
        <button
          onClick={handleManageSettings}
          className="w-full text-center text-xs font-bold text-primary hover:text-primary-dark p-1 transition-colors"
        >
          Manage Settings
        </button>
      </div>
    </div>
  );
};

/* ---------------------------------------------------------
   MAIN HEADER COMPONENT
--------------------------------------------------------- */
export const Header: React.FC<HeaderProps> = ({
  userName,
  userAvatar,
  setUserName,
  setUserAvatar,
}) => {
  const context = useContext(AppContext);
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);

  if (!context) return null;

  const displayName = userName || "Khansa Farooq";

  return (
    <>
      <header className="flex-shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-40 h-20 border-b border-slate-200/60">
        <div className="flex items-center justify-between px-8 h-full">
          {/* Location Search Bar */}
          <div className="hidden md:flex w-full max-w-sm">
            <LocationSearchBar
              initialLabel={context.location || "Rawalpindi, Pakistan"}
              onLocationValid={(loc) => {
                context.setLocation(loc.name);
                context.fetchDashboardData();
              }}
            />
          </div>

          {/* Notifications + Profile */}
          <div className="flex items-center space-x-4 ml-auto">
            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!isNotificationsOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-all relative"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-2 right-2 block h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              </button>

              {isNotificationsOpen && (
                <NotificationDropdown
                  onClose={() => setNotificationsOpen(false)}
                />
              )}
            </div>

            <div className="h-5 w-px bg-slate-200 mx-2"></div>

            {/* Profile Button */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className="flex items-center space-x-3 pl-1 pr-1 py-1 rounded-lg hover:bg-slate-50 transition-all group"
            >
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-slate-700 text-sm leading-tight">
                  {displayName}
                </p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                  Pro Plan
                </p>
              </div>

              <img
                className="w-9 h-9 rounded-full object-cover border border-slate-200"
                src={userAvatar}
                alt="User avatar"
              />
            </button>
          </div>
        </div>
      </header>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userName={displayName}
        userAvatar={userAvatar}
        setUserName={setUserName}
        setUserAvatar={setUserAvatar}
      />
    </>
  );
};
