import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Send cookies with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to log outgoing requests (only in dev)
api.interceptors.request.use(
  (config) => {
    if (import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
      });
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    
    // Log errors only in dev (skip 401 on /auth/me - expected after logout)
    if (import.meta.env.DEV && !(error.response?.status === 401 && error.config?.url?.includes('/auth/me'))) {
      console.error('API Error:', {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        message,
      });
    }
    
    return Promise.reject({ message, status: error.response?.status });
  }
);

// Auth APIs
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
};

// Gig APIs
export const gigAPI = {
  getGigs: (params) => api.get('/gigs', { params }),
  getGigById: (id) => api.get(`/gigs/${id}`),
  createGig: (gigData) => api.post('/gigs', gigData),
  getMyGigs: () => api.get('/gigs/my/gigs'),
};

// Bid APIs
export const bidAPI = {
  createBid: (bidData) => api.post('/bids', bidData),
  getBidsForGig: (gigId) => api.get(`/bids/${gigId}`),
  getMyBids: () => api.get('/bids/my-bids'),
  hireBid: (bidId) => api.patch(`/bids/${bidId}/hire`),
};

export default api;