
import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from './context/AppContext';
import { getSafePlaces } from '../../services/api';

import type { SafePlace } from '../../types';

const Spinner = () => (
    <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-text-muted">Scanning for safe havens near you...</p>
    </div>
);

const SafePlaceCard: React.FC<{ place: SafePlace }> = ({ place }) => (
    <div className="bg-surface border border-subtle rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${place.is_indoor ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                {place.is_indoor ? (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                ) : (
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0020 5.5V3.935m-16.945 7.065A10.003 10.003 0 012 12c0-5.523 4.477-10 10-10s10 4.477 10 10a10.003 10.003 0 01-1.055 4.5" /></svg>
                )}
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-500">{place.distance}</span>
        </div>
        
        <h3 className="text-lg font-bold text-text mb-1 group-hover:text-primary transition-colors">{place.name}</h3>
        <p className="text-xs font-semibold text-text-muted mb-3 uppercase tracking-wider">{place.type}</p>
        
        <p className="text-sm text-text-muted leading-relaxed mb-4">{place.description}</p>
        
        <div className="flex items-center gap-2 pt-4 border-t border-subtle">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span className="text-sm font-bold text-slate-700">Est. AQI: <span className="text-emerald-600">{place.estimated_aqi}</span></span>
        </div>
    </div>
);

export const SafePlacesView: React.FC = () => {
    const context = useContext(AppContext);
    const [places, setPlaces] = useState<SafePlace[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (context?.location) {
            fetchPlaces();
        }
    }, [context?.location, context?.currentAQI]);

    const fetchPlaces = async () => {
        if (!context) return;
        setLoading(true);
        setError(null);
        try {
           const result = await getSafePlaces(context.location, context.currentAQI);

            setPlaces(result);
        } catch (err) {
            setError("Unable to find safe places at the moment.");
        } finally {
            setLoading(false);
        }
    };

    if (!context) return null;

    const isBadAir = context.currentAQI > 100;

    return (
        <div className="animate-fade-in">
             <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-heading text-text tracking-tight">Safe Havens</h1>
                    <p className="text-slate-500 mt-1">
                        Recommended places near <span className="font-semibold text-primary">{context.location}</span> based on current air quality.
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-xl flex items-center gap-3 ${isBadAir ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                    <div className={`p-1.5 rounded-full ${isBadAir ? 'bg-orange-200' : 'bg-emerald-200'}`}>
                        {isBadAir ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        )}
                    </div>
                    <span className="font-bold text-sm">
                        {isBadAir ? "Air Quality is Poor: Showing Indoor & Green Zones" : "Air Quality is Good: Enjoy Outdoor Activities"}
                    </span>
                </div>
            </div>

            {loading ? (
                <Spinner />
            ) : error ? (
                <div className="p-8 text-center bg-rose-50 rounded-2xl border border-rose-100 text-rose-600">
                    <p>{error}</p>
                    <button onClick={fetchPlaces} className="mt-4 px-4 py-2 bg-white rounded-lg shadow-sm text-sm font-bold border border-rose-200 hover:bg-rose-50">Retry</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {places.map((place, idx) => (
                        <SafePlaceCard key={idx} place={place} />
                    ))}
                    {places.length === 0 && (
                        <div className="col-span-full text-center py-12 text-slate-400">
                            No recommendations found for this area.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
