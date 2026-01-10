// src/services/auth/authService.js
import axiosInstance from '../api/axiosInstance';
import API_CONFIG from '../api/config';

class AuthService {
  async register(userData) {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.REGISTER,
      userData
    );
    this.setAuthData(response.data.data);
    return response.data.data;
  }

  async login(credentials) {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.LOGIN,
      credentials
    );
    this.setAuthData(response.data.data);
    return response.data.data;
  }

  async getProfile() {
    const response = await axiosInstance.get(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE
    );
    return response.data.data;
  }

  async updateProfile(userData) {
    const response = await axiosInstance.put(
      API_CONFIG.ENDPOINTS.AUTH.PROFILE,
      userData
    );
    this.updateUserData(response.data.data);
    return response.data.data;
  }

  async logout() {
    try {
      await axiosInstance.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async forgotPassword(email) {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD,
      { email }
    );
    return response.data.data;
  }

  async resetPassword(token, newPassword) {
    const response = await axiosInstance.post(
      API_CONFIG.ENDPOINTS.AUTH.RESET_PASSWORD,
      { token, newPassword }
    );
    return response.data.data;
  }

  // Helper methods
  setAuthData(data) {
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    if (data.user) {
      localStorage.setItem('user_data', JSON.stringify(data.user));
    }
  }

  updateUserData(user) {
    localStorage.setItem('user_data', JSON.stringify(user));
  }

  clearAuthData() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }

  getCurrentUser() {
    const userStr = localStorage.getItem('user_data');
    return userStr ? JSON.parse(userStr) : null;
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }

  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

export default new AuthService();