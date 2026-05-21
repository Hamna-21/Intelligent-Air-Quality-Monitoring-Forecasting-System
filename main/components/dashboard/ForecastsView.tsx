import React, { useState, useEffect } from "react";
import { getHourlyForecast } from "../../services/geminiService";
import type { Prediction, HourlyForecast } from "../../types";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const Spinner: React.FC<{ message?: string }> = ({
  message = "Loading forecast...",
}) => (
  <div className="flex justify-center items-center h-full py-10">
    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
    <p className="ml-3 text-text-muted">{message}</p>
  </div>
);

const SunnyIcon = () => (
  <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12,9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Z" />
    <path d="M12,2A1,1,0,0,0,11,3V5a1,1,0,0,0,2,0V3A1,1,0,0,0,12,2Z" />
    <path d="M21,11H19a1,1,0,0,0,0,2h2a1,1,0,0,0,0-2Z" />
    <path d="M5,11H3a1,1,0,0,0,0,2H5a1,1,0,0,0,0-2Z" />
    <path d="M18.36,5.64l-1.41,1.41a1,1,0,0,0,1.41,1.41l1.41-1.41A1,1,0,0,0,18.36,5.64Z" />
    <path d="M7.05,16.95l-1.41,1.41a1,1,0,0,0,1.41,1.41l1.41-1.41A1,1,0,0,0,7.05,16.95Z" />
    <path d="M12,19a1,1,0,0,0-1,1v2a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19Z" />
    <path d="M5.64,5.64A1,1,0,0,0,4.22,7.05l1.41,1.41a1,1,0,0,0,1.41-1.41Z" />
  </svg>
);

const PartlyCloudyIcon = () => (
  <svg className="w-12 h-12" viewBox="0 0 24 24">
    <path d="M12,9a3,3,0,1,0,3,3A3,3,0,0,0,12,9Z" fill="#facc15" />
    <path d="M12,2a1,1,0,0,0-1,1V5a1,1,0,0,0,2,0V3A1,1,0,0,0,12,2Z" fill="#facc15" />
    <path d="M18.36,5.64l-1.41,1.41a1,1,0,0,0,1.41,1.41l1.41-1.41A1,1,0,0,0,18.36,5.64Z" fill="#facc15" />
    <path
      d="M17.5,12A6.5,6.5,0,0,0,11,5.5a1,1,0,0,0,0,2,4.5,4.5,0,1,1,0,9,1,1,0,0,0,0,2A6.5,6.5,0,0,0,17.5,12Z"
      fill="#d1d5db"
    />
    <path
      d="M17.5,12a4.5,4.5,0,0,0-4.32-4.5,1,1,0,0,0-.37.07,6.49,6.49,0,0,0-11.27,6,1,1,0,0,0,1,.84h14a1,1,0,0,0,.92-1.38A4.47,4.47,0,0,0,17.5,12Z"
      fill="#d1d5db"
    />
  </svg>
);

const CloudyIcon = () => (
  <svg className="w-12 h-12 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.5,12A6.5,6.5,0,0,0,11,5.5a1,1,0,0,0,0,2,4.5,4.5,0,1,1,0,9,1,1,0,0,0,0,2A6.5,6.5,0,0,0,17.5,12Z" />
    <path d="M17.5,12a4.5,4.5,0,0,0-4.32-4.5,1,1,0,0,0-.37.07,6.49,6.49,0,0,0-11.27,6,1,1,0,0,0,1,.84h14a1,1,0,0,0,.92-1.38A4.47,4.47,0,0,0,17.5,12Z" />
  </svg>
);

const HazyIcon = () => (
  <svg
    className="w-12 h-12 text-slate-500"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    viewBox="0 0 24 24"
  >
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
);

const WeatherIcon: React.FC<{ level: string }> = ({ level }) => {
  switch (level) {
    case "Good":
      return <SunnyIcon />;
    case "Moderate":
      return <PartlyCloudyIcon />;
    case "Sensitive":
      return <CloudyIcon />;
    default:
      return <HazyIcon />;
  }
};

const getAqiInfo = (aqi: number) => {
  if (aqi <= 50)
    return {
      level: "Good",
      color: "text-green-600",
      bgColor: "bg-green-100",
      borderColor: "border-green-400",
    };
  if (aqi <= 100)
    return {
      level: "Moderate",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      borderColor: "border-yellow-400",
    };
  if (aqi <= 150)
    return {
      level: "Sensitive",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      borderColor: "border-orange-400",
    };
  if (aqi <= 200)
    return {
      level: "Unhealthy",
      color: "text-red-600",
      bgColor: "bg-red-100",
      borderColor: "border-red-400",
    };
  if (aqi <= 300)
    return {
      level: "Very Unhealthy",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-400",
    };
  return {
    level: "Hazardous",
    color: "text-rose-600",
    bgColor: "bg-rose-100",
    borderColor: "border-rose-400",
  };
};

