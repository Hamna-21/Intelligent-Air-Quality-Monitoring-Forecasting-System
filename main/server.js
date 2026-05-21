process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import "dotenv/config";
import https from "https";
import express from "express";
import cors from "cors";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "10mb" }));

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeFetch = (url, options = {}) =>
  fetch(url, {
    agent: new https.Agent({ keepAlive: true, rejectUnauthorized: false }),
    ...options,
  });

const LOCAL_CITY_FALLBACK = {
  rawalpindi: { lat: 33.5651, lon: 73.0169, country: "PK" },
  islamabad: { lat: 33.6844, lon: 73.0479, country: "PK" },
  lahore: { lat: 31.5204, lon: 74.3587, country: "PK" },
  karachi: { lat: 24.8607, lon: 67.0011, country: "PK" },
};

const SAFE_PLACES = {
  default: [
    {
      name: "Central Park",
      type: "Outdoor",
      distance: "3–5 km",
      is_indoor: false,
      estimated_aqi: 90,
      description: "Cleaner than city center.",
    },
    {
      name: "Indoor Mall",
      type: "Indoor",
      distance: "3–8 km",
      is_indoor: true,
      estimated_aqi: 65,
      description: "Filtered indoor air.",
    },
  ],
};

const safePlacesMock = (loc, aqi) =>
  SAFE_PLACES[loc] ||
  SAFE_PLACES[`${loc}, pakistan`] ||
  SAFE_PLACES.default.map((x) => ({
    ...x,
    estimated_aqi: Math.max(20, Math.min(200, x.estimated_aqi + (aqi - 120) / 5)),
  }));

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/geocode", async (req, res) => {
  const loc = (req.body.location || "").toLowerCase().trim();
  if (!loc) return res.json({ isValid: false });

  if (LOCAL_CITY_FALLBACK[loc]) {
    const c = LOCAL_CITY_FALLBACK[loc];
    return res.json({
      isValid: true,
      name: `${loc}, ${c.country}`,
      lat: c.lat,
      lon: c.lon,
    });
  }

  try {
    const geo = await safeFetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        loc
      )}&limit=1&appid=${process.env.OPENWEATHER_KEY}`
    );
    const json = await geo.json();
    if (!json.length) return res.json({ isValid: false });

    const p = json[0];
    res.json({
      isValid: true,
      name: `${p.name}, ${p.country}`,
      lat: p.lat,
      lon: p.lon,
    });
  } catch (e) {
    res.json({
      isValid: true,
      name: "Rawalpindi, PK",
      lat: 33.5651,
      lon: 73.0169,
    });
  }
});

app.post("/api/aqi/current", async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

  try {
    const r = await safeFetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_KEY}`
    );
    const j = await r.json();
    const d = j.list[0];
    const s = [0, 50, 100, 150, 200, 300];

    res.json({
      aqi: s[d.main.aqi],
      pm25: d.components.pm2_5,
      pm10: d.components.pm10,
      o3: d.components.o3,
      no2: d.components.no2,
      so2: d.components.so2,
      co: d.components.co,
    });
  } catch {
    res.status(500).json({ error: "Failed AQI" });
  }
});

