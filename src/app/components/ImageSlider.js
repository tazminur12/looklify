'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export default function ImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [sliderImages, setSliderImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const sliderRef = useRef(null);
  const touchStartTime = useRef(0);

  // Fetch slider images from API
  useEffect(() => {
    fetchSliderImages();
  }, []);

  const fetchSliderImages = async () => {
    try {
      const response = await fetch('/api/slider?status=active&sortBy=sortOrder');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setSliderImages(data.data);
      } else {
        // Fallback to default images if no slider images found
        setSliderImages([
          {
            image: { url: '/slider/1.webp', alt: 'Premium Beauty Products' },
            title: 'Premium Beauty Products',
            description: 'Discover our curated selection of premium beauty products',
            buttonText: 'Shop Now',
            buttonLink: '/shop'
          },
          {
            image: { url: '/slider/2.jpg', alt: 'Natural Skincare Collection' },
            title: 'Natural Skincare Collection',
            description: 'Experience the power of natural ingredients',
            buttonText: 'Shop Now',
            buttonLink: '/shop'
          },
          {
            image: { url: '/slider/3.jpg', alt: 'Luxury Beauty Essentials' },
            title: 'Luxury Beauty Essentials',
            description: 'Indulge in luxury beauty essentials',
            buttonText: 'Shop Now',
            buttonLink: '/shop'
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
      // Fallback to default images on error
      setSliderImages([
        {
          image: { url: '/slider/1.webp', alt: 'Premium Beauty Products' },
          title: 'Premium Beauty Products',
          description: 'Discover our curated selection of premium beauty products',
          buttonText: 'Shop Now',
          buttonLink: '/shop'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play functionality (paused when user interacts)
  useEffect(() => {
    if (!isDragging && sliderImages.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [sliderImages.length, isDragging]);

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e) => {
    if (sliderImages.length <= 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setStartX(touch.clientX);
    setCurrentX(touch.clientX);
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e) => {
    if (!isDragging || sliderImages.length <= 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    setCurrentX(touch.clientX);
  };

  const handleTouchEnd = (e) => {
    if (!isDragging || sliderImages.length <= 1) {
      setIsDragging(false);
      return;
    }
    
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    const timeDiff = Date.now() - touchStartTime.current;
    const minSwipeDistance = 50;
    const maxSwipeTime = 300; // milliseconds
    
    // Determine if it's a valid swipe based on distance and speed
    if (Math.abs(diff) > minSwipeDistance || (Math.abs(diff) > 30 && timeDiff < maxSwipeTime)) {
      if (diff > 0) {
        // Swipe left - next slide
        goToNext();
      } else {
        // Swipe right - previous slide
        goToPrevious();
      }
    }
    
    setIsDragging(false);
    setCurrentX(0);
  };

  // Mouse event handlers for desktop drag
  const handleMouseDown = (e) => {
    if (sliderImages.length <= 1) return;
    setIsDragging(true);
    setStartX(e.clientX);
    setCurrentX(e.clientX);
    touchStartTime.current = Date.now();
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging || sliderImages.length <= 1) return;
    setCurrentX(e.clientX);
  };

  const handleMouseUp = (e) => {
    if (!isDragging || sliderImages.length <= 1) {
      setIsDragging(false);
      return;
    }
    
    const endX = e.clientX;
    const diff = startX - endX;
    const timeDiff = Date.now() - touchStartTime.current;
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    if (Math.abs(diff) > minSwipeDistance || (Math.abs(diff) > 30 && timeDiff < maxSwipeTime)) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }
    
    setIsDragging(false);
    setCurrentX(0);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const goToPrevious = () => {
    if (sliderImages.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + sliderImages.length) % sliderImages.length);
    }
  };

  const goToNext = () => {
    if (sliderImages.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % sliderImages.length);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading slider images...</p>
        </div>
      </div>
    );
  }

  // Show empty state
  if (sliderImages.length === 0) {
    return (
      <div className="relative w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center text-gray-600 dark:text-gray-400">
          <p>No slider images available</p>
        </div>
      </div>
    );
  }

  // Calculate drag offset for smooth transition
  const getDragOffset = () => {
    if (!isDragging || sliderImages.length <= 1) return 0;
    const diff = currentX - startX;
    // Limit the offset to prevent over-dragging
    const maxOffset = 100;
    return Math.max(-maxOffset, Math.min(maxOffset, diff));
  };

  const dragOffset = getDragOffset();

  return (
    <div 
      ref={sliderRef}
      className="relative w-full h-full overflow-hidden select-none touch-pan-y"
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        if (isDragging) {
          setIsDragging(false);
          setCurrentX(0);
        }
      }}
    >
      {/* Main Image Container */}
      <div 
        className="relative w-full h-full"
        style={{
          transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : 'none',
          transition: isDragging ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {sliderImages.map((slider, index) => {
          // Calculate opacity based on current slide and drag
          let opacity = 0;
          if (index === currentSlide) {
            opacity = 1 - Math.abs(dragOffset) / 200;
          } else if (index === currentSlide + 1 && dragOffset < 0) {
            // Next slide showing on right
            opacity = Math.abs(dragOffset) / 200;
          } else if (index === currentSlide - 1 && dragOffset > 0) {
            // Previous slide showing on left
            opacity = Math.abs(dragOffset) / 200;
          }

          return (
            <div
              key={slider._id || index}
              className="absolute inset-0 transition-opacity duration-300 overflow-hidden"
              style={{
                opacity: isDragging ? opacity : (index === currentSlide ? 1 : 0),
                zIndex: index === currentSlide ? 10 : 5
              }}
            >
            <Image
              src={slider.image.url}
              alt={slider.image.alt || slider.title || 'Slider Image'}
              fill
              className="object-cover object-center"
              priority={index === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 100vw"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/20"></div>
            
            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center px-4 sm:px-8">
              <div className="text-center text-white max-w-lg">
                {slider.title && (
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 drop-shadow-lg">
                    {slider.title}
                  </h1>
                )}
                {slider.description && (
                  <p className="text-sm sm:text-base lg:text-lg mb-6 drop-shadow-md opacity-90">
                    {slider.description}
                  </p>
                )}
              </div>
            </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Arrows - Hidden on mobile for better touch experience */}
      {sliderImages.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden sm:block absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={goToNext}
            className="hidden sm:block absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 sm:p-3 rounded-full transition-all duration-300 hover:scale-110 z-10"
            aria-label="Next image"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators - Enhanced for mobile */}
      {sliderImages.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-10">
          {sliderImages.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125 shadow-lg' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Slide Counter - Mobile optimized */}
      {sliderImages.length > 1 && (
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-black/30 backdrop-blur-sm text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium z-10">
          {currentSlide + 1} / {sliderImages.length}
        </div>
      )}

      {/* Mobile Swipe Indicator */}
      {sliderImages.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 sm:hidden z-10">
          <div className="flex items-center space-x-2 text-white/70 text-xs">
          </div>
        </div>
      )}
    </div>
  );
}
