import { getAxiosInstance } from "@/services/axiosConfig";
import type {
  AdminBrandRequest,
  AdminProduct,
  AdminCategory,
  AdminCatalogSpecRequest,
  AdminProductRequest,
  AdminStoreRequest,
  AdminUserStats,
  ApiResponse,
  PagedResponse,
} from "../types";

const api = () => getAxiosInstance();

const toOffset = (page = 1, limit = 10) => Math.max(page - 1, 0) * limit;

export const getAdminProducts = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
  category_id?: number;
  brand_id?: number;
}) => {
  const response = await api().get<ApiResponse<PagedResponse<AdminProduct>>>(
    "/admin/catalog-products",
    { params }
  );
  return response.data;
};

export const approveAdminCatalogProduct = async (id: number) => {
  const response = await api().put(`/admin/catalog-products/${id}/approve`);
  return response.data;
};

export const rejectAdminCatalogProduct = async (id: number) => {
  const response = await api().put(`/admin/catalog-products/${id}/reject`);
  return response.data;
};

export const getAdminCatalogSpecRequests = async (params: {
  page?: number;
  limit?: number;
  status?: string;
  q?: string;
}) => {
  const response = await api().get<ApiResponse<PagedResponse<AdminCatalogSpecRequest>>>(
    "/admin/catalog-spec-requests",
    { params }
  );
  return response.data;
};

export const approveAdminCatalogSpecRequest = async (id: number) => {
  const response = await api().put(`/admin/catalog-spec-requests/${id}/approve`);
  return response.data;
};

export const rejectAdminCatalogSpecRequest = async (id: number, note?: string) => {
  const response = await api().put(`/admin/catalog-spec-requests/${id}/reject`, { note });
  return response.data;
};

export const getAdminCategories = async () => {
  const response = await api().get<ApiResponse<AdminCategory[]>>(
    "/admin/categories",
    { params: { tree: true, active: "all" } }
  );
  return response.data;
};

export const createAdminCategory = async (payload: {
  name: string;
  slug?: string;
  parent_id?: number | null;
  is_active?: boolean;
}) => {
  const response = await api().post("/admin/categories", payload);
  return response.data;
};

export const updateAdminCategory = async (
  id: number,
  payload: { name?: string; is_active?: boolean }
) => {
  const response = await api().put(`/admin/categories/${id}`, payload);
  return response.data;
};

export const deleteAdminCategory = async (id: number) => {
  const response = await api().delete(`/admin/categories/${id}`);
  return response.data;
};

export const getSimpleBrands = async () => {
  const response = await api().get("/brands");
  const payload = response.data as
    | Array<{ id: number | string; name: string; image?: string | null }>
    | { data?: Array<{ id: number | string; name: string; image?: string | null }> };
  const rows = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    image: row.image ?? null,
  }));
};

export const getAdminUsers = async (params: { page?: number; limit?: number }) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await api().get("/admin/users", {
    params: { limit, offset: toOffset(page, limit) },
  });
  return response.data;
};

export const getAdminUserById = async (id: number) => {
  const response = await api().get(`/admin/users/${id}`);
  return response.data;
};

export const searchAdminUsers = async (params: {
  email?: string;
  username?: string;
  role?: string;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await api().get("/admin/users/search", {
    params: {
      email: params.email,
      username: params.username,
      role: params.role,
      limit,
      offset: toOffset(page, limit),
    },
  });
  return response.data;
};

export const getAdminUserStats = async () => {
  const response = await api().get<ApiResponse<AdminUserStats>>("/admin/users/stats");
  return response.data;
};

export const getAdminStoreRequests = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await api().get<ApiResponse<PagedResponse<AdminStoreRequest>>>(
    "/admin/store-requests",
    {
      params: {
        status: params.status,
        limit,
        offset: toOffset(page, limit),
      },
    }
  );
  return response.data;
};

export const approveAdminStoreRequest = async (id: number) => {
  const response = await api().put(`/admin/store-requests/${id}/approve`);
  return response.data;
};

export const rejectAdminStoreRequest = async (id: number, note?: string) => {
  const response = await api().put(`/admin/store-requests/${id}/reject`, { note });
  return response.data;
};

export const getAdminBrandRequests = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await api().get<ApiResponse<PagedResponse<AdminBrandRequest>>>(
    "/admin/brand-requests",
    {
      params: {
        status: params.status,
        limit,
        offset: toOffset(page, limit),
      },
    }
  );
  return response.data;
};

export const approveAdminBrandRequest = async (id: number) => {
  const response = await api().put(`/admin/brand-requests/${id}/approve`);
  return response.data;
};

export const rejectAdminBrandRequest = async (id: number, note?: string) => {
  const response = await api().put(`/admin/brand-requests/${id}/reject`, { note });
  return response.data;
};

export const createAdminBrand = async (payload: { name: string; image?: string }) => {
  const response = await api().post("/admin/brands", payload);
  return response.data;
};

export const updateAdminBrand = async (
  id: number,
  payload: { name?: string; image?: string }
) => {
  const response = await api().put(`/admin/brands/${id}`, payload);
  return response.data;
};

export const deleteAdminBrand = async (id: number) => {
  const response = await api().delete(`/admin/brands/${id}`);
  return response.data;
};

export const deleteAdminCatalogProduct = async (id: number) => {
  const response = await api().delete(`/admin/catalog-products/${id}`);
  return response.data;
};

export const updateAdminCatalogProduct = async (
  id: number,
  payload: {
    name?: string;
    description?: string | null;
    default_image?: string | null;
    msrp?: number | null;
    specs?: Record<string, unknown> | null;
    status?: string;
    brand_id?: number;
    category_id?: number;
  }
) => {
  const response = await api().put(`/admin/catalog-products/${id}`, payload);
  return response.data;
};

export const getAdminProductRequests = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const response = await api().get<ApiResponse<PagedResponse<AdminProductRequest>>>(
    "/admin/product-requests",
    {
      params: {
        status: params.status,
        limit,
        offset: toOffset(page, limit),
      },
    }
  );
  return response.data;
};

export const approveAdminProductRequest = async (id: number) => {
  const response = await api().put(`/admin/product-requests/${id}/approve`);
  return response.data;
};

export const rejectAdminProductRequest = async (id: number, note?: string) => {
  const response = await api().put(`/admin/product-requests/${id}/reject`, { note });
  return response.data;
};
