import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { X, AlertCircle, Users, User, DollarSign, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

const IssueAssessmentModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Step 1: Assessment Type Selection
  const [assessmentTypes, setAssessmentTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  // Step 2: Rate Selection
  const [assessmentRates, setAssessmentRates] = useState([]);
  const [selectedRate, setSelectedRate] = useState(null);

  // Step 3: Owner Selection
  const [ownerSearchTerm, setOwnerSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [assessAll, setAssessAll] = useState(false);
  const [allActiveOwners, setAllActiveOwners] = useState([]);

  useEffect(() => {
    fetchAssessmentTypes();
    fetchAssessmentRates();
  }, []);

  useEffect(() => {
    if (assessAll) {
      fetchAllActiveOwners();
    }
  }, [assessAll]);

  useEffect(() => {
    if (ownerSearchTerm.length >= 3) {
      searchOwners(ownerSearchTerm);
    } else {
      setSearchResults([]);
    }
  }, [ownerSearchTerm]);

  const fetchAssessmentTypes = async () => {
    try {
      setError(null);
      const response = await apiService.getAssessmentTypes();
      setAssessmentTypes(response);
    } catch (error) {
      console.error('Error fetching assessment types:', error);
      setError('Failed to load assessment types');
    }
  };

  const fetchAssessmentRates = async () => {
    try {
      setError(null);
      const response = await apiService.getAssessmentRates();
      setAssessmentRates(response);
    } catch (error) {
      console.error('Error fetching assessment rates:', error);
      setError('Failed to load assessment rates');
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setError(null);
        await Promise.all([
          fetchAssessmentTypes(),
          fetchAssessmentRates()
        ]);
      } catch (error) {
        console.error('Error loading initial data:', error);
        setError('Failed to load assessment data');
      }
    };

    loadInitialData();
  }, []);

  const fetchAllActiveOwners = async () => {
    try {
      const response = await apiService.getAllActiveOwners();
      setAllActiveOwners(response);
      setSelectedOwners(response);
    } catch (error) {
      console.error('Error fetching active owners:', error);
      setError('Failed to load active owners');
    }
  };

  const searchOwners = async (term) => {
    try {
      const response = await apiService.searchActiveOwners(term);
      setSearchResults(response);
    } catch (error) {
      console.error('Error searching owners:', error);
      setError('Failed to search owners');
    }
  };

  const handleOwnerSelect = (owner) => {
    if (!selectedOwners.find(o => o.OWNER_ID === owner.OWNER_ID)) {
      setSelectedOwners([...selectedOwners, owner]);
    }
  };

  const handleOwnerRemove = (ownerId) => {
    setSelectedOwners(selectedOwners.filter(o => o.OWNER_ID !== ownerId));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const assessmentData = {
        typeId: selectedType.TYPE_ID,
        rateId: selectedRate.RATE_ID,
        amount: selectedRate.AMOUNT,
        owners: selectedOwners.map(owner => ({
          ownerId: owner.OWNER_ID,
          accountId: owner.ACCOUNT_ID
        })),
        issuedBy: user.boardMemberDetails.MEMBER_ID
      };

      await apiService.issueAssessments(assessmentData);
      onClose();
    } catch (error) {
      console.error('Error issuing assessments:', error);
      setError('Failed to issue assessments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Select Assessment Type</h3>
            <div className="grid grid-cols-1 gap-4">
              {assessmentTypes.map(type => (
                <button
                key={type.TYPE_ID}
                onClick={() => setSelectedType(type)}
                className={`p-4 rounded-lg ${
                  selectedType?.TYPE_ID === type.TYPE_ID
                    ? isDarkMode 
                      ? 'bg-darkblue-dark text-tanish-dark'
                      : 'bg-greenblack-light text-tanish-light'
                    : isDarkMode
                      ? 'bg-mutedolive hover:bg-darkblue-dark text-darkolive hover:text-tanish-dark'
                      : 'bg-palebluegrey hover:bg-greenblack-light text-darkblue-light hover:text-tanish-light'
                }`}
                >
                  {type.ASSESSMENT_DESCRIPTION}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <AlertCircle className="inline-block mr-2" size={16} />
              Don't see the assessment type you need? Go to Manage Assessments to add new types.
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Select Assessment Rate</h3>
            <div className="grid grid-cols-1 gap-4">
              {assessmentRates.map(rate => (
                <button
                key={rate.RATE_ID}
                onClick={() => setSelectedRate(rate)}
                className={`p-4 rounded-lg ${
                  selectedRate?.RATE_ID === rate.RATE_ID
                    ? isDarkMode 
                      ? 'bg-darkblue-dark text-tanish-dark'
                      : 'bg-greenblack-light text-tanish-light'
                    : isDarkMode
                      ? 'bg-mutedolive hover:bg-darkblue-dark text-darkolive hover:text-tanish-dark'
                      : 'bg-palebluegrey hover:bg-greenblack-light text-darkblue-light hover:text-tanish-light'
                }`}
                >
                  <div className="flex justify-between items-center">
                    <span>${parseFloat(rate.AMOUNT).toFixed(2)}</span>
                    {rate.ASSESSMENT_YEAR && (
                      <span>Year: {rate.ASSESSMENT_YEAR}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500">
              <AlertCircle className="inline-block mr-2" size={16} />
              Need to add a new rate? Visit Manage Assessments to create new rates.
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Select Owners to Assess</h3>
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={assessAll}
                  onChange={(e) => {
                    setAssessAll(e.target.checked);
                    if (!e.target.checked) {
                      setSelectedOwners([]);
                    }
                  }}
                  className="mr-2"
                />
                <label>Assess All Active Owners</label>
              </div>
            </div>

            {!assessAll && (
              <>
                <input
                  type="text"
                  placeholder="Search owners..."
                  value={ownerSearchTerm}
                  onChange={(e) => setOwnerSearchTerm(e.target.value)}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                  }`}
                />
                <div className="grid grid-cols-1 gap-4 max-h-60 overflow-y-auto">
                  {searchResults.map(owner => (
                    <div
                    key={owner.OWNER_ID}
                    onClick={() => handleOwnerSelect(owner)}
                    className={`p-4 rounded-lg cursor-pointer ${
                      isDarkMode 
                        ? 'bg-mutedolive hover:bg-darkblue-dark text-darkolive hover:text-tanish-dark' 
                        : 'bg-palebluegrey hover:bg-greenblack-light text-darkblue-light hover:text-tanish-light'
                    }`}
                    >
                      <div>{owner.FIRST_NAME} {owner.LAST_NAME}</div>
                      <div className="text-sm">{owner.UNIT} {owner.STREET}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="mt-4">
              <h4 className="font-bold mb-2">Selected Owners ({selectedOwners.length})</h4>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {selectedOwners.map(owner => (
                  <div
                  key={owner.OWNER_ID}
                  className={`p-2 rounded-lg flex justify-between items-center ${
                    isDarkMode 
                      ? 'bg-mutedolive text-darkolive' 
                      : 'bg-palebluegrey text-darkblue-light'
                  }`}
                  >
                    <span>{owner.FIRST_NAME} {owner.LAST_NAME}</span>
                    {!assessAll && (
                      <button
                        onClick={() => handleOwnerRemove(owner.OWNER_ID)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-bold mb-4">Review and Confirm</h3>
            <div className={`p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-mutedolive text-darkolive' 
                : 'bg-palebluegrey text-darkblue-light'
            }`}>
              <h4 className="font-bold mb-2">Assessment Details</h4>
              <div className="space-y-2">
                <p>Type: {selectedType.ASSESSMENT_DESCRIPTION}</p>
                <p>Rate: ${parseFloat(selectedRate.AMOUNT).toFixed(2)}</p>
                <p>Number of Owners: {selectedOwners.length}</p>
                <p>Total Amount: ${(parseFloat(selectedRate.AMOUNT) * selectedOwners.length).toFixed(2)}</p>
              </div>
            </div>

            <div className={`p-4 rounded-lg ${
              isDarkMode 
                ? 'bg-mutedolive text-darkolive' 
                : 'bg-palebluegrey text-darkblue-light'
            }`}>
              <h4 className="font-bold mb-2">Message Preview</h4>
              <div className="whitespace-pre-wrap">
                {`Assessment Notice: ${selectedType.ASSESSMENT_DESCRIPTION}\nAmount: $${parseFloat(selectedRate.AMOUNT).toFixed(2)}\nDue Date: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}\n\nPlease log in to your account to view details or make a payment.`}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Issue Assessment</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-between mb-8">
          {[
            { step: 1, icon: DollarSign, label: 'TYPE' },
            { step: 2, icon: DollarSign, label: 'RATE' },
            { step: 3, icon: assessAll ? Users : User, label: 'OWNERS' },
            { step: 4, icon: CheckCircle, label: 'CONFIRM' }
          ].map(({ step: stepNum, icon: Icon, label }) => (
            <div key={stepNum} className={`flex flex-col items-center ${step >= stepNum ? 'text-tanish-dark' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step >= stepNum 
                  ? isDarkMode ? 'bg-darkblue-dark' : 'bg-greenblack-light'
                  : 'bg-gray-300'
              }`}>
                <Icon size={20} />
              </div>
              <span className="text-xs mt-1">{label}</span>
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {getStepContent()}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => step === 4 ? handleSubmit() : setStep(step + 1)}
            disabled={
              loading ||
              (step === 1 && !selectedType) ||
              (step === 2 && !selectedRate) ||
              (step === 3 && selectedOwners.length === 0)
            }
            className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}
          >
            {step === 4 ? (loading ? 'Processing...' : 'Issue Assessment') : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueAssessmentModal;