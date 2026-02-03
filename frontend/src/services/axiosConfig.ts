/**
 * Axios config cho toàn hệ thống.
 * Mọi request đều qua instance này: baseURL, token, 401 → refresh-token hoặc logout.
 * State (auth, user, ...) quản lý riêng ở từng slice.
 * Không import authSlice ở đây để tránh circular: authSlice → authApi → axiosConfig → authSlice.
 */
import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/config/api";

type StoreWithAuth = {
  getState: () => {
    auth: { token: string | null; refreshToken: string | null };
  };
  dispatch: (action: unknown) => void;
};

const AUTH_SET_CREDENTIALS = "auth/setCredentials";
const AUTH_LOGOUT = "auth/logout";

const REFRESH_URL = "/auth/refresh-token";

export interface ApiErrorPayload {
  code?: string;
  success?: boolean;
  message?: string;
}

/** Chuẩn hóa lỗi từ axios → object thuần để Redux/slice dùng. */
function getErrorPayload(err: AxiosError): ApiErrorPayload {
  const data: unknown = err.response?.data;
  if (data === undefined) return { message: err.message ?? "Request failed" };
  if (typeof data === "string") {
    try {
      const parsed = JSON.parse(data) as ApiErrorPayload;
      return parsed && typeof parsed === "object" ? parsed : { message: data };
    } catch {
      return { message: data };
    }
  }
  if (data && typeof data === "object" && "message" in data)
    return data as ApiErrorPayload;
  return { message: err.message ?? "Request failed" };
}

function rejectWithPayload(err: AxiosError, payload?: ApiErrorPayload) {
  return Promise.reject(payload ?? getErrorPayload(err));
}

interface RefreshResponse {
  code: string;
  success: boolean;
  message?: string;
  data?: { token?: string; refreshToken?: string };
}

let axiosInstance: ReturnType<typeof axios.create> | null = null;
let storeRef: StoreWithAuth | null = null;

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshToken(): Promise<string | null> {
  const store = storeRef;
  if (!store) return null;
  const refreshToken = store.getState().auth.refreshToken;
  if (!refreshToken) return null;
  try {
    const res = await axios
      .create({
        baseURL: API_BASE_URL,
        headers: { "Content-Type": "application/json" },
      })
      .post<RefreshResponse>(REFRESH_URL, { refreshToken });
    const body = res.data;
    if (body.code === "200" && body.success === true && body.data?.token) {
      store.dispatch({
        type: AUTH_SET_CREDENTIALS,
        payload: {
          token: body.data.token,
          refreshToken: body.data.refreshToken ?? undefined,
        },
      });
      return body.data.token;
    }
    return null;
  } catch {
    return null;
  }
}

function isRefreshEndpoint(url: string): boolean {
  return url === REFRESH_URL || url.endsWith(REFRESH_URL);
}

/**
 * Khởi tạo axios instance (gọi 1 lần khi tạo store).
 */
export function createAxiosInstance(
  store: StoreWithAuth
): typeof axiosInstance {
  storeRef = store;
  const instance = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
  });

  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const url = config.url ?? "";
      if (isRefreshEndpoint(url)) return config;
      const token = store.getState().auth.token;
      if (token) {
        config.headers.set("authorization", `Bearer ${token}`);
      }
      return config;
    },
    (err) => Promise.reject(err)
  );

  instance.interceptors.response.use(
    (res) => res,
    async (err: AxiosError) => {
      const config = err.config as InternalAxiosRequestConfig & {
        _retry?: boolean;
      };
      const status = err.response?.status;
      const url = config?.url ?? "";
      const payload = getErrorPayload(err);

      if (status !== 401 || isRefreshEndpoint(url) || config._retry) {
        return rejectWithPayload(err, payload);
      }
      config._retry = true;

      const store = storeRef;
      if (!store) return rejectWithPayload(err, payload);

      const refreshToken = store.getState().auth.refreshToken;
      if (!refreshToken) {
        store.dispatch({ type: AUTH_LOGOUT });
        return rejectWithPayload(err, payload);
      }

      if (!refreshPromise) {
        refreshPromise = tryRefreshToken().finally(() => {
          refreshPromise = null;
        });
      }
      const newToken = await refreshPromise;
      if (!newToken) {
        store.dispatch({ type: AUTH_LOGOUT });
        return rejectWithPayload(err, payload);
      }

      config.headers.set("authorization", `Bearer ${newToken}`);
      return instance.request(config);
    }
  );

  axiosInstance = instance;
  return instance;
}

/**
 * Lấy axios instance (dùng trong authApi, userApi, ...).
 * Gọi createAxiosInstance(store) trước (trong makeStore).
 */
export function getAxiosInstance(): NonNullable<typeof axiosInstance> {
  if (!axiosInstance) {
    throw new Error(
      "Axios chưa khởi tạo. Gọi createAxiosInstance(store) trong makeStore."
    );
  }
  return axiosInstance;
}
