import { axiosPublic } from './axiosConfig';

class AuthService {
  async login(email, password) {
    try {
      const response = await axiosPublic.post('/login', { email, password });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const currentToken = localStorage.getItem('token');
      const response = await axiosPublic.post('/refresh-token', { token: currentToken });
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
      }
      return response.data.token;
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  }

  async register(userData) {
    try {
      const response = await axiosPublic.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async forgotPassword(email) {
    try {
      return await axiosPublic.post('/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      return await axiosPublic.post('/reset-password', { token, newPassword });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async verifyRegistration(accountId, ownerId, tempCode) {
    try {
      const response = await axiosPublic.post('/verify-registration', {
        accountId,
        ownerId,
        tempCode
      });
      return response.data; // Return just the data portion 
    } catch (error) {
      console.error('Verify registration error:', error);
      throw error;
    }
  }

  logout() {
    localStorage.removeItem('token');
  }
}

export const authService = new AuthService();