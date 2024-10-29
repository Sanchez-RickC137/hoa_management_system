// src/services/axiosConfig.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Public axios instance
export const axiosPublic = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add interceptors to public instance for consistent error handling
axiosPublic.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Public API Error:', {
      status: error.response?.status,
      message: error.message,
      endpoint: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

// Private axios instance
export const axiosPrivate = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add request interceptor to private instance
axiosPrivate.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to private instance
axiosPrivate.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    console.log('Private API Error:', {
      status: error.response?.status,
      message: error.message,
      endpoint: originalRequest?.url,
      method: originalRequest?.method
    });

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const response = await axiosPublic.post('/refresh-token', {
          token: localStorage.getItem('token')
        });

        if (response.data?.token) {
          const newToken = response.data.token;
          localStorage.setItem('token', newToken);
          axiosPrivate.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosPrivate(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);