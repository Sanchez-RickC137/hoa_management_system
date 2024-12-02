import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { MessageSquare, CheckCircle, X } from 'lucide-react';
import { apiService } from '../services/apiService';

const ReplyMessageModal = ({ onClose, onMessageSent, parentMessage }) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [step, setStep] = useState(1);
  const { isDarkMode } = useTheme();

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await apiService.sendMessage(parentMessage.SENDER_ID, message, parentMessage.MESSAGE_ID);
      onMessageSent();
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const buttonStyle = `px-4 py-2 rounded-lg ${
    isDarkMode
      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
  }`;

  const renderStep = () => {
    switch (step) {
      case 1:
        console.log(parentMessage.MESSAGE_ID);
        return (
          <div className="flex flex-col flex-grow">
            <div className={`p-4 mb-4 rounded ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}>
              <p className="font-bold mb-2">Replying to: {parentMessage.FIRST_NAME} {parentMessage.LAST_NAME}</p>
              <p className="whitespace-pre-wrap">{parentMessage.MESSAGE}</p>
              <p className="text-sm mt-2">{new Date(parentMessage.CREATED).toLocaleString()}</p>
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reply here..."
              rows={8}
              className={`w-full p-2 mb-4 rounded flex-grow ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="font-bold">Review Your Reply</h3>
            <div className={`p-4 rounded ${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'}`}>
              <p className={`font-bold mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>Replying to: {parentMessage.FIRST_NAME} {parentMessage.LAST_NAME}</p>
              <div className="pl-4 border-l-2 mb-4">
                <p className={`text-sm italic whitespace-pre-wrap ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>{parentMessage.MESSAGE}</p>
              </div>
              <p className={`whitespace-pre-wrap ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>{message}</p>
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
        className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} 
          p-6 rounded-lg shadow-lg w-full max-w-4xl mx-4 flex flex-col`} 
        style={{ maxHeight: '80vh', minHeight: '40vh' }}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reply to Message</h2>
          <button onClick={onClose} className="p-1 hover:opacity-70">
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-evenly mb-8">
          {[
            { step: 1, icon: MessageSquare, label: 'COMPOSE' },
            { step: 2, icon: CheckCircle, label: 'REVIEW' }
          ].map(({ step: stepNum, icon: Icon, label }) => (
            <div key={stepNum} className={`flex flex-col items-center ${step >= stepNum ? 'text-tanish-dark' : 'text-gray-400'}`}>
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
            onClick={onClose}
            className={buttonStyle}
            disabled={sending}
          >
            Cancel
          </button>
          <button
            onClick={() => step === 1 ? setStep(2) : handleSend()}
            className={buttonStyle}
            disabled={sending || !message.trim()}
          >
            {step === 2 ? (sending ? 'Sending...' : 'Send Reply') : 'Review'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReplyMessageModal;