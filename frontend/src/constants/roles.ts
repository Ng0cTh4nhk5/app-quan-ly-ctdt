// src/constants/roles.ts
// Task 1.4.5: 5 vai trò theo BA spec (thay cho ADMIN/MANAGER/COMPILER)
export enum Role {
  PM = 'PM',   // Cán bộ Quản lý chung
  TK = 'TK',   // Trưởng khoa
  GV = 'GV',   // Giảng viên
  HD = 'HD',   // Hội đồng thẩm định
  BGH = 'BGH', // Ban Giám hiệu
}

// Map role → display name (tiếng Việt)
export const ROLE_LABELS: Record<Role, string> = {
  [Role.PM]: 'Quản lý chung',
  [Role.TK]: 'Trưởng khoa',
  [Role.GV]: 'Giảng viên',
  [Role.HD]: 'Hội đồng thẩm định',
  [Role.BGH]: 'Ban Giám hiệu',
};

// Backend cũ trả role ADMIN/MANAGER/COMPILER hoặc roleId 1/2/3.
// Map sang role mới theo migration matrix (Task 1.4.4):
// ADMIN → PM, MANAGER → TK, COMPILER → GV
const LEGACY_ROLE_MAP: Record<string, Role> = {
  ADMIN: Role.PM,
  MANAGER: Role.TK,
  COMPILER: Role.GV,
  '1': Role.PM,
  '2': Role.TK,
  '3': Role.GV,
};

export const isRole = (value: unknown): value is Role =>
  typeof value === 'string' && Object.values(Role).includes(value as Role);

// Chuẩn hóa response login (mới lẫn cũ) về danh sách Role[]
export const resolveRoles = (data: any): Role[] => {
  // Backend mới: user.roles = ['PM', 'TK', ...]
  const roles: unknown[] = data?.user?.roles ?? [];
  const valid = roles.filter(isRole);
  if (valid.length > 0) return valid;

  // Backend cũ: user.role = 'ADMIN' | 'MANAGER' | 'COMPILER' hoặc roleId 1/2/3
  const legacyStr = String(data?.user?.role ?? '').toUpperCase();
  const legacyId = String(data?.user?.roleId ?? data?.user?.role_id ?? '');
  const mapped = LEGACY_ROLE_MAP[legacyStr] ?? LEGACY_ROLE_MAP[legacyId];
  if (mapped) return [mapped];

  // Không resolve được role → trả rỗng, Router sẽ redirect sang /unauthorized
  // KHÔNG dùng fallback GV vì có thể cấp quyền sai cho người dùng không xác định
  console.warn('[resolveRoles] Không thể xác định role từ response:', data);
  return [];
};

// Trang chủ mặc định theo role (dùng cho redirect sau login)
// TODO Sprint 1: tạo route riêng cho HD (/review) và BGH (/dashboard)
const HOME_PATHS: Record<Role, string> = {
  [Role.PM]:  '/admin',
  [Role.TK]:  '/syllabus',
  [Role.GV]:  '/syllabus',
  [Role.HD]:  '/syllabus',  // tạm thời, chờ route /review
  [Role.BGH]: '/syllabus',  // tạm thời, chờ route /dashboard
};

export const homePathForRoles = (roles: Role[]): string => {
  for (const role of roles) {
    if (HOME_PATHS[role]) return HOME_PATHS[role];
  }
  return '/unauthorized'; // roles rỗng hoặc không map được → không cho vào
};
