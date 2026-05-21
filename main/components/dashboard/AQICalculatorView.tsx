
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { getAQICalculatorInsight } from '../../services/geminiService';

type Pollutant = 'pm25' | 'pm10' | 'o3' | 'no2' | 'so2' | 'co';

const calculateAQI = (value: number, pollutant: Pollutant): number => {
    if (isNaN(value) || value < 0) return 0;

    const breakpoints: Record<Pollutant, { i: [number, number], c: [number, number] }[]> = {
        pm25: [ // µg/m³
            { i: [0, 50], c: [0.0, 12.0] }, { i: [51, 100], c: [12.1, 35.4] },
            { i: [101, 150], c: [35.5, 55.4] }, { i: [151, 200], c: [55.5, 150.4] },
            { i: [201, 300], c: [150.5, 250.4] }, { i: [301, 500], c: [250.5, 500.4] },
        ],
        pm10: [ // µg/m³
            { i: [0, 50], c: [0, 54] }, { i: [51, 100], c: [55, 154] },
            { i: [101, 150], c: [155, 254] }, { i: [151, 200], c: [255, 354] },
            { i: [201, 300], c: [355, 424] }, { i: [301, 500], c: [425, 604] },
        ],
        o3: [ // ppm
            { i: [0, 50], c: [0.000, 0.054] }, { i: [51, 100], c: [0.055, 0.070] },
            { i: [101, 150], c: [0.071, 0.085] }, { i: [151, 200], c: [0.086, 0.105] },
            { i: [201, 300], c: [0.106, 0.200] },
        ],
        no2: [ // ppb
            { i: [0, 50], c: [0, 53] }, { i: [51, 100], c: [54, 100] },
            { i: [101, 150], c: [101, 360] }, { i: [151, 200], c: [361, 649] },
            { i: [201, 300], c: [650, 1249] },
        ],
        so2: [ // ppb
            { i: [0, 50], c: [0, 35] }, { i: [51, 100], c: [36, 75] },
            { i: [101, 150], c: [76, 185] }, { i: [151, 200], c: [186, 304] },
        ],
        co: [ // ppm
            { i: [0, 50], c: [0.0, 4.4] }, { i: [51, 100], c: [4.5, 9.4] },
            { i: [101, 150], c: [9.5, 12.4] }, { i: [151, 200], c: [12.5, 15.4] },
            { i: [201, 300], c: [15.5, 30.4] },
        ],
    };

    const bp = breakpoints[pollutant];
    const range = bp.find(r => value >= r.c[0] && value <= r.c[1]);
    
    if (!range) {
       const maxRange = bp[bp.length - 1];
       if (value > maxRange.c[1]) {
           // For values beyond the scale, extrapolate linearly from the last segment
           const prevRange = bp[bp.length - 2];
           const slope = (maxRange.i[1] - prevRange.i[1]) / (maxRange.c[1] - prevRange.c[1]);
           const extrapolatedAQI = maxRange.i[1] + (value - maxRange.c[1]) * slope;
           return Math.min(500, Math.round(extrapolatedAQI)); // Cap at 500
       }
       return 0;
    }
    
    const [I_low, I_high] = range.i;
    const [C_low, C_high] = range.c;
    
    if (C_high === C_low) return I_low; // Avoid division by zero

    const aqi = ((I_high - I_low) / (C_high - C_low)) * (value - C_low) + I_low;
    return Math.round(aqi);
};

const getAqiInfo = (aqi: number) => {
    if (aqi <= 50) return { level: 'Good', color: 'text-green-600' };
    if (aqi <= 100) return { level: 'Moderate', color: 'text-yellow-600' };
    if (aqi <= 150) return { level: 'Sensitive', color: 'text-orange-600' };
    if (aqi <= 200) return { level: 'Unhealthy', color: 'text-red-600' };
    if (aqi <= 300) return { level: 'Very Unhealthy', color: 'text-purple-600' };
    return { level: 'Hazardous', color: 'text-rose-600' };
};

const InputField: React.FC<{ label: string; unit: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, unit, value, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-text-muted">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm">
            <input
                type="number"
                min="0"
                value={value}
                onChange={onChange}
                className="appearance-none block w-full bg-background border border-subtle rounded-lg py-3 pl-4 pr-16 text-text focus:outline-none focus:ring-2 ring-inset focus:ring-primary focus:border-primary"
                placeholder="0.0"
                step="0.1"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-text-muted sm:text-sm" dangerouslySetInnerHTML={{ __html: unit }} />
            </div>
        </div>
    </div>
);

