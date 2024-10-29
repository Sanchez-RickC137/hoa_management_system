import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';

const NotificationPreferencesModal = ({ preferences, onClose, onSave }) => {
  const { isDarkMode } = useTheme();

  // Initialize state based on current preferences
  // preferences will contain the NOTIFICATION_PREF_ID and individual settings
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [settings, setSettings] = useState({
    messages: false,
    newsDocsSurveys: false,
    payments: false,
    charges: false
  });

  // Set initial state when preferences prop changes
  useEffect(() => {
    if (preferences) {
      setEmailEnabled(preferences.EMAIL_ENABLED === 1);
      setSettings({
        messages: preferences.MESSAGES_ENABLED === 1,
        newsDocsSurveys: preferences.NEWS_DOCS_ENABLED === 1,
        payments: preferences.PAYMENTS_ENABLED === 1,
        charges: preferences.CHARGES_ENABLED === 1
      });
    }
  }, [preferences]);

  const handleSave = async () => {
    try {
      // Send exactly what the backend expects
      const preferencesToSave = {
        EMAIL_ENABLED: emailEnabled ? 1 : 0,
        MESSAGES_ENABLED: settings.messages ? 1 : 0,
        NEWS_DOCS_ENABLED: settings.newsDocsSurveys ? 1 : 0,
        PAYMENTS_ENABLED: settings.payments ? 1 : 0,
        CHARGES_ENABLED: settings.charges ? 1 : 0
      };

      console.log('Saving preferences:', preferencesToSave);
      await onSave(preferencesToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const handleEnableAll = () => {
    setEmailEnabled(true);
    setSettings({
      messages: true,
      newsDocsSurveys: true,
      payments: true,
      charges: true
    });
  };

  const handleDisableAll = () => {
    setEmailEnabled(false);
    setSettings({
      messages: false,
      newsDocsSurveys: false,
      payments: false,
      charges: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} p-6 rounded-lg shadow-lg max-w-md w-full m-4`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Edit Notification Preferences
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 hover:bg-opacity-80 rounded-full ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}
          >
            <X size={24} />
          </button>
        </div>

        <div className={`space-y-6 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
          {/* Quick Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleEnableAll}
              className="text-sm hover:underline"
            >
              Enable All
            </button>
            <button
              type="button"
              onClick={handleDisableAll}
              className="text-sm hover:underline"
            >
              Disable All
            </button>
          </div>

          {/* Master Toggle */}
          <div className="mb-6">
            <div className={`flex items-center space-x-2 p-4 rounded-lg bg-opacity-50 border ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              <input
                type="checkbox"
                id="email-enabled"
                checked={emailEnabled}
                onChange={(e) => {
                  setEmailEnabled(e.target.checked);
                  if (!e.target.checked) {
                    setSettings({
                      messages: false,
                      newsDocsSurveys: false,
                      payments: false,
                      charges: false
                    });
                  }
                }}
                className="form-checkbox h-5 w-5"
              />
              <label htmlFor="email-enabled" className="font-medium">
                Enable Email Communications
              </label>
            </div>
          </div>

          {/* Notification Settings */}
          <div className={`space-y-4 ${!emailEnabled ? 'opacity-50' : ''}`}>
            <div className="p-4 rounded-lg bg-opacity-50">
              <div className="space-y-3">
                {/* Messages */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="messages-enabled"
                    checked={settings.messages}
                    onChange={(e) => setSettings(prev => ({ ...prev, messages: e.target.checked }))}
                    disabled={!emailEnabled}
                    className="form-checkbox h-5 w-5 mr-2"
                  />
                  <label htmlFor="messages-enabled">Message Notifications</label>
                </div>

                {/* News/Docs/Surveys */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="news-docs-enabled"
                    checked={settings.newsDocsSurveys}
                    onChange={(e) => setSettings(prev => ({ ...prev, newsDocsSurveys: e.target.checked }))}
                    disabled={!emailEnabled}
                    className="form-checkbox h-5 w-5 mr-2"
                  />
                  <label htmlFor="news-docs-enabled">News, Documents & Surveys</label>
                </div>

                {/* Payments */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="payments-enabled"
                    checked={settings.payments}
                    onChange={(e) => setSettings(prev => ({ ...prev, payments: e.target.checked }))}
                    disabled={!emailEnabled}
                    className="form-checkbox h-5 w-5 mr-2"
                  />
                  <label htmlFor="payments-enabled">Payment Notifications</label>
                </div>

                {/* Charges */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="charges-enabled"
                    checked={settings.charges}
                    onChange={(e) => setSettings(prev => ({ ...prev, charges: e.target.checked }))}
                    disabled={!emailEnabled}
                    className="form-checkbox h-5 w-5 mr-2"
                  />
                  <label htmlFor="charges-enabled">Charges & Assessments</label>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={onClose}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'}`}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPreferencesModal;