import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Message = ({ message, onSelect, currentUserId, isMobileView, isSelected }) => {
  const { isDarkMode } = useTheme();
  const isSystemMessage = message.SENDER_ID === 999999999;

  return (
    <div
      onClick={() => onSelect(message)}
      className={`
        px-3 py-2.5
        cursor-pointer
        ${isDarkMode 
          ? isSelected
            ? 'bg-darkblue-dark bg-opacity-40'
            : 'hover:bg-darkblue-dark hover:bg-opacity-20' 
          : isSelected
            ? 'bg-lightgray bg-opacity-40'
            : 'hover:bg-lightgray hover:bg-opacity-20'
        }
      `}
    >
      <div className="flex flex-col">
        <div className="flex justify-between items-baseline mb-1">
          <div className="flex items-center gap-2">
            {!isSystemMessage && (
              message.SENDER_ID === currentUserId ? (
                <ArrowUpRight size={16} className={isDarkMode ? 'text-tanish-dark shrink-0' : 'text-darkblue-light shrink-0'} />
              ) : (
                <ArrowDownLeft size={16} className={isDarkMode ? 'text-tanish-dark shrink-0' : 'text-darkblue-light shrink-0'} />
              )
            )}
            <span className={`font-medium truncate ${
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
          <span className={`text-xs shrink-0 ml-2 ${
            isDarkMode ? 'text-tanish-dark opacity-75' : 'text-darkblue-light opacity-75'
          }`}>
            {new Date(message.CREATED).toLocaleString()}
          </span>
        </div>
        <p className={`text-sm truncate ml-6 ${
          isDarkMode ? 'text-tanish-dark opacity-75' : 'text-darkblue-light opacity-75'
        }`}>
          {message.MESSAGE}
        </p>
      </div>
    </div>
  );
};

export default Message;