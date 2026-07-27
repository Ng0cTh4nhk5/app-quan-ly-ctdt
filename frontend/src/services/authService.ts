// src/services/authService.ts
// Task 1.5.1: các API call auth qua axiosInstance.
// Format trả về { ok, status, data } để component không phải đổi logic.
import axiosInstance from './axiosInstance';
import type { AxiosError } from 'axios';

// ── Kiểu trả về chuẩn cho mọi API call ───────────────────────────
export interface ApiResult<T = unknown> {
  ok: boolean;
  status: number;
  data: T;
}

function normalizeError(error: unknown): ApiResult {
  const axiosErr = error as AxiosError;
  if (axiosErr.response) {
    return { ok: false, status: axiosErr.response.status, data: axiosErr.response.data as unknown };
  }
  return { ok: false, status: 0, data: { message: 'Không thể kết nối tới máy chủ' } };
}

// POST /auth/login
export async function apiLogin(username: string, password: string): Promise<ApiResult> {
  try {
    const res = await axiosInstance.post('/auth/login', { username, password });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// POST /auth/change-password-first (cần Bearer token)
export async function apiChangePasswordFirst(
  newPassword: string,
  confirmPassword: string,
): Promise<ApiResult> {
  try {
    const res = await axiosInstance.post('/auth/change-password-first', {
      newPassword,
      confirmPassword,
    });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// POST /auth/forgot-password
export async function apiForgotPassword(email: string): Promise<ApiResult> {
  try {
    const res = await axiosInstance.post('/auth/forgot-password', { email });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// POST /auth/reset-password
export async function apiResetPassword(token: string, newPassword: string): Promise<ApiResult> {
  try {
    const res = await axiosInstance.post('/auth/reset-password', { token, newPassword });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}
