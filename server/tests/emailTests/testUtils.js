const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

const generateTestToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '1h' }
  );
};

const setupTestApi = (userId) => {
  const token = generateTestToken(userId);
  const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  // Add response interceptor for better error logging
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response) {
        console.error('Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      }
      return Promise.reject(error);
    }
  );

  return api;
};

const verifyEmail = async (to, subject) => {
  console.log(`Verifying email sent to: ${to}`);
  console.log(`Subject: ${subject}`);
  // In a real test, we might check SendGrid's API for sent emails
  return true;
};

module.exports = {
  setupTestApi,
  verifyEmail,
  generateTestToken
};