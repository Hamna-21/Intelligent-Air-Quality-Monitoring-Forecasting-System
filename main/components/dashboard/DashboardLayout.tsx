// components/dashboard/DashboardLayout.tsx
import React, { useState, useEffect, useContext } from "react";

import { DashboardView } from "./DashboardView";
import Sidebar from "./Sidebar";
import { Header } from "./Header";
import { HealthSpecsView } from "./HealthSpecsView";
import { ForecastsView } from "./ForecastsView";
import { PersonalizedAdviceView } from "./PersonalizedAdviceView";
import { WorldAQIView } from "./WorldAQIView";
import { PollutionSourcesView } from "./PollutionSourcesView";
import FAQView from "./FAQView";
import AQICalculatorView from "./AQICalculatorView";
import { MapView } from "./MapView";
import { InboxView } from "./InboxView";
import { SmogScannerView } from "./SmogScannerView";
import { PollutionReporterView } from "./PollutionReporterView";
import { SafePlacesView } from "./SafePlacesView";
import { View } from "../../types";

import { AppContext } from "./context/AppContext";

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

const DashboardLayout = ({
  onLogout,
  userName,
  userAvatar,
  setUserName,
  setUserAvatar,
}) => {
  const context = useContext(AppContext);
  const [toasts, setToasts] = useState<Toast[]>([]);

  if (!context) return null;

  const { currentView, setCurrentView, fetchDashboardData } = context;

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const renderView = () => {
    switch (currentView) {
      case View.Dashboard:
        return <DashboardView />;
      case View.Map:
        return <MapView />;
      case View.Forecasts:
        return <ForecastsView />;
      case View.HealthSpecs:
        return <HealthSpecsView />;
      case View.PersonalizedAdvice:
        return <PersonalizedAdviceView />;
      case View.WorldAQI:
        return <WorldAQIView />;
      case View.PollutionSources:
        return <PollutionSourcesView />;
      case View.SmogScanner:
        return <SmogScannerView />;
      case View.PollutionReporter:
        return <PollutionReporterView />;
      case View.AQICalculator:
        return <AQICalculatorView />;
      case View.Settings:
        return <FAQView />;
      case View.Inbox:
        return <InboxView />;
      case View.SafePlaces:
        return <SafePlacesView />;
      case View.FAQ:
        return <FAQView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onLogout={onLogout}
      />

      <div className="flex-1 flex flex-col">
        <Header
          userName={userName}
          userAvatar={userAvatar}
          setUserName={setUserName}
          setUserAvatar={setUserAvatar}
        />

        <main className="flex-1 overflow-auto p-6">{renderView()}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
