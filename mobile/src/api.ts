import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/api/auth/refresh`, {
            refresh_token: refreshToken,
          });
          await AsyncStorage.setItem('access_token', data.access_token);
          error.config.headers.Authorization = `Bearer ${data.access_token}`;
          return api(error.config);
        } catch {
          await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth API ───────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get('/api/auth/me'),
};

// ── Products API ───────────────────────────────
export const productsApi = {
  list: (params?: Record<string, any>) => api.get('/api/products', { params }),
  get: (idOrSlug: string) => api.get(`/api/products/${idOrSlug}`),
  getCategories: () => api.get('/api/products/categories'),
  getReviews: (productId: number) => api.get(`/api/products/${productId}/reviews`),
  addReview: (productId: number, data: any) => api.post(`/api/products/${productId}/reviews`, data),
};

// ── Cart API ───────────────────────────────────
export const cartApi = {
  get: () => api.get('/api/cart'),
  add: (productId: number, quantity: number = 1) =>
    api.post('/api/cart/add', { product_id: productId, quantity }),
  update: (productId: number, quantity: number) =>
    api.put(`/api/cart/update?product_id=${productId}&quantity=${quantity}`),
  remove: (productId: number) => api.delete(`/api/cart/remove/${productId}`),
  clear: () => api.delete('/api/cart/clear'),
  applyPromo: (code: string) => api.post('/api/cart/apply-promo', { promo_code: code }),
};

// ── Orders API ─────────────────────────────────
export const ordersApi = {
  list: (params?: Record<string, any>) => api.get('/api/orders', { params }),
  get: (orderId: number) => api.get(`/api/orders/${orderId}`),
  create: (data: any) => api.post('/api/orders', data),
  cancel: (orderId: number) => api.patch(`/api/orders/${orderId}/cancel`),
};

// ── Payments API ───────────────────────────────
export const paymentsApi = {
  initFlouci: (orderId: number, amount: number) =>
    api.post('/api/payments/flouci/init', { order_id: orderId, amount_dt: amount }),
  demoComplete: (orderId: number) =>
    api.post(`/api/payments/demo-complete/${orderId}`),
  getStatus: (orderId: number) => api.get(`/api/payments/${orderId}/status`),
};

// ── Users API ──────────────────────────────────
export const usersApi = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data: any) => api.put('/api/users/me', data),
  getAddresses: () => api.get('/api/addresses'),
  createAddress: (data: any) => api.post('/api/addresses', data),
  updateAddress: (id: number, data: any) => api.put(`/api/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete(`/api/addresses/${id}`),
};
