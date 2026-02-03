import { getAxiosInstance } from "@/services/axiosConfig";
import type { User } from "../types";

const api = () => getAxiosInstance();

export const getUserProfile = async (userId: string): Promise<User> => {
  const response = await api().get<User>(`/users/${userId}`);
  return response.data;
};

export const updateUserProfile = async (
  userId: string,
  data: Partial<User>
): Promise<User> => {
  const response = await api().patch<User>(`/users/${userId}`, data);
  return response.data;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api().get<User[]>("/users");
  return response.data;
};
