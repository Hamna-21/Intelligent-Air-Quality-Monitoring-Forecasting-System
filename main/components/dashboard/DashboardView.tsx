// components/dashboard/DashboardView.tsx

import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "./context/AppContext";
import PollutantInfoModal from "./PollutantInfoModal";
import { fetchCurrentAqiForLocation } from "../../services/aqiService";

// AQI level helper
const getAqiInfoForCard = (aqi: number) => {
  if (aqi <= 50) return { level: "Good", color: "text-green-600" };
  if (aqi <= 100) return { level: "Moderate", color: "text-yellow-600" };
  if (aqi <= 150) return { level: "Sensitive", color: "text-orange-600" };
  if (aqi <= 200) return { level: "Unhealthy", color: "text-red-600" };
  if (aqi <= 300) return { level: "Very Unhealthy", color: "text-purple-600" };
  return { level: "Hazardous", color: "text-rose-600" };
};

export const DashboardView = () => {
  const context = useContext(AppContext);
  const [modalOpen, setModalOpen] = useState(false);

  // City AQI States
  const [gwadarAqi, setGwadarAqi] = useState<number | null>(null);
  const [quettaAqi, setQuettaAqi] = useState<number | null>(null);
  const [rawalpindiAqi, setRawalpindiAqi] = useState<number | null>(null);

  if (!context) return null;

  const {
    location,
    currentAqi,
    pollutants,
    loading,
    error,
    fetchDashboardData,
  } = context;

  // Fetch main location AQI
  useEffect(() => {
    if (currentAqi === null && !loading) {
      fetchDashboardData();
    }
  }, [currentAqi, loading, fetchDashboardData]);

  // Fetch 3 cities AQI
  useEffect(() => {
    const loadCityAQI = async () => {
      try {
        const g = await fetchCurrentAqiForLocation("Gwadar");
        setGwadarAqi(g.aqi);

        const q = await fetchCurrentAqiForLocation("Quetta");
        setQuettaAqi(q.aqi);

        const r = await fetchCurrentAqiForLocation("Rawalpindi");
        setRawalpindiAqi(r.aqi);
      } catch (err) {
        console.error("Error loading city AQI", err);
      }
    };
    loadCityAQI();
  }, []);

  if (loading && currentAqi === null)
    return <div className="p-4 text-gray-500">Loading air quality…</div>;

  if (error)
    return (
      <div className="p-4 text-red-600 font-semibold">
        Failed to load data: {error}
      </div>
    );

  const safeAqi = currentAqi ?? 0;
  const aqiInfo = getAqiInfoForCard(safeAqi);

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold mb-2">Overview</h1>
      <p className="text-gray-500 mb-6">
        Live AQI for <b>{location}</b>
      </p>

      {/* MAIN AQI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">

        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-xs opacity-60">Current AQI</p>
          <p className="text-4xl font-bold">{currentAqi ?? "—"}</p>
          <span className={`text-sm ${aqiInfo.color}`}>{aqiInfo.level}</span>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-xs opacity-60">PM2.5</p>
          <p className="text-3xl font-bold">{pollutants.pm25 ?? "—"}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-xs opacity-60">O₃</p>
          <p className="text-3xl font-bold">{pollutants.o3 ?? "—"}</p>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border">
          <p className="text-xs opacity-60">NO₂</p>
          <p className="text-3xl font-bold">{pollutants.no2 ?? "—"}</p>
        </div>
      </div>

      {/* ⭐ MINIMAL + CLEAN CITY AQI CARDS */}
      <h2 className="text-xl font-semibold mb-4">City AQI Comparison</h2>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">

        {[
          { city: "Khushab", aqi: gwadarAqi },
          { city: "Quetta", aqi: quettaAqi },
          { city: "Rawalpindi", aqi: rawalpindiAqi },
        ].map(({ city, aqi }) => {
          const info = aqi !== null ? getAqiInfoForCard(aqi) : null;

          const bgMap: Record<string, string> = {
            Good: "bg-green-50 border-green-200 text-green-700",
            Moderate: "bg-yellow-50 border-yellow-200 text-yellow-700",
            Sensitive: "bg-orange-50 border-orange-200 text-orange-700",
            Unhealthy: "bg-red-50 border-red-200 text-red-700",
            "Very Unhealthy": "bg-purple-50 border-purple-200 text-purple-700",
            Hazardous: "bg-rose-50 border-rose-200 text-rose-700",
          };

          const classes =
            info && bgMap[info.level]
              ? bgMap[info.level]
              : "bg-slate-50 border-slate-200 text-slate-700";

          return (
            <div
              key={city}
              className={`rounded-xl p-6 shadow-sm border ${classes} transition-all hover:shadow-md`}
            >
              <p className="text-sm font-medium opacity-70">{city}</p>

              <p className="text-4xl font-extrabold mt-3">
                {aqi !== null ? aqi : "—"}
              </p>

              {info && (
                <p className="text-sm font-semibold mt-1 opacity-80">
                  {info.level}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <PollutantInfoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
};
