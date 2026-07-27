// src/services/axiosInstance.ts
// Task 1.2.4: axios instance thống nhất VITE_API_URL + tự động refresh token khi 401
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// ── Request interceptor: đính Bearer token từ sessionStorage ──
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = sessionStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: tự refresh token khi 401 (queue pattern) ──
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: AxiosError) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve(token!);
  });
  failedQueue = [];
};

// Các endpoint auth không được retry/refresh (tránh vòng lặp vô hạn)
const isAuthEndpoint = (url = '') =>
  url.includes('/auth/login') || url.includes('/auth/refresh');

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      const refreshToken = sessionStorage.getItem('refreshToken');
      // Không có refresh token (backend cũ / chưa đăng nhập) → trả lỗi như cũ
      if (!refreshToken) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const payload = res.data?.data ?? res.data;
        const { token, refreshToken: newRefreshToken } = payload;

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', newRefreshToken);

        processQueue(null, token);
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        // Refresh token hết hạn → đăng xuất, quay về login
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
