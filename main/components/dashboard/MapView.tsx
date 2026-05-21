// components/dashboard/MapView.tsx
import React, { useState, useRef, useContext, useEffect } from "react";
import { getSafetyAnalysis, getCoordinates, type SafetyAnalysis } from "../../services/geminiService";
import { AppContext } from "./context/AppContext";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

// Minimal local type just for the info panel
interface SimpleStation {
  city: { name: string };
  aqi: number;
}

const getAqiInfo = (aqi: number) => {
  if (aqi <= 50)
    return {
      level: "Good",
      color: "text-green-600",
      hex: "#22c55e",
      clusterClass: "marker-cluster-aqi-good",
    };
  if (aqi <= 100)
    return {
      level: "Moderate",
      color: "text-yellow-600",
      hex: "#f59e0b",
      clusterClass: "marker-cluster-aqi-moderate",
    };
  if (aqi <= 150)
    return {
      level: "Sensitive",
      color: "text-orange-600",
      hex: "#f97316",
      clusterClass: "marker-cluster-aqi-moderate",
    };
  if (aqi <= 200)
    return {
      level: "Unhealthy",
      color: "text-red-600",
      hex: "#ef4444",
      clusterClass: "marker-cluster-aqi-unhealthy",
    };
  if (aqi <= 300)
    return {
      level: "Very Unhealthy",
      color: "text-purple-600",
      hex: "#a855f7",
      clusterClass: "marker-cluster-aqi-hazardous",
    };
  return {
    level: "Hazardous",
    color: "text-rose-600",
    hex: "#e11d48",
    clusterClass: "marker-cluster-aqi-hazardous",
  };
};

const Loader: React.FC<{ message: string }> = ({ message }) => (
  <div className="absolute inset-0 z-[1000] bg-white/70 flex flex-col items-center justify-center backdrop-blur-sm rounded-2xl pointer-events-none">
    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
    <p className="mt-4 text-text font-semibold">{message}</p>
  </div>
);

const InfoPanel: React.FC<{
  station: SimpleStation | null;
  onClose: () => void;
  isUserLocation?: boolean;
}> = ({ station, onClose, isUserLocation }) => {
  if (!station) return null;

  const { level, color } = getAqiInfo(station.aqi);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] max-w-md bg-white/95 p-4 rounded-2xl shadow-2xl border border-slate-200 flex items-center justify-between transition-all duration-300 backdrop-blur-md">
      <div>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">
          {isUserLocation ? "Current Location" : "Selected Location"}
        </p>
        <p className="text-lg font-bold text-slate-800 truncate max-w-[200px]">
          {station.city.name}
        </p>
      </div>
      <div className="text-right flex items-center gap-4">
        <div className="text-right">
          <p className={`text-3xl font-black ${color}`}>{station.aqi}</p>
          <p className={`text-xs font-bold ${color}`}>{level}</p>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Component for Personal Safety Analysis
