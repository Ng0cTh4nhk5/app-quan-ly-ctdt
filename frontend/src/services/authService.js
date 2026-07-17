// src/services/authService.js
// Task 1.5.1: các API call auth chuyển từ api.js (fetch) sang axiosInstance.
// Giữ nguyên format trả về { ok, status, data } để component không phải đổi logic.
import axiosInstance from './axiosInstance';

function normalizeError(error) {
  if (error.response) {
    return { ok: false, status: error.response.status, data: error.response.data };
  }
  return { ok: false, status: 0, data: { message: 'Không thể kết nối tới máy chủ' } };
}

// POST /auth/login
export async function apiLogin(username, password) {
  try {
    const res = await axiosInstance.post('/auth/login', { username, password });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// POST /auth/change-password-first (cần Bearer token)
export async function apiChangePasswordFirst(newPassword, confirmPassword) {
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
export async function apiForgotPassword(email) {
  try {
    const res = await axiosInstance.post('/auth/forgot-password', { email });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// POST /auth/reset-password
export async function apiResetPassword(token, newPassword) {
  try {
    const res = await axiosInstance.post('/auth/reset-password', { token, newPassword });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}
