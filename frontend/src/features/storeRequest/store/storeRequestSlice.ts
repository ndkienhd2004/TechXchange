import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type {
  StoreRequest,
  StoreRequestList,
  StoreRequestState,
} from "../types";
import {
  createStoreRequest as createStoreRequestApi,
  getMyStoreRequests as getMyStoreRequestsApi,
} from "../services/storeRequestApi";

type ApiResponse<T> = {
  code?: string;
  success?: boolean;
  message?: string;
  data?: T;
};

const initialState: StoreRequestState = {
  items: [],
  total: 0,
  page: 1,
  totalPages: 1,
  listLoading: false,
  submitLoading: false,
  error: null,
};

export const createStoreRequest = createAsyncThunk(
  "storeRequest/create",
  async (
    payload: { store_name: string; store_description?: string },
    thunkAPI
  ) => {
    try {
      const res = (await createStoreRequestApi(payload)) as ApiResponse<unknown>;
      return res?.data ?? res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchMyStoreRequests = createAsyncThunk(
  "storeRequest/fetchMy",
  async (
    params: { limit?: number; offset?: number; status?: string } | undefined,
    thunkAPI
  ) => {
    try {
      const res = (await getMyStoreRequestsApi(
        params
      )) as ApiResponse<StoreRequestList>;
      return res?.data ?? res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const storeRequestSlice = createSlice({
  name: "storeRequest",
  initialState,
  reducers: {
    clearStoreRequestError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createStoreRequest.pending, (state) => {
        state.submitLoading = true;
        state.error = null;
      })
      .addCase(createStoreRequest.rejected, (state, action) => {
        state.submitLoading = false;
        state.error =
          (action.payload as { message?: string } | null)?.message ??
          "Không thể gửi yêu cầu.";
      })
      .addCase(createStoreRequest.fulfilled, (state, action) => {
        state.submitLoading = false;
        state.error = null;
        if (action.payload && typeof action.payload === "object") {
          const next = action.payload as {
            id?: number;
            store_name?: string;
            status?: string;
          };
          if (next.id) {
            state.items = [action.payload as StoreRequest, ...state.items];
            state.total += 1;
          }
        }
      })
      .addCase(fetchMyStoreRequests.pending, (state) => {
        state.listLoading = true;
        state.error = null;
      })
      .addCase(fetchMyStoreRequests.rejected, (state, action) => {
        state.listLoading = false;
        state.error =
          (action.payload as { message?: string } | null)?.message ??
          "Không thể tải danh sách yêu cầu.";
      })
      .addCase(fetchMyStoreRequests.fulfilled, (state, action) => {
        state.listLoading = false;
        const payload = action.payload as StoreRequestList | undefined;
        if (!payload || !payload.requests) return;
        state.items = payload.requests ?? [];
        state.total = payload.total ?? 0;
        state.page = payload.page ?? 1;
        state.totalPages = payload.totalPages ?? 1;
      });
  },
});

export const { clearStoreRequestError } = storeRequestSlice.actions;
export default storeRequestSlice.reducer;
