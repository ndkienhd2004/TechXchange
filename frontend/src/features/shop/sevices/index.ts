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

/**
 * Lấy sản phẩm của cửa hàng
 * @returns Sản phẩm của cửa hàng
 */
export const getShopProductsService = async ({
  page,
  limit,
}: {
  page: number;
  limit: number;
}) => {
  const response = await api().get(`/products/me?page=${page}&limit=${limit}`);
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
    `/products/catalogs?page=${page}&limit=${limit}${q ? `&q=${q}` : ""}`,
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
  quantity: number;
  images?: { url: string; sort_order: number }[];
  variant_key?: string;
}) => {
  const response = await api().post("/products", payload);
  return response.data;
};

/**
 * Gửi yêu cầu tạo sản phẩm mới
 */
export const requestNewProductService = async (payload: {
  name: string;
  category_id: number;
  brand_id?: number;
  brand_name?: string;
  description?: string;
  specs?: Record<string, string>;
  default_image?: string;
}) => {
  const response = await api().post("/products/requests", payload);
  return response.data;
};
