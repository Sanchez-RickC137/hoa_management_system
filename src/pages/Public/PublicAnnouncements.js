import React, { useState, useEffect } from 'react';
import { AlertCircle, Calendar, MapPin } from 'lucide-react';
import { FourSquare } from 'react-loading-indicators';
import { useTheme } from '../../contexts/ThemeContext';
import { apiService } from '../../services/apiService';
import ImageDisplay from '../../components/ImageDisplay';
import CardImageDark from '../../assets/images/AnnouncementNull.png'
import CardImageLight from '../../assets/images/AnnouncementNullLight.png'

const PublicAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const response = await apiService.getAnnouncements();
        // Only take the 3 most recent announcements
        setAnnouncements(response.slice(0, 3));
        setLoading(false);
      } catch (err) {
        setError('Failed to load announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return (
      <div className={`flex min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'}`}>
        <div className="flex-1 flex items-center justify-center">
          {isDarkMode && (<FourSquare color='#D6C6B0' size="large" text="Loading" textColor="#D6C6B0"/>)}
          {!isDarkMode && (<FourSquare color='#2A3A4A' size="large" text="Loading" textColor="#2A3A4A"/>)}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500 flex items-center">
          <AlertCircle className="mr-2" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} rounded-lg shadow-lg`}>
      <div className="container mx-auto px-4 py-12">
        <h1 className={`text-4xl font-bold mb-8 text-center ${
          isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
        }`}>
          Latest Community Updates
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {announcements.map((announcement) => (
            <div
              key={announcement.ANNOUNCEMENT_ID}
              className={`rounded-lg shadow-lg overflow-hidden ${
                isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'
              }`}
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

              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                    isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'
                  }`}>
                    {announcement.TYPE}
                  </span>
                  <span className={`text-sm ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
                    {new Date(announcement.CREATED).toLocaleDateString()}
                  </span>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${
                  isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                }`}>
                  {announcement.TITLE}
                </h3>

                {announcement.EVENT_DATE && (
                  <div className={`flex items-center mb-2 ${
                    isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                  }`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(announcement.EVENT_DATE).toLocaleString()}
                  </div>
                )}

                {announcement.EVENT_LOCATION && (
                  <div className={`flex items-center mb-2 ${
                    isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                  }`}>
                    <MapPin className="w-4 h-4 mr-2" />
                    {announcement.EVENT_LOCATION}
                  </div>
                )}

                <p className={`mt-2 line-clamp-3 ${
                  isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                }`}>
                  {announcement.MESSAGE}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicAnnouncements;