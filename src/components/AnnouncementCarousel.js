import React, { useState, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AnnouncementCard from './AnnouncementCard';

const AnnouncementCarousel = ({ announcements = [], onAnnouncementClick, isMobile }) => {
  const { isDarkMode } = useTheme();
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);

  if (!announcements || announcements.length === 0) {
    return (
      <div className={`flex justify-center items-center h-40 ${
        isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
      }`}>
        <p>No announcements available</p>
      </div>
    );
  }

  // Mobile view renders cards vertically
  if (isMobile) {
    return (
      <div className="flex flex-col gap-4">
        {announcements.map((announcement) => (
          <div
            key={announcement.ANNOUNCEMENT_ID || announcement.id}
            className="w-full"
          >
            <AnnouncementCard
              announcement={announcement}
              onClick={() => onAnnouncementClick?.(announcement)}
              isMobile={true}
            />
          </div>
        ))}
      </div>
    );
  }

  const scroll = (direction) => {
    const container = carouselRef.current;
    if (!container) return;
    
    const cardWidth = container.querySelector('.carousel-card')?.offsetWidth ?? 320;
    const scrollAmount = direction === 'left' ? -cardWidth : cardWidth;
    
    container.scrollTo({
      left: container.scrollLeft + scrollAmount,
      behavior: 'smooth'
    });
  };

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = carouselRef.current && 
    scrollPosition < (carouselRef.current.scrollWidth - carouselRef.current.clientWidth);

  const NavigationButton = ({ direction, onClick, disabled }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        absolute top-1/2 -translate-y-1/2
        ${direction === 'left' ? '-left-2' : '-right-2'}
        items-center justify-center
        p-2 rounded-full shadow-lg
        z-10
        transition-all duration-200
        ${disabled ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:scale-110'}
        ${isDarkMode
          ? 'bg-darkblue-dark text-tanish-dark hover:bg-darkblue-light'
          : 'bg-greenblack-light text-tanish-light hover:bg-darkblue-light'
        }
      `}
    >
      {direction === 'left' ? (
        <ChevronLeft className="w-6 h-6" />
      ) : (
        <ChevronRight className="w-6 h-6" />
      )}
    </button>
  );

  return (
    <div className="relative w-full px-8"> {/* Added padding to account for arrows */}
      <NavigationButton
        direction="left"
        onClick={() => scroll('left')}
        disabled={!canScrollLeft}
      />
      
      <div className="overflow-hidden">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide relative"
        >
          {announcements.map((announcement) => (
            <div
              key={announcement.ANNOUNCEMENT_ID || announcement.id}
              className="carousel-card flex-none w-[280px] sm:w-[320px] md:w-[384px] snap-start"
            >
              <AnnouncementCard
                announcement={announcement}
                onClick={() => onAnnouncementClick?.(announcement)}
                isMobile={false}
              />
            </div>
          ))}
        </div>
      </div>

      <NavigationButton
        direction="right"
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
      />
    </div>
  );
};

export default AnnouncementCarousel;