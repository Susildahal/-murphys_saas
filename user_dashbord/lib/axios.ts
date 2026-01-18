import axios from 'axios';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import app from '@/app/config/firebase';
import { showErrorToast, showSuccessToast } from './toast-handler';

const auth = getAuth(app);

// Promise to wait for auth state to be ready
let authStateReady = false;
let authReadyPromise: Promise<void> | null = null;

const waitForAuthReady = () => {
  if (authStateReady) {
    return Promise.resolve();
  }
  
  if (!authReadyPromise) {
    authReadyPromise = new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, () => {
        authStateReady = true;
        unsubscribe();
        resolve();
      });
    });
  }
  
  return authReadyPromise;
};

// Create axios instance
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add Firebase token
axiosInstance.interceptors.request.use(
  async (config) => {
    try {
      // Wait for auth state to be ready
      await waitForAuthReady();
      
      const user = auth.currentUser;
      console.log('Current user:', user?.email || 'No user');
      
      if (user) {
        // Force refresh token to ensure it's valid
        const token = await user.getIdToken(true);
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token added to request');
      } else {
        console.warn('No authenticated user found');
      }
    } catch (error) {
      console.error('Error getting token for request:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => {
    // Show success toast for successful requests (optional, can be customized)
    if (response.config.method !== 'get') {
      const method = response.config.method?.toUpperCase();
      const successMessages: Record<string, string> = {
        POST: 'Created successfully',
        PUT: 'Updated successfully',
        PATCH: 'Updated successfully',
        DELETE: 'Deleted successfully',
      };
      
      if (method && successMessages[method]) {
        showSuccessToast(successMessages[method]);
      }
    }
    return response;
  },
  (error) => {
    // Handle different error cases
    if (error.response?.status === 401) {
      console.error('Unauthorized - token might be expired');
      showErrorToast('Your session has expired. Please login again.', 'Authentication Error');
      // You could trigger a logout here if needed
    } else if (error.response?.status === 403) {
      showErrorToast('You do not have permission to perform this action.', 'Access Denied');
    } else if (error.response?.status === 404) {
      showErrorToast('The requested resource was not found.', 'Not Found');
    } else if (error.response?.status === 500) {
      showErrorToast('Something went wrong on the server. Please try again later.', 'Server Error');
    } else if (error.response?.data?.message) {
      showErrorToast(error.response.data.message, 'Error');
    } else if (error.message === 'Network Error') {
      showErrorToast('Network error. Please check your internet connection.', 'Connection Error');
    } else {
      showErrorToast(error.message || 'An unexpected error occurred.', 'Error');
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;