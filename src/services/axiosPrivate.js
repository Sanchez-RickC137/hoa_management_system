import axios from 'axios';
import { memoizedRefreshToken } from './refreshToken';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const axiosPrivate = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosPrivate.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token');
    console.log('Token being added to request:', token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error?.config;

    if (error?.response?.status === 401 && !config?.sent) {
      config.sent = true;

      try {
        const newToken = await memoizedRefreshToken();
        if (newToken) {
          config.headers.Authorization = `Bearer ${newToken}`;
          return axiosPrivate(config);
        }
      } catch (refreshError) {
        // Let the app handle the logout
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);