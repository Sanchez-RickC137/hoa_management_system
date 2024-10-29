import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const MessageViewer = ({ message, onClose, onReply, currentUserId, isMobileView }) => {
  const { isDarkMode } = useTheme();
  const isSystemMessage = message.SENDER_ID === 999999999;

  return (
    <div className="h-full flex flex-col">
      {!isMobileView && (
        <div className="flex justify-end p-3 border-b">
          <button
            onClick={onClose}
            className={`p-1 rounded-full hover:bg-opacity-20 ${
              isDarkMode ? 'hover:bg-darkblue-dark' : 'hover:bg-lightgray'
            }`}
          >
            <X size={20} />
          </button>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-3">
        <div className={`rounded-lg shadow-lg ${
          isDarkMode 
            ? 'bg-darkblue-dark bg-opacity-40' 
            : 'bg-lightgray bg-opacity-40'
        }`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                {!isSystemMessage && (
                  message.SENDER_ID === currentUserId ? (
                    <ArrowUpRight size={18} className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
                  ) : (
                    <ArrowDownLeft size={18} className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
                  )
                )}
                <span className={`font-medium ${
                  isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                }`}>
                  {isSystemMessage
                    ? 'System Message'
                    : message.SENDER_ID === currentUserId
                      ? `To: ${message.RECEIVER_NAME}`
                      : `From: ${message.SENDER_NAME}`
                  }
                </span>
              </div>
              <span className={`text-sm ${
                isDarkMode ? 'text-tanish-dark opacity-75' : 'text-darkblue-light opacity-75'
              }`}>
                {new Date(message.CREATED).toLocaleString()}
              </span>
            </div>
            
            <div className={`break-words mb-4 ${
              isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
            }`}>
              {message.MESSAGE}
            </div>

            {!isSystemMessage && (
              <div className={isMobileView ? 'border-t pt-3 mt-3' : ''}>
                <button
                  onClick={() => onReply(message.MESSAGE_ID)}
                  className={`
                    ${isMobileView ? 'w-full py-2' : 'px-4 py-1.5'}
                    rounded-lg text-sm
                    ${isDarkMode
                      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
                      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                    }
                  `}
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageViewer;