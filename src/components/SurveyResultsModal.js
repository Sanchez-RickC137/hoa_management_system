import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { apiService } from '../services/apiService';

const SurveyResultsModal = ({ survey, onClose }) => {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiService.getSurveyResults(survey.SURVEY_ID);
        console.log('Survey results:', response); // Debug log
        setResults(response);
      } catch (error) {
        console.error('Error fetching results:', error);
        setError('Failed to load survey results');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [survey.SURVEY_ID]);

  const prepareChartData = () => {
    if (!results || !results.answers) return [];

    const validAnswers = [1, 2, 3, 4].filter(num => survey[`ANSWER_${num}`]);
    
    return validAnswers.map(answerNum => {
      const answer = results.answers[answerNum] || { count: 0, percentage: 0 };
      return {
        name: survey[`ANSWER_${answerNum}`],
        responses: answer.count || 0,
        percentage: Number(answer.percentage) || 0
      };
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`w-full max-w-3xl mx-4 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
        } p-6`}>
          <p className="text-center">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`w-full max-w-3xl mx-4 rounded-lg shadow-lg ${
          isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
        } p-6`}>
          <p className="text-center text-red-500">{error}</p>
          <button
            onClick={onClose}
            className={`mt-4 px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const chartData = prepareChartData();
  const totalResponses = results?.totalResponses || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`w-full max-w-3xl mx-4 rounded-lg shadow-lg ${
        isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
      } mt-16 lg:mt-0 overflow-y-auto max-h-[80vh]`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Survey Results</h2>
            <button onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          <div className="mb-6">
            <p className="text-lg mb-4">{survey.MESSAGE}</p>
            <p className="text-sm mb-4">Total Responses: {totalResponses}</p>
            
            {totalResponses > 0 ? (
              <>
                <div className="h-64 mb-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar 
                        dataKey="percentage" 
                        fill={isDarkMode ? '#2A3A4A' : '#2B2F2D'}
                        name="Response Percentage"
                        unit="%"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-4">
                  {chartData.map((item, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg ${
                        isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'
                      }`}
                    >
                      <p className="flex justify-between">
                        <span className={`${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                          {item.name}
                        </span>
                        <span className={`${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                          {item.responses} {item.responses === 1 ? 'response' : 'responses'} 
                          {' '}({Number(item.percentage).toFixed(1)}%)
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className={`text-center italic ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>No responses yet</p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyResultsModal;