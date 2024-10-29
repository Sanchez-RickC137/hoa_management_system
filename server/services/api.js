// import axios from 'axios';

// const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const setAuthToken = (token) => {
//   if (token) {
//     axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } else {
//     delete axios.defaults.headers.common['Authorization'];
//   }
// };

// export const login = async (email, password) => {
//   const response = await axios.post(`${API_URL}/login`, { email, password });
//   if (response.data.token) {
//     localStorage.setItem('token', response.data.token);
//     setAuthToken(response.data.token);
//   }
//   return response.data;
// };

// export const getProfile = async () => {
//   return axios.get(`${API_URL}/profile`);
// };

// export const getAnnouncements = async () => {
//   return axios.get(`${API_URL}/announcements`);
// };

// export const getAccountOverview = async () => {
//   return axios.get(`${API_URL}/account-overview`);
// };

// export const logout = () => {
//   localStorage.removeItem('token');
//   setAuthToken(null);
// };

// // Check for token and set auth header on app load
// const token = localStorage.getItem('token');
// if (token) {
//   setAuthToken(token);
// }

// const api = {
//   login,
//   getProfile,
//   getAnnouncements,
//   getAccountOverview,
//   logout,
// };

// export default api;