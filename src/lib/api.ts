import axios from 'axios';

// Backend API base URL with /api/v1 prefix per TRD §9.1
const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const apiBase = `${baseURL}/api/v1`;

const api = axios.create({
  baseURL: apiBase,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
