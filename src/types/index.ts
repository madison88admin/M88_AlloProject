// ============================================================================
// DATA TYPES
// ============================================================================

export interface Column {
  key: string;
  label: string;
  type: 'text' | 'select' | 'boolean';
  options?: string[];
  required?: boolean;
  width?: string;
}

export interface DataRecord {
  id: number;
  all_brand: string;
  brand_visible_to_factory?: string;
  brand_classification?: 'Top' | 'Growth' | 'Emerging' | 'Maintain' | 'Divest' | 'Early Engagement' | 'Growth/Divest';
  status?: 'Active' | 'Inactive' | 'In Development' | 'On hold';
  terms_of_shipment?: 'FOB' | 'LDP';
  lead_pbd?: string;
  support_pbd?: string;
  td?: string;
  nyo_planner?: string;
  indo_m88_md?: string;
  m88_qa?: string;
  mlo_planner?: string;
  mlo_logistic?: string;
  mlo_purchasing?: string;
  mlo_costing?: string;
  wuxi_moretti?: string;
  hz_u_jump?: string;
  pt_u_jump?: string;
  korea_mel?: string;
  singfore?: string;
  heads_up?: string;
  hz_pt_u_jump_senior_md?: string;
  pt_ujump_local_md?: string;
  hz_u_jump_shipping?: string;
  pt_ujump_shipping?: string;
  fa_wuxi?: string;
  fa_hz?: string;
  fa_pt?: string;
  fa_korea?: string;
  fa_singfore?: string;
  fa_heads?: string;
  [key: string]: any;
}

export interface Filters {
  status: string;
  brand_classification: string;
  terms_of_shipment: string;
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc' | '';
}

export interface Analytics {
  total: number;
  active: number;
  topTier: number;
  filtered: number;
}

export interface ColumnVisibility {
  [key: string]: boolean;
}

// ============================================================================
// AUTH TYPES
// ============================================================================

// User roles in the M88 Database system - Updated to include all possible roles
export type UserRole = 'admin' | 'manager' | 'factory_user' | 'viewer' | 'madison88' | 'factory';

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole; // Now uses the complete UserRole type
  company: string;
  permissions: string[]; // Added permissions array for Dashboard
  created_at: string;
  updated_at: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  role?: UserRole;
}

// Registration data
export interface RegisterData {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  company: string;
}

// Auth response
export interface AuthResponse {
  success: boolean;
  error?: string;
  user?: User;
}

// Role permissions
export interface RolePermissions {
  canViewAllAccounts: boolean;
  canEditAccounts: boolean;
  canDeleteAccounts: boolean;
  canManageUsers: boolean;
  canExportData: boolean;
  canImportData: boolean;
}

// Role-based permissions mapping - Updated to include new roles
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    canViewAllAccounts: true,
    canEditAccounts: true,
    canDeleteAccounts: true,
    canManageUsers: true,
    canExportData: true,
    canImportData: true,
  },
  manager: {
    canViewAllAccounts: true,
    canEditAccounts: true,
    canDeleteAccounts: false,
    canManageUsers: false,
    canExportData: true,
    canImportData: true,
  },
  factory_user: {
    canViewAllAccounts: false,
    canEditAccounts: false,
    canDeleteAccounts: false,
    canManageUsers: false,
    canExportData: false,
    canImportData: false,
  },
  viewer: {
    canViewAllAccounts: true,
    canEditAccounts: false,
    canDeleteAccounts: false,
    canManageUsers: false,
    canExportData: false,
    canImportData: false,
  },
  madison88: {
    canViewAllAccounts: true,
    canEditAccounts: true,
    canDeleteAccounts: true,
    canManageUsers: true,
    canExportData: true,
    canImportData: true,
  },
  factory: {
    canViewAllAccounts: false,
    canEditAccounts: false,
    canDeleteAccounts: false,
    canManageUsers: false,
    canExportData: false,
    canImportData: false,
  },
};

// Helper function to get role permissions
export const getRolePermissions = (role: UserRole): RolePermissions => {
  return ROLE_PERMISSIONS[role];
};

// Helper function to check if user has specific permission
export const hasPermission = (user: User | null, permission: keyof RolePermissions): boolean => {
  if (!user) return false;
  return getRolePermissions(user.role)[permission];
};

// ============================================================================
// COMMON UTILITY TYPES
// ============================================================================

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}