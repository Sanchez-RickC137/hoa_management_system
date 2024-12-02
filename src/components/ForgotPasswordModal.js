import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../services/authService';
import { X, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const ForgotPasswordModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (!email.trim()) return;

    try {
      setIsSubmitting(true);
      setStatus({ type: '', message: '' });
      
      await authService.forgotPassword(email);
      
      setStatus({
        type: 'success',
        message: 'Password reset instructions have been sent to your email.'
      });
      
      // Clear form
      setEmail('');
    } catch (error) {
      console.error('Password reset request failed:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to process password reset request. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${
        isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'
      } p-6 rounded-lg shadow-lg max-w-md w-full mx-4`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-opacity-80 rounded-full"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="forgot-password-form">
          {/* Email Input */}
          <div>
            <label htmlFor="forgot-email" className="block mb-2">Email Address</label>
            <div className="relative">
              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-3 pl-10 rounded-lg ${
                  isDarkMode 
                    ? 'bg-mutedolive text-darkolive placeholder-darkolive'
                    : 'bg-palebluegrey text-darkblue-light'
                }`}
                placeholder="Enter your email address"
                required
              />
              <Mail className="absolute left-3 top-3.5 w-5 h-5" />
            </div>
          </div>

          {/* Status Message */}
          {status.message && (
            <div className={`p-4 rounded-lg flex items-start space-x-2 ${
              status.type === 'success' 
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {status.type === 'success' 
                ? <CheckCircle className="w-5 h-5 mt-0.5" />
                : <AlertCircle className="w-5 h-5 mt-0.5" />
              }
              <p>{status.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-mutedolive text-darkolive'
                  : 'bg-palebluegrey text-darkblue-light'
              }`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className={`px-4 py-2 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
                  : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
              } ${(isSubmitting || !email.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
          </div>

          <p className="text-sm text-center mt-4">
            We'll send you an email with instructions to reset your password.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;