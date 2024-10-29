import { authService } from './authService';
import { apiService } from './apiService';
import { axiosPublic, axiosPrivate } from './axiosConfig';

export { authService, apiService, axiosPublic, axiosPrivate };

// For backward compatibility during migration
export default {
  ...apiService,
  auth: authService
};
