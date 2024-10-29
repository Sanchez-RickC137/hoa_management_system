import React, { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { X, Search, UserPlus, UserMinus } from 'lucide-react';
import { apiService } from '../services/apiService';

const UpdateBoardMembersModal = ({ onClose }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const [currentMembers, setCurrentMembers] = useState([]);
  const [boardRoles, setBoardRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchOwners();
    }
  }, [searchTerm]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersResponse, rolesResponse] = await Promise.all([
        apiService.getActiveBoardMembers(),
        apiService.getBoardMemberRoles()
      ]);
      setCurrentMembers(membersResponse);
      setBoardRoles(rolesResponse);
    } catch (error) {
      setError('Failed to load board member data');
      console.error('Error fetching board data:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchOwners = async () => {
    try {
      const response = await apiService.searchActiveOwners(searchTerm);
      // Filter out owners who are already board members
      const filteredResults = response.filter(owner => 
        !currentMembers.some(member => member.OWNER_ID === owner.OWNER_ID)
      );
      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching owners:', error);
    }
  };

  const handleEndRole = async (ownerId, boardMemberId) => {
    try {
      setError('');
      await apiService.endBoardMemberRole(ownerId, boardMemberId);
      fetchData(); // Refresh the list
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to end board member role');
    }
  };

  const handleAddMember = async () => {
    try {
      setError('');
      await apiService.addBoardMember(selectedOwner.OWNER_ID, selectedRole);
      setIsAddingNew(false);
      setSelectedOwner(null);
      setSelectedRole('');
      setSearchTerm('');
      fetchData(); // Refresh the list
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to add board member');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className={`${isDarkMode ? 'bg-greenblack-light text-tanish-dark' : 'bg-softcoral text-darkblue-light'} p-8 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Update Board Members</h2>
          <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {/* Current Board Members */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Current Board Members</h3>
          <div className="bg-opacity-50 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className={`${isDarkMode ? 'bg-darkblue-dark' : 'bg-greenblack-light'} text-tanish-light`}>
                <tr>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Start Date</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}>
                {currentMembers.map((member) => (
                  <tr key={`${member.OWNER_ID}-${member.BOARD_MEMBER_ID}`} className="border-b">
                    <td className="px-6 py-4">{member.FIRST_NAME} {member.LAST_NAME}</td>
                    <td className="px-6 py-4">{member.MEMBER_ROLE}</td>
                    <td className="px-6 py-4">{new Date(member.START_DATE).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      {member.OWNER_ID !== 999999999 && member.OWNER_ID !== user.id && (
                        <button
                          onClick={() => handleEndRole(member.OWNER_ID, member.BOARD_MEMBER_ID)}
                          className="flex items-center text-red-500 hover:text-red-700"
                        >
                          <UserMinus className="w-4 h-4 mr-1" />
                          End Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add New Board Member */}
        <div className="mb-6">
          <button
            onClick={() => setIsAddingNew(true)}
            className={`flex items-center px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Add New Board Member
          </button>
        </div>

        {isAddingNew && (
          <div className={`p-6 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'}`}>
            <h3 className="text-lg font-semibold mb-4">Add New Board Member</h3>
            
            {/* Owner Search */}
            <div className="mb-4">
              <label className="block mb-2">Search Owner</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or address"
                  className={`w-full p-2 pl-10 rounded-lg ${
                    isDarkMode 
                      ? 'bg-darkblue-dark text-tanish-dark' 
                      : 'bg-softcoral text-darkblue-light'
                  }`}
                />
                <Search className={`absolute left-3 top-2.5 w-5 h-5 ${isDarkMode ? 'text-darkolive' : 'text-gray-400'}`} />
              </div>

              {/* Search Results */}
              {searchTerm && searchResults.length > 0 && (
                <div className={`mt-2 p-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-darkblue-dark' 
                    : 'bg-softcoral'
                }`}>
                  {searchResults.map((owner) => (
                    <div
                      key={owner.OWNER_ID}
                      onClick={() => {
                        setSelectedOwner(owner);
                        setSearchTerm('');
                      }}
                      className={`p-2 rounded cursor-pointer ${
                        isDarkMode 
                          ? 'hover:bg-mutedolive' 
                          : 'hover:bg-palebluegrey'
                      } ${
                        selectedOwner?.OWNER_ID === owner.OWNER_ID
                          ? isDarkMode 
                            ? 'bg-mutedolive' 
                            : 'bg-palebluegrey'
                          : ''
                      }`}
                    >
                      <p>{owner.FIRST_NAME} {owner.LAST_NAME}</p>
                      <p className="text-sm opacity-75">
                        {owner.UNIT} {owner.STREET}, {owner.CITY}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {searchTerm && searchResults.length === 0 && (
                <p className="mt-2 text-sm">No matching owners found</p>
              )}
            </div>

            {/* Selected Owner Display */}
            {selectedOwner && (
              <div className={`mb-4 p-4 rounded-lg ${
                isDarkMode 
                  ? 'bg-darkblue-dark' 
                  : 'bg-softcoral'
              }`}>
                <p className="font-semibold">Selected Owner:</p>
                <p>{selectedOwner.FIRST_NAME} {selectedOwner.LAST_NAME}</p>
                <p className="text-sm opacity-75">
                  {selectedOwner.UNIT} {selectedOwner.STREET}, {selectedOwner.CITY}
                </p>
              </div>
            )}

            {/* Role Selection */}
            {selectedOwner && (
              <div className="mb-4">
                <label className="block mb-2">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className={`w-full p-2 rounded-lg ${
                    isDarkMode 
                      ? 'bg-darkblue-dark text-tanish-dark' 
                      : 'bg-softcoral text-darkblue-light'
                  }`}
                >
                  <option value="">Select a role...</option>
                  {boardRoles
                    .filter(role => role.MEMBER_ID !== 1) // Exclude administrator role
                    .map(role => (
                      <option key={role.MEMBER_ID} value={role.MEMBER_ID}>
                        {role.MEMBER_ROLE}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setIsAddingNew(false);
                  setSelectedOwner(null);
                  setSelectedRole('');
                  setSearchTerm('');
                }}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-mutedolive text-darkolive' 
                    : 'bg-palebluegrey text-darkblue-light'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!selectedOwner || !selectedRole}
                className={`px-4 py-2 rounded-lg ${
                  isDarkMode 
                    ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                    : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
                } ${
                  (!selectedOwner || !selectedRole) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Add Member
              </button>
            </div>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-darkblue-dark hover:bg-darkblue-light text-tanish-dark' 
                : 'bg-greenblack-light hover:bg-darkblue-light text-tanish-light'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateBoardMembersModal;