// src/services/api.ts
// Helper functions for talking to our backend (server.js)
// src/services/api.ts
// Helper functions for talking to our backend (server.js)

import type { PollutionAnalysisResult } from "../types";   // ← add this

const API_BASE = "http://localhost:4000/api";



// Generic request helper
async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();
  return data;
}

// 1) Health check
export async function checkBackendHealth() {
  return request("/health");
}

// 2) Safety analysis
export async function analyzeSafety(aqi: number, healthConditions: string[]) {
  return request("/analyze/safety", {
    method: "POST",
    body: JSON.stringify({ aqi, healthConditions }),
  });
}

// 3) Hourly forecast
export async function getHourlyForecast(location: string) {
  return request("/forecast/hourly", {
    method: "POST",
    body: JSON.stringify({ location }),
  });
}

// 4) Image-based smog analysis
export async function analyzeImage(imageBase64: string) {
  return request("/analyze/image", {
    method: "POST",
    body: JSON.stringify({ imageBase64 }),
  });
}
// 5) Current AQI + weather for Overview
export async function getCurrentAqi(location: string) {
  return request("/aqi/current", {
    method: "POST",
    body: JSON.stringify({ location }),
  });
}



// 6) Eco-Enforce: verify pollution incident from image
export async function verifyPollutionIncident(imageBase64: string) {
  const data = await request("/enforce/incident", {
    method: "POST",
    body: JSON.stringify({ imageBase64 }),
  });
  console.log("Eco-enforce incident response:", data);
  return data; // should match PollutionAnalysisResult
}

// 7) Eco-Enforce: generate complaint letter for a verified incident
export async function generateComplaintLetter(
  analysis: PollutionAnalysisResult,
  location: string
) {
  const data = await request("/enforce/complaint", {
    method: "POST",
    body: JSON.stringify({ analysis, location }),
  });
  console.log("Eco-enforce complaint response:", data);
  // backend returns { letter: "...." }
  return data.letter as string;
}

// 8) Safe Havens — recommended indoor/outdoor safe places
export async function getSafePlaces(location: string, aqi: number) {
  return request("/safe-places", {
    method: "POST",
    body: JSON.stringify({ location, aqi })
  });
}




