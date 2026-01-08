// src/services/authService.ts
import api from './api';
import { User, RegisterData, LoginData } from '../types';

class AuthService {
  // Register new user
  async register(userData: RegisterData): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/register', userData);
    return response;
  }

  // Login user
  async login(credentials: LoginData): Promise<{ user: User; token: string }> {
    const response = await api.post('/auth/login', credentials);
    return response;
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile');
    return response;
  }

  // Update user profile
  async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await api.put('/auth/profile', userData);
    return response;
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/change-password', { currentPassword, newPassword });
  }

  // Forgot password
  async forgotPassword(email: string): Promise<{ resetToken: string; expiresAt: string }> {
    const response = await api.post('/auth/forgot-password', { email });
    return response;
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await api.post('/auth/reset-password', { token, newPassword });
  }

  // Logout
  async logout(): Promise<void> {
    await api.post('/auth/logout');
    this.clearLocalStorage();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Save user to localStorage
  saveUserToStorage(user: User, token: string): void {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    api.setAuthToken(token);
  }

  // Clear localStorage
  clearLocalStorage(): void {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    api.clearAuth();
  }

  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
  }
}

export default new AuthService();