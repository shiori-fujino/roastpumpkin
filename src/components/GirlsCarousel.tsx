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
  const [dragX, setDragX] = useState(0); // NEW: swipe offset

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

  const handleNext = () => setCurrentIndex((prev) => (prev + 1) % models.length);
  const handlePrev = () => setCurrentIndex((prev) => (prev - 1 + models.length) % models.length);

  const handleTouchStart = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    setTouchStart(x);
    setTouchEnd(x);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const x = e.touches[0].clientX;
    setTouchEnd(x);
    setDragX((x - touchStart) / 8); // smooth physical glide
  };

  const handleTouchEnd = () => {
    const distance = touchEnd - touchStart;
    if (distance > 50) handlePrev();
    if (distance < -50) handleNext();
    setDragX(0); // reset slide
    setTouchStart(0);
    setTouchEnd(0);
  };

  const visibleCards = getVisibleCards();

  return (
    <section className="min-h-screen bg-black relative overflow-hidden py-20">
      <div className="relative z-10">
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
                if (card.position < 0) handlePrev(), e.preventDefault();
                if (card.position > 0) handleNext(), e.preventDefault();
              }}
              className="
                absolute w-64 h-96 cursor-pointer
                transition-[transform,opacity,filter]
                duration-[550ms]
                ease-[cubic-bezier(.25,.8,.25,1)]
              "
              style={{
                zIndex: card.zIndex,
                transform: `
                  translateX(calc(${card.translateX}vw + ${dragX}px))
                  translateY(${Math.abs(card.position) * 1.5}px)
                  scale(${card.scale})
                  rotateY(${card.position * 5}deg)
                `,
                opacity: card.opacity,
                filter: card.position === 0
                  ? "brightness(1) blur(0px)"
                  : "brightness(0.7) blur(1.5px)",
              }}
            >
              <div className="relative w-full h-full group">
                <div
                  className="absolute inset-0 rounded-lg overflow-hidden border-2 transition-all"
                  style={{
                    borderColor: card.position === 0
                      ? "rgba(255, 40, 40, 0.9)"
                      : "rgba(120, 0, 0, 0.4)",
                    boxShadow: card.position === 0
                      ? "0 0 20px rgba(255,60,60,0.8), 0 0 50px rgba(255,120,60,0.4)"
                      : "none",
                  }}
                >
                  <img
                    src={card.image}
                    alt={card.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                  {card.isNew && (
                    <div
                      className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold animate-pulse"
                      style={{ boxShadow: "0 0 15px rgba(255,50,50,0.85)" }}
                    >
                      NEW
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-bold text-xl mb-1"
                      style={{ textShadow: '0 0 10px rgba(255,0,255,0.8)' }}
                    >
                      {card.name}
                    </h3>
                    <p className="text-white/70 text-sm mb-2">{card.nationality}</p>

                    {card.position === 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {card.cim && <span className="px-2 py-0.5 bg-red-500/80 text-white text-xs">CIM</span>}
                        {card.dfk && <span className="px-2 py-0.5 bg-red-600/80 text-white text-xs">DFK</span>}
                        {card.filming && <span className="px-2 py-0.5 bg-red-700/80 text-white text-xs">Filming</span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center gap-8 mt-12">
          <button onClick={handlePrev}
            className="p-4 rounded-full bg-black/50 border border-red-500/50 text-red-500 hover:bg-red-500/20 transition">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={handleNext}
            className="p-4 rounded-full bg-black/50 border border-red-500/50 text-red-500 hover:bg-red-500/20 transition">
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        <div className="text-xl text-center mt-8 text-gray-500">
          {currentIndex + 1} / {models.length}
        </div>
      </div>
    </section>
  );
};

export default GirlsCarousel;
