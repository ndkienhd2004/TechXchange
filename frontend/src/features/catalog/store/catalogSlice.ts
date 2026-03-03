import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/services/axiosConfig";

export interface CatalogCategory {
  id: number;
  name: string;
  slug?: string;
  parent_id?: number | null;
  level?: number;
  children?: CatalogCategory[];
}

interface CatalogState {
  categoriesTree: CatalogCategory[];
  categoriesFlat: CatalogCategory[];
  loading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  categoriesTree: [],
  categoriesFlat: [],
  loading: false,
  error: null,
};

const flatten = (nodes: CatalogCategory[]): CatalogCategory[] =>
  nodes.flatMap((node) => [node, ...(node.children ? flatten(node.children) : [])]);

export const fetchCatalogCategories = createAsyncThunk(
  "catalog/fetchCategories",
  async (_, thunkAPI) => {
    try {
      const api = getAxiosInstance();
      const res = await api.get("/categories", {
        params: { tree: true, active: "all" },
      });
      return (res?.data?.data ?? []) as CatalogCategory[];
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCatalogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCatalogCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categoriesTree = Array.isArray(action.payload) ? action.payload : [];
        state.categoriesFlat = flatten(state.categoriesTree);
      })
      .addCase(fetchCatalogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as { message?: string } | undefined)?.message ??
          "Không tải được danh mục";
      });
  },
});

export default catalogSlice.reducer;
