import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:7071/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const login = (email, password) => {
  return apiClient.post('/auth/login', { email, password });
};

export const register = (email, password, tenantName) => {
  return apiClient.post('/auth/register', { email, password, tenantName });
};

// Asset APIs
export const getUploadUrl = (fileName, contentType) => {
  return apiClient.post('/assets/upload-url', { fileName, contentType });
};

export const listAssets = () => {
  return apiClient.get('/assets/list');
};

export const deleteAsset = (assetId) => {
  return apiClient.delete(`/assets/delete/${assetId}`);
};

// Subscription APIs
export const createCheckoutSession = (priceId) => {
  return apiClient.post('/subscription/create', { priceId });
};

export default apiClient;