// src/components/profile/ProfileGallery.tsx
import React, { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

type Props = {
  name: string;
  images: string[]; // pass [] if none
  isNew?: boolean;
  className?: string;
};

const ProfileGallery: React.FC<Props> = ({ name, images, isNew = false, className }) => {
  const { t } = useTranslation();

  const imageArray = useMemo(() => (Array.isArray(images) ? images.filter(Boolean) : []), [images]);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const hasMany = imageArray.length > 1;

  const nextImage = () => {
    if (!hasMany) return;
    setCurrentImageIndex((prev) => (prev === imageArray.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!hasMany) return;
    setCurrentImageIndex((prev) => (prev === 0 ? imageArray.length - 1 : prev - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => setTouchEnd(e.touches[0].clientX);
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;

    if (distance > 50) nextImage();
    if (distance < -50) prevImage();

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keep index valid if images change
  React.useEffect(() => {
    if (!imageArray.length) return;
    if (currentImageIndex > imageArray.length - 1) setCurrentImageIndex(0);
  }, [imageArray, currentImageIndex]);

  return (
    <div className={className}>
      {/* Main image */}
      <div
        className="relative aspect-[3/4] overflow-hidden touch-pan-y border border-red-900/40 bg-black/40"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {imageArray.length > 0 ? (
          <img
            src={imageArray[currentImageIndex]}
            alt={`${name} - Photo ${currentImageIndex + 1}`}
            className="w-full h-full object-cover"
            loading="eager"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-500">
            {t("common.noImage")}
          </div>
        )}

        {isNew && (
          <span className="absolute top-4 right-4 bg-red-900 text-white text-sm px-3 py-1 font-bold uppercase tracking-wider">
            {t("badges.new")}
          </span>
        )}

        {hasMany && (
          <>
            <button
              type="button"
              onClick={prevImage}
              className="absolute left-0 top-1/2 -translate-y-1/2 px-4 py-8 bg-black/70 border border-red-900 text-white hover:bg-white/5 transition-colors"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              type="button"
              onClick={nextImage}
              className="absolute right-0 top-1/2 -translate-y-1/2 px-4 py-8 bg-black/70 border border-red-900 text-white hover:bg-white/5 transition-colors"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {imageArray.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setCurrentImageIndex(index)}
                  className={`h-2 transition-all ${
                    index === currentImageIndex ? "bg-red-900 w-8" : "bg-zinc-700 w-2 hover:bg-zinc-500"
                  }`}
                  aria-label={`Go to photo ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {hasMany && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
          {imageArray.map((img, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-20 h-28 overflow-hidden transition-colors border ${
                index === currentImageIndex ? "border-red-900" : "border-zinc-800 hover:border-red-900/60"
              }`}
              aria-label={`Thumbnail ${index + 1}`}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileGallery;
