import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, LoginRequest, SignUpRequest } from "../types";
import {
  GetUserProfileService,
  SignUpService,
  SignInService,
  UpdateUserService,
} from "../services/authApi";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

/** Error từ axiosConfig đã là plain object { code?, success?, message? }. */
const initialState: AuthState = {
  loading: false,
  error: null,
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

const normalizeToken = (value: unknown): string | null => {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token || token === "undefined" || token === "null") return null;
  return token;
};

export const SignIn = createAsyncThunk(
  "auth/signIn",
  async (payload: LoginRequest, thunkAPI) => {
    try {
      const response = await SignInService(payload.email, payload.password);
      showSuccessToast("Đăng nhập thành công");
      return response;
    } catch (error) {
      showErrorToast(error as string);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const SignUp = createAsyncThunk(
  "auth/signUp",
  async (payload: SignUpRequest, thunkAPI) => {
    try {
      const response = await SignUpService(
        payload.email,
        payload.password,
        payload.username,
        payload.gender,
        payload.phone
      );
      showSuccessToast("Đăng ký thành công");
      return response;
    } catch (error) {
      showErrorToast(error as string);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const UpdateUser = createAsyncThunk(
  "auth/updateUser",
  async (
    payload: {
      username: string;
      email: string;
      gender: string;
      phone: string;
      avatar?: string;
      address?: string;
    },
    thunkAPI
  ) => {
    try {
      const response = await UpdateUserService(payload);
      showSuccessToast("Cập nhật thông tin thành công");
      return response;
    } catch (error) {
      showErrorToast(error as string);
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const GetUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, thunkAPI) => {
    try {
      const response = await GetUserProfileService();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user?: AuthState["user"];
        refreshToken?: string | null;
      }>
    ) => {
      state.token = normalizeToken(action.payload.token);
      if (action.payload.user != null) state.user = action.payload.user;
      if (action.payload.refreshToken !== undefined)
        state.refreshToken = normalizeToken(action.payload.refreshToken);
      state.isAuthenticated = Boolean(state.token);
    },
    logout: (state) => {
      showSuccessToast("Đăng xuất thành công");
      state.token = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(SignIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SignIn.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as AuthState["error"]) ?? "An error occurred";
      })
      .addCase(SignIn.fulfilled, (state, action) => {
        state.token = normalizeToken(action.payload.accessToken);
        state.refreshToken = normalizeToken(action.payload.refreshToken);
        state.user = action.payload.user ?? null;
        state.isAuthenticated = Boolean(state.token);
        state.loading = false;
        state.error = null;
      })
      .addCase(SignUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(SignUp.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as AuthState["error"]) ?? "An error occurred";
      })
      .addCase(SignUp.fulfilled, (state, action) => {
        state.user = action.payload.user ?? null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.error = null;
      })
      .addCase(UpdateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(UpdateUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as AuthState["error"]) ?? "An error occurred";
      })
      .addCase(UpdateUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(GetUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(GetUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as AuthState["error"]) ?? "An error occurred";
      })
      .addCase(GetUserProfile.fulfilled, (state, action) => {
        const p = action.payload as
          | { user?: AuthState["user"] }
          | AuthState["user"];
        state.user =
          p && typeof p === "object" && "user" in p
            ? p.user ?? state.user
            : (p as AuthState["user"]);
        state.isAuthenticated = Boolean(state.token);
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