const TrendIcon = ({ trend }: { trend: Prediction["trend"] }) => {
  if (trend === "Improving")
    return (
      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    );
  if (trend === "Worsening")
    return (
      <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17l5-5m0 0l-5-5m5 5H6" />
      </svg>
    );
  return (
    <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
};

const ForecastsView: React.FC = () => {
  const [location] = useState("Rawalpindi, Pakistan");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hourlyForecasts, setHourlyForecasts] = useState<HourlyForecast[] | null>(null);
  const [predictions, setPredictions] = useState<Prediction[] | null>(null);
  const [activeTab, setActiveTab] = useState<"hourly" | "3-day">("hourly");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getHourlyForecast(location);
        console.log("HOURLY FORECAST DATA >>>", data);
        setHourlyForecasts(data);

        const baseAqi = data[0]?.aqi ?? 150;
        const preds: Prediction[] = [
          {
            day: "Today",
            predicted_aqi: baseAqi,
            summary: "Current conditions based on the latest AQI forecast.",
            trend: "Stable",
          },
          {
            day: "Tomorrow",
            predicted_aqi: baseAqi + 10,
            summary: "Slight increase in AQI expected due to stagnant air.",
            trend: "Worsening",
          },
          {
            day: "Day 3",
            predicted_aqi: baseAqi - 15,
            summary: "Conditions expected to improve as winds pick up.",
            trend: "Improving",
          },
        ];
        setPredictions(preds);
      } catch (e) {
        console.error(e);
        setError(
          `Location "${location}" not found or invalid. Please enter a valid city or region.`
        );
        setHourlyForecasts(null);
        setPredictions(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [location]);

  if (loading && !hourlyForecasts) return <Spinner />;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium font-heading text-text">Forecasts</h1>
          <p className="text-text-muted mt-1">
            System predictions for <span className="font-semibold text-primary">{location}</span>.
          </p>
        </div>
        <div className="p-1 bg-slate-100 rounded-lg flex space-x-1 border border-subtle">
          <button
            onClick={() => setActiveTab("3-day")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              activeTab === "3-day"
                ? "bg-primary text-white shadow"
                : "text-text-muted hover:bg-slate-200"
            }`}
          >
            3-Day Forecast
          </button>
          <button
            onClick={() => setActiveTab("hourly")}
            className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-colors ${
              activeTab === "hourly"
                ? "bg-primary text-white shadow"
                : "text-text-muted hover:bg-slate-200"
            }`}
          >
            Hourly Forecast
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {!error && activeTab === "3-day" && predictions && (
        <ThreeDaySection predictions={predictions} />
      )}

      {!error && activeTab === "hourly" && hourlyForecasts && (
        <HourlySection hourlyForecasts={hourlyForecasts} />
      )}
    </div>
  );
};

const ThreeDaySection: React.FC<{ predictions: Prediction[] }> = ({ predictions }) => {
  const chartData = predictions.map((p) => ({
    name: p.day,
    aqi: p.predicted_aqi,
  }));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {predictions.map((pred, index) => {
          const { level, color, bgColor, borderColor } = getAqiInfo(pred.predicted_aqi);
          return (
            <div
              key={index}
              className={`bg-surface p-6 rounded-2xl border border-subtle border-t-4 ${borderColor} shadow-sm transition-all hover:-translate-y-1`}
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium font-heading text-text">{pred.day}</h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${bgColor} ${color}`}>
                  {level}
                </span>
              </div>
              <div className="text-center my-6">
                <span className={`text-6xl font-bold ${color}`}>{pred.predicted_aqi}</span>
                <p className="text-text-muted font-semibold">Predicted AQI</p>
              </div>
              <p className="text-text-muted text-sm mb-4 min-h-[3rem]">{pred.summary}</p>
              <div className="flex items-center justify-between pt-4 border-t border-subtle">
                <span className="text-sm font-semibold text-text-muted">Trend:</span>
                <div className="flex items-center">
                  <span className="font-bold text-text mr-2">{pred.trend}</span>
                  <TrendIcon trend={pred.trend} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold font-heading text-text mb-4">3-Day Trend Analysis</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAqi3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                name="Predicted AQI"
                type="monotone"
                dataKey="aqi"
                stroke="#0ea5e9"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAqi3)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const HourlySection: React.FC<{ hourlyForecasts: HourlyForecast[] }> = ({
  hourlyForecasts,
}) => {
  const chartData = hourlyForecasts.map((h) => ({
    time: h.time,
    aqi: h.aqi,
  }));

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 custom-scrollbar">
          {hourlyForecasts.map((hour, index) => {
            const { color: aqiColor, level } = getAqiInfo(hour.aqi);
            const isNow = hour.time.toLowerCase() === "now";
            return (
              <div
                key={index}
                className={`flex-shrink-0 w-32 text-center p-4 rounded-2xl border ${
                  isNow ? "bg-primary/10 border-primary" : "bg-surface border-subtle"
                }`}
              >
                <p className={`font-bold text-lg ${isNow ? "text-primary" : "text-text"}`}>
                  {hour.time}
                </p>
                <div className="my-2 flex justify-center items-center h-12">
                  <WeatherIcon level={level} />
                </div>
                <p className={`text-4xl font-bold ${aqiColor}`}>{hour.aqi}</p>
                <p className="text-sm text-text-muted">AQI</p>
                <div className="mt-3 pt-3 border-t border-subtle space-y-1 text-sm text-text-muted">
                  <p>{hour.temp}°C</p>
                  <p>{hour.wind} km/h</p>
                  <p>{hour.humidity}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-bold font-heading text-text mb-4">Hourly AQI Progression</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAqiHourly" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Legend />
              <Area
                name="Hourly AQI"
                type="monotone"
                dataKey="aqi"
                stroke="#8b5cf6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorAqiHourly)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export { ForecastsView };
