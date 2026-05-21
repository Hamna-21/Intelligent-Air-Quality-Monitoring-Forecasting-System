import React, { useState } from 'react';
import { analyzeImage } from '../../services/api';
import type { VisionAnalysisResult } from '../../types';


const ScanningEffect = () => (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-[2rem]">
        <div className="w-full h-1 bg-cyan-400/80 shadow-[0_0_30px_rgba(34,211,238,0.8)] absolute top-0 animate-[scan_2s_ease-in-out_infinite]" />
        <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[1px] animate-pulse" />
        <style>{`
            @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
            }
        `}</style>
    </div>
);

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode; color?: string }> = ({ label, value, icon, color = "text-slate-200" }) => (
    <div className="bg-slate-800/50 p-5 rounded-2xl border border-slate-700/50 flex items-center gap-4 transition-all hover:bg-slate-800 hover:shadow-lg hover:shadow-cyan-900/20 hover:-translate-y-1 backdrop-blur-sm">
        <div className="p-3 bg-slate-700/50 rounded-xl shadow-inner text-cyan-400 border border-slate-600">
            {icon}
        </div>
        <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{label}</p>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
        </div>
    </div>
);

const AQIGauge: React.FC<{ value: number }> = ({ value }) => {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(value / 500, 0), 1);
    const dashoffset = circumference - progress * circumference;
    
    let color = '#34d399'; // Emerald-400
    if (value > 50) color = '#facc15'; // Yellow-400
    if (value > 100) color = '#fb923c'; // Orange-400
    if (value > 150) color = '#f87171'; // Red-400
    if (value > 200) color = '#c084fc'; // Purple-400
    if (value > 300) color = '#fb7185'; // Rose-400

    return (
        <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={radius} stroke="#1e293b" strokeWidth="8" fill="transparent" />
                <circle 
                    cx="50" cy="50" r={radius} 
                    stroke={color} 
                    strokeWidth="8" 
                    fill="transparent"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-black text-white tracking-tight">{value}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase mt-1">Visual AQI</span>
            </div>
        </div>
    );
};

