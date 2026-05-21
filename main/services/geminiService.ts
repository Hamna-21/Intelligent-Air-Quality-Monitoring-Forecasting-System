// services/geminiService.ts

import { GoogleGenAI, Type } from "@google/genai";
import type {
  Recommendation,
  Prediction,
  HourlyForecast,
  HealthImpactAnalysis,
  PollutionSourceAnalysis,
  AQICalculatorInsight,
  VisionAnalysisResult,
  PollutionAnalysisResult,
  SafePlace,
} from "../types";

// ------------------------------------------------------
// Lazy initialization of the Gemini Client
// ------------------------------------------------------
let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  if (aiInstance) return aiInstance;

  let apiKey = "";
  try {
    if (typeof process !== "undefined" && (process as any).env) {
      apiKey = (process as any).env.API_KEY || "";
    }
  } catch (e) {
    console.warn("Could not access process.env");
  }

  aiInstance = new GoogleGenAI({ apiKey });
  return aiInstance;
}

// ------------------------------------------------------
// Helper to call Gemini with JSON schema
// ------------------------------------------------------
async function processApiResponse<T>(
  prompt: string,
  schema: any
): Promise<T> {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });
    return JSON.parse(response.text) as T;
  } catch (error: any) {
    if (error.status === 429 || (error.message && error.message.includes("429"))) {
      console.warn("Gemini API Quota Exceeded.");
    } else {
      console.warn("Gemini API Error (falling back to mock data):", error);
    }
    throw error;
  }
}

// ------------------------------------------------------
// MOCK / FALLBACK GENERATORS
// ------------------------------------------------------
function getMockSafetyAnalysis(aqi: number) {
  const status = aqi < 100 ? "Safe" : aqi < 200 ? "Caution" : "Unsafe";
  return {
    status: status as "Safe" | "Caution" | "Unsafe",
    message: `(Simulation) Based on the AQI of ${aqi}, conditions are ${status.toLowerCase()}. Sensitive groups should take precautions.`,
    recommendation:
      aqi < 100
        ? "Enjoy the outdoors, air quality is good."
        : "Wear a mask and minimize outdoor exposure.",
  };
}

function getMockRecommendations(location: string): Recommendation[] {
  return [
    {
      period: "Morning",
      advice: "Air quality is acceptable. Good time for a light walk.",
      aqi: "45",
      uv_index: "Low",
      pollen_level: "Low",
    },
    {
      period: "Afternoon",
      advice: "Ozone levels rising. Stay hydrated and cool.",
      aqi: "85",
      uv_index: "High",
      pollen_level: "Moderate",
    },
    {
      period: "Evening",
      advice: "Conditions improving. Safe for outdoor exercise.",
      aqi: "60",
      uv_index: "Low",
      pollen_level: "Low",
    },
    {
      period: "Night",
      advice: "Excellent air quality. Keep windows open if temp permits.",
      aqi: "35",
      uv_index: "None",
      pollen_level: "Low",
    },
  ];
}

function getMockPredictions(): Prediction[] {
  return [
    {
      day: "Today",
      predicted_aqi: 120,
      summary: "Moderate pollution expected due to traffic patterns.",
      trend: "Stable",
    },
    {
      day: "Tomorrow",
      predicted_aqi: 95,
      summary: "Conditions likely to improve with expected wind.",
      trend: "Improving",
    },
    {
      day: "Day After",
      predicted_aqi: 150,
      summary: "Potential smog spike expected due to stagnation.",
      trend: "Worsening",
    },
  ];
}

function getMockHourlyForecast(): HourlyForecast[] {
  const start = new Date().getHours();
  return Array.from({ length: 8 }, (_, i) => ({
    time: `${(start + i) % 24}:00`,
    aqi: Math.floor(Math.random() * 50) + 50,
    temp: 20 + Math.floor(Math.random() * 10),
    wind: 5 + Math.floor(Math.random() * 10),
    humidity: 40 + Math.floor(Math.random() * 20),
  }));
}

