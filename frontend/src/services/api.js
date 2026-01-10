import axios from 'axios';
import Swal from 'sweetalert2';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor to add auth token
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

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // You can transform response data here if needed
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (!response) {
      // Network error or server down
      Swal.fire({
        title: 'Network Error',
        text: 'Cannot connect to server. Please check your internet connection.',
        icon: 'error',
      });
      return Promise.reject(error);
    }

    const { status, data } = response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        Swal.fire('Session Expired', 'Please login again', 'info');
        break;
        
      case 403:
        // Forbidden
        Swal.fire('Access Denied', 'You do not have permission for this action', 'error');
        break;
        
      case 404:
        // Not found
        Swal.fire('Not Found', data.message || 'Resource not found', 'error');
        break;
        
      case 422:
        // Validation error
        const validationErrors = data.errors || data.message;
        Swal.fire('Validation Error', validationErrors, 'error');
        break;
        
      case 500:
        // Server error
        Swal.fire('Server Error', 'Something went wrong on our end. Please try again later.', 'error');
        break;
        
      default:
        // Other errors
        Swal.fire('Error', data.message || 'An error occurred', 'error');
    }
    
    return Promise.reject(error);
  }
);

// Mock data for development (remove when backend is ready)
const isDevelopment = process.env.NODE_ENV === 'development';

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.post('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  
  // Mock for development
  mockLogin: (credentials) => 
    new Promise((resolve) => {
      setTimeout(() => {
        const mockUser = {
          _id: '1',
          name: 'John Doe',
          email: credentials.email,
          role: credentials.email.includes('admin') ? 'admin' : 'user',
        };
        const mockToken = 'mock-jwt-token';
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve({ data: { token: mockToken, user: mockUser } });
      }, 1000);
    }),
};

// Events API
export const eventsAPI = {
  getAll: (params) => 
    isDevelopment 
      ? Promise.resolve({ 
          data: generateMockEvents(10) 
        })
      : api.get('/events', { params }),
  
  getById: (id) => 
    isDevelopment 
      ? Promise.resolve({ 
          data: generateMockEvents(1)[0] 
        })
      : api.get(`/events/${id}`),
  
  create: (eventData) => api.post('/events', eventData),
  update: (id, eventData) => api.put(`/events/${id}`, eventData),
  delete: (id) => api.delete(`/events/${id}`),
  search: (query) => api.get(`/events/search?q=${query}`),
  getCategories: () => 
    isDevelopment 
      ? Promise.resolve({
          data: ['Music', 'Conference', 'Workshop', 'Sports', 'Art', 'Food & Drink', 'Technology']
        })
      : api.get('/events/categories'),
};

// Bookings API
export const bookingsAPI = {
  getAll: () => 
    isDevelopment 
      ? Promise.resolve({ 
          data: generateMockBookings(5) 
        })
      : api.get('/bookings'),
  
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  cancel: (id) => api.delete(`/bookings/${id}`),
};

// Payment API
export const paymentsAPI = {
  createPaymentIntent: (data) => 
    isDevelopment 
      ? Promise.resolve({
          data: {
            clientSecret: 'mock_client_secret_' + Date.now(),
          }
        })
      : api.post('/payments/create-intent', data),
  
  confirmPayment: (data) => 
    isDevelopment 
      ? Promise.resolve({
          data: { success: true, booking: generateMockBookings(1)[0] }
        })
      : api.post('/payments/confirm', data),
  
  getPaymentHistory: () => api.get('/payments/history'),
};

// Admin API
export const adminAPI = {
  getStats: () => 
    isDevelopment 
      ? Promise.resolve({
          data: {
            totalUsers: 150,
            totalEvents: 45,
            totalBookings: 320,
            totalRevenue: 12500,
            recentBookings: generateMockBookings(5),
          }
        })
      : api.get('/admin/stats'),
  
  getUsers: () => api.get('/admin/users'),
  getEvents: () => api.get('/admin/events'),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
};

// Helper functions for mock data
function generateMockEvents(count) {
  const categories = ['Music', 'Conference', 'Workshop', 'Sports', 'Art'];
  const locations = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'Seattle'];
  
  return Array.from({ length: count }, (_, i) => ({
    _id: `event_${i + 1}`,
    title: `Awesome Event ${i + 1}`,
    description: `This is a description for event ${i + 1}. Lorem ipsum dolor sit amet consectetur adipisicing elit.`,
    date: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    location: locations[i % locations.length],
    category: categories[i % categories.length],
    price: i % 3 === 0 ? 0 : 25 + (i * 5),
    availableTickets: 100 - (i * 10),
    image: `https://picsum.photos/600/300?random=${i + 1}`,
    organizer: {
      name: `Organizer ${i + 1}`,
      email: `organizer${i + 1}@example.com`
    },
    isFeatured: i < 3,
    registeredCount: Math.floor(Math.random() * 100),
  }));
}

function generateMockBookings(count) {
  return Array.from({ length: count }, (_, i) => ({
    _id: `booking_${i + 1}`,
    event: generateMockEvents(1)[0],
    user: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    tickets: Math.floor(Math.random() * 5) + 1,
    totalAmount: (25 + (i * 5)) * (Math.floor(Math.random() * 5) + 1),
    status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'confirmed' : 'cancelled',
    createdAt: new Date(Date.now() - (i + 1) * 86400000).toISOString(),
    paymentMethod: 'card',
    transactionId: `txn_${Date.now()}_${i + 1}`,
  }));
}

export default api;