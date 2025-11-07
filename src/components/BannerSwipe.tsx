import React, { useState, useEffect, useRef } from 'react';

interface Banner {
  id: number;
  image: string;
  title: string;
  newsId?: number;
}

interface BannerSwipeProps {
  banners: Banner[];
}

const BannerSwipe: React.FC<BannerSwipeProps> = ({ banners }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<number>();

  // Auto-play every 7 seconds
  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 7000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      handleNext();
    }, 7000);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
    resetAutoPlay();
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

    if (isLeftSwipe) {
      handleNext();
      resetAutoPlay();
    }
    if (isRightSwipe) {
      handlePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">

      {/* Banner slides */}
      <div
        className="relative h-full w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner, index) => (
  <div
    key={banner.id}
    className={`absolute inset-0 transition-all duration-500 ${
      index === currentIndex
        ? 'opacity-100 scale-100 z-10'  // Add z-10 for active
        : 'opacity-0 scale-95 pointer-events-none'  // Add pointer-events-none for inactive
    }`}
    onClick={() => {
      // Only clickable when it's the current banner
      if (index === currentIndex && banner.newsId !== undefined) {
        console.log('Clicked banner newsId:', banner.newsId);
        window.location.hash = `#/news/${banner.newsId}`;
      }
    }}
    style={{ 
      cursor: index === currentIndex && banner.newsId !== undefined ? 'pointer' : 'default' 
    }}
  >

            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
              style={{ objectPosition: 'center' }}
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

            {/* Title */}
            {banner.title && (
              <div className="absolute bottom-20 left-0 right-0 px-6">
                <h2
                  className="text-4xl font-bold text-white tracking-wider"
                  style={{
                    textShadow: `
          0 0 12px rgba(255,50,50,0.9),
          0 0 28px rgba(255,110,60,0.45),
          0 0 45px rgba(120,0,0,0.5)
        `,
                    fontFamily: 'system-ui, -apple-system, sans-serif'
                  }}
                >
                  {banner.title}
                </h2>
              </div>

            )}
          </div>
        ))}
      </div>



      {/* Progress dots */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              resetAutoPlay();
            }}
            className={`transition-all ${index === currentIndex
              ? 'w-8 h-2 bg-gradient-to-r from-red-500 to-red-900'
              : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              } rounded-full`}
            style={{
              boxShadow: index === currentIndex
                ? '0 0 10px rgba(255,0,255,0.8), 0 0 20px rgba(0,255,255,0.6)'
                : 'none'
            }}
          />
        ))}
      </div>

    </section>
  );
};

export default BannerSwipe;