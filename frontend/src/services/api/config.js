// src/services/api/config.js
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      PROFILE: '/auth/profile',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
      LOGOUT: '/auth/logout',
    },
    EVENTS: {
      GET_ALL: '/events',
      GET_FEATURED: '/events/featured',
      GET_UPCOMING: '/events/upcoming',
      GET_CATEGORIES: '/events/categories',
      GET_SINGLE: (id) => `/events/${id}`,
      CREATE: '/events',
      UPDATE: (id) => `/events/${id}`,
      DELETE: (id) => `/events/${id}`,
    },
    BOOKINGS: {
      CREATE: '/bookings',
      GET_MY_BOOKINGS: '/bookings/my-bookings',
      GET_STATS: '/bookings/stats',
      GET_SINGLE: (id) => `/bookings/${id}`,
      CANCEL: (id) => `/bookings/${id}/cancel`,
      PAYMENT_INTENT: (id) => `/bookings/${id}/payment-intent`,
      CONFIRM_PAYMENT: (id) => `/bookings/${id}/confirm-payment`,
    },
  },
  TIMEOUT: 10000, // 10 seconds
};

export default API_CONFIG;