import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { User, Mail, Key, Pencil } from 'lucide-react';
import { apiService } from '../services/apiService';
import Sidebar from '../components/layout/Sidebar';
import ChangePasswordModal from '../components/ChangePasswordModal';
import NotificationPreferencesModal from '../components/NotificationPreferencesModal';
import PersonalInfoModal from '../components/PersonalInfoModal';
import ContactInfoModal from '../components/ContactInfoModal';

const InfoSection = ({ title, icon: Icon, children, onEdit, hideEdit }) => {
  const { isDarkMode } = useTheme();
  return (
    <div className={`p-6 ${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} rounded-lg shadow-md h-full`}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Icon className={`w-6 h-6 mr-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`} />
          <h2 className={`text-xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            {title}
          </h2>
        </div>
        <div
          className={`px-4 py-2 rounded-lg flex items-center ${
            hideEdit 
              ? 'invisible' // Keeps the spacing by making the div invisible rather than removing it
              : `${isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'} cursor-pointer`
          }`}
          onClick={!hideEdit ? onEdit : undefined}
        >
          <Pencil className="w-4 h-4 mr-2" />
          Edit
        </div>
      </div>
      <div className={`${isDarkMode ? 'bg-mutedolive' : 'bg-palebluegrey'} rounded-lg p-4`}>
        {children}
      </div>
    </div>
  );
};


const OwnerInfo = () => {
  const [ownerData, setOwnerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const { isDarkMode } = useTheme();

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      const response = await apiService.getOwnerDetails();
      setOwnerData(response);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching owner data:', error);
      setError('Failed to load owner information. Please try again later.');
      setLoading(false);
    }
  };

  const handleEditPersonal = () => {
    setShowPersonalModal(true);
  };

  const handleEditContact = () => {
    setShowContactModal(true);
  };

  const handleSavePersonal = async (data) => {
    try {
      await apiService.updateOwnerPersonalInfo(data);
      await fetchOwnerData();
    } catch (error) {
      console.error('Error updating personal info:', error);
    }
  };
  
  const handleSaveContact = async (data) => {
    try {
      await apiService.updateOwnerContactInfo(data);
      await fetchOwnerData();
    } catch (error) {
      console.error('Error updating contact info:', error);
    }
  };

  const handleSavePreferences = async (preferencesToSave) => {
    try {
      await apiService.updateNotificationPreferences(preferencesToSave);
      await fetchOwnerData(); // Refresh the data
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  if (loading) return (
    <div className={`flex ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} min-h-screen`}>
      <Sidebar />
      <div className="flex-1 p-10">Loading...</div>
    </div>
  );

  if (error) return (
    <div className={`flex ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} min-h-screen`}>
      <Sidebar />
      <div className="flex-1 p-10">Error: {error}</div>
    </div>
  );

  return (
    <div className={`flex flex-col ${isDarkMode ? 'bg-greenblack-dark' : 'bg-tanish-light'} rounded-lg shadow-lg`}>
      <Sidebar />
      <div className={`flex-1 m-4 md:m-10 pt-16 md:pt-0`}>
        {/* Header */}
        <div className="mb-6 md:mb-10 flex justify-center">
          <h1 className={`text-2xl md:text-3xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            Owner Information
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <InfoSection title="Personal Information" icon={User} onEdit={handleEditPersonal}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                  First Name
                </label>
                <p className="text-lg">{ownerData?.FIRST_NAME}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                  Last Name
                </label>
                <p className="text-lg">{ownerData?.LAST_NAME}</p>
              </div>
            </div>
          </InfoSection>

          {/* Contact Information */}
          <InfoSection title="Contact Information" icon={Mail} onEdit={handleEditContact}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                  Email
                </label>
                <p className="text-lg">{ownerData?.EMAIL}</p>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                  Phone
                </label>
                <p className="text-lg">{ownerData?.PHONE}</p>
              </div>
            </div>
          </InfoSection>

          {/* Communication Preferences */}
          <InfoSection 
            title="Communication Preferences" 
            icon={Mail} 
            onEdit={() => setShowNotificationModal(true)}
          >
            <div className={`space-y-4 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
              <div className="flex items-center">
                <div className={`w-4 h-4 mr-2 rounded-full ${
                  ownerData?.EMAIL_ENABLED ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <span className="font-medium">
                  Email Communications: {ownerData?.EMAIL_ENABLED ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className={`pl-6 space-y-2 ${!ownerData?.EMAIL_ENABLED ? 'opacity-50' : ''}`}>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={ownerData?.MESSAGES_ENABLED} 
                    className="mr-2" 
                    disabled 
                  />
                  <label>Message Notifications</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={ownerData?.NEWS_DOCS_ENABLED} 
                    className="mr-2" 
                    disabled 
                  />
                  <label>News, Documents & Surveys</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={ownerData?.PAYMENTS_ENABLED} 
                    className="mr-2" 
                    disabled 
                  />
                  <label>Payment Notifications</label>
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={ownerData?.CHARGES_ENABLED} 
                    className="mr-2" 
                    disabled 
                  />
                  <label>Charges & Assessments</label>
                </div>
              </div>
            </div>
          </InfoSection>

          {/* Security */}
          <InfoSection 
            title="Security" 
            icon={Key}
            hideEdit={true}
          >
            <div className={`space-y-4 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
                  Password
                </label>
                <p className="text-lg">••••••••</p>
              </div>
              
              <div className="pl-6">
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className={`px-4 py-2 rounded-lg ${
                    isDarkMode ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                  }`}
                >
                  Change Password
                </button>
              </div>
            </div>
          </InfoSection>
        </div>

        {showPasswordModal && (
          <ChangePasswordModal
            onClose={() => setShowPasswordModal(false)}
            onSuccess={() => {
              setShowPasswordModal(false);
              fetchOwnerData();
            }}
          />
        )}

        {showNotificationModal && (
          <NotificationPreferencesModal
            preferences={ownerData}
            onClose={() => setShowNotificationModal(false)}
            onSave={handleSavePreferences}
          />
        )}

        {showPersonalModal && (
          <PersonalInfoModal
            data={ownerData}
            onClose={() => setShowPersonalModal(false)}
            onSave={handleSavePersonal}
          />
        )}

        {showContactModal && (
          <ContactInfoModal
            data={ownerData}
            onClose={() => setShowContactModal(false)}
            onSave={handleSaveContact}
          />
        )}
      </div>
    </div>
  );
};

export default OwnerInfo;