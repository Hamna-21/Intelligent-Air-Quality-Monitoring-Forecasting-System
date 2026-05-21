import React, { createContext, useState, useCallback } from "react";
import { fetchCurrentAqiForLocation } from "../../../services/aqiService";
import { View } from "../../../types";
import type { HealthCondition, Recommendation } from "../../../types"; // used by HealthSpecs & Insights

export interface AppContextType {
  // Location / AQI
  location: string;
  setLocation: (loc: string) => void;

  currentAqi: number | null;
  pollutants: {
    pm25: number | null;
    pm10: number | null;
    o3: number | null;
    no2: number | null;
    so2: number | null;
    co: number | null;
  };

  loading: boolean;
  error: string | null;

  fetchDashboardData: () => Promise<void>;

  // View state for sidebar navigation
  currentView: View;
  setCurrentView: (view: View) => void;

  // Health profile state (used by HealthSpecsView & Insights)
  healthConditions: HealthCondition[];
  setHealthConditions: React.Dispatch<React.SetStateAction<HealthCondition[]>>;

  // Personalized recommendations (used by PersonalizedAdviceView)
  recommendations: Recommendation[] | null;
  setRecommendations: React.Dispatch<
    React.SetStateAction<Recommendation[] | null>
  >;

  // NEW: let Insights trigger the API call
  fetchInsights: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // ---------- STATES ----------
  const [location, setLocation] = useState("Rawalpindi, Pakistan");
  const [currentAqi, setCurrentAqi] = useState<number | null>(null);

  const [pollutants, setPollutants] = useState({
    pm25: null,
    pm10: null,
    o3: null,
    no2: null,
    so2: null,
    co: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // View state for dashboard tabs
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);

  // Health profile state
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>(
    []
  );

  // Recommendations state (for Insights)
  const [recommendations, setRecommendations] = useState<
    Recommendation[] | null
  >(null);

  // ---------- FETCH AQI (Dashboard) ----------
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await fetchCurrentAqiForLocation(location);

      setCurrentAqi(result.aqi);
      setPollutants({
        pm25: result.pm25,
        pm10: result.pm10,
        o3: result.o3,
        no2: result.no2,
        so2: result.so2,
        co: result.co,
      });

      // IMPORTANT: dashboard fetch is only for AQI, not insights
      // leave recommendations untouched here
    } catch (err: any) {
      setError(err.message ?? "Failed to fetch AQI");
      setCurrentAqi(null);
    } finally {
      setLoading(false);
    }
  }, [location]);

  // ---------- FETCH INSIGHTS (PersonalizedAdviceView) ----------
  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        "http://localhost:4000/api/insights/personalized",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            location,
            healthConditions,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to fetch insights: ${res.status}`);
      }

      const data: Recommendation[] = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      console.error("Insights error:", err);
      setError(err.message ?? "Failed to fetch insights");
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  }, [location, healthConditions]);

  // ---------- FINAL CONTEXT VALUE ----------
  const value: AppContextType = {
    location,
    setLocation,
    currentAqi,
    pollutants,
    loading,
    error,
    fetchDashboardData,
    currentView,
    setCurrentView,
    healthConditions,
    setHealthConditions,
    recommendations,
    setRecommendations,
    fetchInsights,
  };

  // No JSX because this file is .ts
  return React.createElement(AppContext.Provider, { value }, children);
};
