import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import {
  approveAdminCatalogProduct,
  approveAdminCatalogSpecRequest,
  approveAdminBrandRequest,
  approveAdminProductRequest,
  approveAdminStoreRequest,
  getAdminBrandRequests,
  getAdminCatalogSpecRequests,
  getAdminProductRequests,
  getAdminProducts,
  getAdminStoreRequests,
  getAdminUserStats,
  rejectAdminCatalogProduct,
  rejectAdminCatalogSpecRequest,
  rejectAdminBrandRequest,
  rejectAdminProductRequest,
  rejectAdminStoreRequest,
} from "../services/adminApi";
import type {
  AdminProduct,
  AdminProductRequest,
  AdminCatalogSpecRequest,
  AdminState,
  AdminStatus,
  AdminStoreRequest,
  ApiResponse,
  PagedResponse,
  AdminBrandRequest,
} from "../types";

const initialState: AdminState = {
  products: {
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    status: "all",
    loading: false,
    error: null,
    counts: { all: 0, pending: 0, approved: 0, rejected: 0 },
  },
  storeRequests: {
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    status: "all",
    loading: false,
    error: null,
  },
  brandRequests: {
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    status: "all",
    loading: false,
    error: null,
  },
  productRequests: {
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    status: "all",
    loading: false,
    error: null,
  },
  catalogSpecRequests: {
    items: [],
    page: 1,
    totalPages: 1,
    total: 0,
    status: "all",
    loading: false,
    error: null,
  },
  userStats: {
    data: null,
    loading: false,
    error: null,
  },
};

const unwrapData = <T>(res: ApiResponse<T> | T | undefined): T | undefined => {
  if (!res) return undefined;
  if (typeof res === "object" && res !== null && "data" in res) {
    return (res as ApiResponse<T>).data;
  }
  return res as T;
};

const mapProductStatus = (status: AdminStatus) => {
  if (status === "all") return "all";
  if (status === "approved") return "active";
  return status;
};

