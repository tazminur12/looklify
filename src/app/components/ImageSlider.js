'use client';

import { useState, useEffect, useRef } from 'react';
import { Image } from '@unpic/react';

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
      const response = await fetch('/api/slider?status=active&placement=primary&sortBy=sortOrder');
      const data = await response.json();
      
      if (data.success && data.data && data.data.length > 0) {
        setSliderImages(data.data);
      } else {
        setSliderImages([]);
      }
    } catch (error) {
      console.error('Error fetching slider images:', error);
      setSliderImages([]);
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

  // Prevent image download protection
  useEffect(() => {
    // Disable right-click context menu
    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts
    const handleKeyDown = (e) => {
      // Disable Ctrl+S, Ctrl+P, Ctrl+A, F12, etc.
      if (
        (e.ctrlKey || e.metaKey) && 
        (e.key === 's' || e.key === 'p' || e.key === 'a' || e.key === 'u' || e.key === 'i')
      ) {
        e.preventDefault();
        return false;
      }
      // Disable F12 (Developer Tools)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag start
    const handleDragStart = (e) => {
      e.preventDefault();
      return false;
    };

    // Disable select start
    const handleSelectStart = (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
      }
    };

    // Add event listeners
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('selectstart', handleSelectStart);

    // Cleanup
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('selectstart', handleSelectStart);
    };
  }, []);

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
      className="relative w-full max-w-full overflow-hidden select-none touch-pan-y m-0"
      style={{ 
        cursor: isDragging ? 'grabbing' : 'grab',
        aspectRatio: '21/9',
        minHeight: '180px',
        maxHeight: '500px',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        margin: 0,
        padding: 0,
        position: 'relative',
        zIndex: 0
      }}
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
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Main Image Container */}
          <div 
            className="absolute inset-0 w-full h-full"
            style={{
              transform: dragOffset !== 0 ? `translateX(${dragOffset}px)` : 'none',
              transition: isDragging ? 'none' : 'transform 0.3s ease-out',
              width: '100%',
              height: '100%',
              overflow: 'hidden',
              boxSizing: 'border-box'
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
              className="absolute inset-0 transition-opacity duration-300 overflow-hidden bg-white w-full h-full"
              style={{
                opacity: isDragging ? opacity : (index === currentSlide ? 1 : 0),
                zIndex: index === currentSlide ? 10 : 5,
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                boxSizing: 'border-box'
              }}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
            <Image
              src={slider.image.url}
              alt={slider.image.alt || slider.title || 'Slider Image'}
              width={1920}
              height={810}
              className="object-cover object-center select-none"
              loading={index === 0 ? 'eager' : 'lazy'}
              sizes="100vw"
              draggable={false}
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
              style={{ 
                objectFit: 'cover',
                objectPosition: 'center',
                userSelect: 'none',
                WebkitUserDrag: 'none',
                WebkitUserSelect: 'none',
                pointerEvents: 'none',
                touchAction: 'none',
                width: '100%',
                height: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            />
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