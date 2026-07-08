// src/services/memberService.js
import axiosInstance from "./axiosInstance";

// Helper: chuẩn hoá lỗi axios về cùng 1 format { ok, status, data }
// để các component không phải sửa lại logic khi đổi từ fetch -> axios.
function normalizeError(error) {
  if (error.response) {
    return { ok: false, status: error.response.status, data: error.response.data };
  }
  // Lỗi mạng / timeout, không có response từ server
  return { ok: false, status: 0, data: { message: "Không thể kết nối tới máy chủ" } };
}

// ── GET /manager/members?search=&status=&roleId= ──────────────
export async function memberGetList({ search = "", status = "", roleId } = {}) {
  try {
    const params = {};
    if (search) params.search = search;
    if (status) params.status = status;
    if (roleId !== undefined && roleId !== null && roleId !== "") params.roleId = roleId;

    const res = await axiosInstance.get("/manager/members", { params });
    // Backend trả { data: [...] } → lấy .data, nếu không có thì dùng chính nó
    const data = res.data?.data ?? res.data;
    return { ok: true, status: res.status, data };
  } catch (error) {
    return normalizeError(error);
  }
}

// ── GET /manager/members/{id} ──────────────────────────────────
export async function memberGetById(id) {
  try {
    const res = await axiosInstance.get(`/manager/members/${id}`);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// ── POST /manager/members ──────────────────────────────────────
export async function memberCreate(payload) {
  try {
    const res = await axiosInstance.post("/manager/members", payload);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// ── PUT /manager/members/{id} ────────────────────────────────────
export async function memberUpdate(id, payload) {
  try {
    const res = await axiosInstance.put(`/manager/members/${id}`, payload);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// ── DELETE /manager/members/{id} ─────────────────────────────────
export async function memberDelete(id) {
  try {
    const res = await axiosInstance.delete(`/manager/members/${id}`);
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// ── POST /manager/members/bulk-send-email ────────────────────────
// Swagger (BulkActionRequest) yêu cầu field "accountIds", không phải "ids"
export async function memberBulkSendEmail(ids) {
  try {
    const res = await axiosInstance.post("/manager/members/bulk-send-email", {
      accountIds: ids,
    });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    return normalizeError(error);
  }
}

// ── PATCH /manager/members/bulk-revoke ───────────────────────────
export async function memberBulkRevoke(ids) {
  try {
    const res = await axiosInstance.patch("/manager/members/bulk-revoke", {
      accountIds: ids,
    });
    return { ok: true, status: res.status, data: res.data };
  } catch (error) {
    // Một số API trả 204 No Content khi thành công
    if (error.response?.status === 204) {
      return { ok: true, status: 204, data: {} };
    }
    return normalizeError(error);
  }
}