import React, { useContext, useState, useEffect, useCallback } from 'react';
import type { HealthCondition, HealthImpactAnalysis } from '../../types';
import { AppContext } from './context/AppContext';
import { getHealthImpactAnalysis } from '../../services/geminiService';

// Predefined selectable conditions
const availableConditions: HealthCondition[] = [
  { id: 'asthma', label: 'Asthma' },
  { id: 'allergies', label: 'Pollen Allergies' },
  { id: 'copd', label: 'COPD' },
  { id: 'heart_condition', label: 'Heart Condition' },
  { id: 'pregnancy', label: 'Pregnancy' },
  { id: 'children', label: 'With Young Children' },
];

// Keywords to validate custom conditions (AQI-related)
const VALID_AQI_KEYWORDS = [
  "asthma",
  "allergy",
  "allergies",
  "bronchitis",
  "respiratory",
  "copd",
  "lung",
  "pneumonia",
  "heart",
  "cardiac",
  "pregnancy",
  "children",
  "kids",
  "immunity",
  "immune",
  "sinus",
  "pollution",
  "breathing"
];

const Spinner = () => (
  <div className="flex items-center justify-center py-2">
    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
    <p className="ml-3 text-text-muted">System is analyzing your profile...</p>
  </div>
);

const HealthImpactGuide: React.FC<{
  analysis: HealthImpactAnalysis | null;
  loading: boolean;
  error: string | null;
}> = ({ analysis, loading, error }) => {
  if (loading) return <Spinner />;
  if (error) return <p className="text-red-500">{error}</p>;
  if (!analysis) return null;

  const levels = [
    { level: "GOOD", range: "AQI 0–50", data: analysis.good, color: "green" },
    { level: "MODERATE", range: "AQI 51–150", data: analysis.moderate, color: "yellow" },
    { level: "UNHEALTHY", range: "AQI 151+", data: analysis.unhealthy, color: "red" }
  ];

  const colorClasses = {
    green: { text: "text-green-600", border: "border-green-400" },
    yellow: { text: "text-yellow-600", border: "border-yellow-400" },
    red: { text: "text-red-600", border: "border-red-400" }
  };

  return (
    <div className="space-y-5">
      {/* Today's advice */}
      <div className="bg-primary/5 border border-primary/40 rounded-xl p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary/80 mb-1">
          Today&apos;s personalised advice
        </p>
        <p className="text-text font-medium mb-2">{analysis.todayAdvice}</p>
        <p className="text-sm text-text-muted">{analysis.overallSummary}</p>
      </div>

      {/* Per AQI Section */}
      {levels.map(item => (
        <div
          key={item.level}
          className={`bg-background/50 p-5 rounded-xl border-l-4 ${colorClasses[item.color].border}`}
        >
          <p className={`font-medium font-heading ${colorClasses[item.color].text} mb-1`}>
            {item.level} ({item.range})
          </p>

          <p className="text-text/90 mb-3">{item.data.summary}</p>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Do</p>
              <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                {item.data.dos?.map((d, idx) => <li key={idx}>{d}</li>)}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-red-700">Don&apos;t</p>
              <ul className="mt-1 text-sm list-disc list-inside space-y-1">
                {item.data.donts?.map((d, idx) => <li key={idx}>{d}</li>)}
              </ul>
            </div>
          </div>

          <div className="mt-3 space-y-1 text-sm text-text-muted">
            <p><span className="font-semibold">Activity level:</span> {item.data.activityLevel}</p>
            <p><span className="font-semibold">Mask:</span> {item.data.maskRecommendation}</p>
            <p><span className="font-semibold">Safe outdoor exposure:</span> {item.data.exposureLimit}</p>
            {item.data.triggersToWatch?.length > 0 &&
              <p><span className="font-semibold">Triggers to watch:</span> {item.data.triggersToWatch.join(", ")}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export const HealthSpecsView: React.FC = () => {
  const context = useContext(AppContext);
  const [customCondition, setCustomCondition] = useState('');

  const [analysis, setAnalysis] = useState<HealthImpactAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!context) return <div>Loading...</div>;

  const { healthConditions, setHealthConditions } = context;

  const fetchAnalysis = useCallback(async () => {
    if (healthConditions.length === 0) {
      setAnalysis(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const labels = healthConditions.map(c => c.label);
      const result = await getHealthImpactAnalysis(labels);
      setAnalysis(result);
    } catch (err) {
      setError("Failed to load health analysis.");
    } finally {
      setLoading(false);
    }
  }, [healthConditions]);

  useEffect(() => {
    const handler = setTimeout(fetchAnalysis, 500);
    return () => clearTimeout(handler);
  }, [fetchAnalysis]);

  // ADD CUSTOM CONDITION WITH VALIDATION
  const handleAddCustomCondition = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && customCondition.trim() !== "") {
      e.preventDefault();

      const label = customCondition.trim();
      const lower = label.toLowerCase();

      // Validate relevance
      const isRelevant = VALID_AQI_KEYWORDS.some(keyword =>
        lower.includes(keyword)
      );

      if (!isRelevant) {
        alert("This condition is not related to air quality. Please enter a respiratory or pollution-related condition.");
        return;
      }

      const newCondition: HealthCondition = {
        id: lower.replace(/\s+/g, "_"),
        label
      };

      if (!healthConditions.some(c => c.id === newCondition.id)) {
        setHealthConditions(prev => [...prev, newCondition]);
      }

      setCustomCondition("");
    }
  };

  const handleConditionChange = (condition: HealthCondition) => {
    setHealthConditions(prev =>
      prev.some(c => c.id === condition.id)
        ? prev.filter(c => c.id !== condition.id)
        : [...prev, condition]
    );
  };

  const handleRemoveCondition = (id: string) => {
    setHealthConditions(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div>
      <h1 className="text-3xl font-medium font-heading text-text">Health Profile</h1>
      <p className="text-text-muted mt-1 mb-8">
        Personalize your recommendations by selecting existing conditions or adding your own.
      </p>

      {/* Condition Selection */}
      <div className="bg-surface border border-subtle p-8 rounded-2xl mb-8 shadow-sm">
        <h3 className="text-lg font-medium font-heading text-text mb-4">Add or Select Your Conditions</h3>

        {/* Custom input */}
        <div className="mb-6">
          <label className="block text-text-muted text-sm font-medium mb-1">
            Add a custom condition
          </label>
          <div className="relative">
            <input
              type="text"
              value={customCondition}
              onChange={(e) => setCustomCondition(e.target.value)}
              onKeyDown={handleAddCustomCondition}
              placeholder="Type a condition and press Enter..."
              className="bg-background border border-subtle rounded-lg w-full py-3 pl-4 pr-12"
            />
          </div>
        </div>

        {/* Checkbox group */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {availableConditions.map((condition) => {
            const checked = healthConditions.some(c => c.id === condition.id);
            return (
              <label
                key={condition.id}
                className={`flex items-center p-4 border rounded-xl cursor-pointer ${
                  checked ? "bg-primary/10 border-primary" : "bg-surface border-subtle"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => handleConditionChange(condition)}
                  className="h-5 w-5 rounded-md border-slate-400 checked:bg-primary checked:border-primary"
                />
                <span className={`ml-3 ${checked ? "text-primary" : "text-text"}`}>
                  {condition.label}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Results */}
      {healthConditions.length > 0 && (
        <div className="bg-surface border border-subtle p-8 rounded-2xl shadow-sm">
          <div className="mb-8">
            <h3 className="font-medium text-lg">Your Active Sensitivities:</h3>
            <div className="flex flex-wrap gap-3 mt-3">
              {healthConditions.map((c) => (
                <span
                  key={c.id}
                  className="flex items-center px-4 py-1.5 bg-primary/20 rounded-full text-sm font-semibold border border-primary/30"
                >
                  {c.label}
                  <button
                    onClick={() => handleRemoveCondition(c.id)}
                    className="ml-2 text-primary/70 hover:text-primary text-xl leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          <HealthImpactGuide analysis={analysis} loading={loading} error={error} />
        </div>
      )}
    </div>
  );
};
