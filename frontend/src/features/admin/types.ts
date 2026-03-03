export type AdminStatus = "all" | "pending" | "approved" | "rejected";

export interface ApiResponse<T> {
  code?: string;
  success?: boolean;
  message?: string;
  data?: T;
}

export interface AdminProduct {
  id: number;
  name: string;
  msrp?: number | string | null;
  price?: number | string;
  status: string;
  created_at: string;
  brand?: { id: number; name: string };
  category?: { id: number; name: string };
  store?: { id: number; name: string };
  seller?: { id: number; username: string };
  catalog?: {
    id: number;
    name: string;
    brand?: { id: number; name: string };
    category?: { id: number; name: string };
  };
}

export interface PagedResponse<T> {
  total: number;
  page: number;
  totalPages: number;
  products?: T[];
  catalogs?: T[];
  requests?: T[];
  users?: T[];
}

export interface AdminStoreRequest {
  id: number;
  store_name: string;
  store_description?: string | null;
  status: string;
  created_at: string;
  user?: { id: number; username: string; email: string };
}

export interface AdminBrandRequest {
  id: number;
  name: string;
  image?: string | null;
  status: string;
  created_at: string;
  requester?: { id: number; username: string; email: string };
}

export interface AdminProductRequest {
  id: number;
  name: string;
  brand_name?: string | null;
  status: string;
  created_at: string;
  requester?: { id: number; username: string; email: string };
  category?: { id: number; name: string };
}

export interface AdminUserStats {
  totalUsers?: number;
  totalShops?: number;
  totalAdmins?: number;
  [key: string]: unknown;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  level?: number;
  is_active?: boolean;
  children?: AdminCategory[];
}

export interface AdminCatalogSpecRequest {
  id: number;
  catalog_id: number;
  spec_key: string;
  proposed_values: string[];
  status: string;
  created_at: string;
  requester?: { id: number; username: string; email: string };
  catalog?: { id: number; name: string };
}

export interface AdminState {
  products: {
    items: AdminProduct[];
    page: number;
    totalPages: number;
    total: number;
    status: AdminStatus;
    loading: boolean;
    error: string | null;
    counts: Record<AdminStatus, number>;
  };
  storeRequests: {
    items: AdminStoreRequest[];
    page: number;
    totalPages: number;
    total: number;
    status: AdminStatus;
    loading: boolean;
    error: string | null;
  };
  brandRequests: {
    items: AdminBrandRequest[];
    page: number;
    totalPages: number;
    total: number;
    status: AdminStatus;
    loading: boolean;
    error: string | null;
  };
  productRequests: {
    items: AdminProductRequest[];
    page: number;
    totalPages: number;
    total: number;
    status: AdminStatus;
    loading: boolean;
    error: string | null;
  };
  catalogSpecRequests: {
    items: AdminCatalogSpecRequest[];
    page: number;
    totalPages: number;
    total: number;
    status: AdminStatus;
    loading: boolean;
    error: string | null;
  };
  userStats: {
    data: AdminUserStats | null;
    loading: boolean;
    error: string | null;
  };
}
