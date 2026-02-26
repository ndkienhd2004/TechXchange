import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { ProductState, ProductListResponse, Product } from "../types";
import { 
  getProducts as getProductsApi, 
  getProductById as getProductByIdApi,
  GetProductsParams 
} from "../services/productApi";

type ApiResponse<T> = {
  code?: string;
  success?: boolean;
  message?: string;
  data?: T;
};

const initialState: ProductState = {
  items: [],
  selectedProduct: null,
  total: 0,
  page: 1,
  totalPages: 1,
  loading: false,
  detailLoading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (params: GetProductsParams | undefined, thunkAPI) => {
    try {
      const res = (await getProductsApi(params)) as ApiResponse<ProductListResponse>;
      return res?.data ?? res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string | number, thunkAPI) => {
    try {
      const res = (await getProductByIdApi(id)) as ApiResponse<Product>;
      return res?.data ?? res;
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductError: (state) => {
      state.error = null;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message?: string } | null)?.message ?? "Không thể tải danh sách sản phẩm.";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as ProductListResponse | undefined;
        if (!payload || !payload.products) return;
        state.items = payload.products ?? [];
        state.total = payload.total ?? 0;
        state.page = payload.page ?? 1;
        state.totalPages = payload.totalPages ?? 1;
      })
      .addCase(fetchProductById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = (action.payload as { message?: string } | null)?.message ?? "Không thể tải chi tiết sản phẩm.";
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedProduct = action.payload as Product;
      });
  },
});

export const { clearProductError, clearSelectedProduct } = productSlice.actions;
export default productSlice.reducer;
