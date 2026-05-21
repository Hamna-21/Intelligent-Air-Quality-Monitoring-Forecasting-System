
// FIX: Define and export all necessary types for the application.

export enum View {
  Dashboard,
  Map,
  HealthSpecs,
  PersonalizedAdvice,
  Forecasts,
  PollutionSources,
  WorldAQI,
  FAQ,
  AQICalculator,
  Settings,
  Inbox,
  SmogScanner, // New Feature
  PollutionReporter,
  SafePlaces, // New Feature
}

export interface Email {
    id: string;
    sender: string;
    subject: string;
    body: string;
    timestamp: Date;
    read: boolean;
    category: 'Primary' | 'Social' | 'Promotions';
}

export interface HealthCondition {
  id: string;
  label: string;
}

export interface Recommendation {
  period: string;
  advice: string;
  aqi: string;
  uv_index: string;
  pollen_level: string;
}

export interface Prediction {
  day: string;
  predicted_aqi: number;
  summary: string;
  trend: 'Improving' | 'Worsening' | 'Stable';
}

export interface HourlyForecast {
    time: string;
    aqi: number;
    temp: number;
    wind: number;
    humidity: number;
}

export interface CityData {
    city: string;
    country: string;
    aqi: number;
    lat: number;
    lon: number;
}

export interface PollutantInfo {
    name: string;
    description: string;
    sources: string;
    effects: string;
} // Add this new helper interface above HealthImpactAnalysis
export interface AQILevelImpact {
  summary: string;
  dos: string[];
  donts: string[];
  activityLevel: string;        // e.g. "Normal outdoor activity"
  maskRecommendation: string;   // e.g. "Mask not needed" / "Use N95 outdoors"
  exposureLimit: string;        // e.g. "Up to 2 hours outdoors with breaks"
  triggersToWatch: string[];    // e.g. ["Pollen", "Heavy traffic", "Dust storms"]
}

// Add this helper interface above HealthImpactAnalysis
export interface HealthImpactLevel {
  summary: string;
  dos?: string[];
  donts?: string[];
  activityLevel?: string;
  maskRecommendation?: string;
  exposureLimit?: string;
  triggersToWatch?: string[];
}

// Replace your old HealthImpactAnalysis with this:
export interface HealthImpactAnalysis {
  overallSummary?: string;
  todayAdvice?: string;
  good: HealthImpactLevel;
  moderate: HealthImpactLevel;
  unhealthy: HealthImpactLevel;
}


export interface PollutionSource {
    name: string;
    value: number;
    [key: string]: any;
}
export interface PollutionSourceAnalysis {
    sources: PollutionSource[];
    insight: string;
}

export interface AQICalculatorInsight {
    insight: string;
}

export interface MapInsight {
    insight: string;
}

// New Interface for Bio-Vision
export interface VisionAnalysisResult {
    visualAqi: number;
    hazeDensity: 'Clear' | 'Light' | 'Moderate' | 'Heavy' | 'Severe';
    visibilityDistance: string;
    smogType: 'Photochemical' | 'Dust/Sand' | 'Industrial' | 'Mixed' | 'None';
    pollutantSources: string[];
    healthRisk: string;
    discrepancyAnalysis: string;
}

// New Interface for Eco-Enforce (Pollution Reporter)
export interface PollutionAnalysisResult {
    isViolation: boolean;
    violationType: string;
    severity: 'Low' | 'Medium' | 'High' | 'Critical';
    confidence: number;
    description: string;
    legalReference: string; // e.g., "Section 15 of Environmental Protection Act"
}

// New Interface for Safe Places
export interface SafePlace {
    name: string;
    type: string;
    distance: string;
    description: string;
    is_indoor: boolean;
    estimated_aqi: number;
}


// Types for OpenAQ API
export interface OpenAQResponse {
    meta: {
        name: string;
        licence: string;
        website: string;
        page: number;
        limit: number;
        found: number;
    };
    results: OpenAQResult[];
}

export interface OpenAQResult {
    locationId: number;
    location: string;
    parameter: string;
    value: number;
    date: {
        utc: string;
        local: string;
    };
    unit: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
    country: string;
    city: string | null;
    isMobile: boolean;
    isAnalysis: boolean | null;
    entity: string;
    sensorType: string;
}


// MappedStation for OpenAQ data
export interface MappedStation {
    aqi: number;
    uid: number; // This will be locationId
    city: {
        name: string; // This will be location
        geo: [number, number];
    };
}


// Mock data for world AQI view
export const aqiData: CityData[] = [
  { city: 'Delhi', country: 'India', aqi: 354, lat: 28.6139, lon: 77.2090 },
  { city: 'Lahore', country: 'Pakistan', aqi: 289, lat: 31.5204, lon: 74.3587 },
  { city: 'Beijing', country: 'China', aqi: 178, lat: 39.9042, lon: 116.4074 },
  { city: 'New York', country: 'USA', aqi: 45, lat: 40.7128, lon: -74.0060 },
  { city: 'London', country: 'UK', aqi: 65, lat: 51.5074, lon: -0.1278 },
  { city: 'Sydney', country: 'Australia', aqi: 33, lat: -33.8688, lon: 151.2093 },
  { city: 'Tokyo', country: 'Japan', aqi: 55, lat: 35.6895, lon: 139.6917 },
  { city: 'Moscow', country: 'Russia', aqi: 72, lat: 55.7558, lon: 37.6173 },
  { city: 'Cairo', country: 'Egypt', aqi: 160, lat: 30.0444, lon: 31.2357 },
  { city: 'São Paulo', country: 'Brazil', aqi: 88, lat: -23.5505, lon: -46.6333 },
  { city: 'Mexico City', country: 'Mexico', aqi: 110, lat: 19.4326, lon: -99.1332 },
  { city: 'Wellington', country: 'New Zealand', aqi: 15, lat: -41.2865, lon: 174.7762 },
  { city: 'Lagos', country: 'Nigeria', aqi: 145, lat: 6.5244, lon: 3.3792 },
  { city: 'Johannesburg', country: 'South Africa', aqi: 95, lat: -26.2041, lon: 28.0473 },
  { city: 'Buenos Aires', country: 'Argentina', aqi: 58, lat: -34.6037, lon: -58.3816 },
  { city: 'Vancouver', country: 'Canada', aqi: 25, lat: 49.2827, lon: -123.1207 },
  { city: 'Paris', country: 'France', aqi: 75, lat: 48.8566, lon: 2.3522 },
  { city: 'Berlin', country: 'Germany', aqi: 60, lat: 52.5200, lon: 13.4050 },
  { city: 'Rome', country: 'Italy', aqi: 82, lat: 41.9028, lon: 12.4964 },
  { city: 'Mumbai', country: 'India', aqi: 210, lat: 19.0760, lon: 72.8777 },
  { city: 'Singapore', country: 'Singapore', aqi: 48, lat: 1.3521, lon: 103.8198 },
  { city: 'Seoul', country: 'South Korea', aqi: 130, lat: 37.5665, lon: 126.9780 },
  { city: 'Jakarta', country: 'Indonesia', aqi: 188, lat: -6.2088, lon: 106.8456 },
  { city: 'Los Angeles', country: 'USA', aqi: 92, lat: 34.0522, lon: -118.2437 },
  { city: 'Chicago', country: 'USA', aqi: 55, lat: 41.8781, lon: -87.6298 },
  { city: 'Nairobi', country: 'Kenya', aqi: 78, lat: -1.2921, lon: 36.8219 },
  { city: 'Lima', country: 'Peru', aqi: 125, lat: -12.0464, lon: -77.0428 },
];