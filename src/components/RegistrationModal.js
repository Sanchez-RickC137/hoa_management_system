import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';
import { CheckCircle, X } from 'lucide-react';

const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecial: true
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatPhoneNumber = (input, previousValue) => {
  // If backspacing, return the previous value minus the last character
  if (input.length < previousValue.length) {
    return input;
  }

  // Strip all non-numeric characters
  const cleaned = input.replace(/\D/g, '');

  // Limit to 10 digits
  const truncated = cleaned.slice(0, 10);
  
  // Format the number
  let formatted = truncated;
  if (truncated.length > 0) {
    if (truncated.length <= 3) {
      formatted = `(${truncated}`;
    } else if (truncated.length <= 6) {
      formatted = `(${truncated.slice(0, 3)}) ${truncated.slice(3)}`;
    } else {
      formatted = `(${truncated.slice(0, 3)}) ${truncated.slice(3, 6)}-${truncated.slice(6)}`;
    }
  }
  
  return formatted;
};

const validatePassword = (password) => {
  const errors = [];
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`);
  }
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (PASSWORD_REQUIREMENTS.requireSpecial && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

const SuccessModal = ({ email, onClose }) => {
  const { isDarkMode } = useTheme();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-md w-full mx-4`}>
        <div className="flex flex-col items-center text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-4">Registration Successful!</h2>
          <p className="mb-6">
            Your account has been created successfully. You can now login with your email: <strong>{email}</strong>
          </p>
          <button
            onClick={onClose}
            className={`px-6 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Continue to Login
          </button>
        </div>
      </div>
    </div>
  );
};

const RegistrationModal = ({ accountId, ownerId, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isDarkMode } = useTheme();

  const [emailValid, setEmailValid] = useState(false);
  const [phoneValid, setPhoneValid] = useState(false);
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordsMatch, setPasswordsMatch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEmailValid(validateEmail(email));
    setErrors(prev => ({
      ...prev,
      email: validateEmail(email) ? '' : 'Please enter a valid email address'
    }));
  }, [email]);

  useEffect(() => {
    const cleanedPhone = phoneNumber.replace(/\D/g, '');
    setPhoneValid(cleanedPhone.length === 10);
    setErrors(prev => ({
      ...prev,
      phone: cleanedPhone.length === 10 ? '' : 'Please enter a complete phone number'
    }));
  }, [phoneNumber]);

  useEffect(() => {
    const passwordErrors = validatePassword(password);
    setPasswordValid(passwordErrors.length === 0);
    setPasswordsMatch(password === confirmPassword && password !== '');
    
    setErrors(prev => ({
      ...prev,
      password: passwordErrors,
      confirmPassword: password === confirmPassword ? '' : 'Passwords do not match'
    }));
  }, [password, confirmPassword]);

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value, phoneNumber);
    setPhoneNumber(formatted);
  };

  const validateStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return firstName.trim() !== '' && lastName.trim() !== '';
      case 2:
        return emailValid && phoneValid;
      case 3:
        return passwordValid && passwordsMatch;
      default:
        return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authService.register({ 
        accountId, 
        ownerId, 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.trim(), 
        phoneNumber: phoneNumber.replace(/\D/g, ''),
        password 
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.response?.data?.message || 'Registration failed. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onSuccess?.();
  };

  const handleContinue = () => {
    if (!validateStep(step)) {
      return;
    }
    
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
              <label className="block mb-2" aria-label="first name">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputStyle}
                required
              />
            </div>
            <div>
              <label className="block mb-2" aria-label="last name">Last Name</label>
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
              <label className="block mb-2" aria-label="email">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputStyle}
                required
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block mb-2" aria-label="phone">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="(123) 456-7890"
                className={inputStyle}
                required
              />
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div>
              <label className="block mb-2" aria-label="password">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputStyle}
                required
              />
              {errors.password && errors.password.map((err, index) => (
                <p key={index} className="text-red-500 text-sm mt-1">{err}</p>
              ))}
            </div>
            <div>
              <label className="block mb-2" aria-label="confirm password">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputStyle}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
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
          {errors.submit && <p className="text-red-500 mt-4">{errors.submit}</p>}
          
          <div className="flex justify-between mt-8">
            <button
              onClick={step === 1 ? onClose : () => setStep(step - 1)}
              className={buttonStyle}
              disabled={loading}
            >
              {step === 1 ? 'Cancel' : 'Back'}
            </button>
            <button
              onClick={handleContinue}
              className={`${buttonStyle} ${(!validateStep(step) || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!validateStep(step) || loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <span className="animate-spin mr-2">⌛</span>
                  Processing...
                </div>
              ) : (
                step === 3 ? 'Complete Registration' : 'Continue'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {showSuccessModal && (
        <SuccessModal 
          email={email} 
          onClose={handleSuccessClose}
        />
      )}
    </>
  );
};

export default RegistrationModal;