const SafetyCard: React.FC<{
  analysis: SafetyAnalysis | null;
  loading: boolean;
}> = ({ analysis, loading }) => {
  if (loading)
    return (
      <div className="absolute top-20 right-4 z-[1000] w-72 bg-white/90 p-4 rounded-xl shadow-xl backdrop-blur-md animate-pulse">
        <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
        <div className="h-20 bg-slate-100 rounded"></div>
      </div>
    );

  if (!analysis) return null;

  const getStatusColor = (status: string) => {
    if (status === "Safe")
      return "bg-green-100 text-green-800 border-green-200";
    if (status === "Caution")
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    return "bg-red-100 text-red-800 border-red-200";
  };

  return (
    <div className="absolute top-20 right-4 z-[1000] w-72 bg-white/95 p-5 rounded-2xl shadow-2xl backdrop-blur-md border border-slate-200 animate-fade-in">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-slate-800 text-sm">
          Personal Safety Assessment
        </h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(
            analysis.status
          )}`}
        >
          {analysis.status}
        </span>
      </div>
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {analysis.message}
      </p>
      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
          Recommendation
        </p>
        <p className="text-xs font-semibold text-slate-700">
          {analysis.recommendation}
        </p>
      </div>
    </div>
  );
};

export const MapView: React.FC = () => {
  const context = useContext(AppContext);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const clusterGroupRef = useRef<any>(null);

  const [selectedStation, setSelectedStation] = useState<SimpleStation | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [safetyLoading, setSafetyLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [safetyAnalysis, setSafetyAnalysis] = useState<SafetyAnalysis | null>(
    null
  );
  const [locationSearch, setLocationSearch] = useState("");
  const [isUserLoc, setIsUserLoc] = useState(false);
  const [stationsLoaded, setStationsLoaded] = useState(false);

  // treat any "valid city name" / "enter a city" error as input error
  const isInputError =
    !!error &&
    (error.toLowerCase().includes("city") ||
      error.toLowerCase().includes("location not found") ||
      error.toLowerCase().includes("enter a city"));

  // Initialize Leaflet Map
  useEffect(() => {
    const L = (window as any).L;
    if (L && mapContainerRef.current && !mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
      }).setView([30.3753, 69.3451], 5); // Centered on Pakistan

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 20,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Handle Click
      map.on("click", (e: any) => {
        analyzeLocation(e.latlng.lat, e.latlng.lng, false);
      });

      // Initialize Cluster Group with Custom Icon Create Function
      const markerClusterGroup = L.markerClusterGroup({
        iconCreateFunction: function (cluster: any) {
          const markers = cluster.getAllChildMarkers();
          let sum = 0;
          markers.forEach((m: any) => {
            sum += m.options.aqi || 0;
          });
          const avgAqi = markers.length
            ? Math.round(sum / markers.length)
            : 0;
          const info = getAqiInfo(avgAqi);

          return L.divIcon({
            html: `<div style="line-height:30px"><span>${avgAqi}</span></div>`,
            className: `marker-cluster ${info.clusterClass}`,
            iconSize: new L.Point(40, 40),
          });
        },
        showCoverageOnHover: false,
      });

      map.addLayer(markerClusterGroup);
      clusterGroupRef.current = markerClusterGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Function to generate and load dummy stations to demonstrate clustering
  const loadStations = () => {
    const L = (window as any).L;
    if (!L || !clusterGroupRef.current || stationsLoaded) return;

    setLoading(true);
    const markers: any[] = [];

    const cities = [
      { lat: 33.6844, lon: 73.0479, name: "Islamabad" },
      { lat: 31.5204, lon: 74.3587, name: "Lahore" },
      { lat: 24.8607, lon: 67.0011, name: "Karachi" },
      { lat: 34.0151, lon: 71.5249, name: "Peshawar" },
      { lat: 30.1798, lon: 66.975, name: "Quetta" },
    ];

    cities.forEach((city) => {
      for (let i = 0; i < 50; i++) {
        const lat = city.lat + (Math.random() - 0.5) * 2;
        const lon = city.lon + (Math.random() - 0.5) * 2;
        const aqi = Math.floor(Math.random() * 300) + 20;
        const info = getAqiInfo(aqi);

        const icon = L.divIcon({
          className: "custom-pin",
          html: `<div style="background-color: ${info.hex}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>`,
          iconSize: [12, 12],
        });

        const marker = L.marker([lat, lon], { icon: icon, aqi });
        marker.bindTooltip(`AQI: ${aqi}`, { direction: "top" });

        marker.on("click", (e: any) => {
          L.DomEvent.stopPropagation(e);
          analyzeLocation(lat, lon, false);
        });

        markers.push(marker);
      }
    });

    clusterGroupRef.current.addLayers(markers);
    setStationsLoaded(true);
    setLoading(false);
  };

  const analyzeLocation = async (
    lat: number,
    lon: number,
    isUser: boolean
  ) => {
    const L = (window as any).L;
    const map = mapInstanceRef.current;
    if (!map || !L) return;

    setLoading(true);
    setError(null);
    setSelectedStation(null);
    setSafetyAnalysis(null);
    setIsUserLoc(isUser);

    if (markerRef.current) {
      markerRef.current.remove();
    }

    const customIcon = L.divIcon({
      className: "custom-div-icon",
      html: `<div style="background-color: ${
        isUser ? "#3b82f6" : "#ef4444"
      }; width: 20px; height: 20px; border-radius: 50%; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); animation: pulse 2s infinite;"></div><style>@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); } 70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); } 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); } }</style>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    markerRef.current = L.marker([lat, lon], {
      icon: customIcon,
      zIndexOffset: 1000,
    }).addTo(map);
    map.flyTo([lat, lon], 12, { duration: 1.5 });

    try {
      // Directly hit your backend AQI endpoint using lat/lon
      const res = await fetch(`${API_BASE_URL}/api/aqi/current`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });

      if (!res.ok) {
        throw new Error("AQI request failed");
      }

      const data = await res.json();

      const station: SimpleStation = {
        city: {
          name: data.city || (isUser ? "Your Location" : "Selected Location"),
        },
        aqi: data.aqi,
      };

      setSelectedStation(station);

      if (context?.healthConditions) {
        setSafetyLoading(true);
        const conditions = context.healthConditions.map((c) => c.label);
        const analysis = await getSafetyAnalysis(data.aqi, conditions);
        setSafetyAnalysis(analysis);
        setSafetyLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to analyze location.");
    } finally {
      setLoading(false);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        analyzeLocation(
          position.coords.latitude,
          position.coords.longitude,
          true
        );
      },
      () => {
        setLoading(false);
        setError(
          "Unable to access your location. Please allow location access in your browser."
        );
      }
    );
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = locationSearch.trim();
    if (!trimmed) {
      setError("Please enter a city name before searching.");
      return;
    }

    setLoading(true);
    setError(null);
    setSelectedStation(null);
    setSafetyAnalysis(null);

    let resolved = false;

    // 1. Backend geocode via server (OpenWeather geocoder)
    try {
      const res = await fetch(`${API_BASE_URL}/api/geocode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: trimmed }),
      });

      if (res.ok) {
        const geo = await res.json();
        if (
          geo &&
          geo.isValid &&
          typeof geo.lat === "number" &&
          typeof geo.lon === "number"
        ) {
          await analyzeLocation(geo.lat, geo.lon, false);
          if (geo.name) setLocationSearch(geo.name);
          resolved = true;
        } else if (geo && geo.error) {
          setError("City not found. Please enter a valid city name.");
        }
      }
    } catch (err) {
      console.warn("Server geocode failed, falling back to AI coordinates…", err);
    }

    // 2. AI fallback (handles typos / fuzzy names)
    if (!resolved) {
      try {
        const coords = await getCoordinates(trimmed);
        if (
          coords &&
          coords.isValid &&
          typeof coords.lat === "number" &&
          typeof coords.lon === "number"
        ) {
          await analyzeLocation(coords.lat, coords.lon, false);
          if (coords.name) setLocationSearch(coords.name);
          resolved = true;
        } else if (!error) {
          setError("Location not found. Please enter a valid city name.");
        }
      } catch (err) {
        console.error("AI coordinate lookup failed", err);
        if (!error) setError("Search failed. Please try again.");
      }
    }

    if (!resolved && !error) {
      setError("Location not found. Please enter a valid city name.");
    }

    setLoading(false);
  };

  return (
    <div className="h-full w-full flex flex-col relative rounded-2xl overflow-hidden shadow-sm border border-slate-200">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 z-[1000] flex gap-2">
        <form onSubmit={handleSearchSubmit} className="relative shadow-lg rounded-xl">
          <input
            type="text"
            placeholder="Search places (e.g. London)"
            value={locationSearch}
            onChange={(e) => {
              setLocationSearch(e.target.value);
              if (error) setError(null);
            }}
            className={
              "pl-10 pr-4 py-3 rounded-xl bg-white border text-sm font-semibold text-slate-700 placeholder-slate-400 outline-none w-64 md:w-80 shadow-sm " +
              (isInputError
                ? "border-red-300 ring-2 ring-red-300 focus:ring-red-300"
                : "border-transparent focus:ring-2 focus:ring-primary")
            }
          />
          <svg
            className="w-5 h-5 text-slate-400 absolute left-3 top-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </form>

        <button
          onClick={handleLocateMe}
          className="p-3 bg-white text-primary rounded-xl shadow-lg hover:bg-slate-50 transition-all flex items-center justify-center border border-white"
          title="Find My Location"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      {/* Load Stations Toggle */}
      <div className="absolute top-4 right-4 z-[1000]">
        <button
          onClick={loadStations}
          disabled={stationsLoaded}
          className="px-4 py-2 bg-white text-slate-700 rounded-xl shadow-lg hover:bg-slate-50 transition-all font-semibold text-sm border border-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          {stationsLoaded ? "Stations Loaded" : "Show Regional Stations"}
        </button>
      </div>

      {loading && <Loader message="Processing location data..." />}

      {error && (
        <div className="absolute top-20 left-4 z-[1000] bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold shadow-lg animate-fade-in">
          {error}
        </div>
      )}

      {/* Safety Assessment Card Overlay */}
      <SafetyCard analysis={safetyAnalysis} loading={safetyLoading} />

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full bg-slate-100" />

      {/* Bottom Info Panel */}
      <InfoPanel
        station={selectedStation}
        onClose={() => {
          setSelectedStation(null);
          setSafetyAnalysis(null);
        }}
        isUserLocation={isUserLoc}
      />
    </div>
  );
};
