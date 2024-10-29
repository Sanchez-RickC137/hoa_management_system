import mem from 'mem';
import { axiosPublic } from './axiosPublic';

const refreshTokenFn = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const response = await axiosPublic.post('/refresh-token', { token });

    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      return response.data.token;
    }
    
    throw new Error('No token in refresh response');
  } catch (error) {
    localStorage.removeItem('token');
    throw error;
  }
};

// Memoize refresh token function to prevent multiple calls
export const memoizedRefreshToken = mem(refreshTokenFn, {
  maxAge: 10000 // Cache for 10 seconds
});
