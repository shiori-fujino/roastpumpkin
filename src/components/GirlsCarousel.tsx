import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CarouselModel {
  id: number;
  name: string;
  nationality: string;
  image: string;
  profileLink: string;
  isNew: boolean;
  filming?: boolean;
  cim?: boolean;
  dfk?: boolean;
}


interface GirlsCarouselProps {
  models: CarouselModel[];
}


const GirlsCarousel: React.FC<GirlsCarouselProps> = ({ models }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newPosition = direction === 'left' ? scrollPosition - scrollAmount : scrollPosition + scrollAmount;
      carouselRef.current.scrollTo({ left: newPosition, behavior: 'smooth' });
      setScrollPosition(newPosition);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (carouselRef.current) setScrollPosition(carouselRef.current.scrollLeft);
    };
    const carousel = carouselRef.current;
    carousel?.addEventListener('scroll', handleScroll);
    return () => carousel?.removeEventListener('scroll', handleScroll);
  }, []);

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = carouselRef.current
    ? scrollPosition < carouselRef.current.scrollWidth - carouselRef.current.clientWidth
    : true;

  return (
    <section className="min-h-screen bg-black py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{
              background: 'linear-gradient(to right, #4a0000, #ff2a2a)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(255,0,255,0.5)',
            }}
          >
            OUR GIRLS
          </h2>
          
        </div>

        <div className="relative pt-8">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-red-500/20 text-red-500 p-3 backdrop-blur-sm transition-all disabled:opacity-30 border border-red-500/30"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div
            ref={carouselRef}
            className="flex overflow-x-auto gap-4 scrollbar-hide scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {models.map((model) => (
              <Link
                key={model.id}
                to={`/models/${model.name.toLowerCase()}`}
                className="group flex-shrink-0 relative w-64 md:w-80"
              >
                <div className="relative overflow-hidden border-2 border-red-500/40 hover:border-red-500/80 transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,60,60,0.8)]">
                  <div className="aspect-[3/4] overflow-hidden bg-black relative">
                    <img
                      src={model.image}
                      alt={model.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />

                    {/* Film strip perforations */}
                    <div className="absolute inset-y-0 left-0 w-4 bg-black/80 backdrop-blur-sm flex flex-col justify-around items-center py-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-red-500/30 rounded-full" />
                      ))}
                    </div>
                    <div className="absolute inset-y-0 right-0 w-4 bg-black/80 backdrop-blur-sm flex flex-col justify-around items-center py-2">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-red-500/30 rounded-full" />
                      ))}
                    </div>

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {/* NEW badge */}
                    {model.isNew && (
                      <div
                        className="absolute top-3 right-3 px-2 py-1 bg-red-500 text-white text-xs font-bold animate-pulse"
                        style={{ boxShadow: '0 0 15px rgba(255,50,50,0.85)' }}
                      >
                        NEW
                      </div>
                    )}
                  </div>

                  {/* Card footer */}
                  <div className="bg-black border-t border-red-500/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3
                          className="font-bold text-lg group-hover:text-red-400 transition-colors"
                          style={{
                            color: '#ff2a2a',
                            textShadow: '0 0 10px rgba(255,0,255,0.6)',
                          }}
                        >
                          {model.name}
                        </h3>
                        <p className="text-xs text-gray-500">{model.nationality}</p>
                      </div>
                    </div>

                    {/* Service tags */}
                    <div className="flex gap-1 flex-wrap">
                      {model.cim && (
                        <span className="px-2 py-0.5 bg-red-500/80 text-white text-xs">CIM</span>
                      )}
                      {model.dfk && (
                        <span className="px-2 py-0.5 bg-red-600/80 text-white text-xs">DFK</span>
                      )}
                      {model.filming && (
                        <span className="px-2 py-0.5 bg-red-700/80 text-white text-xs">Filming</span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/80 hover:bg-red-500/20 text-red-500 p-3 backdrop-blur-sm transition-all disabled:opacity-30 border border-red-500/30"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GirlsCarousel;