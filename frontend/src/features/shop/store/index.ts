import type { Product } from "@/types/shop";
import { Shop } from "@/types/shop";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getProductCatalogsService,
  getShopBrandsService,
  getShopInfoService,
  getShopProductsService,
  createShopProductService,
  getMyCatalogSpecRequestsService,
  getMyProductRequestsService,
  requestNewProductService,
  requestCatalogSpecService,
} from "../sevices";

const initialState: Shop = {
  info: null,
  productsTotal: 0,
  productsTotalPages: 0,
  products: [],
  productRequests: [],
  productRequestsTotal: 0,
  productRequestsTotalPages: 0,
  catalogSpecRequests: [],
  catalogSpecRequestsTotal: 0,
  catalogSpecRequestsTotalPages: 0,
  brands: [],
  loading: false,
  requestsLoading: false,
  error: null,
  productCatalogs: [],
  productCatalogsTotalPages: 0,
};

function normalizeProductsResponse(raw: unknown): {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
} {
  const d =
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data: Record<string, unknown> }).data
      : (raw as Record<string, unknown>);
  if (!d || typeof d !== "object") {
    return { products: [], total: 0, page: 1, totalPages: 0 };
  }
  const items = (d.items ?? d.products ?? d.data ?? []) as Product[];
  const total = Number(d.total ?? 0);
  const page = Number(d.page ?? 1);
  const totalPages = Number(d.totalPages ?? d.total_pages ?? 0);
  return {
    products: Array.isArray(items) ? items : [],
    total,
    page,
    totalPages,
  };
}

export const getShopInfo = createAsyncThunk(
  "shop/getShopInfo",
  async (_, thunkAPI) => {
    try {
      const response = await getShopInfoService();
      // Lấy phần tử đầu tiên của mảng data từ backend
      return response.data[0];
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getShopProducts = createAsyncThunk(
  "shop/getShopProducts",
  async (arg: { page: number; limit: number; append?: boolean }, thunkAPI) => {
    try {
      const { page, limit } = arg;
      const response = await getShopProductsService({ page, limit });
      return normalizeProductsResponse(response);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getShopBrands = createAsyncThunk(
  "shop/getShopBrands",
  async (_, thunkAPI) => {
    try {
      const response = await getShopBrandsService();
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getProductCatalogs = createAsyncThunk(
  "shop/getProductCatalogs",
  async (
    arg: { page: number; limit: number; q?: string; append?: boolean },
    thunkAPI,
  ) => {
    try {
      const { page, limit, q } = arg;
      const response = await getProductCatalogsService({ page, limit, q });
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const createShopProduct = createAsyncThunk(
  "shop/createProduct",
  async (
    payload: {
      catalog_id: number;
      store_id: number;
      price: number;
      quantity: number;
      variant_options?: Record<string, string>;
      description?: string;
      images?: { url: string; sort_order: number }[];
    },
    thunkAPI,
  ) => {
    try {
      const response = await createShopProductService(payload);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const requestNewProduct = createAsyncThunk(
  "shop/requestProduct",
  async (
    payload: {
      name: string;
      category_id: number;
      brand_id: number;
      brand_name?: string;
      description?: string;
      default_image?: string;
    },
    thunkAPI,
  ) => {
    try {
      const response = await requestNewProductService(payload);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const requestCatalogSpec = createAsyncThunk(
  "shop/requestCatalogSpec",
  async (
    payload: {
      catalog_id: number;
      spec_key: string;
      proposed_values: string[];
    },
    thunkAPI,
  ) => {
    try {
      const response = await requestCatalogSpecService(payload);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getMyProductRequests = createAsyncThunk(
  "shop/getMyProductRequests",
  async (arg: { page: number; limit: number; status?: string }, thunkAPI) => {
    try {
      const response = await getMyProductRequestsService(arg);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getMyCatalogSpecRequests = createAsyncThunk(
  "shop/getMyCatalogSpecRequests",
  async (arg: { page: number; limit: number; status?: string }, thunkAPI) => {
    try {
      const response = await getMyCatalogSpecRequestsService(arg);
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getShopInfo.fulfilled, (state, action) => {
        state.info = action.payload;
      })
      .addCase(getShopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const append = action.meta.arg.append === true;
        state.products = append
          ? [...state.products, ...action.payload.products]
          : action.payload.products;
        state.productsTotal = action.payload.total;
        state.productsTotalPages = action.payload.totalPages;
      })
      .addCase(getShopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload != null &&
          typeof action.payload === "object" &&
          "message" in action.payload
            ? String((action.payload as { message: string }).message)
            : "Tải sản phẩm thất bại";
      })
      .addCase(getShopBrands.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getShopBrands.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        const payload = action.payload as unknown;
        const wrapped =
          payload &&
          typeof payload === "object" &&
          "data" in (payload as Record<string, unknown>)
            ? (payload as { data?: unknown }).data
            : payload;
        state.brands = Array.isArray(wrapped) ? wrapped : [];
      })
      .addCase(getShopBrands.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload != null &&
          typeof action.payload === "object" &&
          "message" in action.payload
            ? String((action.payload as { message: string }).message)
            : "Tải thương hiệu thất bại";
      })
      .addCase(getProductCatalogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProductCatalogs.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.productCatalogs = action.payload.data.catalogs;
        state.productCatalogsTotalPages = action.payload.data.totalPages;
      })
      .addCase(getProductCatalogs.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload != null &&
          typeof action.payload === "object" &&
          "message" in action.payload
            ? String((action.payload as { message: string }).message)
            : "Tải catalog thất bại";
      })
      .addCase(createShopProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createShopProduct.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createShopProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload != null &&
          typeof action.payload === "object" &&
          "message" in action.payload
            ? String((action.payload as { message: string }).message)
            : "Tạo sản phẩm thất bại";
      })
      .addCase(requestNewProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestNewProduct.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestNewProduct.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload != null &&
          typeof action.payload === "object" &&
          "message" in action.payload
            ? String((action.payload as { message: string }).message)
            : "Gửi yêu cầu thất bại";
      })
      .addCase(requestCatalogSpec.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestCatalogSpec.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(requestCatalogSpec.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload != null &&
          typeof action.payload === "object" &&
          "message" in action.payload
            ? String((action.payload as { message: string }).message)
            : "Gửi yêu cầu thêm thông số thất bại";
      })
      .addCase(getMyProductRequests.pending, (state) => {
        state.requestsLoading = true;
      })
      .addCase(getMyProductRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.productRequests = action.payload?.data?.requests ?? [];
        state.productRequestsTotal = action.payload?.data?.total ?? 0;
        state.productRequestsTotalPages = action.payload?.data?.totalPages ?? 0;
      })
      .addCase(getMyProductRequests.rejected, (state) => {
        state.requestsLoading = false;
      })
      .addCase(getMyCatalogSpecRequests.pending, (state) => {
        state.requestsLoading = true;
      })
      .addCase(getMyCatalogSpecRequests.fulfilled, (state, action) => {
        state.requestsLoading = false;
        state.catalogSpecRequests = action.payload?.data?.requests ?? [];
        state.catalogSpecRequestsTotal = action.payload?.data?.total ?? 0;
        state.catalogSpecRequestsTotalPages =
          action.payload?.data?.totalPages ?? 0;
      })
      .addCase(getMyCatalogSpecRequests.rejected, (state) => {
        state.requestsLoading = false;
      });
  },
});

export const {} = shopSlice.actions;

export default shopSlice.reducer;