export const fetchAdminProducts = createAsyncThunk(
  "admin/fetchProducts",
  async (params: { page: number; status: AdminStatus; limit?: number; q?: string }, thunkAPI) => {
    try {
      const res = await getAdminProducts({
        page: params.page,
        limit: params.limit ?? 10,
        status: mapProductStatus(params.status),
        q: params.q,
      });
      return unwrapData<PagedResponse<AdminProduct>>(res);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchAdminProductCounts = createAsyncThunk(
  "admin/fetchProductCounts",
  async (_, thunkAPI) => {
    try {
      const [allRes, pendingRes, approvedRes, rejectedRes] = await Promise.all([
        getAdminProducts({ page: 1, limit: 1, status: "all" }),
        getAdminProducts({ page: 1, limit: 1, status: "pending" }),
        getAdminProducts({ page: 1, limit: 1, status: "active" }),
        getAdminProducts({ page: 1, limit: 1, status: "rejected" }),
      ]);
      const allData = unwrapData<PagedResponse<AdminProduct>>(allRes);
      const pendingData = unwrapData<PagedResponse<AdminProduct>>(pendingRes);
      const approvedData = unwrapData<PagedResponse<AdminProduct>>(approvedRes);
      const rejectedData = unwrapData<PagedResponse<AdminProduct>>(rejectedRes);

      return {
        all: allData?.total ?? 0,
        pending: pendingData?.total ?? 0,
        approved: approvedData?.total ?? 0,
        rejected: rejectedData?.total ?? 0,
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const cancelAdminProductById = createAsyncThunk(
  "admin/rejectCatalogProduct",
  async (id: number, thunkAPI) => {
    try {
      await rejectAdminCatalogProduct(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const approveAdminProductById = createAsyncThunk(
  "admin/approveCatalogProduct",
  async (id: number, thunkAPI) => {
    try {
      await approveAdminCatalogProduct(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchAdminStoreRequests = createAsyncThunk(
  "admin/fetchStoreRequests",
  async (params: { page: number; status: AdminStatus; limit?: number }, thunkAPI) => {
    try {
      const res = await getAdminStoreRequests({
        page: params.page,
        limit: params.limit ?? 10,
        status: params.status === "all" ? "all" : params.status,
      });
      return unwrapData<PagedResponse<AdminStoreRequest>>(res);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const approveStoreRequestById = createAsyncThunk(
  "admin/approveStoreRequest",
  async (id: number, thunkAPI) => {
    try {
      await approveAdminStoreRequest(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const rejectStoreRequestById = createAsyncThunk(
  "admin/rejectStoreRequest",
  async (params: { id: number; note?: string }, thunkAPI) => {
    try {
      await rejectAdminStoreRequest(params.id, params.note);
      return params.id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchAdminBrandRequests = createAsyncThunk(
  "admin/fetchBrandRequests",
  async (params: { page: number; status: AdminStatus; limit?: number }, thunkAPI) => {
    try {
      const res = await getAdminBrandRequests({
        page: params.page,
        limit: params.limit ?? 10,
        status: params.status === "all" ? "all" : params.status,
      });
      return unwrapData<PagedResponse<AdminBrandRequest>>(res);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const approveBrandRequestById = createAsyncThunk(
  "admin/approveBrandRequest",
  async (id: number, thunkAPI) => {
    try {
      await approveAdminBrandRequest(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const rejectBrandRequestById = createAsyncThunk(
  "admin/rejectBrandRequest",
  async (params: { id: number; note?: string }, thunkAPI) => {
    try {
      await rejectAdminBrandRequest(params.id, params.note);
      return params.id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchAdminProductRequests = createAsyncThunk(
  "admin/fetchProductRequests",
  async (params: { page: number; status: AdminStatus; limit?: number }, thunkAPI) => {
    try {
      const res = await getAdminProductRequests({
        page: params.page,
        limit: params.limit ?? 10,
        status: params.status === "all" ? "all" : params.status,
      });
      return unwrapData<PagedResponse<AdminProductRequest>>(res);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const approveProductRequestById = createAsyncThunk(
  "admin/approveProductRequest",
  async (id: number, thunkAPI) => {
    try {
      await approveAdminProductRequest(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const rejectProductRequestById = createAsyncThunk(
  "admin/rejectProductRequest",
  async (params: { id: number; note?: string }, thunkAPI) => {
    try {
      await rejectAdminProductRequest(params.id, params.note);
      return params.id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchAdminUserStats = createAsyncThunk(
  "admin/fetchUserStats",
  async (_, thunkAPI) => {
    try {
      const res = await getAdminUserStats();
      return unwrapData(res);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchAdminCatalogSpecRequests = createAsyncThunk(
  "admin/fetchCatalogSpecRequests",
  async (params: { page: number; status: AdminStatus; limit?: number }, thunkAPI) => {
    try {
      const res = await getAdminCatalogSpecRequests({
        page: params.page,
        limit: params.limit ?? 10,
        status: params.status === "all" ? "all" : params.status,
      });
      return unwrapData<PagedResponse<AdminCatalogSpecRequest>>(res);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const approveCatalogSpecRequestById = createAsyncThunk(
  "admin/approveCatalogSpecRequest",
  async (id: number, thunkAPI) => {
    try {
      await approveAdminCatalogSpecRequest(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const rejectCatalogSpecRequestById = createAsyncThunk(
  "admin/rejectCatalogSpecRequest",
  async (params: { id: number; note?: string }, thunkAPI) => {
    try {
      await rejectAdminCatalogSpecRequest(params.id, params.note);
      return params.id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const getErrorMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object" && "message" in payload) {
    return String((payload as { message?: string }).message ?? fallback);
  }
  return fallback;
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdminProductsStatus: (state, action: PayloadAction<AdminStatus>) => {
      state.products.status = action.payload;
      state.products.page = 1;
    },
    setAdminStoreRequestsStatus: (state, action: PayloadAction<AdminStatus>) => {
      state.storeRequests.status = action.payload;
      state.storeRequests.page = 1;
    },
    setAdminBrandRequestsStatus: (state, action: PayloadAction<AdminStatus>) => {
      state.brandRequests.status = action.payload;
      state.brandRequests.page = 1;
    },
    setAdminProductRequestsStatus: (state, action: PayloadAction<AdminStatus>) => {
      state.productRequests.status = action.payload;
      state.productRequests.page = 1;
    },
    setAdminCatalogSpecRequestsStatus: (state, action: PayloadAction<AdminStatus>) => {
      state.catalogSpecRequests.status = action.payload;
      state.catalogSpecRequests.page = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminProducts.pending, (state) => {
        state.products.loading = true;
        state.products.error = null;
      })
      .addCase(fetchAdminProducts.fulfilled, (state, action) => {
        state.products.loading = false;
        const data = action.payload;
        state.products.items = data?.catalogs ?? data?.products ?? [];
        state.products.total = data?.total ?? 0;
        state.products.page = data?.page ?? 1;
        state.products.totalPages = data?.totalPages ?? 1;
      })
      .addCase(fetchAdminProducts.rejected, (state, action) => {
        state.products.loading = false;
        state.products.error = getErrorMessage(action.payload, "Không thể tải sản phẩm");
      })
      .addCase(fetchAdminProductCounts.fulfilled, (state, action) => {
        state.products.counts = action.payload;
      })
      .addCase(fetchAdminStoreRequests.pending, (state) => {
        state.storeRequests.loading = true;
        state.storeRequests.error = null;
      })
      .addCase(fetchAdminStoreRequests.fulfilled, (state, action) => {
        state.storeRequests.loading = false;
        const data = action.payload;
        state.storeRequests.items = data?.requests ?? [];
        state.storeRequests.total = data?.total ?? 0;
        state.storeRequests.page = data?.page ?? 1;
        state.storeRequests.totalPages = data?.totalPages ?? 1;
      })
      .addCase(fetchAdminStoreRequests.rejected, (state, action) => {
        state.storeRequests.loading = false;
        state.storeRequests.error = getErrorMessage(action.payload, "Không thể tải yêu cầu cửa hàng");
      })
      .addCase(fetchAdminBrandRequests.pending, (state) => {
        state.brandRequests.loading = true;
        state.brandRequests.error = null;
      })
      .addCase(fetchAdminBrandRequests.fulfilled, (state, action) => {
        state.brandRequests.loading = false;
        const data = action.payload;
        state.brandRequests.items = data?.requests ?? [];
        state.brandRequests.total = data?.total ?? 0;
        state.brandRequests.page = data?.page ?? 1;
        state.brandRequests.totalPages = data?.totalPages ?? 1;
      })
      .addCase(fetchAdminBrandRequests.rejected, (state, action) => {
        state.brandRequests.loading = false;
        state.brandRequests.error = getErrorMessage(action.payload, "Không thể tải yêu cầu thương hiệu");
      })
      .addCase(fetchAdminProductRequests.pending, (state) => {
        state.productRequests.loading = true;
        state.productRequests.error = null;
      })
      .addCase(fetchAdminProductRequests.fulfilled, (state, action) => {
        state.productRequests.loading = false;
        const data = action.payload;
        state.productRequests.items = data?.requests ?? [];
        state.productRequests.total = data?.total ?? 0;
        state.productRequests.page = data?.page ?? 1;
        state.productRequests.totalPages = data?.totalPages ?? 1;
      })
      .addCase(fetchAdminProductRequests.rejected, (state, action) => {
        state.productRequests.loading = false;
        state.productRequests.error = getErrorMessage(action.payload, "Không thể tải yêu cầu sản phẩm");
      })
      .addCase(fetchAdminCatalogSpecRequests.pending, (state) => {
        state.catalogSpecRequests.loading = true;
        state.catalogSpecRequests.error = null;
      })
      .addCase(fetchAdminCatalogSpecRequests.fulfilled, (state, action) => {
        state.catalogSpecRequests.loading = false;
        const data = action.payload;
        state.catalogSpecRequests.items = data?.requests ?? [];
        state.catalogSpecRequests.total = data?.total ?? 0;
        state.catalogSpecRequests.page = data?.page ?? 1;
        state.catalogSpecRequests.totalPages = data?.totalPages ?? 1;
      })
      .addCase(fetchAdminCatalogSpecRequests.rejected, (state, action) => {
        state.catalogSpecRequests.loading = false;
        state.catalogSpecRequests.error = getErrorMessage(
          action.payload,
          "Không thể tải yêu cầu thông số"
        );
      })
      .addCase(fetchAdminUserStats.pending, (state) => {
        state.userStats.loading = true;
        state.userStats.error = null;
      })
      .addCase(fetchAdminUserStats.fulfilled, (state, action) => {
        state.userStats.loading = false;
        state.userStats.data = action.payload ?? null;
      })
      .addCase(fetchAdminUserStats.rejected, (state, action) => {
        state.userStats.loading = false;
        state.userStats.error = getErrorMessage(action.payload, "Không thể tải thống kê người dùng");
      });
  },
});

export const {
  setAdminProductsStatus,
  setAdminStoreRequestsStatus,
  setAdminBrandRequestsStatus,
  setAdminProductRequestsStatus,
  setAdminCatalogSpecRequestsStatus,
} = adminSlice.actions;

export default adminSlice.reducer;
