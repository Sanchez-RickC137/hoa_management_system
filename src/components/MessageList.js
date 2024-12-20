// MessageList.js
import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import Message from './Message';

const MessageList = ({ messages, view, onSelectMessage, currentUserId, isMobileView, selectedMessageId }) => {
  const { isDarkMode } = useTheme();

  const getRootMessage = (message, allMessages) => {
    let currentMessage = message;
    const visited = new Set(); // Prevent infinite loops
    
    while (currentMessage.PARENT_MESSAGE_ID) {
      if (visited.has(currentMessage.MESSAGE_ID)) break;
      visited.add(currentMessage.MESSAGE_ID);
      
      const parent = allMessages.find(m => m.MESSAGE_ID === currentMessage.PARENT_MESSAGE_ID);
      if (!parent) break;
      currentMessage = parent;
    }
    return currentMessage;
  };

  const groupedMessages = view === 'conversations'
    ? messages.reduce((acc, message) => {
        const rootMessage = getRootMessage(message, messages);
        const key = rootMessage?.MESSAGE_ID || message.MESSAGE_ID;
        if (!acc[key]) acc[key] = [];
        acc[key].push(message);
        return acc;
      }, {})
    : { all: messages };

  return (
    <div className="h-full overflow-hidden">
      <div className={`h-full overflow-x-hidden overflow-y-auto divide-y ${isDarkMode ? 'bg-greenblack-light divide-darkblue-dark' : 'bg-oldlace divide-darkblue-light'}`}>
        {view === 'conversations'
          ? Object.entries(groupedMessages)
              .sort(([, a], [, b]) => new Date(b[0]?.CREATED) - new Date(a[0]?.CREATED))
              .map(([key, conversation]) => (
                <Message
                  key={key}
                  message={conversation[0]}
                  onSelect={onSelectMessage}
                  currentUserId={currentUserId}
                  isSelected={selectedMessageId === conversation[0].MESSAGE_ID}
                  isMobileView={isMobileView}
                />
              ))
          : messages.map(message => (
              <Message
                key={message.MESSAGE_ID}
                message={message}
                onSelect={onSelectMessage}
                currentUserId={currentUserId}
                isSelected={selectedMessageId === message.MESSAGE_ID}
                isMobileView={isMobileView}
              />
            ))
        }
      </div>
    </div>
  );
};

export default MessageList;
