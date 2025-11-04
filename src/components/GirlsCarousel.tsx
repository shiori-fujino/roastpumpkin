import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Model {
  id: number;
  name: string;
  nationality: string;
  image: string;
  profileLink: string;
  isNew: boolean;
  filming: boolean;
  cim: boolean;
  dfk: boolean;
}

interface GirlsCarouselProps {
  models: Model[];
}

const GirlsCarousel: React.FC<GirlsCarouselProps> = ({ models }) => {
  const [currentIndex, setCurrentIndex] = useState(2);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const getVisibleCards = () => {
    const cards = [];
    for (let i = -2; i <= 2; i++) {
      const index = (currentIndex + i + models.length) % models.length;
      cards.push({
        ...models[index],
        position: i,
        zIndex: 5 - Math.abs(i),
        scale: 1 - Math.abs(i) * 0.1,
        opacity: 1 - Math.abs(i) * 0.2,
        translateX: i * 30,
      });
    }
    return cards;
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % models.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);
  };

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

    if (isLeftSwipe) handleNext();
    if (isRightSwipe) handlePrev();

    setTouchStart(0);
    setTouchEnd(0);
  };

  const visibleCards = getVisibleCards();

  return (
    <section className="min-h-screen bg-black relative overflow-hidden py-20">
      {/* Cyberpunk background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,0,255,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,255,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black" />
      </div>

      <div className="relative z-10">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center mb-16 px-4"
          style={{
            background: 'linear-gradient(to right, #4a0000, #ff2a2a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(255,0,255,0.5)',
          }}
        >
          OUR GIRLS
        </h2>

        {/* 3D Card Stack */}
        <div 
          className="relative h-[500px] w-full flex items-center justify-center perspective-1000"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {visibleCards.map((card) => (
            <Link
              key={`${card.id}-${card.position}`}
              to={card.position === 0 ? `/models/${card.name.toLowerCase()}` : '#'}
              onClick={(e) => {
                if (card.position !== 0) {
                  e.preventDefault();
                  if (card.position < 0) handlePrev();
                  if (card.position > 0) handleNext();
                }
              }}
              className="absolute w-64 h-96 transition-all duration-500 ease-out cursor-pointer"
              style={{
                zIndex: card.zIndex,
                transform: `
                  translateX(${card.translateX}vw) 
                  scale(${card.scale})
                  rotateY(${card.position * 5}deg)
                `,
                opacity: card.opacity,
                filter: card.position === 0 ? 'none' : 'brightness(0.6)',
              }}
            >
              <div className="relative w-full h-full group">
                {/* Card container with neon border */}
                <div
  className="absolute inset-0 rounded-lg overflow-hidden border-2 transition-all"
  style={{
    borderColor:
      card.position === 0
        ? "rgba(255, 40, 40, 0.9)"   // vivid red when active
        : "rgba(120, 0, 0, 0.4)",    // muted deep red otherwise
    boxShadow:
      card.position === 0
        ? `
            0 0 25px rgba(255, 60, 60, 0.8),
            0 0 60px rgba(255, 120, 60, 0.4),
            inset 0 0 20px rgba(80, 0, 0, 0.5)
          `
        : "none",
  }}
>
                  {/* Image */}
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {/* NEW badge */}
                  {card.isNew && (
                    <div className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold animate-pulse"
                      style={{
                        boxShadow: '0 0 15px rgba(255,0,255,0.8)'
                      }}
                    >
                      NEW
                    </div>
                  )}

                  {/* Info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-xl mb-1"
                      style={{
                        textShadow: '0 0 10px rgba(255,0,255,0.8), 0 0 20px rgba(0,255,255,0.6)'
                      }}
                    >
                      {card.name}
                    </h3>
                    <p className="text-black-400 text-sm mb-2">{card.nationality}</p>

                    {/* Services badges */}
                    {card.position === 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {card.cim && (
                          <span className="px-2 py-0.5 bg-red-500/80 text-white text-xs">
                            CIM
                          </span>
                        )}
                        {card.dfk && (
                          <span className="px-2 py-0.5 bg-amber-500/80 text-white text-xs">
                            DFK
                          </span>
                        )}
                        {card.filming && (
                          <span className="px-2 py-0.5 bg-red-500/80 text-white text-xs">
                            Filming
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Navigation arrows */}
        <div className="flex justify-center gap-8 mt-12">
          <button
            onClick={handlePrev}
            className="p-4 rounded-full bg-black/50 backdrop-blur-sm border border-red-500/50 text-red-500 hover:bg-red-500/20 hover:border-pink-500 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(255,0,255,0.3)'
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <button
            onClick={handleNext}
            className="p-4 rounded-full bg-black/50 backdrop-blur-sm border border-red-500/50 text-red-500 hover:bg-red-500/20 hover:border-pink-500 transition-all"
            style={{
              boxShadow: '0 0 20px rgba(255,0,255,0.3)'
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Progress indicator */}
        <div className="text-xl text-center mt-8 text-gray-500">
          {currentIndex + 1} / {models.length}
        </div>
      </div>
    </section>
  );
};

export default GirlsCarousel;