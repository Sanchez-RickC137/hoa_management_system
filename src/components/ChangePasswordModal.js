import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { apiService } from '../services/apiService';
import { X } from 'lucide-react';

const ChangePasswordModal = ({ user, onClose, onSuccess }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await apiService.changePassword(user.id, newPassword);
      onSuccess();
    } catch (error) {
      setError('Failed to change password. Please try again.');
    }
  };

  const inputStyle = `w-full p-2 rounded-lg border ${
    isDarkMode ? 'bg-mutedolive border-tanish-dark text-darkolive' : 'bg-palebluegrey border-darkblue-light'
  }`;

  const buttonStyle = `px-4 py-2 rounded-lg ${
    isDarkMode
      ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark'
      : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
  }`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-6 rounded-lg shadow-lg max-w-md w-full m-4 `}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold mb-6">Change Password</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>
        <p className="mb-4">You must change your password before proceeding.</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-2">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={inputStyle}
              required
            />
          </div>
          <div>
            <label className="block mb-2">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={inputStyle}
              required
            />
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="submit" className={buttonStyle}>
              Change Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;