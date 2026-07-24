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

  return [Role.GV]; // fallback GV
};

// Trang chủ mặc định theo role (dùng cho redirect sau login)
export const homePathForRoles = (roles: Role[]): string =>
  roles.includes(Role.PM) ? '/admin' : '/syllabus';
