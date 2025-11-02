import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:6500/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const getProducts = (params = {}) => api.get('/products', { params });
export const getProductById = (id) => api.get(`/products/${id}`);
export const createOrder = (orderData) => api.post('/orders', orderData);

// Consultation APIs
export const getConsultationByRef = (ref) => api.get(`/consultations/ref/${ref}`);
export const getConsultationById = (id) => api.get(`/consultations/${id}`);
export const getAllConsultations = (params = {}) => api.get('/consultations', { params });
export const getConsultationStats = () => api.get('/consultations/stats/overview');
export const updateConsultation = (id, data) => api.put(`/consultations/${id}`, data);

export default api;

