import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

const SurveyCompletionModal = ({ survey, onClose, onSubmit }) => {
  const [selectedAnswerNumber, setSelectedAnswerNumber] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  const handleSubmit = async () => {
    if (!selectedAnswerNumber) {
      setError('Please select an answer');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      
      console.log('Submitting answer:', selectedAnswerNumber);
      await apiService.submitSurveyResponse(survey.SURVEY_ID, selectedAnswerNumber);
      
      onSubmit();
    } catch (error) {
      console.error('Failed to submit survey:', error);
      setError(error.response?.data?.error || 'Failed to submit survey response');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl mx-4 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Complete Survey</h2>
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 hover:bg-opacity-80 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-lg mb-4">{survey.MESSAGE}</p>
            <div className="space-y-4">
              {[survey.ANSWER_1, survey.ANSWER_2, survey.ANSWER_3, survey.ANSWER_4]
                .map((answer, index) => {
                  if (!answer) return null;
                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswerNumber(index + 1)}
                      disabled={isSubmitting}
                      className={`w-full p-4 rounded-lg text-left transition-colors ${
                        selectedAnswerNumber === index + 1
                          ? isDarkMode 
                            ? 'bg-darkblue-dark text-tanish-dark' 
                            : 'bg-greenblack-light text-tanish-light'
                          : isDarkMode
                            ? 'bg-mutedolive hover:bg-darkblue-dark'
                            : 'bg-palebluegrey hover:bg-greenblack-light hover:text-tanish-light'
                      }`}
                    >
                      {answer}
                    </button>
                  );
                })
                .filter(Boolean)}
            </div>
          </div>

          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}

          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedAnswerNumber}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              } ${(isSubmitting || !selectedAnswerNumber) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Response'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyCompletionModal;