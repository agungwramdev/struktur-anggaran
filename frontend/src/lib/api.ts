import axios from 'axios';

// Use API_URL for server-side requests (SSR), NEXT_PUBLIC_API_URL for client-side
const getBaseURL = () => {
  // Server-side (in Docker container)
  if (typeof window === 'undefined') {
    return process.env.API_URL || 'http://backend:3001';
  }
  // Client-side (browser) - Use /api prefix for reverse proxy
  // This allows: https://struktur-anggaran.pbj.my.id/api/auth/login
  return process.env.NEXT_PUBLIC_API_URL || '/api';
};

const api = axios.create({
  baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🌐 API Request (authenticated):', config.url);
    } else {
      console.warn('⚠️ API Request without token:', config.url);
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized');
      console.error('Failed request:', error.config?.url);
      console.error('Error details:', error.response?.data);

      if (typeof window !== 'undefined') {
        const isLoginPage = window.location.pathname.includes('/login');

        console.log('🔍 401 Analysis:', {
          isLoginPage,
          url: error.config?.url,
          hasToken: !!localStorage.getItem('token')
        });

        // Don't do anything on login page - let login handler deal with it
        if (isLoginPage) {
          console.log('⚠️ 401 on login page, ignoring');
          return Promise.reject(error);
        }

        // For other pages with 401, token is invalid - clear and redirect
        console.error('🗑️ Clearing auth due to 401 on protected endpoint');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
