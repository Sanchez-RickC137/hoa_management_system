import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Calendar, Home, User, X } from 'lucide-react';
import { apiService } from '../services/apiService';

const NewAccountModal = ({ onClose, onSuccess }) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [properties, setProperties] = useState([]);
  const [messagePreview, setMessagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    propertyId: '',
    effectiveDate: new Date().toISOString().split('T')[0], // Today's date as default
    useCurrentDate: true
  });

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await apiService.getAvailableProperties();
        setProperties(response);
      } catch (error) {
        setError('Failed to load properties');
        console.error('Error fetching properties:', error);
      }
    };
    fetchProperties();
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const effectiveDate = formData.useCurrentDate ? 
        new Date().toISOString().split('T')[0] : 
        formData.effectiveDate;

      const response = await apiService.createNewAccount({
        propertyId: formData.propertyId,
        effectiveDate
      });

      setMessagePreview(response.message);
      setStep(2);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : ''}`}>Select Property</label>
              <select
                value={formData.propertyId}
                onChange={(e) => setFormData(prev => ({ ...prev, propertyId: e.target.value }))}
                className={`w-full p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-mutedolive text-darkolive placeholder-darkolive' 
                    : 'bg-palebluegrey text-darkblue-light'
                }`}
                required
              >
                <option value="" className={isDarkMode ? 'text-darkolive' : ''}>Select a property...</option>
                {properties.map(property => (
                  <option 
                    key={property.PROP_ID} 
                    value={property.PROP_ID}
                    className={isDarkMode ? 'text-darkolive' : ''}
                  >
                    {`${property.UNIT} ${property.STREET}, ${property.CITY}, ${property.STATE} ${property.ZIP_CODE}`}
                  </option>
                ))}
              </select>
            </div>

            <div className={isDarkMode ? 'text-darkolive' : ''}>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.useCurrentDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    useCurrentDate: e.target.checked 
                  }))}
                  className="form-checkbox"
                />
                <span>Use current date</span>
              </label>
            </div>

            {!formData.useCurrentDate && (
              <div>
                <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : ''}`}>Effective Date</label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    effectiveDate: e.target.value 
                  }))}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-mutedolive text-darkolive' 
                      : 'bg-palebluegrey text-darkblue-light'
                  }`}
                  required
                />
              </div>
            )}
          </div>
        );

      case 2:
        return messagePreview && (
          <div className={`p-4 rounded-lg ${
            isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
          }`}>
            <h3 className={`font-bold mb-4 ${isDarkMode ? 'text-darkolive' : ''}`}>
              Account Created Successfully
            </h3>
            <div className="space-y-2">
              <p><strong>Account Number:</strong> {messagePreview.accountId}</p>
              <p><strong>Owner ID:</strong> {messagePreview.ownerId}</p>
              <p><strong>Temporary Code:</strong> {messagePreview.temporaryCode}</p>
              <div className="mt-4">
                <p className="italic">
                  Please provide this information to the closing agent or law firm handling the closing.
                </p>
                <p className="text-sm mt-2">
                  A message containing this information has been sent to your inbox.
                </p>
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
      <div className={`${
        isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
      } p-8 rounded-lg shadow-lg max-w-lg w-full`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create New Account</h2>
          <button onClick={onClose} className="p-1 hover:opacity-70">
            <X size={24} className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
          </button>
        </div>

        {error && (
          <div className="text-red-500 mb-4 p-3 rounded-lg bg-red-100">
            {error}
          </div>
        )}

        {renderStep()}

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
            }`}
            disabled={loading}
          >
            Cancel
          </button>
          {step === 1 && (
            <button
              onClick={handleSubmit}
              disabled={loading || !formData.propertyId}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              } ${(loading || !formData.propertyId) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          )}
          {step === 2 && (
            <button
              onClick={onSuccess}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              }`}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAccountModal;