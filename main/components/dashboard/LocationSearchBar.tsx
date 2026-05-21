// components/dashboard/LocationSearchBar.tsx
import React, { useState } from "react";

type LocationResult = {
  name: string;
  lat: number;
  lon: number;
};

// Optional: parent can listen when a valid city is selected
interface LocationSearchBarProps {
  initialLabel?: string;
  onLocationValid?: (loc: LocationResult) => void;
}

export const LocationSearchBar: React.FC<LocationSearchBarProps> = ({
  initialLabel = "",
  onLocationValid,
}) => {
  const [query, setQuery] = useState(initialLabel);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmed = query.trim();

    // Empty string → ask user to type something
    if (!trimmed) {
      setError("Please enter a city name.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("http://localhost:4000/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: trimmed }),
      });

      const data = await res.json();

      // Backend either returns isValid: false or 400 for bad city
      if (!res.ok || !data?.isValid) {
        setError("Please enter a valid city name.");
        return;
      }

      // Use the normalized name from backend (e.g. "Lahore, PK")
      const result: LocationResult = {
        name: data.name,
        lat: data.lat,
        lon: data.lon,
      };

      setQuery(data.name);
      setError(null);

      if (onLocationValid) {
        onLocationValid(result);
      }
    } catch (err) {
      console.error("Location search error:", err);
      setError("Unable to validate city. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="relative flex items-center bg-white rounded-xl border border-slate-200 shadow-sm"
      >
        <span className="absolute left-3 text-slate-400">
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
              d="M15 10a5 5 0 11-10 0 5 5 0 0110 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-4.35-4.35"
            />
          </svg>
        </span>

        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (error) setError(null);
          }}
          placeholder="Search city (e.g. Lahore)"
          className="w-full pl-9 pr-12 py-2.5 text-sm text-slate-700 placeholder-slate-400 bg-transparent border-0 focus:outline-none focus:ring-0"
        />

        <button
          type="submit"
          disabled={loading}
          className="absolute right-2 flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white text-xs font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          ) : (
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
                d="M5 12h14M12 5l7 7-7 7"
              />
            </svg>
          )}
        </button>
      </form>

      {error && (
        <p className="mt-1 text-xs font-semibold text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};
