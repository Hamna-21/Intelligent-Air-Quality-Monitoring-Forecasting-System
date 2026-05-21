// services/aqiService.ts

export interface CurrentAqiResponse {
  name: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  no2: number;
  so2: number;
  co: number;
}

// Fetch CURRENT AQI for a CITY using backend
export async function fetchCurrentAqiForLocation(
  location: string
): Promise<CurrentAqiResponse> {
  const clean = location.trim();
  if (!clean) {
    throw new Error("Location is empty");
  }

  // 1) Geocode the location → lat/lon
  const geoRes = await fetch("http://localhost:4000/api/geocode", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ location: clean }),
  });

  if (!geoRes.ok) {
    throw new Error("Failed to geocode location");
  }

  const geoJson = await geoRes.json();

  if (!geoJson?.isValid) {
    throw new Error("Invalid city name");
  }

  // 2) Get AQI for the coordinates
  const aqiRes = await fetch("http://localhost:4000/api/aqi/current", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat: geoJson.lat, lon: geoJson.lon }),
  });

  if (!aqiRes.ok) {
    throw new Error("Failed to fetch AQI");
  }

  const data = await aqiRes.json();

  return {
    name: geoJson.name,
    aqi: data.aqi,
    pm25: data.pm25,
    pm10: data.pm10,
    o3: data.o3,
    no2: data.no2,
    so2: data.so2,
    co: data.co,
  };
}
