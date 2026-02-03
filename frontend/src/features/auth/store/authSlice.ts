import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AuthState, LoginRequest, SignUpRequest } from "../types";
import {
  GetUserProfileService,
  SignUpService,
  SignInService,
  UpdateUserService,
} from "../services/authApi";

/** Error từ axiosConfig đã là plain object { code?, success?, message? }. */
const initialState: AuthState = {
  loading: false,
  error: null,
  token: null,
  refreshToken: null,
  user: null,
  isAuthenticated: false,
};

export const SignIn = createAsyncThunk(
  "auth/signIn",
  async (payload: LoginRequest, thunkAPI) => {
    try {
      const response = await SignInService(payload.email, payload.password);
      return response.data;
    } catch (error) {
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
      return response.data;
    } catch (error) {
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
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const GetUserProfile = createAsyncThunk(
  "auth/getUserProfile",
  async (_, thunkAPI) => {
    try {
      const response = await GetUserProfileService();
      return response.data;
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
      state.token = action.payload.token;
      if (action.payload.user != null) state.user = action.payload.user;
      if (action.payload.refreshToken !== undefined)
        state.refreshToken = action.payload.refreshToken ?? null;
      state.isAuthenticated = true;
    },
    logout: (state) => {
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
        state.token = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken ?? null;
        state.user = action.payload.user;
        state.isAuthenticated = true;
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
        state.user = action.payload.user;
        state.isAuthenticated = true;
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
        console.log("respose:", action.payload);
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
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
      });
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
