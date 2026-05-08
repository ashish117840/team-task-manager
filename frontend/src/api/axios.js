import axios from 'axios';

const rawBaseURL = import.meta.env.VITE_API_URL || '';
const baseURL = rawBaseURL.replace(/\/$/, '');
const apiBaseURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

const instance = axios.create({
  baseURL: apiBaseURL
});

instance.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default instance;
