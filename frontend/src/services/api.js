import axios from 'axios';

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rit_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getProducts = (params) => api.get('/products', { params }).then((r) => r.data);
export const getProduct = (id) => api.get(`/products/${id}`).then((r) => r.data);
export const createProduct = (data) => api.post('/products', data).then((r) => r.data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data).then((r) => r.data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const getProductStats = () => api.get('/products/stats/summary').then((r) => r.data);

export const getCategories = () => api.get('/categories').then((r) => r.data);
export const createCategory = (data) => api.post('/categories', data).then((r) => r.data);

export const login = (email, password) => api.post('/auth/login', { email, password }).then((r) => r.data);
export const register = (email, password) => api.post('/auth/register', { email, password }).then((r) => r.data);
export const getCurrentUser = () => api.get('/auth/me').then((r) => r.data);
