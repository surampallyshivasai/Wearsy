const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  adminLogin: async (credentials) => {
    return apiRequest('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },
};

// Products API
export const productsAPI = {
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.gender) params.append('gender', filters.gender);
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);
    
    return apiRequest(`/products?${params.toString()}`);
  },

  getById: async (id) => {
    return apiRequest(`/products/${id}`);
  },

  create: async (productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append('image', productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create product');
    }
    return data;
  },

  update: async (id, productData) => {
    const formData = new FormData();
    Object.keys(productData).forEach(key => {
      if (key === 'image' && productData[key] instanceof File) {
        formData.append('image', productData[key]);
      } else {
        formData.append(key, productData[key]);
      }
    });

    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to update product');
    }
    return data;
  },

  delete: async (id) => {
    return apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

// Cart API
export const cartAPI = {
  getItems: async () => {
    return apiRequest('/cart');
  },

  addItem: async (productId, quantity = 1) => {
    return apiRequest('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity }),
    });
  },

  updateQuantity: async (cartItemId, quantity) => {
    return apiRequest(`/cart/${cartItemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeItem: async (cartItemId) => {
    return apiRequest(`/cart/${cartItemId}`, {
      method: 'DELETE',
    });
  },

  clearCart: async () => {
    return apiRequest('/cart', {
      method: 'DELETE',
    });
  },
};

// Orders API
export const ordersAPI = {
  getUserOrders: async () => {
    return apiRequest('/orders');
  },

  createOrder: async (orderData) => {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  // Admin only
  getAllOrders: async () => {
    return apiRequest('/admin/orders');
  },

  updateOrderStatus: async (orderId, status) => {
    return apiRequest(`/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// Addresses API
export const addressesAPI = {
  getSavedAddresses: async () => {
    return apiRequest('/addresses');
  },

  saveAddress: async (addressData) => {
    return apiRequest('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  },

  deleteAddress: async (addressId) => {
    return apiRequest(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  },
};

export default {
  auth: authAPI,
  products: productsAPI,
  cart: cartAPI,
  orders: ordersAPI,
  addresses: addressesAPI,
}; 