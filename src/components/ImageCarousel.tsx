import { useState, useCallback, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn, ImageOff } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  title: string;
}

export default function ImageCarousel({ images, title }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightbox, setIsLightbox] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleImageLoad = (index: number) => {
    setLoadedImages(prev => new Set(prev).add(index));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    setTouchStart(null);
  };

  useEffect(() => {
    if (!isLightbox) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') setIsLightbox(false);
    };
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [isLightbox, nextSlide, prevSlide]);

  const displayImages = images.slice(0, 5);
  const useSlideLayout = images.length < 5;

  if (images.length === 0) {
    return (
      <div className="aspect-[4/3] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100 shadow-card flex flex-col items-center justify-center text-neutral-400">
        <ImageOff className="h-10 w-10 mb-2" strokeWidth={1.5} />
        <span className="text-sm font-medium">No photos available yet</span>
      </div>
    );
  }

  return (
    <>
      {/* ── MOBILE: Swipeable single-image carousel ── */}
      <div className="block sm:hidden">
        <div
          ref={carouselRef}
          className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-100 shadow-card"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={images[currentIndex]}
            alt={`${title} - ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            key={currentIndex}
          />
          {/* Nav arrows */}
          {images.length > 1 && (
            <>
              <button onClick={prevSlide}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white transition-all">
                <ChevronLeft className="h-4 w-4 text-navy-800" />
              </button>
              <button onClick={nextSlide}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white transition-all">
                <ChevronRight className="h-4 w-4 text-navy-800" />
              </button>
            </>
          )}
          {/* Counter */}
          <div className="absolute bottom-3 right-3 px-3 py-1 bg-black/60 backdrop-blur text-white text-xs font-semibold rounded-xl">
            {currentIndex + 1} / {images.length}
          </div>
          {/* Dots */}
          {images.length <= 8 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-1.5">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === currentIndex ? 'bg-white w-3.5' : 'bg-white/50'}`} />
              ))}
            </div>
          )}
        </div>
        <button onClick={() => setIsLightbox(true)}
          className="mt-3 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors uppercase tracking-wider">
          View all {images.length} photos →
        </button>
      </div>

      {/* ── TABLET/DESKTOP: Conditional Layout ── */}
      <div className="hidden sm:block">
        {useSlideLayout ? (
          // Slide Carousel Layout (for <5 images)
          <div 
            ref={carouselRef}
            className="relative aspect-[4/3] md:aspect-[16/10] lg:aspect-[16/9] rounded-2xl overflow-hidden bg-neutral-100 shadow-card"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Main Image */}
            <img
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-500 ease-out"
              key={currentIndex}
              onLoad={() => handleImageLoad(currentIndex)}
            />

            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white hover:scale-110 transition-all">
                  <ChevronLeft className="h-5 w-5 text-navy-800" />
                </button>
                <button onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 backdrop-blur rounded-xl shadow-sm hover:bg-white hover:scale-110 transition-all">
                  <ChevronRight className="h-5 w-5 text-navy-800" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-4 right-4 px-3.5 py-1.5 bg-black/70 backdrop-blur text-white text-sm font-semibold rounded-xl">
              {currentIndex + 1} / {images.length}
            </div>

            {/* Lightbox Trigger */}
            <button onClick={() => setIsLightbox(true)}
              className="absolute bottom-4 left-4 p-2.5 bg-white/90 backdrop-blur-md rounded-xl shadow-sm hover:bg-white hover:scale-105 transition-all flex items-center gap-2">
              <ZoomIn className="h-4.5 w-4.5 text-navy-800" />
              <span className="text-sm font-semibold text-navy-800">View all</span>
            </button>

            {/* Thumbnail dots/strip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {images.map((_, i) => (
                <button key={i} onClick={() => setCurrentIndex(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentIndex ? 'bg-brand-500 w-8' : 'bg-white/70 hover:bg-white'}`} />
              ))}
            </div>
          </div>
        ) : (
          // Grid Layout (for 5+ images)
          <div className="grid grid-cols-4 grid-rows-2 gap-2.5 rounded-2xl overflow-hidden h-[340px] md:h-[400px] lg:h-[440px] shadow-card">
            {/* Main large image */}
            <div
              className="col-span-2 row-span-2 relative cursor-pointer group overflow-hidden"
              onClick={() => setIsLightbox(true)}
            >
              {!loadedImages.has(0) && <div className="absolute inset-0 skeleton bg-neutral-100" />}
              <img
                src={images[0]}
                alt={`${title} - Main`}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                onLoad={() => handleImageLoad(0)}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 backdrop-blur-md rounded-xl p-2.5 shadow-sm hover:scale-105 transition-all">
                <ZoomIn className="h-4.5 w-4.5 text-navy-800" />
              </div>
            </div>

            {/* Smaller images */}
            {displayImages.slice(1, 5).map((image, idx) => {
              const index = idx + 1;
              const isLast = index === displayImages.length - 1 && images.length > 5;
              return (
                <div
                  key={index}
                  className="relative cursor-pointer group overflow-hidden"
                  onClick={() => { setCurrentIndex(index); setIsLightbox(true); }}
                >
                  {!loadedImages.has(index) && <div className="absolute inset-0 skeleton bg-neutral-100" />}
                  <img
                    src={image}
                    alt={`${title} - ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                    onLoad={() => handleImageLoad(index)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  {isLast && (
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="text-white font-display font-bold text-xl tracking-wider">+{images.length - 5}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Fill empty slots */}
            {displayImages.length < 5 && Array.from({ length: 5 - displayImages.length }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-neutral-100" />
            ))}
          </div>
        )}

        {!useSlideLayout && (
          <button onClick={() => setIsLightbox(true)}
            className="mt-3.5 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors uppercase tracking-wider">
            View all {images.length} photos →
          </button>
        )}
      </div>

      {/* ── LIGHTBOX ── */}
      {isLightbox && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <span className="text-sm font-semibold tracking-wider">{currentIndex + 1} / {images.length}</span>
            <button onClick={() => setIsLightbox(false)}
              className="p-2.5 hover:bg-white/10 rounded-xl transition-colors text-white/80 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Image */}
          <div className="flex-1 flex items-center justify-center px-4 relative min-h-0">
            <img
              src={images[currentIndex]}
              alt={`${title} - ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain animate-scale-in"
              key={currentIndex}
            />
            {images.length > 1 && (
              <>
                <button onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 hover:border-white/20 border border-white/5 rounded-xl transition-all">
                  <ChevronLeft className="h-6 w-6 text-white" />
                </button>
                <button onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/10 hover:border-white/20 border border-white/5 rounded-xl transition-all">
                  <ChevronRight className="h-6 w-6 text-white" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          <div className="p-4 flex justify-center space-x-2 overflow-x-auto hide-scrollbar">
            {images.map((image, index) => (
              <button key={index} onClick={() => setCurrentIndex(index)}
                className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-14 rounded-xl overflow-hidden transition-all ${
                  index === currentIndex ? 'ring-2 ring-brand-500 scale-105 opacity-100' : 'opacity-40 hover:opacity-75'
                }`}>
                <img src={image} alt={`Thumb ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
