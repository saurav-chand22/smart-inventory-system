import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        message = 'Cannot connect to Backend Server (http://localhost:8080). Please ensure your Spring Boot backend is running.';
      } else {
        message = 'An unexpected error occurred';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
