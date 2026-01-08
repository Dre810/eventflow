// src/services/api.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
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
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        // You can transform response data here
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          this.clearAuth();
          window.location.href = '/login';
        }
        
        // Handle other errors
        const message = error.response?.data?.message || error.message || 'An error occurred';
        return Promise.reject(new Error(message));
      }
    );
  }

  // Auth methods
  public setAuthToken(token: string): void {
    localStorage.setItem('token', token);
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public clearAuth(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete this.axiosInstance.defaults.headers.common['Authorization'];
  }

  // HTTP methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.put<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.patch<ApiResponse<T>>(url, data, config);
    return response.data.data as T;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.axiosInstance.delete<ApiResponse<T>>(url, config);
    return response.data.data as T;
  }

  // File upload
  public async uploadFile(url: string, file: File, fieldName = 'file'): Promise<any> {
    const formData = new FormData();
    formData.append(fieldName, file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };

    return this.post(url, formData, config);
  }
}

export default new ApiService();