// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app-name.onrender.com' // Render.com'dan aldığınız URL'yi buraya yazın
  : 'http://localhost:5000';

export const API_ENDPOINTS = {
  // User endpoints
  USER_SYNC: `${API_BASE_URL}/api/user/sync`,
  USER_PROFILE: (uid) => `${API_BASE_URL}/api/user/${uid}`,
  USERS_ADD: `${API_BASE_URL}/api/users/add`,
  
  // Product endpoints
  PRODUCTS: `${API_BASE_URL}/api/products`,
  PRODUCT_DETAIL: (id) => `${API_BASE_URL}/api/products/${id}`,
  ADMIN_PRODUCTS: `${API_BASE_URL}/api/admin/products`,
  ADMIN_PRODUCT_DETAIL: (id) => `${API_BASE_URL}/api/admin/products/${id}`,
  
  // Category endpoints
  CATEGORIES: `${API_BASE_URL}/api/categories`,
  ADMIN_CATEGORIES: `${API_BASE_URL}/api/admin/categories`,
  ADMIN_CATEGORY_DETAIL: (id) => `${API_BASE_URL}/api/admin/categories/${id}`,
  
  // Brand endpoints
  BRANDS: `${API_BASE_URL}/api/brands`,
  
  // Order endpoints
  ORDERS: `${API_BASE_URL}/api/orders`,
  ADMIN_ORDERS: `${API_BASE_URL}/api/admin/orders`,
  
  // Address endpoints
  ADDRESSES: `${API_BASE_URL}/api/addresses`,
  ADDRESS_DETAIL: (id) => `${API_BASE_URL}/api/addresses/${id}`,
  ADMIN_ADDRESSES: `${API_BASE_URL}/api/admin/addresses`,
  ADMIN_ADDRESS_DETAIL: (id) => `${API_BASE_URL}/api/admin/addresses/${id}`,
  
  // Admin endpoints
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_RECENT_ORDERS: `${API_BASE_URL}/api/admin/recent-orders`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_USER_ROLE: (id) => `${API_BASE_URL}/api/admin/users/${id}/role`,
  
  // Upload endpoints
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload/upload-image-local`,
};

export default API_BASE_URL; 