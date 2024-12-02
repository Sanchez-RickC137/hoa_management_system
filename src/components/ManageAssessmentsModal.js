import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus } from 'lucide-react';
import { apiService } from '../services/apiService';

const ManageAssessmentsModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for assessment types
  const [newTypes, setNewTypes] = useState([{ description: '' }]);

  // State for assessment rates
  const [newRates, setNewRates] = useState([{
    year: '',
    amount: '',
    useRegularAssessment: true,
    isYearlyAssessment: false
  }]);

  const handleAddTypeField = () => {
    setNewTypes([...newTypes, { description: '' }]);
  };

  const handleTypeChange = (index, value) => {
    const updatedTypes = [...newTypes];
    updatedTypes[index].description = value;
    setNewTypes(updatedTypes);
  };

  const handleAddRateField = () => {
    setNewRates([...newRates, {
      year: '',
      amount: '',
      useRegularAssessment: true,
      isYearlyAssessment: false
    }]);
  };

  const handleSubmitTypes = async () => {
    try {
      setError(null);
      const validTypes = newTypes.filter(type => type.description.trim() !== '');
      
      if (validTypes.length === 0) {
        setError('Please enter at least one valid assessment type');
        return;
      }

      await apiService.addAssessmentTypes(validTypes);
      setSuccess('Assessment types added successfully');
      setNewTypes([{ description: '' }]);
    } catch (err) {
      setError('Failed to add assessment types');
      console.error('Error adding assessment types:', err);
    }
  };

  const handleSubmitRates = async () => {
    try {
      setError(null);
      const validRates = newRates.filter(rate => 
        rate.amount.trim() !== '' && 
        (!rate.isYearlyAssessment || (rate.isYearlyAssessment && rate.year.trim() !== ''))
      );

      if (validRates.length === 0) {
        setError('Please enter at least one valid assessment rate');
        return;
      }

      const invalidRates = validRates.filter(rate => {
        const year = parseInt(rate.year);
        const amount = parseFloat(rate.amount);
        return (
          (rate.isYearlyAssessment && (isNaN(year) || year < 2000 || year > 2100)) ||
          isNaN(amount) || amount <= 0
        );
      });

      if (invalidRates.length > 0) {
        setError('Please enter valid years (2000-2100) and positive amounts');
        return;
      }

      const ratesWithMemberId = validRates.map(rate => ({
        ...rate,
        changedBy: user.boardMemberDetails.MEMBER_ID
      }));

      await apiService.addAssessmentRates(ratesWithMemberId);
      setSuccess('Assessment rates added successfully');
      setNewRates([{
        year: '',
        amount: '',
        useRegularAssessment: true,
        isYearlyAssessment: false
      }]);
    } catch (err) {
      setError('Failed to add assessment rates');
      console.error('Error adding assessment rates:', err);
    }
  };
  
  const handleRateChange = (index, field, value) => {
    const updatedRates = [...newRates];
    
    if (field === 'amount') {
      // Ensure value is a valid number
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        updatedRates[index].amount = value;
      }
    } 
    else if (field === 'year') {
      // Always allow empty string for non-yearly assessments
      if (value === '') {
        updatedRates[index].year = value;
        return;
      }
      
      // Now we know it's a string of digits, we can check if it's a valid year
      const numYear = parseInt(value);
      if (value.length === 4) {
        const currentYear = new Date().getFullYear();
        if (numYear < currentYear) {
          setError('Year must be ' + currentYear + ' or greater');
          return;
        }
      }
      updatedRates[index].year = value;
    }
    else if (field === 'isYearlyAssessment') {
      if (value && !updatedRates[index].year) {
        setError('Year is required for yearly assessments');
        return;
      }
      updatedRates[index][field] = value;
    } 
    
    setNewRates(updatedRates);
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Assessments</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Assessment Types Section */}
        <div className="mb-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Assessment Types
          </h3>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-mutedbeige'} space-y-4`}>
            {newTypes.map((type, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={type.description}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                  placeholder="Enter assessment type..."
                  className={`flex-1 p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-greenblack-dark text-tanish-dark placeholder-tanish-dark' 
                      : 'bg-tanish-light text-darkblue-light placeholder-darkblue-light'
                  }`}
                />
                {index === newTypes.length - 1 && (
                  <button
                    onClick={handleAddTypeField}
                    className={`p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-greenblack-dark hover:bg-darkblue-light text-tanish-dark' 
                        : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                    }`}
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmitTypes}
            className={`mt-4 w-full p-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Add New Types
          </button>
        </div>

        {/* Assessment Rates Section */}
        <div className="mb-8">
          <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Assessment Rates
          </h3>
          <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-mutedolive' : 'bg-mutedbeige'} space-y-4`}>
            {newRates.map((rate, index) => (
              <div key={index} className="space-y-4">
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                      Amount
                    </label>
                    <input
                      type="number"
                      value={rate.amount}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.match(/^\d*\.?\d{0,2}$/)) {
                          handleRateChange(index, 'amount', value);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent negative signs and e (exponential notation)
                        if (e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      min="0.01"
                      step="0.01"
                      placeholder="0.00"
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-greenblack-dark text-tanish-dark placeholder-tanish-dark' 
                          : 'bg-tanish-light text-darkblue-light placeholder-darkblue-light'
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                      Year {rate.isYearlyAssessment ? '(Required)' : '(Optional)'}
                    </label>
                    <input
                      type="text"
                      value={rate.year}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow digits to be typed
                        if (value === '' || /^\d+$/.test(value)) {
                          handleRateChange(index, 'year', value);
                        }
                      }}
                      placeholder="YYYY"
                      className={`w-full p-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-greenblack-dark text-tanish-dark placeholder-tanish-dark' 
                          : 'bg-tanish-light text-darkblue-light placeholder-darkblue-light'
                      }`}
                      required={rate.isYearlyAssessment}
                    />
                  </div>
                  {index === newRates.length - 1 && (
                    <button
                      onClick={handleAddRateField}
                      className={`p-2 rounded-lg ${
                        isDarkMode 
                          ? 'bg-greenblack-dark hover:bg-darkblue-light text-tanish-dark' 
                          : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                      }`}
                    >
                      <Plus size={20} />
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rate.isYearlyAssessment}
                    onChange={(e) => handleRateChange(index, 'isYearlyAssessment', e.target.checked)}
                    className="mr-2"
                  />
                  <label className={isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}>
                    Use for Yearly Assessment
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={handleSubmitRates}
            className={`mt-4 w-full p-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Add New Rates
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageAssessmentsModal;