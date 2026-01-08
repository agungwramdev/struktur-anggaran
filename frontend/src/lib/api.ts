import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
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

      // Only clear auth and redirect if this is an auth endpoint failure
      // Don't clear for other endpoints (user might just not be logged in yet)
      if (typeof window !== 'undefined') {
        const isAuthEndpoint = error.config?.url?.includes('/auth/');
        const isLoginPage = window.location.pathname.includes('/login');

        console.log('🔍 401 Analysis:', {
          isAuthEndpoint,
          isLoginPage,
          url: error.config?.url
        });

        // Only clear localStorage if this is an auth endpoint failure (token is actually invalid)
        // OR if we're not on the login page and this is a protected endpoint
        if (isAuthEndpoint && !isLoginPage) {
          console.error('🗑️ Clearing auth due to failed auth endpoint');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        } else if (!isLoginPage && !isAuthEndpoint) {
          // For non-auth endpoints, don't clear localStorage
          // Let the ProtectedRoute handle the redirect
          console.log('⚠️ 401 on non-auth endpoint, not clearing localStorage');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