function getMockHealthAnalysis(): HealthImpactAnalysis {
  return {
    overallSummary:
      "With your current health profile, you are generally safe on good-AQI days, need extra caution on moderate days, and should strongly limit outdoor exposure when air becomes unhealthy.",
    todayAdvice:
      "Treat today as a mixed-air-quality day. Keep your rescue medications nearby, avoid long walks on busy roads, use an N95 mask if the air looks hazy, and move indoors if you feel any breathing discomfort, chest tightness, or unusual fatigue.",

    good: {
      summary:
        "Air quality is excellent and poses minimal risk, even for sensitive groups such as people with asthma, allergies, or pregnancy.",
      dos: [
        "Enjoy normal outdoor activities, including light exercise",
        "Keep rescue inhalers or regular medicines available as usual",
        "Open windows for ventilation if outdoor smells are neutral",
        "Stay hydrated and maintain your usual routine",
      ],
      donts: [
        "Do not skip your prescribed maintenance medications",
        "Avoid staying close to heavy traffic for long unnecessary periods",
        "Avoid burning trash or wood at home",
      ],
      activityLevel: "Normal outdoor activities are generally safe.",
      maskRecommendation:
        "Mask usually not required; carry one if you are extremely sensitive.",
      exposureLimit: "No special time limit for most people; monitor symptoms.",
      triggersToWatch: [
        "Sudden traffic jams",
        "Local trash burning",
        "Indoor dust if you open windows",
      ],
    },

    moderate: {
      summary:
        "Air quality is acceptable but can irritate the lungs of people with asthma, COPD, pollen allergies, heart disease, or pregnancy.",
      dos: [
        "Prefer indoor activities in well-ventilated or filtered spaces",
        "Use controller and rescue medications exactly as prescribed",
        "Plan outdoor tasks for early morning or late evening when possible",
        "Monitor symptoms such as cough, wheeze, chest tightness, or palpitations",
      ],
      donts: [
        "Avoid intense outdoor workouts along main roads",
        "Avoid staying near idling vehicles or congested junctions",
        "Do not ignore early warning signs like unusual shortness of breath",
      ],
      activityLevel:
        "Light to moderate outdoor activity with breaks; avoid pushing yourself.",
      maskRecommendation:
        "Consider an N95 or KN95 mask outdoors, especially near traffic or dusty areas.",
      exposureLimit:
        "Try to limit continuous outdoor exposure to short trips (30–60 minutes at a time).",
      triggersToWatch: [
        "Rush-hour traffic",
        "Construction dust",
        "Pollen peaks",
        "Open burning in nearby areas",
      ],
    },

    unhealthy: {
      summary:
        "Air quality is unhealthy and can cause significant symptoms for sensitive groups and even healthy individuals, especially with prolonged exposure.",
      dos: [
        "Stay indoors as much as possible in a clean, filtered room",
        "Use air purifiers or DIY filters if available",
        "Keep rescue inhalers and emergency contact numbers close by",
        "Contact your doctor if symptoms escalate or become persistent",
      ],
      donts: [
        "Avoid outdoor exercise or unnecessary trips",
        "Do not let children, elderly, or pregnant individuals stay outside for long",
        "Avoid indoor sources of smoke like incense, cigarettes, or frying with lots of oil",
      ],
      activityLevel:
        "Minimize outdoor activity; focus on essential tasks only and prefer indoor alternatives.",
      maskRecommendation:
        "If you must go outside, use a well-fitting N95/FFP2 mask and keep trips short.",
      exposureLimit:
        "Keep outdoor exposure as brief as possible (ideally under 15–20 minutes at a time).",
      triggersToWatch: [
        "Visible smog or haze",
        "Industrial plumes and brick-kiln areas",
        "Busy highways and diesel vehicles",
        "Indoor smoke and strong cleaning chemicals",
      ],
    },
  } as any; // cast to match HealthImpactAnalysis if your interface is narrower
}

function getMockPollutionSources(): PollutionSourceAnalysis {
  return {
    sources: [
      { name: "Traffic", value: 45 },
      { name: "Industry", value: 25 },
      { name: "Dust", value: 15 },
      { name: "Residential", value: 15 },
    ],
    insight:
      "Vehicular emissions are currently the primary contributor to local pollution levels.",
  };
}

function getMockVisionAnalysis(): VisionAnalysisResult {
  return {
    visualAqi: 165,
    hazeDensity: "Heavy",
    visibilityDistance: "1.2 km",
    smogType: "Industrial",
    pollutantSources: [
      "Vehicle Emissions",
      "Factory Smoke",
      "Construction Dust",
    ],
    healthRisk: "High risk of respiratory irritation. Avoid outdoor exercise.",
    discrepancyAnalysis:
      "Visual indicators suggest pollution levels may be 15-20% higher than local sensors report due to localized stagnation zones.",
  };
}

