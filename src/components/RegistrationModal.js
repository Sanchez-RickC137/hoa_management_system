import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';

const RegistrationModal = ({ accountId, ownerId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await apiService.register({ 
        accountId, 
        ownerId, 
        firstName, 
        lastName, 
        email, 
        phoneNumber, 
        password 
      });
      onSuccess();
      navigate('/login');
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  const handleContinue = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSubmit();
    }
  };

  const buttonStyle = `px-4 py-2 rounded-lg ${
    isDarkMode
      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
  }`;

  const inputStyle = `w-full p-2 rounded-lg border ${
    isDarkMode ? 'bg-mutedolive border-tanish-dark text-darkolive' : 'bg-palebluegrey border-darkblue-light'
  }`;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-md w-full`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Complete Registration</h2>
          <button onClick={onClose}>&times;</button>
        </div>

        <div className="flex justify-between mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className={`flex flex-col items-center ${step >= i ? 'text-tanish-dark' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full ${
                step >= i 
                  ? isDarkMode ? 'bg-darkblue-dark' : 'bg-greenblack-light'
                  : 'bg-gray-300'
              } flex items-center justify-center text-white font-bold mb-2`}>
                {i}
              </div>
              <span className="text-xs">
                {i === 1 ? 'PERSONAL INFO' : i === 2 ? 'CONTACT INFO' : 'PASSWORD'}
              </span>
            </div>
          ))}
        </div>

        {renderStep()}
        {error && <p className="text-red-500 mt-4">{error}</p>}
        <div className="flex justify-between mt-8">
          <button
            onClick={step === 1 ? onClose : () => setStep(step - 1)}
            className={buttonStyle}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </button>
          <button
            onClick={handleContinue}
            className={buttonStyle}
          >
            {step === 3 ? 'Complete Registration' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationModal;