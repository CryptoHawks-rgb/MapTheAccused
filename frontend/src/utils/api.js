import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
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
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API methods
export const accusedAPI = {
  getAll: () => api.get('/accused'),
  getById: (id) => api.get(`/accused/${id}`),
  create: (data) => api.post('/accused', data),
  update: (id, data) => api.put(`/accused/${id}`, data),
  delete: (id) => api.delete(`/accused/${id}`),
  search: (query, searchType) => api.post('/search', { query, search_type: searchType })
};

export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats')
};

export const userAPI = {
  getAll: () => api.get('/users'),
  delete: (userId) => api.delete(`/users/${userId}`)
};

export const adminAPI = {
  seedData: () => api.post('/seed-data')
};