function getMockPollutionIncident(): PollutionAnalysisResult {
  return {
    isViolation: true,
    violationType: "Illegal Stubble Burning",
    severity: "High",
    confidence: 94,
    description:
      "Image analysis confirms dense black smoke consistent with organic material combustion.",
    legalReference: "Section 144 CrPC & Environmental Protection Act",
  };
}

function getMockSafePlaces(): SafePlace[] {
  return [
    {
      name: "City Central Library",
      type: "Library",
      estimated_aqi: "35 (Indoor)" as any,
      distance: "1.2 km",
      description: "Excellent HVAC system with HEPA filtration.",
      is_indoor: true,
    },
    {
      name: "National Park Green Zone",
      type: "Park",
      estimated_aqi: "85 (Outdoor)" as any,
      distance: "4.5 km",
      description:
        "Large green space with significantly lower pollution density than city center.",
      is_indoor: false,
    },
    {
      name: "Grand Mall Atrium",
      type: "Shopping Mall",
      estimated_aqi: "40 (Indoor)" as any,
      distance: "2.5 km",
      description: "Large indoor space with controlled air quality.",
      is_indoor: true,
    },
    {
      name: "Royal Botanical Gardens",
      type: "Garden",
      estimated_aqi: "80 (Outdoor)" as any,
      distance: "3.2 km",
      description:
        "Abundant vegetation helps mitigate some particulate matter.",
      is_indoor: false,
    },
    {
      name: "Modern Art Gallery",
      type: "Museum",
      estimated_aqi: "30 (Indoor)" as any,
      distance: "3.0 km",
      description: "Climate controlled environment ensuring clean air.",
      is_indoor: true,
    },
  ];
}

// ------------------------------------------------------
// PUBLIC API FUNCTIONS
// ------------------------------------------------------
export interface SafetyAnalysis {
  status: "Safe" | "Caution" | "Unsafe";
  message: string;
  recommendation: string;
}

