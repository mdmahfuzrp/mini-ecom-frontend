import axios from 'axios';

// Determine the backend API URL based on environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

// Debug: Log the API URL being used
console.log('Using API URL:', API_URL);

// Create axios instance with base URL
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to attach the authentication token to every request
api.interceptors.request.use(
    config => {
        // Get token from localStorage
        const token = localStorage.getItem('token');

        // If token exists, add it to the request header
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    error => {
        return Promise.reject(error);
    },
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
    response => {
        return response;
    },
    error => {
        // Handle expected errors silently
        if (error.response) {
            // Authentication errors are expected and handled by the components
            if (error.response.status === 401 || error.response.status === 403) {
                // Don't log expected auth errors to console
                return Promise.reject(error);
            }
        }

        // Log unexpected errors
        console.log('API Error:', error.response?.status, error.message);
        return Promise.reject(error);
    },
);

// API endpoints for authentication
export const authApi = {
    register: userData => api.post('/auth/register', userData),
    login: (email, password) => api.post('/auth/login', { email, password }),
    getProfile: () => api.get('/auth/me'),
    // Helper method to extract user data from the response
    processUserResponse: response => {
        if (!response || !response.data) return null;
        return response.data.user || response.data;
    },
    // Helper method to extract token from the response
    getToken: response => {
        if (!response || !response.data) return null;
        return response.data.token || response.data.accessToken;
    },
};

// API endpoints for products
export const productsApi = {
    getAll: params => {
        console.log('Calling productsApi.getAll with params:', params);
        return api.get('/products', { params });
    },
    getById: id => {
        console.log('Calling productsApi.getById with id:', id);
        return api.get(`/products/${id}`);
    },
    create: productData => api.post('/products', productData),
    update: (id, productData) => api.put(`/products/${id}`, productData),
    delete: id => api.delete(`/products/${id}`),
    getFeatured: (limit = 4) => {
        console.log('Calling productsApi.getFeatured with limit:', limit);
        return api.get('/products', {
            params: {
                limit,
                sortBy: 'rating',
                sortOrder: 'DESC',
            },
        });
    },
    // Helper method to extract products and pagination data from the response
    processResponse: response => {
        console.log('Processing API response:', response);

        if (!response || !response.data) {
            console.error('API Response is empty or invalid:', response);
            return { products: [], totalPages: 0, currentPage: 1, totalItems: 0 };
        }

        // Check if response is already paginated
        if (response.data.products && Array.isArray(response.data.products)) {
            return {
                products: response.data.products,
                totalPages: response.data.totalPages || 1,
                currentPage: response.data.currentPage || 1,
                totalItems: response.data.totalItems || response.data.products.length,
            };
        }

        // Handle case where response is just an array of products
        const products = Array.isArray(response.data) ? response.data : [];
        return {
            products,
            totalPages: 1,
            currentPage: 1,
            totalItems: products.length,
        };
    },
};

// API endpoints for categories
export const categoriesApi = {
    getAll: () => api.get('/categories'),
    getById: id => api.get(`/categories/${id}`),
    create: categoryData => api.post('/categories', categoryData),
    update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
    delete: id => api.delete(`/categories/${id}`),
    // Helper method to extract categories from the response
    processResponse: response => {
        if (!response || !response.data) return [];
        return Array.isArray(response.data) ? response.data : response.data.categories && Array.isArray(response.data.categories) ? response.data.categories : [];
    },
};

// API endpoints for orders
export const ordersApi = {
    create: orderData => api.post('/orders', orderData),
    getAll: async () => {
        try {
            const response = await api.get('/orders');
            return response;
        } catch (error) {
            console.log('Error in ordersApi.getAll:', error);
            throw error;
        }
    },
    getById: id => api.get(`/orders/${id}`),
    cancel: id => api.put(`/orders/${id}/cancel`),
    // Helper method to extract orders from the response
    processResponse: response => {
        if (!response || !response.data) return [];
        return Array.isArray(response.data) ? response.data : response.data.orders && Array.isArray(response.data.orders) ? response.data.orders : [];
    },
};

// API endpoints for customers
export const customersApi = {
    getProfile: () => api.get('/customers/profile'),
    createUpdateProfile: customerData => api.post('/customers/profile', customerData),
    // Helper method to extract customer data from response
    processResponse: response => {
        if (!response || !response.data) return null;
        if (response.data.success === false) return null;

        // Check if the response contains a customer object or if it is the customer object itself
        const customerData = response.data.customer || response.data;

        // Additional validation to ensure we have a valid customer object
        if (!customerData || typeof customerData !== 'object') return null;

        return customerData;
    },
};

export default api;
