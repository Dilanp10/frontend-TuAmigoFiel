import axios from 'axios';

const baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:4000'
  : 'https://backend-tuamigofiel.onrender.com';

const api = axios.create({
  baseURL: baseURL, 
  timeout: 30000,
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;