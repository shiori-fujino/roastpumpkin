import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ---------------- Types ---------------- */

interface Banner {
  id: number;
  image: string;
  title: string;
  newsId?: number;
}

interface BannerSwipeProps {
  banners: Banner[];
}

/* ---------------- Component ---------------- */

const BannerSwipe: React.FC<BannerSwipeProps> = ({ banners }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoPlayRef = useRef<number>();

  // Auto-play every 7 seconds
  useEffect(() => {
    if (!banners.length) return;

    autoPlayRef.current = window.setInterval(() => {
      handleNext();
    }, 7000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [currentIndex, banners.length]);

  const resetAutoPlay = () => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = window.setInterval(() => {
      handleNext();
    }, 7000);
  };

  const handleNext = () => {
    if (!banners.length || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % banners.length);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handlePrev = () => {
    if (!banners.length || isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(
      (prev) => (prev - 1 + banners.length) % banners.length
    );
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
    if (distance > 50) {
      handleNext();
      resetAutoPlay();
    }
    if (distance < -50) {
      handlePrev();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  return (
    <section className="relative h-screen w-full overflow-hidden bg-black">
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
                ? "opacity-100 scale-100 z-10"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
            onClick={() => {
              if (index === currentIndex && banner.newsId !== undefined) {
                navigate(`/news/${banner.newsId}`);
              }
            }}
            style={{
              cursor:
                index === currentIndex && banner.newsId !== undefined
                  ? "pointer"
                  : "default",
            }}
          >
            <img
              src={banner.image}
              alt={banner.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />


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
            className={`transition-all ${
              index === currentIndex
                ? "w-8 h-2 bg-gradient-to-r from-red-500 to-red-900"
                : "w-2 h-2 bg-white/30 hover:bg-white/50"
            } rounded-full`}
          />
        ))}
      </div>
    </section>
  );
};

export default BannerSwipe;