export async function getSafetyAnalysis(
  aqi: number,
  healthConditions: string[]
): Promise<SafetyAnalysis> {
  try {
    const conditionsStr =
      healthConditions.length > 0
        ? healthConditions.join(", ")
        : "None (General Public)";
    const prompt = `Analyze if it is safe for a user with the following health conditions: [${conditionsStr}] to be in an area with an Air Quality Index (AQI) of ${aqi}. 
Return a status (Safe, Caution, or Unsafe), a personalized message explaining why, and a specific recommendation.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ["Safe", "Caution", "Unsafe"] },
        message: { type: Type.STRING },
        recommendation: { type: Type.STRING },
      },
      required: ["status", "message", "recommendation"],
    };

    return await processApiResponse<SafetyAnalysis>(prompt, schema);
  } catch (e) {
    return getMockSafetyAnalysis(aqi);
  }
}

export async function getPersonalizedRecommendations(
  location: string,
  healthConditions: string[]
): Promise<Recommendation[]> {
  try {
    const res = await fetch("http://localhost:4000/api/insights/personalized", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location,
        healthConditions,
      }),
    });

    if (!res.ok) {
      console.error(
        "Personalized advice backend error:",
        res.status,
        await res.text()
      );
      return getMockRecommendations(location);
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.warn("Unexpected advice payload, using mock data:", data);
      return getMockRecommendations(location);
    }

    return data as Recommendation[];
  } catch (e) {
    console.error("Personalized advice request failed, using mock:", e);
    return getMockRecommendations(location);
  }
}


export async function getAirQualityPredictions(
  location: string
): Promise<Prediction[]> {
  try {
    const prompt = `For the location "${location}", provide a 3-day air quality forecast for "Today", "Tomorrow", and "Day After Tomorrow". For each day, provide a predicted numerical AQI (integer), a brief summary of conditions (string), and a trend ('Improving', 'Worsening', or 'Stable') as a string.`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.STRING },
          predicted_aqi: { type: Type.INTEGER },
          summary: { type: Type.STRING },
          trend: { type: Type.STRING },
        },
        required: ["day", "predicted_aqi", "summary", "trend"],
      },
    };

    return await processApiResponse<Prediction[]>(prompt, schema);
  } catch (e) {
    return getMockPredictions();
  }
}

// ------------------------------------------------------
// REAL HOURLY FORECAST (uses your backend + OpenWeather)
// ------------------------------------------------------
export async function getHourlyForecast(
  location: string
): Promise<HourlyForecast[]> {
  try {
    const geoRes = await fetch("http://localhost:4000/api/geocode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location }),
    });

    const geo = await geoRes.json();

    if (!geo.isValid) {
      console.warn("Geocode failed for", location);
      return getMockHourlyForecast();
    }

    const res = await fetch("http://localhost:4000/api/forecast/hourly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: geo.lat, lon: geo.lon }),
    });

    if (!res.ok) {
      console.error("Hourly forecast API error:", await res.text());
      return getMockHourlyForecast();
    }

    const data = await res.json();
    return data as HourlyForecast[];
  } catch (e) {
    console.error("Hourly forecast error, using mock data:", e);
    return getMockHourlyForecast();
  }
}

// ------------------------------------------------------
// HEALTH IMPACT ANALYSIS (REAL + RICH, WITH FALLBACK)
// ------------------------------------------------------
export async function getHealthImpactAnalysis(
  healthConditions: string[]
): Promise<HealthImpactAnalysis> {
  try {
    const conditionsStr =
      healthConditions.length > 0
        ? healthConditions.join(", ")
        : "None (general healthy adult)";

    const prompt = `
You are a medical air-quality assistant.

User health conditions: ${conditionsStr}

Create a detailed health-impact guide for air pollution with the following structure:

- overallSummary: 1 sentence summarising their general risk profile across AQI ranges.
- todayAdvice: 2–3 sentences of simple, practical advice for what they should focus on TODAY (how to behave, what to watch, precautions).

For each AQI band, return an object with:
- summary: 1–2 sentences about expected health impact for this user group.
- dos: list of 3–5 short bullet phrases starting with a verb (e.g., "Carry your inhaler", "Prefer indoor gyms").
- donts: list of 3–5 short bullet phrases of what to avoid.
- activityLevel: 1 sentence about safe activity level.
- maskRecommendation: 1 sentence. Mention N95/FFP2 when needed.
- exposureLimit: human-readable string describing safe outdoor time (e.g., "Up to 1 hour with breaks").
- triggersToWatch: list of 3–6 short labels (e.g., "Traffic", "Pollen", "Dust storms").

AQI bands:
- good 0–50   → key reserved word: "good"
- moderate 51–150 → key: "moderate"
- unhealthy 151+ → key: "unhealthy"

Return ONLY JSON with this exact shape:
{
  "overallSummary": string,
  "todayAdvice": string,
  "good": { ...fields above... },
  "moderate": { ...fields above... },
  "unhealthy": { ...fields above... }
}
`;

    const levelSchema = {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        dos: { type: Type.ARRAY, items: { type: Type.STRING } },
        donts: { type: Type.ARRAY, items: { type: Type.STRING } },
        activityLevel: { type: Type.STRING },
        maskRecommendation: { type: Type.STRING },
        exposureLimit: { type: Type.STRING },
        triggersToWatch: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "summary",
        "dos",
        "donts",
        "activityLevel",
        "maskRecommendation",
        "exposureLimit",
        "triggersToWatch",
      ],
    };

    const schema = {
      type: Type.OBJECT,
      properties: {
        overallSummary: { type: Type.STRING },
        todayAdvice: { type: Type.STRING },
        good: levelSchema,
        moderate: levelSchema,
        unhealthy: levelSchema,
      },
      required: ["overallSummary", "todayAdvice", "good", "moderate", "unhealthy"],
    };

    return await processApiResponse<HealthImpactAnalysis>(prompt, schema);
  } catch (e) {
    return getMockHealthAnalysis();
  }
}

// ------------------------------------------------------
// Pollution source analysis
// ------------------------------------------------------
export async function getPollutionSourceAnalysis(
  location: string,
  time: string
): Promise<PollutionSourceAnalysis> {
  try {
    const res = await fetch("http://localhost:4000/api/insights/pollution-sources", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, time }),
    });

    if (!res.ok) {
      console.error(
        "Pollution source backend error:",
        res.status,
        await res.text()
      );
      return getMockPollutionSources();
    }

    const data = await res.json();

    if (!data || !Array.isArray(data.sources)) {
      console.warn("Unexpected pollution source payload, using mock:", data);
      return getMockPollutionSources();
    }

    return data as PollutionSourceAnalysis;
  } catch (e) {
    console.error("Pollution source request failed, using mock:", e);
    return getMockPollutionSources();
  }
}


// ------------------------------------------------------
// Pollution sources map (still mocked around real center)
// ------------------------------------------------------
export interface PollutionSourceMapData {
  id: string;
  lat: number;
  lon: number;
  type: "Industrial" | "Vehicular" | "Natural" | "Residential";
  name: string;
  severity: "High" | "Medium" | "Low";
}

export async function getPollutionSourcesMapData(
  location: string
): Promise<{ center: [number, number]; sources: PollutionSourceMapData[] }> {
  const coords = await getCoordinates(location);
  if (!coords || !coords.isValid) {
    throw new Error("Location not found");
  }

  const centerLat = coords.lat;
  const centerLon = coords.lon;

  const sources: PollutionSourceMapData[] = [];
  const types: ("Industrial" | "Vehicular" | "Natural" | "Residential")[] = [
    "Industrial",
    "Vehicular",
    "Natural",
    "Residential",
  ];

  for (let i = 0; i < 15; i++) {
    const latOffset = (Math.random() - 0.5) * 0.08;
    const lonOffset = (Math.random() - 0.5) * 0.08;
    const type = types[Math.floor(Math.random() * types.length)];

    let name = "Unknown Source";
    if (type === "Industrial") name = `Factory Zone ${String.fromCharCode(65 + i)}`;
    if (type === "Vehicular") name = `Major Intersection ${i + 1}`;
    if (type === "Natural") name = `Open Land / Dust`;
    if (type === "Residential") name = `Residential Burning`;

    sources.push({
      id: `source-${i}`,
      lat: centerLat + latOffset,
      lon: centerLon + lonOffset,
      type,
      name,
      severity: Math.random() > 0.6 ? "High" : "Medium",
    });
  }

  return { center: [centerLat, centerLon], sources };
}

// ------------------------------------------------------
// AQI Calculator Insight
// ------------------------------------------------------
export async function getAQICalculatorInsight(
  aqi: number,
  pollutant: string
): Promise<AQICalculatorInsight> {
  try {
    const prompt = `The calculated AQI is ${aqi} with ${pollutant} as the dominant pollutant. Provide a 1-sentence insight about what this specific pollutant usually originates from and its immediate health implication.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        insight: { type: Type.STRING },
      },
      required: ["insight"],
    };

    return await processApiResponse<AQICalculatorInsight>(prompt, schema);
  } catch (e) {
    return { insight: "Calculated based on standard EPA breakpoints." };
  }
}

