import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Calendar, Clock, MapPin, Download } from 'lucide-react';
import ImageDisplay from './ImageDisplay';

const AnnouncementModal = ({ announcement, onClose }) => {
  const { isDarkMode } = useTheme();
  const isEvent = announcement.TYPE === 'EVENT';

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  };


  const imageUrl = announcement.FILE_BLOB
  ? `data:${announcement.FILE_MIME};base64,${announcement.FILE_BLOB}`
  : null;


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`relative w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col ${
        isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'
      } rounded-lg shadow-lg`}>
        {/* Header */}
        <div className="p-4 border-b sticky top-0 z-10 bg-inherit">
          <div className="flex justify-between items-center">
            <h2 className={`text-xl font-bold ${
              isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
            }`}>
              {announcement.TITLE}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 rounded-full hover:bg-opacity-80"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center mt-2 text-sm opacity-75">
            <span className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{announcement.TYPE}</span>
            <span className={`mx-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>•</span>
            <span className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{new Date(announcement.CREATED).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {announcement.FILE_BLOB && (
            <div className="mb-4 max-h-[300px] overflow-hidden rounded-lg">
              <ImageDisplay
                imageData={announcement.FILE_BLOB}
                mimeType={announcement.FILE_MIME}
                altText={announcement.TITLE}
              />
            </div>
          )}

          {/* Event Details if applicable */}
          {announcement.TYPE === 'EVENT' && (
            <div className={`mb-4 p-4 rounded-lg ${
              isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'
            }`}>
              <div className="flex items-center mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                <span>{new Date(announcement.EVENT_DATE).toLocaleString()}</span>
              </div>
              {announcement.EVENT_LOCATION && (
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span>{announcement.EVENT_LOCATION}</span>
                </div>
              )}
            </div>
          )}

          {/* Message Content */}
          <div className={`whitespace-pre-wrap ${
            isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
          }`}>
            {announcement.MESSAGE}
          </div>
        </div>
      </div>
    </div>
  );
};


export default AnnouncementModal;