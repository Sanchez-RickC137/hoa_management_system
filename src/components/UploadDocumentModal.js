import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Upload } from 'lucide-react';
import { apiService } from '../services/apiService';

const DOCUMENT_CATEGORIES = [
  'Governing Documents',
  'Meeting Minutes',
  'Financial Reports',
  'Forms',
  'Newsletters',
  'Other'
];

const UploadDocumentModal = ({ onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
  
    try {
      const formPayload = new FormData();
      
      if (file) {
        formPayload.append('file', file);
      }
      
      Object.keys(formData).forEach(key => {
        formPayload.append(key, formData[key]);
      });
  
      await apiService.uploadDocument(formPayload);
      onSuccess();
    } catch (err) {
      console.error('Error uploading document:', err);
      setError(err.response?.data?.error || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const allowedFileTypes = `
    .doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt
    `;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`relative w-full max-w-2xl mx-4 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'
      }`}>
        <div className="flex justify-between items-center p-6 border-b border-opacity-20">
          <h2 className={`text-2xl font-bold ${
            isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
          }`}>
            Upload Document
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-opacity-80">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full p-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className={`w-full p-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              }`}
              required
            >
              <option value="">Select a category</option>
              {DOCUMENT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={`w-full p-2 rounded-lg h-32 ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              }`}
              required
            />
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>File</label>
            <div className="flex flex-col gap-2">
              <input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept={allowedFileTypes}
              required
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
              <p className={`text-sm ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Allowed file types: Microsoft Office documents (.doc, .docx, .xls, .xlsx, .ppt, .pptx), 
              PDF files (.pdf), and text files (.txt)
              </p>
              {file && (
              <div className="flex items-center gap-2">
                <span>{file.name}</span>
                <button
                type="button"
                onClick={() => setFile(null)}
                className="text-red-500 hover:text-red-700"
                >
                <X className="w-4 h-4" />
                </button>
              </div>
              )}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">
              {error}
            </div>
          )}

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
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;