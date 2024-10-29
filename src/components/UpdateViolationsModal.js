import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X, Edit, Plus, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';
const EditViolationForm = ({ violation = null, onSave, onCancel }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    description: violation?.VIOLATION_DESCRIPTION || '',
    rate: violation?.VIOLATION_RATE || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }

    if (!formData.rate || formData.rate <= 0) {
      setError('Rate must be greater than 0');
      return;
    }

    try {
      if (violation) {
        await onSave(violation.TYPE_ID, formData);
      } else {
        await onSave(null, formData);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-bold mb-4">
        {violation ? 'Edit Violation Type' : 'Add New Violation Type'}
      </h3>

      <div>
        <label className="block mb-2">Description</label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className={`w-full p-2 rounded-lg ${
            isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
          }`}
          required
        />
      </div>

      <div>
        <label className="block mb-2">Fine Amount ($)</label>
        <input
          type="number"
          value={formData.rate}
          onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
          step="0.01"
          min="0"
          className={`w-full p-2 rounded-lg ${
            isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
          }`}
          required
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className={`px-4 py-2 rounded-lg ${
            isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
          }`}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={`px-4 py-2 rounded-lg ${
            isDarkMode 
              ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
              : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
          }`}
        >
          {violation ? 'Save Changes' : 'Add Violation Type'}
        </button>
      </div>
    </form>
  );
};

const UpdateViolationsModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [violationTypes, setViolationTypes] = useState([]);
  const [selectedViolation, setSelectedViolation] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchViolationTypes();
  }, []);

  const fetchViolationTypes = async () => {
    try {
      const response = await apiService.getViolationTypes();
      setViolationTypes(response);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching violation types:', err);
      setError('Failed to load violation types');
      setLoading(false);
    }
  };

  const handleSave = async (typeId, formData) => {
    try {
      if (typeId) {
        await apiService.updateViolationType(typeId, formData);
      } else {
        await apiService.createViolationType(formData);
      }
      await fetchViolationTypes();
      setSelectedViolation(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving violation type:', error);
      throw new Error('Failed to save violation type');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Manage Violation Types</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading violation types...</p>
          </div>
        ) : error ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : selectedViolation || showAddForm ? (
          <div className="flex-1 overflow-y-auto">
            <EditViolationForm
              violation={selectedViolation}
              onSave={handleSave}
              onCancel={() => {
                setSelectedViolation(null);
                setShowAddForm(false);
              }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setShowAddForm(true)}
                className={`px-4 py-2 rounded-lg flex items-center ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                }`}
              >
                <Plus size={20} className="mr-2" />
                Add New Violation Type
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {violationTypes.map((violation) => (
                  <div
                  key={violation.TYPE_ID}
                  className={`p-4 rounded-lg transition-colors duration-200 ${
                    isDarkMode 
                      ? 'bg-mutedolive hover:bg-darkblue-dark' 
                      : 'bg-palebluegrey hover:bg-greenblack-light'
                  } cursor-pointer group`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-lg font-semibold mb-2 ${
                          isDarkMode 
                            ? 'text-darkolive group-hover:text-tanish-dark' 
                            : 'text-darkblue-light group-hover:text-tanish-light'
                        }`}>
                          {violation.VIOLATION_DESCRIPTION}
                        </h3>
                        <p className={`text-lg font-bold ${
                          isDarkMode 
                            ? 'text-darkolive group-hover:text-tanish-dark' 
                            : 'text-darkblue-light group-hover:text-tanish-light'
                        }`}>
                          {formatCurrency(violation.VIOLATION_RATE)}
                        </p>
                      </div>
                      <button
                        onClick={() => setSelectedViolation(violation)}
                        className={`p-2 rounded-lg hover:bg-opacity-80 opacity-0 group-hover:opacity-100 transition-opacity ${
                          isDarkMode ? 'text-darkolive group-hover:text-tanish-dark' : ''
                        }`}
                      >
                        <Edit size={20} />
                      </button>
                    </div>
                  </div>
                ))}

                {violationTypes.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 mb-4 opacity-50" />
                    <p>No violation types found. Add one to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateViolationsModal;