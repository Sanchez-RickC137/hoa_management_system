import React, { useState, useEffect } from 'react';
import { Plus, ArrowLeft } from 'lucide-react';
import { FourSquare } from 'react-loading-indicators';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/apiService';
import MessageList from '../../components/MessageList';
import MessageDetail from '../../components/MessageDetail';
import MessageViewer from '../../components/MessageViewer';
import NewMessageModal from '../../components/NewMessageModal';
import ReplyMessageModal from '../../components/ReplyMessageModal';
import Sidebar from '../../components/layout/Sidebar';


const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedThread, setSelectedThread] = useState([]);
  const [view, setView] = useState('timeline');
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    fetchMessages();
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await apiService.getMessages();
      setMessages(response || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages. Please try again.');
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMessage = async (message) => {
    try {
      if (view === 'conversations') {
        const thread = await apiService.getMessageThread(message.MESSAGE_ID);
        setSelectedThread(thread || []);
      }
      setSelectedMessage(message);
    } catch (error) {
      console.error('Error handling message selection:', error);
      setError('Failed to load message details. Please try again.');
    }
  };

  const handleNewMessage = () => {
    setShowNewMessageModal(true);
  };

  const handleMessageSent = () => {
    setShowNewMessageModal(false);
    setShowReplyModal(false);
    fetchMessages();
  };

  const handleReply = (parentMessageId) => {
    if (selectedMessage?.SENDER_ID !== 999999999) {
      const parentMessage = messages.find(msg => msg.MESSAGE_ID === parentMessageId);
      setSelectedMessage(parentMessage);
      setShowReplyModal(true);
    }
  };

  const handleBackToList = () => {
    setSelectedMessage(null);
    setSelectedThread([]);
  };

  if (loading) {
    return (
      <div className={`flex justify-center align-center ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} min-h-screen`}>
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
        {isDarkMode && <FourSquare color='#D6C6B0' size="large" text="Loading" textColor="" />}
        {!isDarkMode && <FourSquare color='#2A3A4A' size="large" text="Loading" textColor="" />}
        </div>
      </div>
    );
  }

  // Desktop View
  const DesktopView = () => (
    <div className="flex flex-col h-screen pt-14 max-w-[1400px] mx-auto">
      {/* Desktop Header */}
      <div className="flex items-center justify-between px-6 h-14 border-b bg-inherit">
        <h1 className="text-3xl font-bold">Messages</h1>
        <div className="flex gap-4">
          <div className="flex rounded-lg shadow-lg overflow-hidden border border-darkblue-dark">
            <button
              onClick={() => setView('timeline')}
              className={`px-4 py-1.5 text-sm transition-colors ${
                view === 'timeline' 
                  ? 'bg-darkblue-dark text-tanish-dark' 
                  : 'hover:bg-darkblue-dark hover:bg-opacity-10'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setView('conversations')}
              className={`px-4 py-1.5 text-sm transition-colors ${
                view === 'conversations' 
                  ? 'bg-darkblue-dark text-tanish-dark' 
                  : 'hover:bg-darkblue-dark hover:bg-opacity-10'
              }`}
            >
              Conversations
            </button>
          </div>
          <button
            onClick={handleNewMessage}
            className="px-4 py-1.5 bg-darkblue-dark text-tanish-dark rounded-lg shadow-lg text-sm hover:bg-opacity-90 transition-colors"
          >
            New Message
          </button>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="flex flex-1 min-h-0">
        <div className="w-80 border border-darkblue-dark">
          <MessageList
            messages={messages}
            view={view}
            onSelectMessage={handleSelectMessage}
            currentUserId={currentUser?.id}
            selectedMessageId={selectedMessage?.MESSAGE_ID}
          />
        </div>
        <div className="flex-1">
          {selectedMessage ? (
            view === 'conversations' ? (
              <MessageDetail
                message={selectedMessage}
                thread={selectedThread}
                onClose={() => setSelectedMessage(null)}
                onReply={handleReply}
                currentUserId={currentUser?.id}
              />
            ) : (
              <MessageViewer
                message={selectedMessage}
                onClose={() => setSelectedMessage(null)}
                onReply={handleReply}
                currentUserId={currentUser?.id}
              />
            )
          ) : (
            <div className="flex items-center justify-center h-full text-darkblue-light opacity-50">
              Select a message to view
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Mobile View
  const MobileView = () => (
    <div className="flex flex-col h-screen pt-14 w-80 max-w-full mx-auto overflow-hidden rounded-lg shadow-lg">
      {/* Mobile Header */}
      {selectedMessage ? (
        <div className="flex items-center px-3 h-12 border-b bg-inherit">
          <button
            onClick={handleBackToList}
            className="flex items-center gap-2 text-sm"
          >
            <ArrowLeft size={18} />
            Back
          </button>
        </div>
      ) : (
        <div className="flex flex-col border-b bg-inherit">
          <div className="flex items-center justify-between px-3 h-12">
            <h1 className="text-lg font-bold">Messages</h1>
            <button
              onClick={handleNewMessage}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-darkblue-dark text-tanish-dark"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex px-3 pb-2 gap-2">
            <button
              onClick={() => setView('timeline')}
              className={`flex-1 py-1 rounded-full text-xs ${
                view === 'timeline' ? 'bg-darkblue-dark text-tanish-dark' : 'border border-darkblue-dark'
              }`}
            >
              List
            </button>
            <button
              onClick={() => setView('conversations')}
              className={`flex-1 py-1 rounded-full text-xs ${
                view === 'conversations' ? 'bg-darkblue-dark text-tanish-dark' : 'border border-darkblue-dark'
              }`}
            >
              Convos
            </button>
          </div>
        </div>
      )}
  
      {/* Mobile Content */}
      <div className="flex-1 overflow-hidden">
        {selectedMessage ? (
          <div className="h-full">
            {view === 'conversations' ? (
              <MessageDetail
                message={selectedMessage}
                thread={selectedThread}
                onClose={handleBackToList}
                onReply={handleReply}
                currentUserId={currentUser?.id}
                isMobileView
              />
            ) : (
              <MessageViewer
                message={selectedMessage}
                onClose={handleBackToList}
                onReply={handleReply}
                currentUserId={currentUser?.id}
                isMobileView
              />
            )}
          </div>
        ) : (
          <div className="h-full border border-darkblue-dark">
            <MessageList
              messages={messages}
              view={view}
              onSelectMessage={handleSelectMessage}
              currentUserId={currentUser?.id}
              isMobileView
            />
          </div>
        )}
      </div>
    </div>
  );
  
  return (
    <div className={`rounded-lg shadow-lg ${isDarkMode ? 'bg-greenblack-dark text-tanish-dark' : 'bg-tanish-light text-darkblue-light'} min-h-screen`}>
      {isMobileView ? <MobileView /> : <DesktopView />}
      
      {showNewMessageModal && (
        <NewMessageModal
          onClose={() => setShowNewMessageModal(false)}
          onMessageSent={handleMessageSent}
        />
      )}
      
      {showReplyModal && selectedMessage && (
        <ReplyMessageModal
          onClose={() => setShowReplyModal(false)}
          onMessageSent={handleMessageSent}
          parentMessage={selectedMessage}
          currentUserId={currentUser?.id}
        />
      )}
    </div>
  );
};

export default Messages;