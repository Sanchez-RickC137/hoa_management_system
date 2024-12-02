// src/__tests__/security/testUtils.js
const axios = require('axios');

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosPublic = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

const axiosPrivate = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

const testAuthService = {
  async login(email, password) {
    const response = await axiosPublic.post('/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  async refreshToken() {
    const currentToken = localStorage.getItem('token');
    const response = await axiosPublic.post('/refresh-token', { token: currentToken });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data.token;
  }
};

module.exports = {
  axiosPublic,
  axiosPrivate,
  testAuthService
};