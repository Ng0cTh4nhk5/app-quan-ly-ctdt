// src/services/subjectService.js
import axiosInstance from "./axiosInstance";

// ── GET /manager/subjects ──
export const getSubjects = async ({
  search = "",
  assign_status = "",
  compile_status = "",
} = {}) => {
  const params = {};

  if (search) params.search = search;
  if (assign_status) params.assign_status = assign_status;
  if (compile_status) params.compile_status = compile_status;

  const { data } = await axiosInstance.get("/manager/subjects", { params });

  return data;
};

// ── POST /manager/subjects ──
export const createSubject = async (payload) => {
  const { data } = await axiosInstance.post("/manager/subjects", payload);

  return data;
};

// ── PUT /manager/subjects/{id} ──
export const updateSubject = async (id, payload) => {
  const { data } = await axiosInstance.put(`/manager/subjects/${id}`, payload);

  return data;
};

// ── DELETE /manager/subjects/{id} ──
export const deleteSubject = async (id) => {
  const { data } = await axiosInstance.delete(`/manager/subjects/${id}`);

  return data;
};

// ── GET /manager/subjects/unassigned?search=&maKhoa=&maCTDT= ──
export const getUnassignedSubjects = async ({
  search = "",
  maKhoa = "",
  maCTDT = "",
} = {}) => {
  const params = {};

  if (search) params.search = search;
  if (maKhoa) params.maKhoa = maKhoa;
  if (maCTDT) params.maCTDT = maCTDT;

  const { data } = await axiosInstance.get("/manager/subjects/unassigned", {
    params,
  });

  return data;
};

// ── POST /manager/assignments ──
// body: { compilerId, subjectIds }
export const createAssignment = async (payload) => {
  const { data } = await axiosInstance.post("/manager/assignments", payload);

  return data;
};