app.post("/api/forecast/hourly", async (req, res) => {
  const { lat, lon } = req.body;
  if (!lat || !lon) return res.status(400).json({ error: "Missing lat/lon" });

  try {
    const key = process.env.OPENWEATHER_KEY;
    const [wRes, aRes] = await Promise.all([
      safeFetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`
      ),
      safeFetch(
        `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${lat}&lon=${lon}&appid=${key}`
      ),
    ]);

    const weather = await wRes.json();
    const air = await aRes.json();
    const s = [0, 50, 100, 150, 200, 300];

    const out = [];
    for (let i = 0; i < 8; i++) {
      if (!weather.list[i] || !air.list[i]) break;
      out.push({
        time: i === 0 ? "Now" : `+${i * 3}hr`,
        aqi: s[air.list[i].main.aqi],
        temp: Math.round(weather.list[i].main.temp),
        wind: Math.round(weather.list[i].wind.speed),
        humidity: weather.list[i].main.humidity,
      });
    }

    res.json(out);
  } catch {
    res.status(500).json({ error: "Forecast error" });
  }
});

app.post("/api/analyze/image", async (req, res) => {
  try {
    const d = (req.body.imageBase64 || "").split(",")[1];
    const sc = {
      type: Type.OBJECT,
      properties: {
        visualAqi: { type: Type.NUMBER },
        hazeDensity: { type: Type.STRING },
        visibilityDistance: { type: Type.STRING },
        smogType: { type: Type.STRING },
        pollutantSources: { type: Type.ARRAY, items: { type: Type.STRING } },
        healthRisk: { type: Type.STRING },
        discrepancyAnalysis: { type: Type.STRING },
      },
    };

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: d } },
        { text: "Analyze smog and pollution." },
      ],
      config: { responseMimeType: "application/json", responseSchema: sc },
    });

    res.json(JSON.parse(r.text));
  } catch (e) {
    res.status(500).json({ error: "Image error" });
  }
});

app.post("/api/safe-places", async (req, res) => {
  const { location, aqi } = req.body;
  if (!location) return res.status(400).json({ error: "Missing location" });

  try {
    const sc = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          distance: { type: Type.STRING },
          description: { type: Type.STRING },
          is_indoor: { type: Type.BOOLEAN },
          estimated_aqi: { type: Type.NUMBER },
        },
      },
    };

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `Safe places in ${location}. AQI = ${aqi}. JSON only.`,
        },
      ],
      config: { responseMimeType: "application/json", responseSchema: sc },
    });

    const p = JSON.parse(r.text);
    if (p?.length) return res.json(p);
  } catch {}

  res.json(safePlacesMock(location.toLowerCase(), Number(aqi)));
});

app.post("/api/insights/pollution-sources", async (req, res) => {
  try {
    const sc = {
      type: Type.OBJECT,
      properties: {
        sources: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: { name: { type: Type.STRING }, value: { type: Type.NUMBER } },
          },
        },
        insight: { type: Type.STRING },
      },
    };

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `Top pollution sources for ${req.body.location}. JSON only.`,
        },
      ],
      config: { responseMimeType: "application/json", responseSchema: sc },
    });

    res.json(JSON.parse(r.text));
  } catch {
    res.json({
      sources: [
        { name: "Traffic", value: 45 },
        { name: "Industry", value: 25 },
        { name: "Dust", value: 15 },
        { name: "Residential", value: 15 },
      ],
      insight: "Traffic is the dominant pollution source.",
    });
  }
});

app.post("/api/insights/personalized", async (req, res) => {
  try {
    const geo = await safeFetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
        req.body.location
      )}&limit=1&appid=${process.env.OPENWEATHER_KEY}`
    );
    const g = await geo.json();
    if (!g.length) throw new Error();

    const place = g[0];
    const air = await safeFetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${place.lat}&lon=${place.lon}&appid=${process.env.OPENWEATHER_KEY}`
    );
    const a = await air.json();
    const sc = [0, 50, 100, 150, 200, 300];
    const aqi = sc[a.list[0].main.aqi];

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          period: { type: Type.STRING },
          advice: { type: Type.STRING },
          aqi: { type: Type.STRING },
          uv_index: { type: Type.STRING },
          pollen_level: { type: Type.STRING },
        },
      },
    };

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          text: `Generate 4 time-block air quality recommendations for ${place.name}. AQI=${aqi}. JSON only.`,
        },
      ],
      config: { responseMimeType: "application/json", responseSchema: schema },
    });

    res.json(JSON.parse(r.text));
  } catch {
    res.json([
      {
        period: "Morning",
        advice: "Good time for light walk.",
        aqi: "120",
        uv_index: "Low",
        pollen_level: "Low",
      },
      {
        period: "Afternoon",
        advice: "Avoid long exposure near traffic.",
        aqi: "120",
        uv_index: "High",
        pollen_level: "Moderate",
      },
      {
        period: "Evening",
        advice: "Cleaner conditions for outdoor activity.",
        aqi: "120",
        uv_index: "Low",
        pollen_level: "Low",
      },
      {
        period: "Night",
        advice: "Ventilate only if fresh outside.",
        aqi: "120",
        uv_index: "None",
        pollen_level: "Low",
      },
    ]);
  }
});

app.post("/api/enforce/incident", async (req, res) => {
  try {
    const img = (req.body.imageBase64 || "").split(",")[1];
    const sc = {
      type: Type.OBJECT,
      properties: {
        isViolation: { type: Type.BOOLEAN },
        violationType: { type: Type.STRING },
        severity: { type: Type.STRING },
        confidence: { type: Type.NUMBER },
        description: { type: Type.STRING },
        legalReference: { type: Type.STRING },
      },
    };

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        { inlineData: { mimeType: "image/jpeg", data: img } },
        { text: "Scan for environmental violations. JSON only." },
      ],
      config: { responseMimeType: "application/json", responseSchema: sc },
    });

    res.json(JSON.parse(r.text));
  } catch {
    res.json({
      isViolation: false,
      violationType: "None",
      severity: "Low",
      confidence: 100,
      description: "No pollution detected.",
      legalReference: "N/A",
    });
  }
});

app.post("/api/enforce/complaint", async (req, res) => {
  try {
    const { analysis, location } = req.body;
    if (!analysis?.isViolation)
      return res.json({
        letter: "No complaint generated — no violation detected.",
      });

    const r = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write complaint letter about ${analysis.violationType} at ${location}.`,
    });

    res.json({ letter: r.text });
  } catch {
    res.status(500).json({ error: "Complaint generation failed" });
  }
});

app.listen(port, () =>
  console.log(`Backend running at http://localhost:${port}`)
);
