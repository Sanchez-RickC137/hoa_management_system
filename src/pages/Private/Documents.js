import React, { useState, useEffect } from 'react';
import { FourSquare } from 'react-loading-indicators';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Plus, Grid, List, ArrowUp, ArrowDown } from 'lucide-react';
import { apiService } from '../../services/apiService';
import DocumentCard from '../../components/DocumentCard';
import UploadDocumentModal from '../../components/UploadDocumentModal';
import ImageDisplay from '../../components/ImageDisplay';
import Sidebar from '../../components/layout/Sidebar';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [viewType, setViewType] = useState('grid');
  const [sortConfig, setSortConfig] = useState({ field: 'CREATED', direction: 'desc' });
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();
  const { user, isBoardMember } = useAuth();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiService.getDocuments();
      setDocuments(response || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    setSortConfig(prevConfig => ({
      field,
      direction: 
        prevConfig.field === field && prevConfig.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    const direction = sortConfig.direction === 'asc' ? 1 : -1;
    if (sortConfig.field === 'TITLE') {
      return direction * a.TITLE.localeCompare(b.TITLE);
    }
    return direction * (new Date(a.CREATED) - new Date(b.CREATED));
  });

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    fetchDocuments();
  };

  const handleDocumentClick = (document) => {
    setSelectedDocument(document);
  };

  const DocumentModal = ({ document, onClose }) => {
    const handleDownload = () => {
      // Logic to handle document download
      const fileUrl = `data:${document.FILE_MIME};base64,${document.FILE_BLOB}`;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = document.FILE_NAME;
      link.click();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`relative w-full max-w-2xl mx-4 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'
        } p-6`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className={`text-2xl font-bold ${
              isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
            }`}>{document.TITLE}</h2>
            <button onClick={onClose} className="text-2xl">&times;</button>
          </div>
          
          <div className={`mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            <p className="mb-2">{document.DESCRIPTION}</p>
            <p className="text-sm">Uploaded on: {new Date(document.CREATED).toLocaleDateString()}</p>
          </div>

          <div className="flex justify-between items-center">
            <p className={`text-sm ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>File: {document.FILE_NAME}</p>
            <button
              onClick={handleDownload}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              }`}
            >
              Download
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`flex min-h-screen ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'}`}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          {isDarkMode && (<FourSquare color='#D6C6B0' size="large" text="Loading" textColor="#D6C6B0"/>)}
          {!isDarkMode && (<FourSquare color='#2A3A4A' size="large" text="Loading" textColor="#2A3A4A"/>)}
        </div>
      </div>
    );
  }


  return (
    <div className={`min-h-screen p-4 sm:p-6 pt-16 sm:pt-6 ${
      isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'
    } rounded-lg shadow-lg`}>
      {/* Desktop Header */}
      <div className="hidden sm:flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold ${
          isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
        }`}>
          Documents
        </h1>
        <div className="flex items-center space-x-4">
          <div className={`flex space-x-2 p-1 rounded-lg ${
            isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'
          }`}>
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded ${viewType === 'grid' ? 
                (isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light') 
                : ''
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded ${viewType === 'list' ? 
                (isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light') 
                : ''
              }`}
            >
              <List size={20} />
            </button>
          </div>
          {isBoardMember() && (
            <button
              onClick={() => setShowUploadModal(true)}
              className={`flex items-center px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              }`}
            >
              <Plus size={20} className="mr-2" />
              Upload Document
            </button>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="sm:hidden space-y-4">
        <div className="flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
          }`}>
            Documents
          </h1>
          
          <div className={`flex items-center space-x-2 p-1 rounded-lg ${
            isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'
          }`}>
            <button
              onClick={() => setViewType('grid')}
              className={`p-2 rounded ${viewType === 'grid' ? 
                (isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light') 
                : ''
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewType('list')}
              className={`p-2 rounded ${viewType === 'list' ? 
                (isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-greenblack-light text-tanish-light') 
                : ''
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>

        {isBoardMember() && (
          <button
            onClick={() => setShowUploadModal(true)}
            className={`w-full flex items-center justify-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            <Plus size={20} className="mr-2" />
            Upload Document
          </button>
        )}
      </div>

      {error && (
        <div className="text-red-500 mb-4 p-4 rounded-lg bg-red-100">
          {error}
        </div>
      )}

      {/* Document list/grid view */}
      <div className="mt-6">
        {viewType === 'list' ? (
          <div className={`rounded-lg shadow-lg ${
            isDarkMode ? 'bg-greenblack-light' : 'bg-oldlace'
          }`}>
            <div className="flex items-center justify-between p-4 border-b border-opacity-20">
              <button
                onClick={() => handleSort('TITLE')}
                className="flex items-center space-x-2"
              >
                <span className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Title</span>
                {sortConfig.field === 'TITLE' && (
                  sortConfig.direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />
                )}
              </button>
              <button
                onClick={() => handleSort('CREATED')}
                className="flex items-center space-x-2"
              >
                <span className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Date</span>
                {sortConfig.field === 'CREATED' && (
                  sortConfig.direction === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}/>
                )}
              </button>
            </div>
            <div className="divide-y divide-opacity-20">
              {sortedDocuments.map((document) => (
                <DocumentCard
                  key={document.DOCUMENT_ID}
                  document={document}
                  onClick={handleDocumentClick}
                  viewType="list"
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedDocuments.map((document) => (
              <DocumentCard
                key={document.DOCUMENT_ID}
                document={document}
                onClick={handleDocumentClick}
                viewType="grid"
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
        />
      )}

      {selectedDocument && (
        <DocumentModal
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
};

export default Documents;