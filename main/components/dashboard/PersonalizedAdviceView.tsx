import React, { useContext, useEffect } from 'react';
import type { Recommendation } from '../../types';
import { AppContext } from './context/AppContext';

const Spinner: React.FC = () => (
  <div className="flex justify-center items-center h-full py-10">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    <p className="ml-4 text-text-muted">Generating your advice...</p>
  </div>
);

const getStatusColor = (level: string) => {
  const lowerLevel = level.toLowerCase();
  if (lowerLevel.includes('good') || lowerLevel.includes('low')) return 'text-green-600';
  if (lowerLevel.includes('moderate')) return 'text-yellow-600';
  if (lowerLevel.includes('unhealthy') || lowerLevel.includes('high')) return 'text-red-600';
  return 'text-text-muted';
};

const AdviceCard: React.FC<{ rec: Recommendation }> = ({ rec }) => {
  const icons = {
    Morning: '☀️',
    Afternoon: '🌤️',
    Evening: '🌙',
    Night: '🌃'
  };
  const icon = icons[rec.period as keyof typeof icons] || 'ℹ️';

  return (
    <div className="bg-surface border border-subtle p-6 rounded-2xl flex flex-col h-full shadow-sm">
      <div className="flex items-center mb-4">
        <span className="text-3xl mr-4">{icon}</span>
        <h3 className="text-xl font-medium font-heading text-text">{rec.period}</h3>
      </div>
      <p className="text-text-muted flex-grow">{rec.advice}</p>
      <div className="mt-6 pt-4 border-t border-subtle flex justify-around items-start">
        <div className="text-center px-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">AQI</p>
          <p className={`font-bold text-lg ${getStatusColor(rec.aqi)}`}>{rec.aqi}</p>
        </div>
        <div className="text-center px-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">UV Index</p>
          <p className={`font-bold text-lg ${getStatusColor(rec.uv_index)}`}>{rec.uv_index}</p>
        </div>
        <div className="text-center px-2">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">Pollen</p>
          <p className={`font-bold text-lg ${getStatusColor(rec.pollen_level)}`}>{rec.pollen_level}</p>
        </div>
      </div>
    </div>
  );
};

export const PersonalizedAdviceView: React.FC = () => {
  const context = useContext(AppContext);

  if (!context) return null;

  // 🔴 BEFORE:
  // const { loading, error, recommendations, fetchDashboardData, location } = context;

  // ✅ AFTER – use fetchInsights instead of fetchDashboardData
  const { loading, error, recommendations, fetchInsights, location } = context;

  // ✅ OPTIONAL: auto-load insights when this view mounts
  useEffect(() => {
    // you can guard if you only want to load once or when healthConditions/location change,
    // but this already works fine because fetchInsights is memoized with useCallback
    fetchInsights();
  }, [fetchInsights]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-medium font-heading text-text">Personalized Advice</h1>
          <p className="text-text-muted mt-1">
            Daily guidance for <span className="font-semibold text-primary">{location}</span>, tailored to you.
          </p>
        </div>
        <button
          // 🔴 BEFORE: onClick={fetchDashboardData}
          // ✅ AFTER:
          onClick={fetchInsights}
          disabled={loading}
          className="bg-gradient-to-r from-primary to-sky-500 text-white font-bold py-2.5 px-5 rounded-lg hover:shadow-lg hover:shadow-sky-500/20 hover:-translate-y-0.5 disabled:bg-slate-400 disabled:shadow-none disabled:from-slate-400 disabled:to-slate-400 transition-all duration-300 active:scale-[0.98] active:shadow-md flex items-center"
        >
          <svg className={`w-5 h-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 11a8 8 0 0114.53-4.53l-2.53 2.53M20 13a8 8 0 01-14.53 4.53l2.53-2.53" />
          </svg>
          {loading ? 'Generating...' : 'Regenerate'}
        </button>
      </div>

      {loading && <Spinner />}
      {error && (
        <div className="bg-red-200 border border-red-400 text-red-700 px-4 py-3 rounded-lg" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && recommendations && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recommendations.map((rec) => (
            <AdviceCard key={rec.period + rec.aqi} rec={rec} />
          ))}
        </div>
      )}

      {!loading && !error && (!recommendations || recommendations.length === 0) && (
        <div className="text-center py-10 text-text-muted">No advice available. Try searching for a location.</div>
      )}
    </div>
  );
};