export const SmogScannerView: React.FC = () => {
    const [image, setImage] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [result, setResult] = useState<VisionAnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // TEST CASE: Unsupported file type (PDF, GIF, etc)
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                setError("Unsupported file format");
                return;
            }

            // TEST CASE: Large image upload (>10MB)
            if (file.size > 10 * 1024 * 1024) {
                setError("File size too large. Maximum 10MB allowed.");
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setResult(null); // Reset previous result
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAnalyze = async () => {
    if (!image) return;
    setIsScanning(true);
    setError(null);

    try {
        const [analysis] = await Promise.all([
            analyzeImage(image),                               // ⬅️ now calls backend
            new Promise(resolve => setTimeout(resolve, 2500))  // keeps the scan animation
        ]);

        // Backend returns the same shape as VisionAnalysisResult
        setResult(analysis as VisionAnalysisResult);

        // If later we see the backend wraps it like { result: {...} },
        // we’ll change this line to:
        // setResult((analysis as any).result);
    } catch (err) {
        console.error("View analysis error:", err);
        setError("Analysis unavailable. Please try again.");
    } finally {
        setIsScanning(false);
    }
};


    return (
        <div className="h-full flex flex-col animate-fade-in pb-6">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-slate-900 tracking-tight">Bio-Vision Scanner</h1>
                    <p className="text-slate-500 font-medium mt-1">Optical environmental analysis & forensics.</p>
                </div>
                {result && (
                    <button 
                        onClick={() => { setImage(null); setResult(null); }}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 shadow-lg text-sm font-bold text-cyan-400 rounded-xl hover:bg-slate-700 hover:text-cyan-300 transition-all flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 11a8 8 0 0114.53-4.53l-2.53 2.53M20 13a8 8 0 01-14.53 4.53l2.53-2.53" /></svg>
                        New Scan
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full min-h-[500px]">
                
                {/* Left Panel - Image Upload/Display */}
                <div className="lg:col-span-5 flex flex-col h-full">
                    <div className={`relative flex-1 rounded-[2rem] overflow-hidden transition-all duration-300 border-2 ${!image ? 'bg-white border-slate-200 border-dashed hover:border-cyan-400 hover:bg-cyan-50/10 group cursor-pointer' : 'bg-slate-950 border-slate-800 shadow-2xl'}`}>
                        {!image ? (
                            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer p-8">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-cyan-50 transition-all duration-300 text-slate-400 group-hover:text-cyan-500 border border-slate-200 group-hover:border-cyan-200">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                </div>
                                <span className="text-xl font-bold text-slate-700 group-hover:text-cyan-700 transition-colors">Upload Evidence</span>
                                <span className="text-sm text-slate-400 mt-2 font-medium">Supports JPG, PNG (Max 10MB)</span>
                                <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                            </label>
                        ) : (
                            <>
                                <img src={image} alt="Target" className="w-full h-full object-cover opacity-80" />
                                {isScanning && <ScanningEffect />}
                                {!isScanning && !result && (
                                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center transition-all">
                                        <button 
                                            onClick={handleAnalyze}
                                            className="bg-cyan-500 text-white font-bold py-4 px-10 rounded-full hover:bg-cyan-400 hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.5)] flex items-center gap-3 border border-cyan-300/50"
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            INITIATE SCAN
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    {error && (
                        <div className="mt-4 p-4 bg-rose-950/30 text-rose-400 rounded-2xl border border-rose-900/50 text-sm font-medium flex items-center gap-3 animate-fade-in shadow-lg">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            {error}
                        </div>
                    )}
                </div>

                {/* Right Panel - Results (Dark Mode) */}
                <div className="lg:col-span-7 h-full">
                    {result ? (
                        <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 shadow-2xl h-full flex flex-col gap-6 relative overflow-hidden animate-fade-in">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-[80px]" />
                            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px]" />

                            <div className="flex items-center justify-between relative z-10 border-b border-slate-800 pb-6">
                                <div className="flex items-center gap-8">
                                    <AQIGauge value={result.visualAqi} />
                                    <div>
                                        {/* TEST CASE: Image with no smog -> "No smog detected" */}
                                        <h3 className="text-2xl font-bold text-white">
                                            {result.smogType === 'None' ? 'No Smog Detected' : 'Scan Complete'}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                                            <p className="text-slate-400 text-sm font-medium tracking-wide">LIVE ANALYSIS STREAM</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-800 text-xs font-bold text-cyan-400 uppercase tracking-wide border border-slate-700 shadow-inner">
                                        {result.smogType}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 relative z-10">
                                <MetricCard 
                                    label="Optical Density" 
                                    value={result.hazeDensity} 
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" /></svg>}
                                />
                                <MetricCard 
                                    label="Est. Visibility" 
                                    value={result.visibilityDistance} 
                                    icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>}
                                />
                            </div>

                            <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/50 relative z-10">
                                <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                                    <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>
                                    Identified Pollutants
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {result.pollutantSources.map((source, i) => (
                                        <span key={i} className="px-3.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-bold text-slate-300 shadow-sm">
                                            {source}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-cyan-950/20 rounded-2xl p-6 border border-cyan-900/30 relative z-10 flex-grow">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-cyan-900/30 rounded-lg text-cyan-400 mt-0.5 border border-cyan-800/30">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-cyan-200 mb-1">System Insight</h4>
                                        <p className="text-sm text-slate-400 leading-relaxed font-medium">
                                            {result.discrepancyAnalysis}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full bg-slate-900 rounded-[2rem] border border-dashed border-slate-800 flex flex-col items-center justify-center p-12 text-center opacity-80">
                            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-lg border border-slate-700">
                                <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-200">Awaiting Input</h3>
                            <p className="text-slate-500 font-medium max-w-xs mt-1">Upload a photo to begin optical analysis.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