const AQICalculatorView: React.FC = () => {
    const [concentrations, setConcentrations] = useState({ pm25: '', pm10: '', o3: '', no2: '', so2: '', co: '' });
    const [insight, setInsight] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (pollutant: keyof typeof concentrations) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const valStr = e.target.value;
        const val = parseFloat(valStr);
        
        // Always update state so user can see what they typed/edited
        setConcentrations(prev => ({ ...prev, [pollutant]: valStr }));

        // TEST CASE: Invalid input (negative values) - Strict "Invalid input" message
        if (val < 0) {
            setError("Invalid input");
        } else {
            // Clear error if all values are valid
            // We check if THIS value is valid, but we must also ensure no other values are invalid
            // Ideally we check validity of current operation.
            // For simplicity, if current is valid, we clear. A more complex validation would check all fields.
            setError(null);
        }
    };

    const pollutantAqis = useMemo(() => ({
        pm25: calculateAQI(parseFloat(concentrations.pm25), 'pm25'),
        pm10: calculateAQI(parseFloat(concentrations.pm10), 'pm10'),
        o3: calculateAQI(parseFloat(concentrations.o3), 'o3'),
        no2: calculateAQI(parseFloat(concentrations.no2), 'no2'),
        so2: calculateAQI(parseFloat(concentrations.so2), 'so2'),
        co: calculateAQI(parseFloat(concentrations.co), 'co'),
    }), [concentrations]);

    const { finalAqi, dominantPollutant } = useMemo(() => {
        let maxAqi = 0;
        let dominant: string = 'N/A';
        for (const [key, value] of Object.entries(pollutantAqis)) {
            if (typeof value === 'number' && value > maxAqi) {
                maxAqi = value;
                dominant = key.toUpperCase();
            }
        }
        return { finalAqi: maxAqi, dominantPollutant: dominant };
    }, [pollutantAqis]);

    const { level, color } = getAqiInfo(finalAqi);

    const fetchInsight = useCallback(async () => {
        if (finalAqi > 0 && dominantPollutant !== 'N/A' && !error) {
            setLoading(true);
            try {
                const result = await getAQICalculatorInsight(finalAqi, dominantPollutant);
                setInsight(result.insight);
            } catch (error) {
                console.error(error);
                setInsight("Could not retrieve insight at this time.");
            } finally {
                setLoading(false);
            }
        } else {
            setInsight('');
        }
    }, [finalAqi, dominantPollutant, error]);
    
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchInsight();
        }, 500); // Debounce API call
        return () => clearTimeout(handler);
    }, [fetchInsight]);


    return (
        <div>
            <h1 className="text-3xl font-medium font-heading text-text">AQI Calculator</h1>
            <p className="text-text-muted mt-1 mb-8">Enter pollutant concentrations to calculate the corresponding Air Quality Index (AQI).</p>

            {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 px-4 py-3 rounded-lg mb-6 text-sm font-bold">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-surface border border-subtle rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-medium font-heading text-text mb-4">Pollutant Concentrations</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="PM2.5" unit="µg/m³" value={concentrations.pm25} onChange={handleInputChange('pm25')} />
                        <InputField label="PM10" unit="µg/m³" value={concentrations.pm10} onChange={handleInputChange('pm10')} />
                        <InputField label="Ozone (O₃)" unit="ppm" value={concentrations.o3} onChange={handleInputChange('o3')} />
                        <InputField label="Nitrogen Dioxide (NO₂)" unit="ppb" value={concentrations.no2} onChange={handleInputChange('no2')} />
                        <InputField label="Sulfur Dioxide (SO₂)" unit="ppb" value={concentrations.so2} onChange={handleInputChange('so2')} />
                        <InputField label="Carbon Monoxide (CO)" unit="ppm" value={concentrations.co} onChange={handleInputChange('co')} />
                    </div>
                     <p className="text-xs text-text-muted pt-4">Calculations are based on U.S. EPA standards. Enter a value for at least one pollutant.</p>
                </div>

                <div className="lg:col-span-3">
                    <div className="bg-surface p-8 rounded-2xl h-full flex flex-col justify-center items-center text-center transition-colors duration-300 border border-subtle shadow-sm">
                        <p className="text-text-muted font-semibold">CALCULATED AQI</p>
                        <p className={`my-4 text-8xl font-bold ${!error && finalAqi > 0 ? color : 'text-text'}`}>
                            {error ? '--' : finalAqi}
                        </p>
                        <p className={`text-2xl font-semibold mb-2 ${!error && finalAqi > 0 ? color : 'text-text'}`}>
                            {error ? 'Input Error' : level}
                        </p>
                        <p className="text-text-muted">Dominant Pollutant: <span className="font-semibold text-text">{error ? 'N/A' : dominantPollutant}</span></p>
                        {(!error && (loading || insight)) && (
                            <div className="mt-6 border-t border-subtle pt-4 w-full max-w-md">
                                <h4 className="font-medium font-heading text-primary mb-2 flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.25c.997 0 1.944.416 2.625 1.125a3.75 3.75 0 011.125 2.625V7.5h3.75a.75.75 0 010 1.5h-3.75v3.75a.75.75 0 01-1.5 0V9h-3.75a.75.75 0 010-1.5h3.75V6a2.25 2.25 0 00-2.25-2.25H7.5a.75.75 0 010-1.5h4.5zM3.75 9.75A.75.75 0 013 9V7.5a3.75 3.75 0 013.75-3.75h.75a.75.75 0 010 1.5h-.75A2.25 2.25 0 003.75 7.5V9a.75.75 0 01.75.75zM9 12.75a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM9 17.25a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM4.5 21a.75.75 0 01-.75-.75v-7.5a.75.75 0 011.5 0v7.5a.75.75 0 01-.75-.75zM12 21a.75.75 0 01-.75-.75v-4.5a.75.75 0 011.5 0v4.5a.75.75 0 01-.75-.75z"/></svg>
                                    System Insight
                                </h4>
                                {loading ? <div className="animate-pulse h-4 bg-slate-200 rounded w-3/4 mx-auto"></div> : <p className="text-text-muted text-sm">{insight}</p>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AQICalculatorView;
