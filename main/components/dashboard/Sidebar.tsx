
import React, { useContext, useEffect, useState } from 'react';
import type { View } from '../../types';
import { View as ViewEnum } from '../../types';
import { AppContext } from './context/AppContext';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
}

const NavItem: React.FC<{
  view: View;
  label: string;
  icon: React.ReactNode;
  currentView: View;
  onClick: (view: View) => void;
  badge?: number;
}> = ({ view, label, icon, currentView, onClick, badge }) => {
  const isActive = currentView === view;
  return (
    <li
      onClick={() => onClick(view)}
      className={`flex items-center justify-between px-3 py-2.5 mx-2 rounded-md transition-all duration-200 cursor-pointer group mb-0.5 ${
        isActive
          ? 'bg-primary/10 text-primary font-semibold'
          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
      }`}
    >
      <div className="flex items-center">
        <span className={`transition-colors duration-200 ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</span>
        <span className="ml-3 text-sm">{label}</span>
      </div>
      {badge && badge > 0 && (
          <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {badge}
          </span>
      )}
    </li>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, onLogout }) => {
  const context = useContext(AppContext);
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
      const interval = setInterval(() => {
          if (Notification.permission !== permission) {
              setPermission(Notification.permission);
          }
      }, 2000);
      return () => clearInterval(interval);
  }, [permission]);

  const navItems = [
    { view: ViewEnum.Dashboard, label: 'Overview', icon: <DashboardIcon /> },
    { view: ViewEnum.Map, label: 'Live Map', icon: <MapIcon /> },
    { view: ViewEnum.SmogScanner, label: 'Bio-Vision Scanner', icon: <ScannerIcon /> },
    { view: ViewEnum.PollutionReporter, label: 'Eco-Enforce', icon: <ShieldIcon /> },
    { view: ViewEnum.SafePlaces, label: 'Safe Havens', icon: <SafePlaceIcon /> },
    { view: ViewEnum.HealthSpecs, label: 'Health Profile', icon: <HealthIcon /> },
    { view: ViewEnum.PersonalizedAdvice, label: 'Insights', icon: <RecommendationsIcon /> },
    { view: ViewEnum.Forecasts, label: 'Forecasts', icon: <PredictionsIcon /> },
    { view: ViewEnum.PollutionSources, label: 'Sources', icon: <PollutionIcon /> },
    { view: ViewEnum.WorldAQI, label: 'Global Data', icon: <WorldIcon /> },
    { view: ViewEnum.AQICalculator, label: 'Calculator', icon: <CalculatorIcon /> },
    { view: ViewEnum.FAQ, label: 'FAQ', icon: <FAQIcon /> },
  ];

  const handleActivateAlerts = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
         setPermission(permission);
         if (permission === 'granted' && context) {
             context.addToast("System Alerts Active", 'success');
             context.playAlertSound(); 
             new Notification("AQ System", { body: "Desktop notifications are now enabled.", icon: "/vite.svg" });
         } else if (context) {
             context.addToast("Permission Blocked. Check browser settings.", 'error');
         }
      });
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-50">
      <div className="h-20 flex items-center px-6">
        <div className="bg-primary/10 p-2 rounded-xl mr-3">
             <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
             </svg>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 font-heading">AQ System</h2>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 custom-scrollbar">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 px-6">Main Menu</p>
        <ul className="space-y-1">
            {navItems.map((item) => (
              <NavItem
                key={item.view}
                view={item.view}
                label={item.label}
                icon={item.icon}
                currentView={currentView}
                onClick={setCurrentView}
              />
            ))}
        </ul>
      </nav>

       <div className="p-4 border-t border-slate-100">
         <div className="mb-2 px-1">
            {permission === 'granted' ? (
                <div className="w-full flex items-center justify-center p-2 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></span>
                    Alerts Active
                </div>
            ) : (
                <button 
                    onClick={handleActivateAlerts}
                    className="w-full flex items-center justify-center p-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-colors border border-slate-200"
                >
                    Enable Alerts
                </button>
            )}
         </div>

        <ul className="space-y-1">
             <NavItem
                view={ViewEnum.Settings}
                label="Settings"
                icon={<SettingsIcon />}
                currentView={currentView}
                onClick={setCurrentView}
              />
             <li onClick={onLogout} className="flex items-center px-3 py-2.5 mx-2 rounded-md transition-all duration-200 cursor-pointer group text-slate-500 hover:bg-rose-50 hover:text-rose-600">
                <span className="text-slate-400 group-hover:text-rose-500"><LogoutIcon /></span>
                <span className="ml-3 font-medium text-sm">Sign Out</span>
             </li>
        </ul>
       </div>
    </aside>
  );
};

const DashboardIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
const MapIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13v-6m0 6l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m0 10v-6m0 6l-6-3" /></svg>;
const HealthIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>;
const RecommendationsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>;
const PredictionsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
const PollutionIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" /></svg>;
const WorldIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5V3.935m-16.945 7.065A10.003 10.003 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10a10.003 10.003 0 01-1.055 4.5" /></svg>;
const FAQIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CalculatorIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>;
const SettingsIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const LogoutIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const ScannerIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ShieldIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
const SafePlaceIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;

export default Sidebar;
