import React, { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { X } from 'lucide-react';
import { validateName } from '../utils/validation';

const PersonalInfoModal = ({ data, onClose, onSave }) => {
 const { isDarkMode } = useTheme();
 const [formData, setFormData] = useState({
   FIRST_NAME: data?.FIRST_NAME || '',
   LAST_NAME: data?.LAST_NAME || ''
 });
 const [errors, setErrors] = useState({});

 const handleNameChange = (field, value) => {
   setFormData(prev => ({ ...prev, [field]: value }));
   setErrors(prev => ({ 
     ...prev, 
     [field]: !validateName(value) ? 'Name can only contain letters, spaces and hyphens' : '' 
   }));
 };

 const handleSubmit = async (e) => {
   e.preventDefault();
   
   const newErrors = {
     FIRST_NAME: !validateName(formData.FIRST_NAME) ? 'Name can only contain letters, spaces and hyphens' : '',
     LAST_NAME: !validateName(formData.LAST_NAME) ? 'Name can only contain letters, spaces and hyphens' : ''
   };

   setErrors(newErrors);

   if (Object.values(newErrors).some(error => error)) {
     return;
   }

   try {
     await onSave(formData);
     onClose();
   } catch (error) {
     console.error('Error saving personal info:', error);
   }
 };

 return (
   <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
     <div className={`${isDarkMode ? 'bg-greenblack-light' : 'bg-softcoral'} p-6 rounded-lg shadow-lg max-w-md w-full m-4`}>
       <div className="flex justify-between items-center mb-6">
         <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-tanish-dark' : 'text-darkblue-light'}`}>
           Edit Personal Information
         </h2>
         <button onClick={onClose} className="p-2 hover:bg-opacity-80 rounded-full">
           <X size={24} />
         </button>
       </div>

       <form onSubmit={handleSubmit} className="space-y-4">
         <div>
           <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
             First Name
           </label>
           <input
             type="text"
             value={formData.FIRST_NAME}
             onChange={(e) => handleNameChange('FIRST_NAME', e.target.value)}
             className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'} ${errors.FIRST_NAME ? 'border-red-500' : ''}`}
             required
           />
           {errors.FIRST_NAME && <p className="text-red-500 text-sm mt-1">{errors.FIRST_NAME}</p>}
         </div>

         <div>
           <label className={`block mb-2 ${isDarkMode ? 'text-darkolive' : 'text-darkblue-light'}`}>
             Last Name
           </label>
           <input
             type="text"
             value={formData.LAST_NAME}
             onChange={(e) => handleNameChange('LAST_NAME', e.target.value)}
             className={`w-full p-2 rounded-lg ${isDarkMode ? 'bg-mutedolive text-darkolive' : 'bg-palebluegrey text-darkblue-light'} ${errors.LAST_NAME ? 'border-red-500' : ''}`}
             required
           />
           {errors.LAST_NAME && <p className="text-red-500 text-sm mt-1">{errors.LAST_NAME}</p>}
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

export default PersonalInfoModal;