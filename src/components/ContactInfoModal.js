import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';
import { formatPhoneNumber, validatePhone, validateEmail } from '../utils/validation';

const ContactInfoModal = ({ data, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const [formData, setFormData] = useState({
    EMAIL: data?.EMAIL || '',
    PHONE: data?.PHONE || ''
  });
  const [errors, setErrors] = useState({});

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, PHONE: formatted }));
    setErrors(prev => ({ ...prev, PHONE: !validatePhone(formatted) ? 'Phone must be 10 digits' : '' }));
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, EMAIL: email }));
    setErrors(prev => ({ ...prev, EMAIL: !validateEmail(email) ? 'Invalid email format' : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors = {
      EMAIL: !validateEmail(formData.EMAIL) ? 'Invalid email format' : '',
      PHONE: !validatePhone(formData.PHONE) ? 'Phone must be 10 digits' : ''
    };

    setErrors(newErrors);

    // Check if there are any errors
    if (Object.values(newErrors).some(error => error)) {
      return;
    }

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving contact info:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} p-6 rounded-lg shadow-lg max-w-md w-full m-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Edit Contact Information
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
              Email
            </label>
            <input
              type="email"
              value={formData.EMAIL}
              onChange={handleEmailChange}
              className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'} ${errors.EMAIL ? 'border-red-500' : ''}`}
              required
            />
            {errors.EMAIL && <p className="text-red-500 text-sm mt-1">{errors.EMAIL}</p>}
          </div>

          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
              Phone
            </label>
            <input
              type="tel"
              value={formData.PHONE}
              onChange={handlePhoneChange}
              placeholder="(XXX) XXX-XXXX"
              className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'} ${errors.PHONE ? 'border-red-500' : ''}`}
              required
            />
            {errors.PHONE && <p className="text-red-500 text-sm mt-1">{errors.PHONE}</p>}
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactInfoModal;