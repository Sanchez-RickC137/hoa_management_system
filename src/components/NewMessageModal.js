import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Users, MessageSquare, CheckCircle, X } from 'lucide-react';
import { apiService } from '../services/apiService';

const NewMessageModal = ({ onClose, onMessageSent }) => {
  const [recipients, setRecipients] = useState([]);
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const { isDarkMode } = useTheme();

  const buttonStyle = `px-4 py-2 rounded-lg ${
    isDarkMode
      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
  }`;

  useEffect(() => {
    fetchRecipients('');
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRecipients(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchRecipients = async (search) => {
    try {
      const response = await apiService.searchUsers(search);
      setRecipients(response);
    } catch (error) {
      console.error('Error fetching recipients:', error);
    }
  };

  const handleSend = async () => {
    if (!selectedRecipient || !message.trim()) return;
    setSending(true);
    try {
      await apiService.sendMessage(selectedRecipient.OWNER_ID, message);
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setSelectedRecipient(null);
    }
    setStep(step - 1);
  };

  const handleContinue = () => {
    if (step === 1 && !selectedRecipient) return;
    if (step === 2 && !message.trim()) return;
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSend();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <>
            <input
              type="text"
              placeholder="Search for a recipient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full p-2 mb-4 rounded-md shadow-md ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 h-[18rem] overflow-y-auto">
              {recipients.length > 0 ? (
                recipients.slice(0, 6).map((recipient) => (
                  <div
                    key={recipient.OWNER_ID}
                    onClick={() => setSelectedRecipient(recipient)}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedRecipient?.OWNER_ID === recipient.OWNER_ID
                        ? isDarkMode 
                          ? 'bg-darkblue-dark text-tanish-dark'
                          : 'bg-greenblack-light text-tanish-light'
                        : isDarkMode
                          ? 'bg-mutedolive text-darkolive hover:bg-darkblue-dark'
                          : 'bg-palebluegrey hover:bg-greenblack-light hover:text-tanish-light'
                    }`}
                  >
                    <div>
                      <h3 className="font-bold truncate">{recipient.FIRST_NAME} {recipient.LAST_NAME}</h3>
                      <p className="truncate">{recipient.UNIT} {recipient.STREET}</p>
                    </div>
                    {recipient.MEMBER_ROLE && 
                      <p className="text-sm italic truncate mt-auto">{recipient.MEMBER_ROLE}</p>
                    }
                  </div>
                ))
              ) : (
                <p className="col-span-3 text-center">No recipients found</p>
              )}
            </div>
          </>
        );
      case 2:
        return (
          <>
            <p className="mb-4">To: {selectedRecipient.FIRST_NAME} {selectedRecipient.LAST_NAME}</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={8}
              className={`w-full p-2 mb-4 rounded ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            />
          </>
        );
      case 3:
        return (
          <div className="space-y-4">
            <h3 className="font-bold">Review Your Message</h3>
            <div className={`p-4 rounded ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
              <p className={`font-bold mb-2 ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}>To: {selectedRecipient.FIRST_NAME} {selectedRecipient.LAST_NAME}</p>
              <p className={`whitespace-pre-wrap ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}>{message}</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        className={`${
          isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
        } p-6 rounded-lg shadow-lg w-full max-w-3xl mx-4 flex flex-col`} 
        style={{ maxHeight: '80vh' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">New Message</h2>
          <button onClick={onClose} className="p-1 hover:opacity-70">
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-evenly px-20 mb-8">
          {[
            { step: 1, icon: Users, label: 'RECIPIENT' },
            { step: 2, icon: MessageSquare, label: 'MESSAGE' },
            { step: 3, icon: CheckCircle, label: 'REVIEW' }
          ].map(({ step: stepNum, icon: Icon, label }) => (
            <div key={stepNum} className={`flex flex-col items-center shadow-md${step >= stepNum ? 'text-tanish-dark' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full ${
                step >= stepNum 
                  ? isDarkMode ? 'bg-darkblue-dark' : 'bg-greenblack-light'
                  : 'bg-gray-300'
              } flex items-center justify-center text-white mb-2`}>
                <Icon size={20} />
              </div>
              <span className="text-xs">{label}</span>
            </div>
          ))}
        </div>

        <div className="flex-grow overflow-hidden flex flex-col">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={step === 1 ? onClose : handleBack}
            className={buttonStyle}
            disabled={sending}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleContinue}
            className={`${buttonStyle} ${
              (step === 1 && !selectedRecipient) || (step === 2 && !message.trim())
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
            disabled={
              sending || 
              (step === 1 && !selectedRecipient) || 
              (step === 2 && !message.trim())
            }
          >
            {step === 3 ? (sending ? 'Sending...' : 'Send Message') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewMessageModal;