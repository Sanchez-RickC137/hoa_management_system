import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Edit, Trash2, AlertTriangle, FileText, Download } from 'lucide-react';
import { apiService } from '../services/apiService';

// Confirmation Dialog Component - Same structure as announcements
const DeleteConfirmationDialog = ({ onClose, onConfirm, document }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-6 rounded-lg shadow-lg max-w-md mx-4`}>
        <div className="flex items-center mb-4">
          <AlertTriangle className="w-6 h-6 mr-2 text-red-500" />
          <h3 className="text-xl font-bold">Confirm Deletion</h3>
        </div>
        <p className="mb-6">
          Are you sure you want to delete the document: "{document.FILE_NAME}"? This action cannot be undone.
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

// Edit Document Form Component
const EditDocumentForm = ({ document, onSave, onCancel }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    title: document.FILE_NAME?.split('.').slice(0, -1).join('.') || '',
    description: document.DESCRIPTION || '',
    file: null
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('description', formData.description);
      if (formData.file) {
        formPayload.append('file', formData.file);
      }
      
      await onSave(document.DOCUMENT_ID, formPayload);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
        <label className="block mb-2">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`w-full p-2 rounded-lg h-32 ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
          required
        />
      </div>

      <div>
        <label className="block mb-2">Replace File (Optional)</label>
        <input
          type="file"
          onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex items-center px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
              : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
          }`}
        >
          <FileText className="w-5 h-5 mr-2" />
          Choose New File
        </label>
        {formData.file && <p className="mt-2">{formData.file.name}</p>}
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

const ManageDocumentsModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [documents, setDocuments] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await apiService.getDocuments();
      setDocuments(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents');
      setLoading(false);
    }
  };

  const handleSave = async (documentId, formData) => {
    try {
      await apiService.updateDocument(documentId, formData);
      await fetchDocuments();
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error updating document:', error);
      setError('Failed to update document');
    }
  };

  const handleDelete = async () => {
    try {
      await apiService.deleteDocument(selectedDocument.DOCUMENT_ID);
      await fetchDocuments();
      setShowDeleteConfirmation(false);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Error deleting document:', error);
      setError('Failed to delete document');
    }
  };

  const handleDownload = async (document) => {
    try {
      await apiService.downloadDocument(document.DOCUMENT_ID);
    } catch (error) {
      console.error('Error downloading document:', error);
      setError('Failed to download document');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Documents</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading documents...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : selectedDocument ? (
          <div className="flex-1 overflow-y-auto">
            <EditDocumentForm
              document={selectedDocument}
              onSave={handleSave}
              onCancel={() => setSelectedDocument(null)}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {documents.map((document) => (
                <div
                key={document.DOCUMENT_ID}
                className={`p-4 rounded-lg transition-colors duration-200 ${
                  isDarkMode 
                    ? 'bg-mutedolive hover:bg-darkblue-dark' 
                    : 'bg-palebluegrey hover:bg-greenblack-light'
                } cursor-pointer group`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light'
                      }`}>
                        {document.CATEGORY}
                      </span>
                      <span className={`text-sm opacity-75 ${
                        isDarkMode 
                          ? 'text-darkolive group-hover:text-tanish-dark' 
                          : 'text-darkblue-light group-hover:text-tanish-light'
                      }`}>
                        {formatDate(document.CREATED)}
                      </span>
                    </div>
                    <h3 className={`text-lg font-semibold mb-2 ${
                      isDarkMode 
                        ? 'text-darkolive group-hover:text-tanish-dark' 
                        : 'text-darkblue-light group-hover:text-tanish-light'
                    }`}>
                      {document.FILE_NAME}
                    </h3>
                    <p className={`text-sm line-clamp-2 ${
                      isDarkMode 
                        ? 'text-darkolive group-hover:text-tanish-dark' 
                        : 'text-darkblue-light group-hover:text-tanish-light'
                    }`}>
                      {document.DESCRIPTION}
                    </p>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleDownload(document)}
                      className={`p-2 rounded-lg hover:bg-opacity-80 ${
                        isDarkMode ? 'text-darkolive group-hover:text-tanish-dark' : ''
                      }`}
                    >
                      <Download size={20} />
                    </button>
                    <button
                      onClick={() => setSelectedDocument(document)}
                      className={`p-2 rounded-lg hover:bg-opacity-80 ${
                        isDarkMode ? 'text-darkolive group-hover:text-tanish-dark' : ''
                      }`}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDocument(document);
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
          document={selectedDocument}
          onClose={() => {
            setShowDeleteConfirmation(false);
            setSelectedDocument(null);
          }}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default ManageDocumentsModal;