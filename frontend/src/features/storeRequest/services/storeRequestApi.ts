import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

export const createStoreRequest = async (payload: {
  store_name: string;
  store_description?: string;
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
