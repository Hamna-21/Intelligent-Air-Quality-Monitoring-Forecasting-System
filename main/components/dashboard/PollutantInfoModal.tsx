import React from 'react';
import type { PollutantInfo } from '../../types';

interface PollutantInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const pollutantData: Record<string, PollutantInfo> = {
  'PM2.5': {
    name: 'PM2.5 (Fine Particulate Matter)',
    description: 'Microscopic solid or liquid particles suspended in the air, smaller than 2.5 micrometers. They are a primary component of haze and smoke.',
    sources: 'Combustion from vehicles, power plants, wood burning, industrial processes, and construction sites.',
    effects: 'Due to their small size, they can penetrate deep into the lungs and enter the bloodstream, leading to respiratory issues, decreased lung function, asthma attacks, and cardiovascular problems.'
  },
  'Ozone': {
    name: 'Ozone (O₃)',
    description: 'A highly reactive gas composed of three oxygen atoms. Ground-level ozone is the main component of smog.',
    sources: 'Created by chemical reactions between nitrogen oxides (NOx) and volatile organic compounds (VOCs) in the presence of sunlight. Major sources include industrial emissions and vehicle exhaust.',
    effects: 'Can cause chest pain, coughing, throat irritation, and airway inflammation. It can worsen bronchitis, emphysema, and asthma, and can permanently scar lung tissue with repeated exposure.'
  },
  'NO2': {
    name: 'Nitrogen Dioxide (NO₂)',
    description: 'A reddish-brown, highly reactive gas that is part of a group of gases called nitrogen oxides (NOx).',
    sources: 'Primarily from the burning of fuel in vehicles, power plants, and industrial boilers. Unvented kerosene or gas stoves and heaters also produce NO₂ indoors.',
    effects: 'Can irritate the respiratory system, aggravate respiratory diseases like asthma, and may contribute to the development of asthma and increased susceptibility to respiratory infections.'
  },
   'Other': {
    name: 'Other Pollutants',
    description: 'This category includes other significant pollutants such as Sulfur Dioxide (SO₂), Carbon Monoxide (CO), and Volatile Organic Compounds (VOCs).',
    sources: 'SO₂ from burning fossil fuels containing sulfur; CO from incomplete combustion in vehicles and appliances; VOCs from paints, solvents, and fuels.',
    effects: 'Varies widely. SO₂ affects the respiratory system. CO is toxic and reduces oxygen delivery in the body. VOCs can cause a range of health effects from eye irritation to cancer.'
  },
};

const aqiLevels = [
    { range: '0-50', level: 'Good', color: 'bg-green-500', implications: 'Air quality is satisfactory, and air pollution poses little or no risk.' },
    { range: '51-100', level: 'Moderate', color: 'bg-yellow-500', implications: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.' },
    { range: '101-150', level: 'Unhealthy for Sensitive Groups', color: 'bg-orange-500', implications: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.' },
    { range: '151-200', level: 'Unhealthy', color: 'bg-red-500', implications: 'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.' },
    { range: '201-300', level: 'Very Unhealthy', color: 'bg-purple-500', implications: 'Health alert: The risk of health effects is increased for everyone.' },
    { range: '301+', level: 'Hazardous', color: 'bg-rose-600', implications: 'Health warning of emergency conditions: everyone is more likely to be affected.' },
]

const PollutantInfoModal: React.FC<PollutantInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-3xl border border-subtle max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-subtle p-4 flex justify-between items-center">
          <h2 className="text-xl font-medium font-heading text-text">Pollutant Information Center</h2>
          <button onClick={onClose} className="text-2xl font-light p-1 rounded-full text-text-muted hover:bg-slate-100">&times;</button>
        </div>

        <div className="p-6">
            <div className="mb-8">
                <h3 className="text-lg font-medium font-heading text-primary mb-3">Major Air Pollutants</h3>
                <div className="space-y-4">
                    {Object.values(pollutantData).map(p => (
                        <div key={p.name} className="p-4 bg-slate-50 rounded-lg border border-subtle">
                            <h4 className="font-medium font-heading text-text">{p.name}</h4>
                            <p className="text-sm text-text-muted mt-1"><span className="font-semibold text-text/80">Sources:</span> {p.sources}</p>
                            <p className="text-sm text-text-muted mt-1"><span className="font-semibold text-text/80">Health Effects:</span> {p.effects}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium font-heading text-primary mb-3">Understanding AQI Levels</h3>
                <div className="space-y-3">
                    {aqiLevels.map(level => (
                        <div key={level.level} className="flex items-start">
                            <div className="w-24 flex-shrink-0 flex items-center">
                                <span className={`w-4 h-4 rounded-full mr-2 ${level.color}`}></span>
                                <span className="font-bold text-text">{level.range}</span>
                            </div>
                            <div className="flex-1">
                                <p className="font-semibold text-text">{level.level}</p>
                                <p className="text-sm text-text-muted">{level.implications}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PollutantInfoModal;