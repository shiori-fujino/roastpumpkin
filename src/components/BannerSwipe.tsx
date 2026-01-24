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
            className={`absolute inset-0 transition-all duration-500 ${index === currentIndex
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
      {/* Scroll hint */}
      <div className="absolute bottom-16 left-0 right-0 z-10 flex justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2 opacity-80">
          <div className="h-7 w-5 rounded-full border border-white/30 flex items-start justify-center p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-white/60 animate-[scrollDot_1.6s_ease-in-out_infinite]" />
          </div>

          <svg
            className="h-6 w-6 text-white/50 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
      
{/* Counter (top-right) */}
<div className="absolute top-6 left-6 z-20 text-white/60 text-sm tracking-[0.25em] select-none">
  {String(currentIndex + 1).padStart(2, "0")} / {String(banners.length).padStart(2, "0")}
</div>
    </section>
  );
};

export default BannerSwipe;
