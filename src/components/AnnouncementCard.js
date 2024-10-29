import React from 'react';
import ImageDisplay from './ImageDisplay';
import { useTheme } from '../contexts/ThemeContext';
import CardImageDark from '../assets/images/AnnouncementNull.png'
import CardImageLight from '../assets/images/AnnouncementNullLight.png'

const AnnouncementCard = ({ announcement, onClick }) => {
  const { isDarkMode } = useTheme();

  return (
    <div 
      onClick={() => onClick?.(announcement)}
      className={`
        w-full h-[400px] sm:h-[450px] lg:h-[500px]
        flex flex-col 
        bg-white rounded-lg shadow-lg overflow-hidden 
        cursor-pointer 
        transition-transform duration-200 hover:scale-[1.02]
        ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'}
      `}
    >
      {/* Image container with fixed height */}
      <div className="h-48 sm:h-56 lg:h-64 w-full relative">
        {announcement.FILE_BLOB ? (
          <ImageDisplay 
            imageData={announcement.FILE_BLOB}
            mimeType={announcement.FILE_MIME}
            altText={announcement.TITLE}
          />
        ) : (
          <div className={`
            w-full h-full 
            ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'} 
            flex items-center justify-center
          `}>
          {isDarkMode ? (
            <img src={CardImageLight} alt="Summit Ridge Logo" className="w-full h-full"></img>
          ) : (
            <img src={CardImageDark} alt="Summit Ridge Logo" className="w-full h-full"></img>
          )}
            
          </div>
        )}
      </div>

      {/* Content section */}
      <div className="flex-1 p-3 sm:p-4 lg:p-5 overflow-y-auto">
        <div className="flex justify-between items-start mb-2">
          <span className={`
            inline-block px-2 py-1 text-xs font-semibold rounded-full
            ${isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'}
          `}>
            {announcement.TYPE}
          </span>
          <span className={`text-xs ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            {new Date(announcement.CREATED).toLocaleDateString()}
          </span>
        </div>

        <h3 className={`
          text-lg font-semibold mb-2 line-clamp-2
          ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}
        `}>
          {announcement.TITLE}
        </h3>

        {announcement.EVENT_DATE && (
          <div className={`text-sm mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            {new Date(announcement.EVENT_DATE).toLocaleDateString()}
            {announcement.EVENT_END_DATE && (
              <> - {new Date(announcement.EVENT_END_DATE).toLocaleDateString()}</>
            )}
          </div>
        )}

        {announcement.EVENT_LOCATION && (
          <p className={`text-sm mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            📍 {announcement.EVENT_LOCATION}
          </p>
        )}

        {announcement.MESSAGE && (
          <p className={`
            text-sm line-clamp-3
            ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}
          `}>
            {announcement.MESSAGE}
          </p>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;