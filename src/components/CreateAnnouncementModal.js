import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Upload } from 'lucide-react';
import { apiService } from '../services/apiService';

const CreateAnnouncementModal = ({ onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'EVENT',
    eventDate: '',
    eventTime: '',
    eventEndDate: '',
    eventEndTime: '',
    eventLocation: ''
  });
  const [scheduling, setScheduling] = useState({
    isScheduled: false,
    publishDate: '',
    publishTime: '',
    status: 'PUBLISHED'
  });


  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      console.log('File selected:', selectedFile);
      setFile(selectedFile);
      
      // Create preview if it's an image
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const formPayload = new FormData();
      
      // Log the file before appending
      console.log('Current file:', file);
      
      // Add file first
      if (file) {
        formPayload.append('file', file, file.name);
        console.log('File appended to FormData:', file.name);
      }
      
      // Add other fields
      formPayload.append('title', formData.title);
      formPayload.append('message', formData.message);
      formPayload.append('type', formData.type);
  
      if (formData.type === 'EVENT') {
        if (formData.eventDate && formData.eventTime) {
          const eventDateTime = `${formData.eventDate}T${formData.eventTime}`;
          formPayload.append('eventDate', eventDateTime);
        }
        
        if (formData.eventLocation) {
          formPayload.append('eventLocation', formData.eventLocation);
        }
      }

      if (scheduling.isScheduled) {
        const publishDateTime = `${scheduling.publishDate}T${scheduling.publishTime}`;
        formPayload.append('publishDate', publishDateTime);
        formPayload.append('status', 'SCHEDULED');
      } else {
        formPayload.append('status', 'PUBLISHED');
        formPayload.append('publishDate', new Date().toISOString());
      }
  
      // Debug log FormData contents
      for (let pair of formPayload.entries()) {
        console.log('FormData entry:', pair[0], pair[1] instanceof File ? 'File: ' + pair[1].name : pair[1]);
      }
  
      const response = await apiService.createAnnouncement(formPayload);
      console.log('Announcement creation response:', response);
      onSuccess();
    } catch (err) {
      console.error('Error creating announcement:', err);
      setError(err.response?.data?.error || 'Failed to create announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderSchedulingControls = () => (
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
        <label htmlFor="schedule-post" className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Schedule this announcement</label>
      </div>

      {scheduling.isScheduled && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Publish Date</label>
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
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Publish Time</label>
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
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative w-full max-w-2xl mx-4 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-opacity-20">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
          }`}>
            Create New Announcement
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-80 ${
              isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                }`}
              >
                <option value="EVENT">Event</option>
                <option value="ANNOUNCEMENT">Announcement</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                }`}
              />
            </div>
          </div>

          {/* Event Details */}
          {formData.type === 'EVENT' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                    }`}
                    required
                  />
                </div>
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Event Time</label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                    }`}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>End Date (Optional)</label>
                  <input
                    type="date"
                    name="eventEndDate"
                    value={formData.eventEndDate}
                    onChange={handleInputChange}
                    min={formData.eventDate}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                    }`}
                  />
                </div>
                <div>
                  <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>End Time (Optional)</label>
                  <input
                    type="time"
                    name="eventEndTime"
                    value={formData.eventEndTime}
                    onChange={handleInputChange}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Location</label>
                <input
                  type="text"
                  name="eventLocation"
                  value={formData.eventLocation}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                  }`}
                  placeholder="Event location"
                />
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Message</label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              className={`w-full p-2 rounded-lg h-16... ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              }`}
              required
            />
          </div>

          {/* File Upload */}
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Attachment (Optional)</label>
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept="image/*"
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                }`}
              >
                <Upload className="w-5 h-5 mr-2" />
                Choose File
              </label>

              {file && (
                <div className="flex items-center gap-2">
                  <span className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}>
                    {file.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setFilePreview(null);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {filePreview && (
                <div className="mt-2 rounded-lg overflow-hidden">
                  <img
                    src={filePreview}
                    alt="Preview"
                    className="max-h-48 w-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

          {/* Scheduling Controls */}
          {renderSchedulingControls()}

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              }`}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              }`}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAnnouncementModal;