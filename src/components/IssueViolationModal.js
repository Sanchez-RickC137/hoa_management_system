import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, User, AlertTriangle, CheckCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

// Owner Selection Step Component
const OwnerSelectionStep = ({ onSelect, selectedOwner }) => {
  const { isDarkMode } = useTheme();
  const [owners, setOwners] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOwners = async () => {
      try {
        const response = await apiService.getActiveOwners();
        setOwners(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load owners');
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);

  const filteredOwners = owners.filter(owner => 
    `${owner.FIRST_NAME} ${owner.LAST_NAME} ${owner.STREET}`.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading owners...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search owners..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={`w-full p-2 rounded-lg ${
          isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
        }`}
      />
      
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredOwners.map((owner) => (
          <div
            key={owner.OWNER_ID}
            onClick={() => onSelect(owner)}
            className={`p-4 rounded-lg cursor-pointer transition-colors duration-200 group ${
              selectedOwner?.OWNER_ID === owner.OWNER_ID
                ? isDarkMode
                  ? 'bg-darkblue-dark text-tanish-dark'
                  : 'bg-greenblack-light text-tanish-light'
                : isDarkMode
                  ? 'bg-mutedolive hover:bg-darkblue-dark'
                  : 'bg-palebluegrey hover:bg-greenblack-light'
            }`}
          >
            <div className="flex items-center">
              <User className={`w-5 h-5 mr-2 ${
                selectedOwner?.OWNER_ID === owner.OWNER_ID
                  ? 'text-current'
                  : isDarkMode
                    ? 'text-darkolive group-hover:text-tanish-dark'
                    : 'text-darkblue-light group-hover:text-tanish-light'
              }`} />
              <div>
                <p className={`font-semibold ${
                  selectedOwner?.OWNER_ID === owner.OWNER_ID
                    ? 'text-current'
                    : isDarkMode
                      ? 'text-darkolive group-hover:text-tanish-dark'
                      : 'text-darkblue-light group-hover:text-tanish-light'
                }`}>
                  {owner.FIRST_NAME} {owner.LAST_NAME}
                </p>
                <p className={`text-sm ${
                  selectedOwner?.OWNER_ID === owner.OWNER_ID
                    ? 'text-current'
                    : isDarkMode
                      ? 'text-darkolive group-hover:text-tanish-dark'
                      : 'text-darkblue-light group-hover:text-tanish-light'
                }`}>
                  {owner.UNIT} {owner.STREET}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Violation Details Step Component
const ViolationDetailsStep = ({ onComplete, violationData, onChange }) => {
  const { isDarkMode } = useTheme();
  const [violationTypes, setViolationTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchViolationTypes = async () => {
      try {
        const response = await apiService.getViolationTypes();
        setViolationTypes(response);
        setLoading(false);
      } catch (err) {
        setError('Failed to load violation types');
        setLoading(false);
      }
    };
    fetchViolationTypes();
  }, []);

  if (loading) return <div>Loading violation types...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2">Violation Type</label>
        <select
          value={violationData.violationType?.TYPE_ID || ''}
          onChange={(e) => {
            const selectedType = violationTypes.find(
              vt => vt.TYPE_ID === parseInt(e.target.value)
            );
            onChange({ ...violationData, violationType: selectedType });
          }}
          className={`w-full p-2 rounded-lg ${
            isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
          }`}
          required
        >
          <option value="">Select a violation type</option>
          {violationTypes.map((type) => (
            <option key={type.TYPE_ID} value={type.TYPE_ID}>
              {type.VIOLATION_DESCRIPTION} - ${type.VIOLATION_RATE}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block mb-2">Violation Date</label>
        <input
          type="date"
          value={violationData.violationDate || ''}
          onChange={(e) => onChange({ ...violationData, violationDate: e.target.value })}
          max={new Date().toISOString().split('T')[0]}
          className={`w-full p-2 rounded-lg ${
            isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
          }`}
          required
        />
      </div>
    </div>
  );
};

// Review Step Component
const ReviewStep = ({ owner, violationData }) => {
  const { isDarkMode } = useTheme();
  const dueDate = new Date(violationData.violationDate);
  dueDate.setDate(dueDate.getDate() + 30);

  return (
    <div className={`p-6 rounded-lg ${
      isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'
    }`}>
      <h3 className="text-lg font-bold mb-4">Review Violation Details</h3>
      
      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">Owner Information</h4>
          <p>{owner.FIRST_NAME} {owner.LAST_NAME}</p>
          <p>{owner.UNIT} {owner.STREET}</p>
        </div>

        <div>
          <h4 className="font-semibold">Violation Information</h4>
          <p>{violationData.violationType.VIOLATION_DESCRIPTION}</p>
          <p>Amount: ${violationData.violationType.VIOLATION_RATE}</p>
          <p>Violation Date: {new Date(violationData.violationDate).toLocaleDateString()}</p>
          <p>Payment Due Date: {dueDate.toLocaleDateString()}</p>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-semibold text-yellow-800">System Message Preview</h4>
          <p className="text-sm text-yellow-800">
            A violation has been recorded for your property at {owner.UNIT} {owner.STREET}.
            <br /><br />
            Violation Type: {violationData.violationType.VIOLATION_DESCRIPTION}
            <br />
            Date of Violation: {new Date(violationData.violationDate).toLocaleDateString()}
            <br />
            Amount Due: ${violationData.violationType.VIOLATION_RATE}
            <br />
            Payment Due Date: {dueDate.toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
};

// Main Modal Component
const IssueViolationModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [step, setStep] = useState(1);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [violationData, setViolationData] = useState({
    violationType: null,
    violationDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await apiService.issueViolation({
        ownerId: selectedOwner.OWNER_ID,
        violationTypeId: violationData.violationType.TYPE_ID,
        violationDate: violationData.violationDate
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to issue violation');
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedOwner !== null;
      case 2:
        return violationData.violationType && violationData.violationDate;
      default:
        return true;
    }
  };

  const buttonStyle = `px-4 py-2 rounded-lg ${
    isDarkMode 
      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Issue Violation</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        <div className="flex justify-between px-20 mb-8">
          {[
            { step: 1, icon: User, label: 'SELECT OWNER' },
            { step: 2, icon: AlertTriangle, label: 'VIOLATION DETAILS' },
            { step: 3, icon: CheckCircle, label: 'REVIEW' }
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

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-600 rounded-lg">
            {error}
          </div>
        )}

        <div className="mb-6">
          {step === 1 && (
            <OwnerSelectionStep
              onSelect={setSelectedOwner}
              selectedOwner={selectedOwner}
            />
          )}
          {step === 2 && (
            <ViolationDetailsStep
              onComplete={(data) => {
                setViolationData(data);
                setStep(3);
              }}
              violationData={violationData}
              onChange={setViolationData}
            />
          )}
          {step === 3 && (
            <ReviewStep
              owner={selectedOwner}
              violationData={violationData}
            />
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className={buttonStyle}
            disabled={loading}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={() => step === 3 ? handleSubmit() : setStep(step + 1)}
            className={buttonStyle}
            disabled={loading || !canProceed()}
          >
            {step === 3 
              ? (loading ? 'Processing...' : 'Issue Violation') 
              : 'Continue'
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueViolationModal;