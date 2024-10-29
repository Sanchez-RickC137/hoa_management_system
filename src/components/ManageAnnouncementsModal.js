import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { apiService } from '../services/apiService';

// Confirmation Dialog Component
const DeleteConfirmationDialog = ({ onClose, onConfirm, announcement }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-6 rounded-lg shadow-lg max-w-md mx-4`}>
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
          <h3 className="text-xl font-bold">Confirm Deletion</h3>
        </div>
        <p className="mb-6">
          Are you sure you want to delete the {announcement.TYPE.toLowerCase()}: "{announcement.TITLE}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// Edit Announcement Form Component
const EditAnnouncementForm = ({ announcement, onSave, onCancel }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: announcement.TITLE,
    message: announcement.MESSAGE,
    type: announcement.TYPE,
    eventDate: announcement.EVENT_DATE ? new Date(announcement.EVENT_DATE).toISOString().split('T')[0] : '',
    eventTime: announcement.EVENT_DATE ? new Date(announcement.EVENT_DATE).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) : '',
    eventEndDate: announcement.EVENT_END_DATE ? new Date(announcement.EVENT_END_DATE).toISOString().split('T')[0] : '',
    eventEndTime: announcement.EVENT_END_DATE ? new Date(announcement.EVENT_END_DATE).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) : '',
    eventLocation: announcement.EVENT_LOCATION || '',
  });

  const [scheduling, setScheduling] = useState({
    isScheduled: announcement.STATUS === 'SCHEDULED',
    publishDate: announcement.PUBLISH_DATE ? new Date(announcement.PUBLISH_DATE).toISOString().split('T')[0] : '',
    publishTime: announcement.PUBLISH_DATE ? new Date(announcement.PUBLISH_DATE).toLocaleTimeString('en-US', { hour12: false }).slice(0, 5) : '',
    status: announcement.STATUS || 'PUBLISHED'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const eventDateTime = formData.eventDate && formData.eventTime 
        ? `${formData.eventDate}T${formData.eventTime}`
        : null;

      const eventEndDateTime = formData.eventEndDate && formData.eventEndTime
        ? `${formData.eventEndDate}T${formData.eventEndTime}`
        : null;

      const publishDateTime = scheduling.isScheduled && scheduling.publishDate && scheduling.publishTime
        ? `${scheduling.publishDate}T${scheduling.publishTime}`
        : null;

      await onSave({
        ...formData,
        eventDate: eventDateTime,
        eventEndDate: eventEndDateTime,
        publishDate: publishDateTime,
        status: scheduling.isScheduled ? 'SCHEDULED' : 'PUBLISHED',
        announcementId: announcement.ANNOUNCEMENT_ID
      });
    } catch (error) {
      console.error('Error saving announcement:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-2">Type</label>
        <select
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
        >
          <option value="ANNOUNCEMENT">Announcement</option>
          <option value="EVENT">Event</option>
        </select>
      </div>

      <div>
        <label className="block mb-2">Title</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
          required
        />
      </div>

      {formData.type === 'EVENT' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Event Date</label>
              <input
                type="date"
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Event Time</label>
              <input
                type="time"
                value={formData.eventTime}
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">End Date (Optional)</label>
              <input
                type="date"
                value={formData.eventEndDate}
                onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                min={formData.eventDate}
                className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
              />
            </div>
            <div>
              <label className="block mb-2">End Time (Optional)</label>
              <input
                type="time"
                value={formData.eventEndTime}
                onChange={(e) => setFormData({ ...formData, eventEndTime: e.target.value })}
                className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
              />
            </div>
          </div>

          <div>
            <label className="block mb-2">Location</label>
            <input
              type="text"
              value={formData.eventLocation}
              onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
              className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
              placeholder="Event location"
            />
          </div>
        </>
      )}

      <div>
        <label className="block mb-2">Message</label>
        <textarea
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`w-full p-2 rounded-lg h-32 ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
          required
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="schedule-post"
            checked={scheduling.isScheduled}
            onChange={(e) => setScheduling(prev => ({
              ...prev,
              isScheduled: e.target.checked,
              status: e.target.checked ? 'SCHEDULED' : 'PUBLISHED'
            }))}
            className="form-checkbox"
          />
          <label htmlFor="schedule-post">Schedule this announcement</label>
        </div>

        {scheduling.isScheduled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Publish Date</label>
              <input
                type="date"
                value={scheduling.publishDate}
                onChange={(e) => setScheduling(prev => ({
                  ...prev,
                  publishDate: e.target.value
                }))}
                min={new Date().toISOString().split('T')[0]}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                }`}
                required={scheduling.isScheduled}
              />
            </div>
            <div>
              <label className="block mb-2">Publish Time</label>
              <input
                type="time"
                value={scheduling.publishTime}
                onChange={(e) => setScheduling(prev => ({
                  ...prev,
                  publishTime: e.target.value
                }))}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                }`}
                required={scheduling.isScheduled}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const ManageAnnouncementsModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await apiService.getAnnouncements();
      setAnnouncements(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError('Failed to load announcements');
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      await apiService.updateAnnouncement(formData.announcementId, formData);
      await fetchAnnouncements();
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error updating announcement:', error);
      setError('Failed to update announcement');
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteAnnouncement(selectedAnnouncement.ANNOUNCEMENT_ID);
      await fetchAnnouncements();
      setShowDeleteConfirmation(false);
      setSelectedAnnouncement(null);
    } catch (error) {
      console.error('Error deleting announcement:', error);
      setError('Failed to delete announcement');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Announcements & Events</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading announcements...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : selectedAnnouncement ? (
          <div className="flex-1 overflow-y-auto">
            <EditAnnouncementForm
              announcement={selectedAnnouncement}
              onSave={handleSave}
              onCancel={() => setSelectedAnnouncement(null)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
  <div className="space-y-4">
    {announcements.map((announcement) => (
      <div
        key={announcement.ANNOUNCEMENT_ID}
        className={`p-4 rounded-lg transition-all duration-200 ${
          isDarkMode 
            ? `bg-mutedolive hover:bg-darkblue-dark group-hover:text-tanish-dark` 
            : `bg-palebluegrey hover:bg-greenblack-light hover:text-tanish-light`
        } cursor-pointer group`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded-full ${
                isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'
              }`}>
                {announcement.TYPE}
              </span>
              <span className={`text-sm opacity-75 ${
                isDarkMode 
                  ? 'text-darkolive group-hover:text-tanish-dark' 
                  : 'text-darkblue-light group-hover:text-tanish-light'
              }`}>
                {formatDate(announcement.CREATED)}
              </span>
            </div>
            <h3 className={`text-lg font-semibold mb-2 ${
              isDarkMode 
                ? 'text-darkolive group-hover:text-tanish-dark' 
                : 'text-darkblue-light group-hover:text-tanish-light'
            }`}>
              {announcement.TITLE}
            </h3>
            <p className={`text-sm line-clamp-2 ${
              isDarkMode 
                ? 'text-darkolive group-hover:text-tanish-dark' 
                : 'text-darkblue-light group-hover:text-tanish-light'
            }`}>
              {announcement.MESSAGE}
            </p>
          </div>
          <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => setSelectedAnnouncement(announcement)}
              className={`p-2 rounded-lg hover:bg-opacity-80 ${
                isDarkMode ? 'text-darkolive group-hover:text-tanish-dark' : ''
              }`}
            >
              <Edit size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedAnnouncement(announcement);
                setShowDeleteConfirmation(true);
              }}
              className="p-2 rounded-lg hover:bg-opacity-80 text-red-500"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>
        )}
      </div>

      {showDeleteConfirmation && (
        <DeleteConfirmationDialog
          announcement={selectedAnnouncement}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setSelectedAnnouncement(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default ManageAnnouncementsModal;