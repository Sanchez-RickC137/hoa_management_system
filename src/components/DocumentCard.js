import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { FileText, Calendar, Download } from 'lucide-react';

const DocumentCard = ({ document, onClick, viewType = 'grid' }) => {
  const { isDarkMode } = useTheme();
  const formatDate = (date) => new Date(date).toLocaleDateString();
  const formatFileSize = (blob) => {
    if (!blob) return 'N/A';
    const bytes = blob.length;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (viewType === 'list') {
    return (
      <div 
        onClick={() => onClick(document)}
        className={`flex items-center justify-between p-4 cursor-pointer ${
          isDarkMode ? 'hover:bg-darkblue-dark' : 'hover:bg-palebluegrey'
        } rounded-lg transition-colors duration-200`}
      >
        <div className="flex items-center space-x-4">
          <FileText className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
          <div>
            <h3 className={`font-semibold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              {document.TITLE}
            </h3>
            <p className={`text-sm opacity-75 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{document.DESCRIPTION}</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <span className={`text-sm ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{formatDate(document.CREATED)}</span>
          <span className={`text-sm ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{formatFileSize(document.FILE_BLOB)}</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick(document)}
      className={`p-4 rounded-lg shadow-lg cursor-pointer ${
        isDarkMode ? 'bg-greenblack-light hover:bg-darkblue-dark' : 'bg-oldlace hover:bg-palebluegrey'
      } transition-colors duration-200`}
    >
      <div className="flex items-center justify-between mb-4">
        <FileText size={24} className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
        <span className={`text-sm ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
          {document.CATEGORY}
        </span>
      </div>
      <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
        {document.TITLE}
      </h3>
      <p className={`text-sm mb-4 line-clamp-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
        {document.DESCRIPTION}
      </p>
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center">
          <Calendar size={16} className={`mr-1 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`} />
          <span className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{formatDate(document.CREATED)}</span>
        </div>
        <span className={`${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>{formatFileSize(document.FILE_BLOB)}</span>
      </div>
    </div>
  );
};

export default DocumentCard;