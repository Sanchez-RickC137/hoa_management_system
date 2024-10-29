import React, { useState } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

const CreateSurveyModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState(['', '']);
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  const handleAddAnswer = () => {
    if (answers.length < 4) {
      setAnswers([...answers, '']);
    }
  };

  const handleRemoveAnswer = (index) => {
    if (answers.length > 2) {
      const newAnswers = answers.filter((_, i) => i !== index);
      setAnswers(newAnswers);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    try {
      const surveyData = {
        message: question,
        answers: answers.map(answer => answer.trim()).filter(answer => answer !== ''),
        endDate: endDate
      };
      await apiService.createSurvey(surveyData);
      onSuccess();
    } catch (error) {
      setError('Failed to create survey');
    }
  };  // Added missing closing brace

  const handleContinue = () => {
    if (step === 1) {
      if (!question.trim()) {
        setError('Please enter a survey question');
        return;
      }
      if (!endDate) {
        setError('Please set an end date');
        return;
      }
    } else if (step === 2) {
      const validAnswers = answers.filter(answer => answer.trim() !== '');
      if (validAnswers.length < 2) {
        setError('Please provide at least two answers');
        return;
      }
    }
    
    if (step < 3) {
      setStep(step + 1);
      setError('');
    } else {
      handleSubmit();
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Survey Question</label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className={`w-full p-3 rounded-lg ${
                  isDarkMode 
                    ? 'bg-mutedolive text-darkolive placeholder-darkolive' 
                    : 'bg-palebluegrey text-darkblue-light placeholder-darkblue-light'
                }`}
                rows={4}
                placeholder="Enter your survey question here..."
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Survey End Date</label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
                className={`w-full p-3 rounded-lg ${
                  isDarkMode 
                    ? 'bg-mutedolive text-darkolive placeholder-darkolive' 
                    : 'bg-palebluegrey text-darkblue-light placeholder-darkblue-light'
                }`}
                required
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <label className="font-medium">Survey Answers</label>
              {answers.length < 4 && (
                <button
                  onClick={handleAddAnswer}
                  className={`p-2 rounded-lg ${
                    isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                  }`}
                >
                  <Plus size={20} />
                </button>
              )}
            </div>
            {answers.map((answer, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className={`flex-1 p-3 rounded-lg ${
                    isDarkMode 
                      ? 'bg-mutedolive text-darkolive placeholder-darkolive' 
                      : 'bg-palebluegrey text-darkblue-light placeholder-darkblue-light'
                  }`}
                  placeholder={`Answer ${index + 1}`}
                />
                {answers.length > 2 && (
                  <button
                    onClick={() => handleRemoveAnswer(index)}
                    className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                  >
                    <Minus size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
            }`}>
              <h3 className="font-bold mb-2 text-darkolive">Question:</h3>
              <p className="text-darkolive">{question}</p>
            </div>
            
            <div className={`p-4 rounded-lg ${
              isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
            }`}>
              <h3 className="font-bold mb-2 text-darkolive">Answers:</h3>
              <ul className="list-disc list-inside text-darkolive">
                {answers.map((answer, index) => (
                  answer.trim() && (
                    <li key={index} className="mb-2">{answer}</li>
                  )
                ))}
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-2xl mx-4 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
      }`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Create New Survey</h2>
            <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
              <X size={24} />
            </button>
          </div>

          <div className="flex justify-between mb-8">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className={`flex flex-col items-center ${
                step >= stepNum ? 'text-tanish-dark' : 'text-gray-400'
              }`}>
                <div className={`w-10 h-10 rounded-full ${
                  step >= stepNum 
                    ? isDarkMode ? 'bg-darkblue-dark' : 'bg-greenblack-light'
                    : 'bg-gray-300'
                // Continuing from previous CreateSurveyModal component...
                } flex items-center justify-center text-white mb-2`}>
                  {stepNum}
                </div>
                <span className="text-xs">
                  {stepNum === 1 ? 'QUESTION' : stepNum === 2 ? 'ANSWERS' : 'REVIEW'}
                </span>
              </div>
            ))}
          </div>

          <div className="mb-6">
            {renderStep()}
          </div>

          {error && (
            <p className="text-red-500 mb-4">{error}</p>
          )}

          <div className="flex justify-between">
            <button
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
              }`}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleContinue}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              }`}
            >
              {step === 3 ? 'Create Survey' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSurveyModal;