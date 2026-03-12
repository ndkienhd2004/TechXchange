import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

export const createStoreRequest = async (payload: {
  store_name: string;
  store_description?: string;
  contact_phone: string;
  address_line: string;
  ward?: string;
  district: string;
  city?: string;
  province: string;
  ghn_province_id?: number | null;
  ghn_district_id?: number | null;
  ghn_ward_code?: string | null;
}) => {
  const response = await api().post("/stores/requests", payload);
  return response.data;
};

export const getMyStoreRequests = async (params?: {
  limit?: number;
  offset?: number;
  status?: string;
}) => {
  const response = await api().get("/stores/requests/me", { params });
  return response.data;
};
