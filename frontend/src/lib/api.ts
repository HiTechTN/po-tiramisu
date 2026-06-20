import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const res = await axios.post(`${API_URL}/api/auth/refresh`, {
              refresh_token: refreshToken,
            });
            const newToken = res.data.access_token;
            localStorage.setItem('access_token', newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          } catch {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        } else {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  register: (data: { email: string; password: string; full_name: string; phone?: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/api/auth/refresh', { refresh_token: refreshToken }),
  getMe: () => api.get('/api/auth/me'),
};

// Products API
export const productsApi = {
  list: (params?: { skip?: number; limit?: number; category?: string; search?: string; sort?: string; order?: string }) =>
    api.get('/api/products', { params }),
  get: (idOrSlug: string) => api.get(`/api/products/${idOrSlug}`),
  getCategories: () => api.get('/api/products/categories'),
  getReviews: (productId: number) => api.get(`/api/products/${productId}/reviews`),
  createReview: (productId: number, data: any) =>
    api.post(`/api/products/${productId}/reviews`, data),
};

// Cart API
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

// Orders API
export const ordersApi = {
  list: (params?: { skip?: number; limit?: number; status?: string }) =>
    api.get('/api/orders', { params }),
  get: (orderId: number) => api.get(`/api/orders/${orderId}`),
  create: (data: { address_id: number; payment_method: string; delivery_date?: string; notes?: string; promo_code?: string }) =>
    api.post('/api/orders', data),
  cancel: (orderId: number) => api.patch(`/api/orders/${orderId}/cancel`),
};

// Payments API
export const paymentsApi = {
  initFlouci: (orderId: number, amount: number) =>
    api.post('/api/payments/flouci/init', { order_id: orderId, amount_dt: amount }),
  demoComplete: (orderId: number) =>
    api.post(`/api/payments/demo-complete/${orderId}`),
  getStatus: (orderId: number) => api.get(`/api/payments/${orderId}/status`),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/api/users/me'),
  updateProfile: (data: { full_name?: string; phone?: string; avatar_url?: string }) =>
    api.put('/api/users/me', data),
  getAddresses: () => api.get('/api/addresses'),
  createAddress: (data: any) => api.post('/api/addresses', data),
  updateAddress: (id: number, data: any) => api.put(`/api/addresses/${id}`, data),
  deleteAddress: (id: number) => api.delete(`/api/addresses/${id}`),
};

// Deliveries API
export const deliveriesApi = {
  track: (deliveryId: number) => api.get(`/api/deliveries/${deliveryId}/track`),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/api/admin/dashboard'),
  getOrders: (params?: any) => api.get('/api/admin/orders', { params }),
  updateOrderStatus: (orderId: number, status: string, notes?: string) =>
    api.patch(`/api/admin/orders/${orderId}/status`, { status, notes }),
  getProducts: (params?: any) => api.get('/api/admin/products', { params }),
  createProduct: (data: any) => api.post('/api/admin/products', data),
  updateProduct: (productId: number, data: any) =>
    api.put(`/api/admin/products/${productId}`, data),
  deleteProduct: (productId: number) => api.delete(`/api/admin/products/${productId}`),
  getInventory: () => api.get('/api/admin/inventory'),
  adjustInventory: (productId: number, adjustment: number) =>
    api.post('/api/admin/inventory/adjust', { product_id: productId, adjustment }),
  getUsers: (params?: any) => api.get('/api/admin/users', { params }),
  updateUser: (userId: number, data: any) => api.patch(`/api/admin/users/${userId}`, data),
};
