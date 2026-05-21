
import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Sector, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { getPollutionSourceAnalysis } from '../../services/geminiService';
import type { PollutionSourceAnalysis } from '../../types';

const COLORS = ['#0ea5e9', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899'];

const Spinner: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-text-muted font-medium">Analyzing pollution composition...</p>
    </div>
);

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="font-bold text-sm">{`${value}%`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" className="text-xs">
        {`(Rate: ${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

export const PollutionSourcesView: React.FC = () => {
    const [location, setLocation] = useState('Rawalpindi, Pakistan');
    const [data, setData] = useState<PollutionSourceAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [hiddenSources, setHiddenSources] = useState<string[]>([]);

    const fetchData = useCallback(async () => {
        if (!location.trim()) return;
        setLoading(true);
        setError(null);
        try {
            const time = new Date().toLocaleTimeString();
            const result = await getPollutionSourceAnalysis(location, time);
            
            // Check if result is valid
            if (!result || !result.sources || result.sources.length === 0) {
                 setError("No data available for this location.");
            } else {
                 setData(result);
            }
        } catch (err) {
            setError("Failed to analyze location. Please try a valid city.");
        } finally {
            setLoading(false);
        }
    }, [location]);

    useEffect(() => {
        fetchData();
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchData();
    };

    const onPieEnter = (_: any, index: number) => {
        setActiveIndex(index);
    };

    const toggleSource = (name: string) => {
        setHiddenSources(prev => 
            prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
        );
    };

    const filteredData = data?.sources.filter(s => !hiddenSources.includes(s.name)) || [];

    return (
        <div className="h-full flex flex-col animate-fade-in">
            <div className="mb-6">
                <h1 className="text-3xl font-bold font-heading text-slate-900 tracking-tight">Pollution Source Analysis</h1>
                <p className="text-slate-500 mt-1">Breakdown of primary pollution contributors in your area.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col">
                {/* Search & Filter Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-start md:items-center">
                    <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="Enter city (e.g. Lahore)"
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium focus:ring-2 focus:ring-primary focus:bg-white transition-all outline-none"
                        />
                         <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3 group-focus-within:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                         <button type="submit" className="absolute right-2 top-1.5 px-3 py-1 bg-white text-xs font-bold text-primary border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50">Analyze</button>
                    </form>

                    {data && (
                        <div className="flex flex-wrap gap-2">
                            {data.sources.map((source, index) => (
                                <button
                                    key={source.name}
                                    onClick={() => toggleSource(source.name)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                        hiddenSources.includes(source.name)
                                        ? 'bg-slate-100 text-slate-400 border-slate-200 line-through decoration-slate-400'
                                        : 'bg-white text-slate-700 border-slate-200 shadow-sm hover:border-primary hover:text-primary'
                                    }`}
                                >
                                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${hiddenSources.includes(source.name) ? 'bg-slate-300' : ''}`} style={{ backgroundColor: hiddenSources.includes(source.name) ? undefined : COLORS[index % COLORS.length] }}></span>
                                    {source.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <div className="flex-1 min-h-[400px] relative">
                    {loading && <div className="absolute inset-0 bg-white/80 z-10 backdrop-blur-sm"><Spinner /></div>}
                    
                    {error ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-red-50 rounded-2xl border border-red-100">
                             <div className="bg-red-100 p-4 rounded-full mb-4 text-red-500">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                             </div>
                             <h3 className="text-xl font-bold text-red-700 mb-2">Analysis Failed</h3>
                             <p className="text-red-600/80 max-w-md">{error}</p>
                             <button onClick={fetchData} className="mt-6 px-6 py-2 bg-white text-red-600 font-bold rounded-lg border border-red-200 shadow-sm hover:bg-red-50">Try Again</button>
                        </div>
                    ) : (
                        <div className="flex flex-col lg:flex-row items-center h-full">
                            <div className="w-full lg:w-2/3 h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={filteredData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={120}
                                            paddingAngle={4}
                                            dataKey="value"
                                            onMouseEnter={onPieEnter}
                                        >
                                            {filteredData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                                            ))}
                                        </Pie>
                                        <Legend verticalAlign="bottom" height={36} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>

                            {data && (
                                <div className="w-full lg:w-1/3 p-6 bg-slate-50/80 rounded-2xl border border-slate-100">
                                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        AI Insight
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-6">
                                        {data.insight}
                                    </p>
                                    
                                    <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-3">Key Contributors</h4>
                                    <div className="space-y-3">
                                        {data.sources.slice(0, 3).map((source, i) => (
                                            <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 shadow-sm">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs" style={{ backgroundColor: COLORS[i % COLORS.length] }}>
                                                        {source.value}%
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm">{source.name}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
