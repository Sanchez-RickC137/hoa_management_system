import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Plus } from 'lucide-react';
import { apiService } from '../services/apiService';
import Sidebar from '../components/layout/Sidebar';
import CreateSurveyModal from '../components/CreateSurveyModal';
import SurveyCompletionModal from '../components/SurveyCompletionModal';
import SurveyResultsModal from '../components/SurveyResultsModal';

// Survey Header Section
const SurveyHeader = ({ activeSurveys, inactiveSurveys, activeView, setActiveView, isBoardMember, setShowCreateModal, isDarkMode }) => {
  return (
    <div className="mb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
        <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} mb-4 sm:mb-0`}>
          Community Surveys
        </h1>
        
        {isBoardMember() && activeView === 'active' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className={`w-full sm:w-auto sm:mb-2 flex items-center justify-center px-4 py-2 rounded-lg shadow-lg md:mb-4 sm:mb-0 ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Survey
          </button>
        )}
      </div>

      <div className="flex space-x-4 mt-4">
        <button
          onClick={() => setActiveView('active')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg shadow-lg ${
            activeView === 'active'
              ? isDarkMode 
                ? 'bg-darkblue-dark text-tanish-dark' 
                : 'bg-greenblack-light text-tanish-light'
              : isDarkMode
                ? 'bg-mutedolive text-darkolive'
                : 'bg-palebluegrey text-darkblue-light'
          }`}
        >
          <span className="hidden sm:inline">Active Surveys</span>
          <span className="sm:hidden mb-2">Active</span>
          {' '}({activeSurveys.length})
        </button>
        <button
          onClick={() => setActiveView('inactive')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-lg shadow-lg ${
            activeView === 'inactive'
              ? isDarkMode 
                ? 'bg-darkblue-dark text-tanish-dark' 
                : 'bg-greenblack-light text-tanish-light'
              : isDarkMode
                ? 'bg-mutedolive text-darkolive'
                : 'bg-palebluegrey text-darkblue-light'
          }`}
        >
          <span className="hidden sm:inline">Inactive Surveys</span>
          <span className="sm:hidden mb-2">Inactive</span>
          {' '}({inactiveSurveys.length})
        </button>
      </div>
    </div>
  );
};

// SurveyCard sub-component - The individual cards
const SurveyCard = ({ survey, userResponse, onTakeSurvey, onViewResults }) => {
  const { isDarkMode } = useTheme();
  const endDate = new Date(survey.END_DATE);
  const now = new Date();
  const timeLeft = endDate - now;
  
  const formatTimeLeft = () => {
    if (timeLeft <= 0) return 'Ended';
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h remaining`;
  };
  
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-lg flex flex-col h-full`}>
      <div className="flex-grow">
        <h3 className={`text-xl font-bold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
          {survey.MESSAGE}
        </h3>

        <p className={`text-sm ${isDarkMode ? 'text-tanish-dark opacity-75' : 'text-darkblue-light opacity-75'}`}>
          {survey.STATUS === 'ACTIVE' ? formatTimeLeft() : 'Survey Ended'}
        </p>
      </div>
      
      <div className="flex justify-end space-x-4 mt-4 pt-4 border-t border-opacity-20">
        {survey.STATUS === 'ACTIVE' && !userResponse && (
          <button
            onClick={() => onTakeSurvey(survey)}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Take Survey
          </button>
        )}
        <button
          onClick={() => onViewResults(survey)}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-mutedolive hover:bg-darkblue-dark text-darkolive hover:text-tanish-dark' 
              : 'bg-palebluegrey hover:bg-darkblue-light text-darkblue-light hover:text-tanish-light'
          }`}
        >
          View Results
        </button>
      </div>
    </div>
  );
};


// Main Survey component - The page
const Survey = () => {
  const [activeSurveys, setActiveSurveys] = useState([]);
  const [inactiveSurveys, setInactiveSurveys] = useState([]);
  const [userResponses, setUserResponses] = useState({});
  const [activeView, setActiveView] = useState('active');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  const { isDarkMode } = useTheme();
  const { isBoardMember } = useAuth();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await apiService.getSurveys();
      console.log('Fetched surveys:', response);
      
      setActiveSurveys(response.activeSurveys || []);
      setInactiveSurveys(response.inactiveSurveys || []);
      setUserResponses(response.userResponses || {});
      setError(null);
    } catch (error) {
      console.error('Error fetching surveys:', error);
      setError('Failed to load surveys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchSurveys();
  };

  const handleTakeSurvey = (survey) => {
    setSelectedSurvey(survey);
    setShowCompletionModal(true);
  };

  const handleViewResults = (survey) => {
    setSelectedSurvey(survey);
    setShowResultsModal(true);
  };

  const handleSurveySubmit = () => {
    setShowCompletionModal(false);
    fetchSurveys();
  };

  if (loading) {
    return (
      <div className={`flex ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} min-h-screen`}>
        <Sidebar />
        <div className="flex-1 p-10 mt-16 sm:mt-0">Loading surveys...</div>
      </div>
    );
  }

  const displayedSurveys = activeView === 'active' ? activeSurveys : inactiveSurveys;

  return (
    <div className={`flex ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} min-h-screen rounded-lg shadow-lg`}>
      <Sidebar />
      <div className="flex-1 p-4 sm:p-10 mt-16 sm:mt-0">
        <SurveyHeader 
          activeSurveys={activeSurveys}
          inactiveSurveys={inactiveSurveys}
          activeView={activeView}
          setActiveView={setActiveView}
          isBoardMember={isBoardMember}
          setShowCreateModal={setShowCreateModal}
          isDarkMode={isDarkMode}
        />

        {error && (
          <div className="text-red-500 mb-4 p-4 rounded-lg bg-red-100">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedSurveys.map((survey) => (
            <SurveyCard
              key={survey.SURVEY_ID}
              survey={survey}
              userResponse={userResponses[survey.SURVEY_ID]}
              onTakeSurvey={handleTakeSurvey}
              onViewResults={handleViewResults}
            />
          ))}
        </div>

        {displayedSurveys.length === 0 && (
          <p className={`text-center mt-8 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            No {activeView} surveys available.
          </p>
        )}

        {/* Modals remain unchanged */}
        {showCreateModal && (
          <CreateSurveyModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}

        {showCompletionModal && selectedSurvey && (
          <SurveyCompletionModal
            survey={selectedSurvey}
            onClose={() => setShowCompletionModal(false)}
            onSubmit={handleSurveySubmit}
          />
        )}

        {showResultsModal && selectedSurvey && (
          <SurveyResultsModal
            survey={selectedSurvey}
            onClose={() => setShowResultsModal(false)}
          />
        )}
      </div>
    </div>
  );
};


export default Survey;