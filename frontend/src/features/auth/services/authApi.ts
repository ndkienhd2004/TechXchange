import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

export const SignInService = async (email: string, password: string) => {
  const response = await api().post("/auth/login", { email, password });
  return response.data;
};

export const SignUpService = async (
  email: string,
  password: string,
  name: string,
  gender: string,
  phone: string
) => {
  const response = await api().post("/auth/register", {
    email,
    password,
    name,
    gender,
    phone,
  });
  return response.data;
};

export const UpdateUserService = async (data: {
  username: string;
  email: string;
  gender: string;
  phone: string;
  avatar?: string;
  address?: string;
}) => {
  const response = await api().put("/users/profile", data);
  return response.data;
};

export const GetUserProfileService = async () => {
  const response = await api().get("/users/profile");
  return response.data;
};
