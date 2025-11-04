import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter } from 'lucide-react';
import data from "../data/data.json"

interface RosterModel {
  id: number;
  name: string;
  nationality: string;
  image: string;
  profileLink: string;
  isNew: boolean;
  isAvailableNow?: boolean;
  nextAvailable?: string;
  workingTime?: string;
  filming: boolean;
  cim: boolean;
  dfk: boolean;
}

interface RosterGridProps {
  rosterToday: number[];
  rosterTomorrow: number[];
}

const RosterGrid: React.FC<RosterGridProps> = ({ rosterToday, rosterTomorrow }) => {
  const [activeTab, setActiveTab] = useState<'today' | 'tomorrow'>('today');
  const [currentBatch, setCurrentBatch] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedNationalities, setSelectedNationalities] = useState<string[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const BATCH_SIZE = 6;
  const currentRosterIds = activeTab === 'today' ? rosterToday : rosterTomorrow;
  const currentRoster = currentRosterIds
  .map(id => data.models.find(m => m.id === id))
  .filter(Boolean) as RosterModel[];

// Check if tomorrow's roster is available (after 7 PM)
const isTomorrowAvailable = () => {
  const now = new Date();
  const hour = now.getHours();
  return hour >= 19; // 7 PM
};

  // Get unique nationalities
  const nationalities = [...new Set(currentRoster.map(m => m.nationality))].sort();

  // Apply filters
  const filteredRoster = currentRoster.filter(model => {
    if (selectedNationalities.length > 0 && !selectedNationalities.includes(model.nationality)) {
      return false;
    }
    if (onlyAvailable && !model.isAvailableNow) {
      return false;
    }
    return true;
  });

  const totalBatches = Math.ceil(filteredRoster.length / BATCH_SIZE);
  const currentBatchModels = filteredRoster.slice(
    currentBatch * BATCH_SIZE,
    (currentBatch + 1) * BATCH_SIZE
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && currentBatch < totalBatches - 1) {
      setCurrentBatch(prev => prev + 1);
    }
    if (isRightSwipe && currentBatch > 0) {
      setCurrentBatch(prev => prev - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const toggleNationality = (nat: string) => {
    setSelectedNationalities(prev =>
      prev.includes(nat) ? prev.filter(n => n !== nat) : [...prev, nat]
    );
    setCurrentBatch(0);
  };

  const clearFilters = () => {
    setSelectedNationalities([]);
    setOnlyAvailable(false);
    setCurrentBatch(0);
  };

  return (
    <section id="roster" className="min-h-screen bg-black relative overflow-hidden py-12">
      {/* Cyberpunk grid background */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,255,255,0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,0,255,0.3) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px'
        }}
      />

      <div className="relative z-10 max-w-screen-xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 justify-center">
          <button
  onClick={() => { setActiveTab('today'); setCurrentBatch(0); }}
  className={`px-6 py-3 font-bold text-2xl tracking-wider transition-all ${
    activeTab === 'today'
      ? 'bg-gradient-to-r from-red-700 to-red-900 text-white'
      : 'bg-gray-900 text-gray-500 hover:text-white'
  } border-2 ${
    activeTab === 'today' ? 'border-red-500' : 'border-gray-700'
  }`}
  style={{
    boxShadow: activeTab === 'today'
      ? `
        0 0 18px rgba(255,60,60,0.6),
        0 0 35px rgba(255,120,60,0.35),
        inset 0 0 10px rgba(90,0,0,0.4)
      `
      : 'none'
  }}
>
  TODAY
</button>

<button
  onClick={() => { 
    if (isTomorrowAvailable()) {
      setActiveTab('tomorrow'); 
      setCurrentBatch(0);
    }
  }}
  disabled={!isTomorrowAvailable()}
  className={`px-6 py-3 font-bold tracking-wider transition-all ${
    activeTab === 'tomorrow'
      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
      : isTomorrowAvailable()
        ? 'bg-gray-900 text-gray-500 hover:text-white'
        : 'bg-gray-900 text-gray-700 cursor-not-allowed'
  } border-2 ${
    activeTab === 'tomorrow' ? 'border-red-500' : 'border-gray-700'
  }`}
  style={{
    boxShadow: activeTab === 'tomorrow'
      ? `
        0 0 16px rgba(255,50,50,0.6),
        0 0 30px rgba(255,110,50,0.3),
        inset 0 0 8px rgba(80,0,0,0.35)
      `
      : 'none'
  }}
>
  TOMORROW {!isTomorrowAvailable() && '(7PM)'}
</button>

        </div>

        {/* Filter button */}
        <div className="flex justify-between items-center ml-6 mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-red-500/50 text-red-400 hover:bg-purple-900/30 transition-all text-xl"
          >
            <Filter className="w-4 h-4" />
            FILTERS
            {(selectedNationalities.length > 0 || onlyAvailable) && (
              <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                {selectedNationalities.length + (onlyAvailable ? 1 : 0)}
              </span>
            )}
          </button>

          <div className="text-red-800 text-xl mr-6">
            Page {currentBatch + 1} / {totalBatches}
          </div>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="mb-6 p-4 bg-gray-900 border border-red-500/50 mx-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-500 font-bold">FILTERS</h3>
              <button onClick={clearFilters} className="text-lg text-gray-500 hover:text-white">
                CLEAR ALL
              </button>
            </div>

            {/* Only available toggle */}
            <label className="flex items-center gap-2 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={onlyAvailable}
                onChange={(e) => { setOnlyAvailable(e.target.checked); setCurrentBatch(0); }}
                className="w-4 h-4 accent-cyan-500"
              />
              <span className="text-red-400 text-lg">Show Available Girls Only</span>
            </label>

            {/* Nationality filters */}
            <div className="flex flex-wrap gap-2">
              {nationalities.map(nat => (
                <button
                  key={nat}
                  onClick={() => toggleNationality(nat)}
                  className={`px-3 py-1 text-md transition-all ${
                    selectedNationalities.includes(nat)
                      ? 'bg-gradient-to-r from-red-500 to-red-800 text-white border-red-500'
                      : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-500'
                  } border`}
                >
                  {nat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        <div 
          className="grid grid-cols-2 gap-0 mb-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {currentBatchModels.map((model) => (
            <Link
              key={model.id}
              to={`/models/${model.name.toLowerCase()}`}
              className="relative aspect-[3/4] overflow-hidden group block"
              style={{
                width: '50vw',
                boxShadow: 'inset 0 0 0 1px rgba(255,0,255,0.2)'
              }}
            >
              {/* Image */}
              <img
                src={model.image}
                alt={model.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Neon glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-b from-pink-500/0 via-purple-500/0 to-cyan-500/0 group-hover:from-pink-500/20 group-hover:via-purple-500/20 group-hover:to-cyan-500/20 transition-all duration-500" />

              {/* Info overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent flex flex-col justify-end p-4">
                {/* Availability badge */}
                {model.isAvailableNow ? (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-black text-xs font-bold animate-pulse"
                    style={{
                      boxShadow: '0 0 15px rgba(0,255,0,0.8)'
                    }}
                  >
                    AVAILABLE NOW
                  </div>
                ) : model.nextAvailable ? (
                  <div className="absolute top-3 left-3 px-3 py-1 bg-gray-900 border border-red-500/50 text-red-400 text-sm font-bold">
                    Available at {model.nextAvailable}
                  </div>
                ) : null}

                {/* NEW badge */}
                {model.isNew && (
                  <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white text-xs font-bold"
                    style={{
                      boxShadow: '0 0 15px rgba(255,0,255,0.8)'
                    }}
                  >
                    NEW
                  </div>
                )}

                {/* Name and nationality */}
                <h3 className="text-white font-bold text-lg mb-1"
                  style={{
                    textShadow: '0 0 10px rgba(255,0,255,0.8), 0 0 20px rgba(0,255,255,0.6)'
                  }}
                >
                  {model.name}
                </h3>
                <p className="text-red-800 text-lg">{model.nationality}</p>
              </div>
            </Link>
          ))}
        </div>

        
        {/* Progress dots */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalBatches }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBatch(index)}
              className={`transition-all rounded-full ${
                index === currentBatch
                  ? 'w-8 h-2 bg-gradient-to-r from-red-500 to-red-900'
                  : 'w-2 h-2 bg-gray-700 hover:bg-gray-500'
              }`}
              style={{
                boxShadow: index === currentBatch 
                  ? '0 0 10px rgba(255,0,255,0.8), 0 0 20px rgba(0,255,255,0.6)'
                  : 'none'
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RosterGrid;