// ------------------------------------------------------
// Vision-based image analysis
// ------------------------------------------------------
export async function analyzeAirQualityImage(
  imageBase64: string
): Promise<VisionAnalysisResult> {
  try {
    const base64Data = imageBase64.split(",")[1] || imageBase64;

    const prompt =
      "Analyze this image for signs of air pollution, smog, or haze. If the sky is blue/clear and no smog is visible, you MUST return 'None' for smogType, 'Clear' for hazeDensity, and a low visualAqi (0-50). Otherwise, estimate the Visual AQI, haze density, visibility, smog type, likely sources, health risk, and provide a discrepancy analysis.";

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            visualAqi: { type: Type.NUMBER },
            hazeDensity: {
              type: Type.STRING,
              enum: ["Clear", "Light", "Moderate", "Heavy", "Severe"],
            },
            visibilityDistance: { type: Type.STRING },
            smogType: {
              type: Type.STRING,
              enum: ["Photochemical", "Dust/Sand", "Industrial", "Mixed", "None"],
            },
            pollutantSources: { type: Type.ARRAY, items: { type: Type.STRING } },
            healthRisk: { type: Type.STRING },
            discrepancyAnalysis: { type: Type.STRING },
          },
          required: [
            "visualAqi",
            "hazeDensity",
            "visibilityDistance",
            "smogType",
            "pollutantSources",
            "healthRisk",
            "discrepancyAnalysis",
          ],
        },
      },
    });

    return JSON.parse(response.text) as VisionAnalysisResult;
  } catch (e) {
    console.warn("Vision API Error:", e);
    return getMockVisionAnalysis();
  }
}

