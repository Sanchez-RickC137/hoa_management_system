import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, ArrowDownLeft, ArrowUpRight, CornerDownRight } from 'lucide-react';

const MessageDetail = ({ message, thread, onClose, onReply, currentUserId, isMobileView }) => {
  const { isDarkMode } = useTheme();

  const buildMessageTree = (messages) => {
    const messageMap = new Map(messages.map(msg => [msg.MESSAGE_ID, { ...msg, children: [] }]));
    const rootMessages = [];

    messages.forEach(msg => {
      if (msg.PARENT_MESSAGE_ID === null) {
        rootMessages.push(messageMap.get(msg.MESSAGE_ID));
      } else {
        const parent = messageMap.get(msg.PARENT_MESSAGE_ID);
        if (parent) {
          parent.children.push(messageMap.get(msg.MESSAGE_ID));
        }
      }
    });

    return rootMessages;
  };

  const renderMessageTree = (msg, level = 0) => (
    <div key={msg.MESSAGE_ID} className="relative">
      <div 
        className={`mb-3 ${level > 0 ? 'ml-6' : ''}`}
        style={{
          borderLeft: level > 0 ? `2px solid ${isDarkMode ? '#354856' : '#D6C6B0'}` : 'none',
        }}
      >
        {level > 0 && (
          <div className="absolute -left-[1px] top-4 -ml-3">
            <CornerDownRight size={16} className={isDarkMode ? 'text-darkblue-light' : 'text-tanish-dark'} />
          </div>
        )}
        
        <div className={`rounded-lg shadow-lg overflow-hidden ${
          isDarkMode 
            ? msg.SENDER_ID === currentUserId 
              ? 'bg-darkblue-dark bg-opacity-40' 
              : 'bg-greenblack-light bg-opacity-40'
            : msg.SENDER_ID === currentUserId 
              ? 'bg-lightgray bg-opacity-40' 
              : 'bg-mutedbeige bg-opacity-40'
        }`}>
          <div className="p-3">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2 min-w-0">
                {msg.SENDER_ID === currentUserId ? (
                  <ArrowUpRight size={16} className={isDarkMode ? 'text-tanish-dark shrink-0' : 'text-darkblue-light shrink-0'} />
                ) : (
                  <ArrowDownLeft size={16} className={isDarkMode ? 'text-tanish-dark shrink-0' : 'text-darkblue-light shrink-0'} />
                )}
                <span className={`font-medium truncate ${
                  isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
                }`}>
                  {msg.SENDER_ID === 999999999 
                    ? 'System Message'
                    : msg.SENDER_ID === currentUserId 
                      ? `To: ${msg.RECEIVER_NAME}`
                      : `From: ${msg.SENDER_NAME}`
                  }
                </span>
              </div>
              <span className={`text-xs shrink-0 ml-2 ${
                isDarkMode ? 'text-tanish-dark opacity-75' : 'text-darkblue-light opacity-75'
              }`}>
                {new Date(msg.CREATED).toLocaleString()}
              </span>
            </div>
            
            <div className={`break-words ${
              isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'
            }`}>
              {msg.MESSAGE}
            </div>
  
            {!isMobileView && msg.SENDER_ID !== 999999999 && (
              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => onReply(msg.MESSAGE_ID)}
                  className={`px-3 py-1 text-sm rounded ${
                    isDarkMode 
                      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                  }`}
                >
                  Reply
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="pl-6">
        {msg.children.map(child => renderMessageTree(child, level + 1))}
      </div>
    </div>
  );

  const messageTree = buildMessageTree(thread);

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
        {messageTree.map(msg => renderMessageTree(msg))}
      </div>
      {isMobileView && message.SENDER_ID !== 999999999 && (
        <div className="p-3 border-t">
          <button
            onClick={() => onReply(message.MESSAGE_ID)}
            className={`w-full py-2 rounded-lg text-sm ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Reply
          </button>
        </div>
      )}
    </div>
  );
};

export default MessageDetail;