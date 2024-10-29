import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { apiService } from '../services/apiService';
import AnnouncementCarousel from '../components/AnnouncementCarousel';
import AnnouncementCalendar from '../components/AnnouncementCalendar';
import AnnouncementModal from '../components/AnnouncementModal';
import CreateAnnouncementModal from '../components/CreateAnnouncementModal';

const AnnouncementsNews = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  const { isDarkMode } = useTheme();
  const { user, isBoardMember } = useAuth();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnnouncements();
      setAnnouncements(response || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements. Please try again later.');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  // Handler for when an announcement is clicked
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  // Handler for successful announcement creation
  const handleCreateSuccess = async () => {
    setShowCreateModal(false);
    await fetchAnnouncements(); // Refresh the announcements list
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-greenblack-dark text-tanish-dark' : 'bg-tanish-light text-darkblue-light'
      }`}>
        Loading announcements...
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 md:p-6 flex flex-col ${
      isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'
    } rounded-lg shadow-lg`}>
      {/* Header Section - Centered title with responsive button placement */}
      <div className="mb-8 mt-16 md:mt-0 flex flex-col md:flex-row md:justify-between items-center gap-4">
        <h1 className={`text-3xl font-bold text-center ${
          isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
        }`}>
          Announcements & Events
        </h1>
        {isBoardMember() && (
          <button
            onClick={() => setShowCreateModal(true)}
            className={`flex items-center px-4 py-2 rounded-lg w-full md:w-auto justify-center ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            New Announcement
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-500 mb-4 p-4 rounded-lg bg-red-100">
          {error}
        </div>
      )}

      {/* Carousel Section - Vertical on mobile */}
      <div className={`mb-8 p-4 md:p-6 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'
      }`}>
        <h2 className={`text-2xl text-center font-semibold mb-4 ${
          isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
        }`}>
          Recent Announcements
        </h2>
        <div className="w-full">
          <AnnouncementCarousel 
            announcements={announcements}
            onAnnouncementClick={handleAnnouncementClick}
            isMobile={windowWidth < 768}
          />
        </div>
      </div>

      {/* Calendar Section */}
      <div className={`p-4 md:p-6 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'
      }`}>
        <AnnouncementCalendar 
          announcements={announcements}
          onEventClick={handleAnnouncementClick}
        />
      </div>

      {/* Modals */}
      {selectedAnnouncement && (
        <AnnouncementModal
          announcement={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}

      {showCreateModal && (
        <CreateAnnouncementModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};

export default AnnouncementsNews;