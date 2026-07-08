// src/services/programService.js
//
// Đã cấu hình chính xác theo tài liệu Swagger chính thức:
//   GET    /api/programs?search=&page=&pageSize=
//   GET    /api/programs/{id}
//   POST   /api/programs
//   PUT    /api/programs/{id}
//   DELETE /api/programs/{id}
//
// Quy định Schema API:
//   POST body : { nganhDaoTao, trinhDo, hinhThuc, namApDung, maCTDT, tenCTDT }
//   PUT  body : { tenCTDT, tenCTDTEng, trinhDo, hinhThuc, trangThai, nganhDaoTao, namApDung }
//
// Dùng chung axiosInstance (đã tự đính Bearer token + đúng BASE_URL) thay vì
// tự viết lại fetch/token ở từng service — tránh lệch domain / token như trước.
import axiosInstance from "./axiosInstance";

function normalizeError(error) {
  if (error.response) {
    return { ok: false, status: error.response.status, data: error.response.data };
  }
  return { ok: false, status: 0, data: { message: "Không thể kết nối tới máy chủ" } };
}

// Bật/tắt chế độ dữ liệu giả (Mock data). Đặt sang false để chạy API thật.
const USE_MOCK = false

// ── Mock data (chỉ kích hoạt khi USE_MOCK = true) ────────────────
let MOCK_PROGRAMS = [
  {
    id: 1,
    maCTDT: 'DH_KHMT_CQ',
    tenCTDT: 'Khoa học máy tính',
    trinhDo: 'Đại học',
    hinhThuc: 'Chính quy',
    trangThai: 'Đang mở',
  },
  {
    id: 2,
    maCTDT: 'DH_CNTT_VHVL',
    tenCTDT: 'Công nghệ thông tin',
    trinhDo: 'Đại học',
    hinhThuc: 'Vừa học vừa làm',
    trangThai: 'Chưa mở',
  },
]
let mockNextId = 3
const delay = (ms = 350) => new Promise((r) => setTimeout(r, ms))

// ── GET /api/programs?search=&page=&pageSize= ──────────────
export async function getPrograms({ search = '', page = 1, pageSize = 10 } = {}) {
  if (USE_MOCK) {
    await delay()
    const q = search.trim().toLowerCase()
    const data = MOCK_PROGRAMS.filter(
      (p) =>
        !q ||
        p.maCTDT.toLowerCase().includes(q) ||
        p.tenCTDT.toLowerCase().includes(q)
    )
    return { ok: true, status: 200, data }
  }

  try {
    const params = { page, pageSize }
    if (search) params.search = search

    const res = await axiosInstance.get('/api/programs', { params })
    const data = res.data?.data ?? res.data
    return { ok: true, status: res.status, data }
  } catch (error) {
    return normalizeError(error)
  }
}

// ── GET /api/programs/{id} ──────────────────────────────────
export async function getProgramById(id) {
  if (USE_MOCK) {
    await delay()
    const item = MOCK_PROGRAMS.find((p) => p.id === id)
    return item
      ? { ok: true, status: 200, data: item }
      : { ok: false, status: 404, data: null }
  }

  try {
    const res = await axiosInstance.get(`/api/programs/${id}`)
    const data = res.data?.data ?? res.data
    return { ok: true, status: res.status, data }
  } catch (error) {
    return normalizeError(error)
  }
}

// ── POST /api/programs ──────────────────────────────────────
export async function createProgram(payload) {
  if (USE_MOCK) {
    await delay()
    const newItem = { id: mockNextId++, ...payload }
    MOCK_PROGRAMS = [...MOCK_PROGRAMS, newItem]
    return { ok: true, status: 201, data: newItem }
  }

  const body = {
    nganhDaoTao: payload.nganhDaoTao ?? '',
    trinhDo: payload.trinhDo ?? '',
    hinhThuc: payload.hinhThuc ?? '',
    namApDung: payload.namApDung ?? new Date().toISOString(),
    maCTDT: payload.maCTDT ?? '',
    tenCTDT: payload.tenCTDT ?? '',
  }

  try {
    const res = await axiosInstance.post('/api/programs', body)
    return { ok: true, status: res.status, data: res.data }
  } catch (error) {
    return normalizeError(error)
  }
}

// ── PUT /api/programs/{id} ──────────────────────────────────
export async function updateProgram(id, payload) {
  if (USE_MOCK) {
    await delay()
    MOCK_PROGRAMS = MOCK_PROGRAMS.map((p) =>
      p.id === id ? { ...p, ...payload } : p
    )
    return { ok: true, status: 200, data: { id, ...payload } }
  }

  const body = {
    tenCTDT: payload.tenCTDT ?? '',
    tenCTDTEng: payload.tenCTDTEng ?? '',
    trinhDo: payload.trinhDo ?? '',
    hinhThuc: payload.hinhThuc ?? '',
    trangThai: payload.trangThai ?? '',
    nganhDaoTao: payload.nganhDaoTao ?? '',
    namApDung: payload.namApDung ?? new Date().toISOString(),
  }

  try {
    const res = await axiosInstance.put(`/api/programs/${id}`, body)
    return { ok: true, status: res.status, data: res.data }
  } catch (error) {
    return normalizeError(error)
  }
}

// ── DELETE /api/programs/{id} ───────────────────────────────
export async function deleteProgram(id) {
  if (USE_MOCK) {
    await delay()
    MOCK_PROGRAMS = MOCK_PROGRAMS.filter((p) => p.id !== id && p.maCTDT !== id)
    return { ok: true, status: 200, data: { id } }
  }

  try {
    const res = await axiosInstance.delete(`/api/programs/${id}`)
    return { ok: true, status: res.status, data: res.data }
  } catch (error) {
    return normalizeError(error)
  }
}