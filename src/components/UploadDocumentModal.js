import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Upload, AlertCircle } from 'lucide-react';
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
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
  });
  const [touched, setTouched] = useState({});

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!file) {
      newErrors.file = 'Please select a file to upload';
    }

    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);
    
    if (Object.keys(formErrors).length > 0) {
      // Mark all fields as touched when attempting to submit
      const allTouched = Object.keys(formData).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, { file: true });
      setTouched(allTouched);
      return;
    }

    setLoading(true);
    
    try {
      const formPayload = new FormData();
      
      if (file) {
        formPayload.append('file', file);
      }
      
      Object.keys(formData).forEach(key => {
        formPayload.append(key, formData[key].trim());
      });
  
      await apiService.uploadDocument(formPayload);
      onSuccess();
    } catch (err) {
      console.error('Error uploading document:', err);
      setErrors({ submit: err.response?.data?.error || 'Failed to upload document' });
    } finally {
      setLoading(false);
    }
  };

  const allowedFileTypes = `.doc,.docx,.xls,.xlsx,.ppt,.pptx,.pdf,.txt`;

  const FormField = ({ label, error, touched, children }) => (
    <div>
      <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
        {label} <span className="text-red-500">*</span>
      </label>
      {children}
      {touched && error && (
        <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
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
            Upload Document
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-opacity-80">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField 
            label="Title" 
            error={errors.title} 
            touched={touched.title}
          >
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              onBlur={() => handleBlur('title')}
              className={`w-full p-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              } ${touched.title && errors.title ? 'border-2 border-red-500' : ''}`}
            />
          </FormField>

          <FormField 
            label="Category" 
            error={errors.category} 
            touched={touched.category}
          >
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              onBlur={() => handleBlur('category')}
              className={`w-full p-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              } ${touched.category && errors.category ? 'border-2 border-red-500' : ''}`}
            >
              <option value="">Select a category</option>
              {DOCUMENT_CATEGORIES.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </FormField>

          <FormField 
            label="Description" 
            error={errors.description} 
            touched={touched.description}
          >
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              onBlur={() => handleBlur('description')}
              className={`w-full p-2 rounded-lg h-32 ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              } ${touched.description && errors.description ? 'border-2 border-red-500' : ''}`}
            />
          </FormField>

          <FormField 
            label="File" 
            error={errors.file} 
            touched={touched.file}
          >
            <div className="flex flex-col gap-2">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                accept={allowedFileTypes}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                } ${touched.file && errors.file ? 'border-2 border-red-500' : ''}`}
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
          </FormField>

          {errors.submit && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{errors.submit}</span>
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