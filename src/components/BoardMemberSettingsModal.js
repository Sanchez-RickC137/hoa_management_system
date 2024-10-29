import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Plus, Edit2, Shield, AlertCircle } from 'lucide-react';
import { apiService } from '../services/apiService';

// Quick edit modal component
const EditRoleModal = ({ role, onClose, onSave }) => {
  const { isDarkMode } = useTheme();
  const [roleData, setRoleData] = useState({
    MEMBER_ROLE: role.MEMBER_ROLE,
    ASSESS_FINES: role.ASSESS_FINES === '1',
    CHANGE_RATES: role.CHANGE_RATES === '1',
    CHANGE_MEMBERS: role.CHANGE_MEMBERS === '1'
  });

  const handleSave = () => {
    onSave({
      ...roleData,
      ASSESS_FINES: roleData.ASSESS_FINES ? '1' : '0',
      CHANGE_RATES: roleData.CHANGE_RATES ? '1' : '0',
      CHANGE_MEMBERS: roleData.CHANGE_MEMBERS ? '1' : '0',
      MEMBER_ID: role.MEMBER_ID
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-6 rounded-lg shadow-lg w-96`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Edit Role: {role.MEMBER_ROLE}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className={`block mb-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>Role Title</label>
            <input
              type="text"
              value={roleData.MEMBER_ROLE}
              onChange={(e) => setRoleData({ ...roleData, MEMBER_ROLE: e.target.value })}
              className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive placeholder-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}
            />
          </div>

          <div className={`space-y-2 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={roleData.ASSESS_FINES}
                onChange={(e) => setRoleData({ ...roleData, ASSESS_FINES: e.target.checked })}
                className="mr-2"
              />
              <label>Can Assess Fines</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={roleData.CHANGE_RATES}
                onChange={(e) => setRoleData({ ...roleData, CHANGE_RATES: e.target.checked })}
                className="mr-2"
              />
              <label>Can Change Rates</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={roleData.CHANGE_MEMBERS}
                onChange={(e) => setRoleData({ ...roleData, CHANGE_MEMBERS: e.target.checked })}
                className="mr-2"
              />
              <label>Can Change Members</label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
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

const BoardMemberSettingsModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // State for new role
  const [newRole, setNewRole] = useState({
    MEMBER_ROLE: '',
    ASSESS_FINES: false,
    CHANGE_RATES: false,
    CHANGE_MEMBERS: false
  });

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await apiService.getBoardMemberRoles();
      setRoles(response);
    } catch (err) {
      setError('Failed to load board member roles');
      console.error('Error fetching roles:', err);
    }
  };

  const handleEditRole = async (updatedRole) => {
    try {
      await apiService.updateBoardMemberRole(updatedRole);
      setSuccess('Role updated successfully');
      fetchRoles();
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update role');
      console.error('Error updating role:', err);
    }
  };

  const handleAddNewRole = async () => {
    try {
      if (!newRole.MEMBER_ROLE.trim()) {
        setError('Role title is required');
        return;
      }

      const roleData = {
        ...newRole,
        ASSESS_FINES: newRole.ASSESS_FINES ? '1' : '0',
        CHANGE_RATES: newRole.CHANGE_RATES ? '1' : '0',
        CHANGE_MEMBERS: newRole.CHANGE_MEMBERS ? '1' : '0'
      };

      await apiService.addBoardMemberRole(roleData);
      setSuccess('New role added successfully');
      fetchRoles();
      setNewRole({
        MEMBER_ROLE: '',
        ASSESS_FINES: false,
        CHANGE_RATES: false,
        CHANGE_MEMBERS: false
      });
    } catch (err) {
      setError('Failed to add new role');
      console.error('Error adding role:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`
        ${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} 
        p-8 rounded-lg shadow-lg w-full max-w-2xl mx-4
        max-h-[80vh] flex flex-col
      `}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Board Member Roles</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} className={isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'} />
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-2">
          {/* Current Roles Section */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Current Roles
            </h3>
            <div className="space-y-4">
              {roles.map((role) => (
                <div
                  key={role.MEMBER_ID}
                  className={`p-4 rounded-lg ${
                    isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'
                  } flex justify-between items-center`}
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold">{role.MEMBER_ROLE}</span>
                      {(role.MEMBER_ID === 1 || role.MEMBER_ID === 5) && (
                        <Shield className={isDarkMode ? 'text-darkolive' : 'text-yellow-500'} size={16} />
                      )}
                    </div>
                    <div className="text-sm mt-1 space-x-2">
                      {role.ASSESS_FINES === '1' && (
                        <span className={`${isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-gray-200 text-darkblue-light'} px-2 py-1 rounded-full text-xs`}>
                          Assess Fines
                        </span>
                      )}
                      {role.CHANGE_RATES === '1' && (
                        <span className={`${isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-gray-200 text-darkblue-light'} px-2 py-1 rounded-full text-xs`}>
                          Change Rates
                        </span>
                      )}
                      {role.CHANGE_MEMBERS === '1' && (
                        <span className={`${isDarkMode ? 'bg-darkblue-dark text-tanish-dark' : 'bg-gray-200 text-darkblue-light'} px-2 py-1 rounded-full text-xs`}>
                          Change Members
                        </span>
                      )}
                    </div>
                  </div>
                  {role.MEMBER_ID !== 1 && role.MEMBER_ID !== 5 && (
                    <button
                      onClick={() => {
                        setSelectedRole(role);
                        setShowEditModal(true);
                      }}
                      className={`p-2 rounded-lg hover:bg-opacity-80 ${isDarkMode ? 'text-darkolive' : ''}`}
                    >
                      <Edit2 size={20} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* New Role Section */}
          <div className="mb-8">
            <h3 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
              Add New Role
            </h3>
            <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}>
              <div className="space-y-4">
                <div>
                  <label className="block mb-2">Role Title</label>
                  <input
                    type="text"
                    value={newRole.MEMBER_ROLE}
                    onChange={(e) => setNewRole({ ...newRole, MEMBER_ROLE: e.target.value })}
                    className={`w-full p-2 rounded-lg ${
                      isDarkMode 
                        ? 'bg-greenblack-light text-tanish-dark placeholder-tanish-dark' 
                        : 'bg-tanish-light text-darkblue-light'
                    }`}
                    placeholder="Enter role title..."
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.ASSESS_FINES}
                      onChange={(e) => setNewRole({ ...newRole, ASSESS_FINES: e.target.checked })}
                      className="mr-2"
                    />
                    <label>Can Assess Fines</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.CHANGE_RATES}
                      onChange={(e) => setNewRole({ ...newRole, CHANGE_RATES: e.target.checked })}
                      className="mr-2"
                    />
                    <label>Can Change Rates</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newRole.CHANGE_MEMBERS}
                      onChange={(e) => setNewRole({ ...newRole, CHANGE_MEMBERS: e.target.checked })}
                      className="mr-2"
                    />
                    <label>Can Change Members</label>
                  </div>
                </div>
              </div>
              <button
                onClick={handleAddNewRole}
                className={`mt-4 w-full p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                }`}
              >
                Add New Role
              </button>
            </div>
          </div>
        </div>

        {showEditModal && selectedRole && (
          <EditRoleModal
            role={selectedRole}
            onClose={() => setShowEditModal(false)}
            onSave={handleEditRole}
          />
        )}
      </div>
    </div>
  );
};

export default BoardMemberSettingsModal;