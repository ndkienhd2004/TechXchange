import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

/**
 * Lấy thông tin cửa hàng
 * @returns Thông tin cửa hàng
 */
export const getShopInfoService = async () => {
  const response = await api().get("/shop/info");
  return response.data;
};

/**
 * Lấy sản phẩm của cửa hàng
 * @returns Sản phẩm của cửa hàng
 */
export const getShopProductsService = async ({
  page,
  size,
}: {
  page: number;
  size: number;
}) => {
  const response = await api().get(`/products/me?page=${page}&size=${size}`);
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
  size,
}: {
  page: number;
  size: number;
}) => {
  const response = await api().get(
    `/products/catalogs?page=${page}&size=${size}`,
  );
  return response.data;
};
