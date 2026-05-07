import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

/**
 * Lấy thông tin cửa hàng
 * @returns Thông tin cửa hàng
 */
export const getShopInfoService = async () => {
  const response = await api().get("/stores/me");
  return response.data;
};

export const updateShopAddressService = async (
  storeId: number,
  payload: {
    address_line: string;
    ward?: string;
    district: string;
    city?: string;
    province: string;
    ghn_province_id?: number | null;
    ghn_district_id?: number | null;
    ghn_ward_code?: string | null;
  },
) => {
  const response = await api().put(`/stores/${storeId}/address`, payload);
  return response.data;
};

export const updateShopProfileService = async (
  storeId: number,
  payload: {
    name?: string;
    description?: string;
    logo?: string | null;
    banner?: string | null;
  },
) => {
  const response = await api().put(`/stores/${storeId}/profile`, payload);
  return response.data;
};

export const registerShopGhnService = async (storeId: number) => {
  const response = await api().post(`/stores/${storeId}/ghn/register`);
  return response.data;
};

type ShopAnalyticsRange = "7d" | "30d" | "90d" | "all";

export const getShopAnalyticsService = async (
  query:
    | ShopAnalyticsRange
    | {
        range?: ShopAnalyticsRange;
        fromDate?: string;
        toDate?: string;
      },
) => {
  const params =
    typeof query === "string"
      ? { range: query }
      : {
          ...(query.range ? { range: query.range } : {}),
          ...(query.fromDate ? { from_date: query.fromDate } : {}),
          ...(query.toDate ? { to_date: query.toDate } : {}),
        };

  const response = await api().get("/orders/shop/analytics", {
    params,
  });
  return response.data;
};

/**
 * Lấy sản phẩm của cửa hàng
 * @returns Sản phẩm của cửa hàng
 */
export const getShopProductsService = async ({
  page,
  limit,
  q,
}: {
  page: number;
  limit: number;
  q?: string;
}) => {
  const response = await api().get("/products/me", {
    params: {
      page,
      limit,
      ...(q ? { q } : {}),
    },
  });
  return response.data;
};

/**
 * Lấy thương hiệu của cửa hàng
 * @returns Thương hiệu của cửa hàng
 */
export const getShopBrandsService = async () => {
  const response = await api().get("/brands");
  return response.data;
};

export const createBrandRequestService = async (payload: {
  name: string;
  image?: string;
}) => {
  const response = await api().post("/brands/requests", payload);
  return response.data;
};

export const getMyBrandRequestsService = async ({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: "all" | "pending" | "approved" | "rejected";
}) => {
  const offset = Math.max(page - 1, 0) * limit;
  const response = await api().get("/brands/requests/me", {
    params: {
      limit,
      offset,
      ...(status && status !== "all" ? { status } : {}),
    },
  });
  return response.data;
};

export const getProductCatalogsService = async ({
  page,
  limit,
  q,
}: {
  page: number;
  limit: number;
  q?: string;
}) => {
  const response = await api().get(
    `/products/catalogs?page=${page}&limit=${limit}&status=active${q ? `&q=${q}` : ""}`,
  );
  return response.data;
};

/**
 * Tạo listing sản phẩm từ catalog
 */
export const createShopProductService = async (payload: {
  catalog_id: number;
  store_id: number;
  price: number;
  description?: string;
  images?: { url: string; sort_order: number }[];
  variant_options?: Record<string, string>;
}) => {
  const response = await api().post("/products", payload);
  return response.data;
};

export const updateShopProductService = async (
  productId: number,
  payload: {
    price?: number;
    description?: string;
    status?: "active" | "inactive" | "sold_out";
    images?: { url: string; sort_order: number }[];
  },
) => {
  const response = await api().put(`/products/${productId}`, payload);
  return response.data;
};

export const deleteShopProductService = async (productId: number) => {
  const response = await api().delete(`/products/${productId}`);
  return response.data;
};

/**
 * Gửi yêu cầu tạo sản phẩm mới
 */
export const requestNewProductService = async (payload: {
  name: string;
  category_id: number;
  brand_id: number;
  brand_name?: string;
  description?: string;
  specs?: Record<string, string>;
  default_image?: string;
}) => {
  const response = await api().post("/products/requests", payload);
  return response.data;
};

export const requestCatalogSpecService = async (payload: {
  catalog_id: number;
  spec_key: string;
  proposed_values: string[];
}) => {
  const response = await api().post("/products/catalog-spec-requests", payload);
  return response.data;
};

export const getMyProductRequestsService = async ({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}) => {
  const offset = Math.max(page - 1, 0) * limit;
  const response = await api().get(
    `/products/requests/me?page=${page}&limit=${limit}&offset=${offset}${status ? `&status=${status}` : ""}`,
  );
  return response.data;
};

export const getMyCatalogSpecRequestsService = async ({
  page,
  limit,
  status,
}: {
  page: number;
  limit: number;
  status?: string;
}) => {
  const response = await api().get(
    `/products/catalog-spec-requests?page=${page}&limit=${limit}${status ? `&status=${status}` : ""}`,
  );
  return response.data;
};

export const getShopInventoryOverviewService = async (query?: {
  q?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await api().get("/stores/me/inventory", {
    params: {
      ...(query?.q ? { q: query.q } : {}),
      ...(query?.page ? { page: query.page } : {}),
      ...(query?.limit ? { limit: query.limit } : {}),
    },
  });
  return response.data;
};

export const getShopInventoryTransactionsService = async (
  productId: number,
  query?: { limit?: number; offset?: number },
) => {
  const response = await api().get(
    `/stores/me/inventory/${productId}/transactions`,
    {
      params: {
        ...(query?.limit ? { limit: query.limit } : {}),
        ...(query?.offset ? { offset: query.offset } : {}),
      },
    },
  );
  return response.data;
};

export const importShopInventoryService = async (payload: {
  product_id: number;
  serial_id: number;
  quantity: number;
  unit_cost: number;
  note?: string;
}) => {
  const response = await api().post("/stores/me/inventory/import", payload);
  return response.data;
};
