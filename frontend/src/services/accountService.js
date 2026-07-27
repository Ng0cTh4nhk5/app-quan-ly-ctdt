// src/services/accountService.js
// Task 1.5.1: các API call accounts chuyển từ api.js (fetch) sang axiosInstance.
// Giữ nguyên tên hàm + format { ok, status, data } để Adminpage không phải đổi logic.
import axiosInstance from './axiosInstance';

function normalizeError(error) {
  if (error.response) {
    return { ok: false, status: error.response.status, data: error.response.data };
  }
  return { ok: false, status: 0, data: { message: 'Không thể kết nối tới máy chủ' } };
}

// GET /api/accounts?page=&limit=&search=&status=
export async function apiGetAccounts({ page = 1, limit = 10, search = '', status = '' } = {}) {
  try {
    const params = { page, limit };
    if (search) params.search = search;
    if (status && status !== 'Trạng thái') params.status = status;

    const res = await axiosInstance.get('/api/accounts', { params });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// POST /api/accounts
export async function apiCreateAccount(payload) {
  try {
    const res = await axiosInstance.post('/api/accounts', payload);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// PUT /api/accounts/{id}
export async function apiUpdateAccount(id, payload) {
  try {
    const res = await axiosInstance.put(`/api/accounts/${id}`, payload);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// DELETE /api/accounts/{id}
export async function apiDeleteAccount(id) {
  try {
    const res = await axiosInstance.delete(`/api/accounts/${id}`);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// GET /api/faculties
export async function apiGetKhoaList() {
  try {
    const res = await axiosInstance.get('/api/faculties');
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// GET /api/programs
export async function apiGetProgramsList() {
  try {
    const res = await axiosInstance.get('/api/programs');
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}
