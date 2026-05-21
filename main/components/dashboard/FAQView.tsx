import React, { useState, useMemo } from 'react';

const faqData = {
    "General Questions": [
        {
            question: "What is the Air Quality Index (AQI)?",
            answer: "The AQI is a system for translating complex air quality data into a single number and color-coded scale. It helps people understand what the local air quality means for their health. The scale runs from 0 to 500, where higher values indicate greater air pollution and health risk."
        },
        {
            question: "How often is the air quality data updated?",
            answer: "Our system aggregates real-time data from various monitoring stations. The 'Current AQI' on the dashboard is updated hourly, while forecasts and recommendations are generated based on the latest predictive models."
        },
        {
            question: "What are the main pollutants that affect air quality?",
            answer: "The five major pollutants regulated by the Clean Air Act are ground-level ozone (O₃), particulate matter (PM2.5 and PM10), carbon monoxide (CO), sulfur dioxide (SO₂), and nitrogen dioxide (NO₂). Our system focuses on the most common ones like PM2.5 and Ozone for general display, but the calculator can handle more."
        },
    ],
    "Health & Safety": [
        {
            question: "How does air quality affect my health?",
            answer: "Poor air quality can have various short-term and long-term health effects. Short-term effects include irritation to the eyes, nose, and throat, shortness of breath, and worsening of conditions like asthma. Long-term exposure can lead to more severe issues like respiratory infections, heart disease, and lung cancer."
        },
        {
            question: "What does 'Unhealthy for Sensitive Groups' mean?",
            answer: "This AQI category (101-150) means that while the general public is not likely to be affected, people with lung disease, older adults, and children are at a greater risk from exposure to the pollutants in the air. People in these groups should reduce prolonged or heavy exertion outdoors."
        },
        {
            question: "Why is PM2.5 considered so dangerous?",
            answer: "PM2.5 refers to fine particulate matter with a diameter of 2.5 micrometers or less. Because they are so small, these particles can bypass the body's natural defenses, embedding deep within the lungs and even entering the bloodstream. This can lead to significant cardiovascular and respiratory diseases."
        },
        {
            question: "How can I protect myself from poor air quality?",
            answer: "Check the daily AQI forecast. On high-pollution days, try to limit your time outdoors. Avoid exercising near high-traffic areas. When indoors, keep windows closed and use an air purifier if possible. If you must go outside, consider wearing a high-quality mask (like an N95)."
        }
    ],
    "About the System": [
        {
            question: "How are the predictions and recommendations generated?",
            answer: "Our system uses advanced AI models, powered by Google's Gemini, combined with meteorological data and historical air quality trends. The AI analyzes these inputs to generate forecasts and personalized health recommendations based on your location and specified health conditions."
        },
        {
            question: "How does the 'Pollution Sources' analysis work?",
            answer: "The pollution source analysis uses an AI model to estimate the contribution of different sources (like traffic, industry, etc.) based on your city's profile, time of day, and typical activity patterns. It's a model-based estimation designed to provide general insights."
        },
        {
            question: "Is my personal health data secure?",
            answer: "Yes. We prioritize your privacy. Your selected health conditions are used only to tailor the AI-generated recommendations and are not shared with any third parties. All data processing is done in a secure environment."
        }
    ]
};

type FaqCategory = keyof typeof faqData;

const AccordionItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void; }> = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-subtle last:border-b-0 group">
            <button onClick={onClick} className="w-full flex justify-between items-center text-left py-4 px-1">
                <span className={`font-medium text-md transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-text group-hover:text-primary/90'}`}>{question}</span>
                <div className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full transition-colors duration-200 ${isOpen ? 'bg-primary/10' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
                  <svg className={`w-5 h-5 transition-all duration-300 ${isOpen ? 'rotate-180 text-primary' : 'text-text-muted group-hover:text-text'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
            </button>
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="pb-4 pt-0 px-1 text-text-muted">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQView: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<FaqCategory>("General Questions");
    const [openIndices, setOpenIndices] = useState<number[]>([0]);
    const [allOpen, setAllOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredQuestions = useMemo(() => {
        if (!activeCategory || !faqData[activeCategory]) return [];
        return faqData[activeCategory].filter(item => 
            item.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [activeCategory, searchTerm]);

    const handleItemClick = (index: number) => {
        setAllOpen(false); // Disable "all open" mode on individual click
        setOpenIndices(prev => 
            prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
        );
    };

    const toggleAll = () => {
        if (allOpen) {
            setOpenIndices([]);
        } else {
            setOpenIndices(filteredQuestions.map((_, i) => i));
        }
        setAllOpen(!allOpen);
    }
    
    return (
        <div>
             <div className="flex flex-col md:flex-row gap-8">
                {/* Categories Sidebar */}
                <div className="md:w-1/4">
                    <h3 className="text-lg font-medium font-heading text-text mb-4 px-2">Categories</h3>
                    <ul className="space-y-2">
                        {(Object.keys(faqData) as FaqCategory[]).map(category => (
                            <li key={category}>
                                <button
                                    onClick={() => {
                                        setActiveCategory(category);
                                        setOpenIndices([0]); // Open first item of new category
                                        setAllOpen(false);
                                    }}
                                    className={`w-full text-left font-medium p-3 rounded-lg transition-colors ${
                                        activeCategory === category 
                                        ? 'bg-primary text-white shadow' 
                                        : 'text-text-muted hover:bg-slate-200 hover:text-text'
                                    }`}
                                >
                                    {category}
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Questions and Answers */}
                <div className="md:w-3/4">
                    <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                        <div className="relative w-full sm:w-auto flex-grow">
                             <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full py-2.5 pl-10 pr-4 text-text bg-surface border border-primary/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <button onClick={toggleAll} className="font-semibold text-primary hover:text-primary-dark transition-colors flex-shrink-0">
                           {allOpen ? 'COLLAPSE ALL' : 'EXPAND ALL'}
                        </button>
                    </div>
                    
                    <div className="bg-surface border border-subtle rounded-2xl p-4 sm:p-6 shadow-sm">
                        {filteredQuestions.length > 0 ? (
                            filteredQuestions.map((item, index) => (
                                <AccordionItem 
                                    key={item.question}
                                    question={item.question}
                                    answer={item.answer}
                                    isOpen={allOpen || openIndices.includes(index)}
                                    onClick={() => handleItemClick(index)}
                                />
                            ))
                        ) : (
                            <p className="text-text-muted text-center p-8">No questions found matching your search.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQView;