import { getAxiosInstance } from "@/services/axiosConfig";
import type { ProductListResponse } from "../types";

const api = () => getAxiosInstance();

export interface GetProductsParams {
  page?: number;
  limit?: number;
  q?: string;
  category_id?: number;
  brand_id?: number;
  store_id?: number;
  seller_id?: number;
  status?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}

export const getProducts = async (params?: GetProductsParams): Promise<ProductListResponse> => {
  const response = await api().get<ProductListResponse>("/products", { params });
  return response.data;
};

export const getProductById = async (id: string | number) => {
  const response = await api().get(`/products/${id}`);
  return response.data;
};
