// api.js - Tất cả API calls tập trung ở đây
const BASE_URL = 'https://startup-backend-production-bf19.up.railway.app';

const getToken = () => sessionStorage.getItem('token');

const authFetch = (path, options = {}) => {
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
      ...(options.headers || {}),
    },
  });
};

// ── AUTH ──────────────────────────────────────────────────────────

// POST /auth/login
export async function apiLogin(username, password) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// POST /auth/change-password-first
export async function apiChangePasswordFirst(newPassword, confirmPassword) {
  const res = await authFetch('/auth/change-password-first', {
    method: 'POST',
    body: JSON.stringify({ newPassword, confirmPassword }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// POST /auth/forgot-password
export async function apiForgotPassword(email) {
  const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// POST /auth/reset-password
export async function apiResetPassword(token, newPassword) {
  const res = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── ACCOUNTS ─────────────────────────────────────────────────────

// GET /api/accounts?page=&limit=&search=&status=
export async function apiGetAccounts({ page = 1, limit = 10, search = '', status = '' } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('search', search);
  if (status && status !== 'Trạng thái') params.append('status', status);

  const res = await authFetch(`/api/accounts?${params.toString()}`);
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// POST /api/accounts
export async function apiCreateAccount(payload) {
  const res = await authFetch('/api/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// PUT /api/accounts/{id}
export async function apiUpdateAccount(id, payload) {
  const res = await authFetch(`/api/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// DELETE /api/accounts/{id}
export async function apiDeleteAccount(id) {
  const res = await authFetch(`/api/accounts/${id}`, {
    method: 'DELETE',
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// GET /api/faculties  (trước: /api/Khoa/get-list)
export async function apiGetKhoaList() {
  const res = await authFetch('/api/faculties');
  const data = await res.json().catch(() => ([]));
  return { ok: res.ok, status: res.status, data };
}

// GET /api/programs  (trước: /api/Programs/get-list)
export async function apiGetProgramsList() {
  const res = await authFetch('/api/programs');
  const data = await res.json().catch(() => ([]));
  return { ok: res.ok, status: res.status, data };
}