// ------------------------------------------------------
// Pollution incident verification + complaint letter
// ------------------------------------------------------
export async function verifyPollutionIncident(
  imageBase64: string
): Promise<PollutionAnalysisResult> {
  try {
    const base64Data = imageBase64.split(",")[1] || imageBase64;
    const prompt = `Analyze this image for environmental violations.
CRITICAL: If the image shows a CLEAR SKY, NATURE, CLEAN ENVIRONMENT, or NO VISIBLE POLLUTION/SMOKE/TRASH, you MUST return:
isViolation: false, violationType: "None", severity: "Low", confidence: 100, description: "No pollution detected.", legalReference: "N/A".

Only set isViolation to TRUE if there is clear evidence of illegal burning, industrial smoke, or illegal dumping.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Data } },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isViolation: { type: Type.BOOLEAN },
            violationType: { type: Type.STRING },
            severity: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
            },
            confidence: { type: Type.NUMBER },
            description: { type: Type.STRING },
            legalReference: { type: Type.STRING },
          },
          required: [
            "isViolation",
            "violationType",
            "severity",
            "confidence",
            "description",
            "legalReference",
          ],
        },
      },
    });

    return JSON.parse(response.text) as PollutionAnalysisResult;
  } catch (e) {
    return getMockPollutionIncident();
  }
}

export async function generateComplaintLetter(
  analysis: PollutionAnalysisResult,
  location: string
): Promise<string> {
  try {
    if (!analysis.isViolation)
      return "No complaint generated as no violation was detected.";

    const prompt = `Write a formal legal complaint letter to the Environmental Protection Agency regarding a verified incident of ${analysis.violationType} at ${location}. 
Severity: ${analysis.severity}. 
Details: ${analysis.description}. 
Reference: ${analysis.legalReference}. 
The letter should be professional, assertive, and request immediate action. Return ONLY the letter text.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text;
  } catch (e) {
    return "Subject: Formal Complaint Regarding Environmental Violation\n\nTo the Environmental Protection Agency,\n\nI am writing to report a serious violation...";
  }
}

// ------------------------------------------------------
// Coordinates via Gemini (used by some views)
// ------------------------------------------------------
export async function getCoordinates(
  query: string
): Promise<{ lat: number; lon: number; name: string; isValid: boolean } | null> {
  try {
    const prompt = `Analyze the location query: "${query}".
1. Determine if this is a REAL, existing city, region, or valid geographical location on Earth.
2. CRITICAL: If the query is a person's name (e.g., "Faiza", "John", "Ali"), a random string, gibberish, or NOT a widely recognized place, you MUST set 'isValid' to FALSE. Do not hallucinate coordinates for people.
3. If it is a valid place, set 'isValid' to TRUE, and provide the latitude, longitude, and formal name.`;

    const schema = {
      type: Type.OBJECT,
      properties: {
        lat: { type: Type.NUMBER },
        lon: { type: Type.NUMBER },
        name: { type: Type.STRING },
        isValid: { type: Type.BOOLEAN },
      },
      required: ["lat", "lon", "name", "isValid"],
    };

    return await processApiResponse<{
      lat: number;
      lon: number;
      name: string;
      isValid: boolean;
    }>(prompt, schema);
  } catch (e) {
    return null;
  }
}

// ------------------------------------------------------
// Nearby “Safe Places”
// ------------------------------------------------------
export async function getNearbySafePlaces(
  location: string,
  currentAQI: number
): Promise<SafePlace[]> {
  try {
    const prompt = `Identify 4 specific "Safe Havens" or cleaner air spots near "${location}".
Current AQI is ${currentAQI}.
If AQI is high (>100), prioritize INDOOR places with air filtration (Malls, Libraries, Museums).
If AQI is low (<100), include OUTDOOR nature spots (Parks, Gardens).
ALWAYS provide a MIX of 2 Indoor and 2 Outdoor places regardless of AQI, but mark them accordingly.
For each, provide: name, type (e.g., Mall, Park), estimated_aqi (string like "45 (Indoor)"), distance (approx string), description (why it's safe), and is_indoor (boolean).`;

    const schema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          type: { type: Type.STRING },
          estimated_aqi: { type: Type.STRING },
          distance: { type: Type.STRING },
          description: { type: Type.STRING },
          is_indoor: { type: Type.BOOLEAN },
        },
        required: [
          "name",
          "type",
          "estimated_aqi",
          "distance",
          "description",
          "is_indoor",
        ],
      },
    };

    return await processApiResponse<SafePlace[]>(prompt, schema);
  } catch (e) {
    return getMockSafePlaces();
  }
}
