import type { Product } from "@/types/shop";
import { Shop } from "@/types/shop";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {
  getProductCatalogsService,
  getShopBrandsService,
  getShopInfoService,
  getShopProductsService,
} from "../sevices";

const initialState: Shop = {
  info: {
    name: "",
    description: "",
    logo: "",
    banner: "",
    address: "",
    phone: "",
    email: "",
    website: "",
  },
  productsTotalPages: 0,
  products: [],
  brands: [],
  loading: false,
  error: null,
  productCatalogs: [],
  productCatalogsTotalPages: 0,
};

function normalizeProductsResponse(raw: unknown): {
  products: Product[];
  page: number;
  totalPages: number;
} {
  const d =
    raw && typeof raw === "object" && "data" in raw
      ? (raw as { data: Record<string, unknown> }).data
      : (raw as Record<string, unknown>);
  if (!d || typeof d !== "object") {
    return { products: [], page: 1, totalPages: 0 };
  }
  const items = (d.items ?? d.products ?? d.data ?? []) as Product[];
  const page = Number(d.page ?? 1);
  const totalPages = Number(d.totalPages ?? d.total_pages ?? 0);
  return {
    products: Array.isArray(items) ? items : [],
    page,
    totalPages,
  };
}

export const getShopInfo = createAsyncThunk(
  "shop/getShopInfo",
  async (_, thunkAPI) => {
    try {
      const response = await getShopInfoService();
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  },
);

export const getShopProducts = createAsyncThunk(
  "shop/getShopProducts",
  async (arg: { page: number; size: number; append?: boolean }, thunkAPI) => {
    try {
      const { page, size } = arg;
      const response = await getShopProductsService({ page, size });
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
  async (arg: { page: number; size: number; append?: boolean }, thunkAPI) => {
    try {
      const { page, size } = arg;
      const response = await getProductCatalogsService({ page, size });
      console.log(response);
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
      .addCase(getShopInfo.fulfilled, () => {})
      .addCase(getShopInfo.pending, () => {})
      .addCase(getShopInfo.rejected, () => {})
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
        state.brands = action.payload;
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
      });
  },
});

export const {} = shopSlice.actions;

export default shopSlice.reducer;
