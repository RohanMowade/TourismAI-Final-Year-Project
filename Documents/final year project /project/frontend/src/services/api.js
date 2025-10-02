// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const api = {
  // Authentication
  login: async (credentials) => {
    const response = await apiClient.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Destinations
  getDestinations: async () => {
    const response = await apiClient.get('/destinations');
    return response.data;
  },

  // Sales
  getSales: async (params = {}) => {
    const response = await apiClient.get('/sales', { params });
    return response.data;
  },

  // Dashboard Analytics
  getDashboardData: async (period = '30d') => {
    const response = await apiClient.get('/analytics/dashboard', {
      params: { period }
    });
    return response.data;
  },

  // Predictions
  generatePredictions: async (modelType, destinationId, forecastDays) => {
    const response = await apiClient.post('/predictions/generate', {
      model_type: modelType,
      destination_id: destinationId,
      forecast_days: forecastDays
    });
    return response.data;
  },

  getPredictions: async (params = {}) => {
    const response = await apiClient.get('/predictions', { params });
    return response.data;
  },

  // Market Basket Analysis
  getMarketBasketAnalysis: async (minSupport = 0.01, minConfidence = 0.3) => {
    const response = await apiClient.post('/analytics/market-basket', {
      min_support: minSupport,
      min_confidence: minConfidence
    });
    return response.data;
  },

  // Health check
  healthCheck: async () => {
    const response = await apiClient.get('/health');
    return response.data;
  }
};

export default api;
