import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getAxiosInstance } from "@/services/axiosConfig";
import { logout } from "@/features/auth";

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  subtotal: number;
  product?: {
    id: number;
    name: string;
    price: number | string;
    images?: { id: number; url: string; sort_order: number }[];
    store?: { id: number; name: string };
  };
}

interface CartState {
  items: CartItem[];
  subtotal: number;
  totalItems: number;
  totalLines: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  totalItems: 0,
  totalLines: 0,
  loading: false,
  error: null,
};

const mapCartResponse = (raw: unknown) => {
  const container =
    raw && typeof raw === "object" ? (raw as { data?: unknown }) : undefined;
  const data =
    container && container.data && typeof container.data === "object"
      ? (container.data as Record<string, unknown>)
      : (raw as Record<string, unknown>);
  return {
    items: Array.isArray(data?.items) ? (data.items as CartItem[]) : [],
    subtotal: Number(data?.subtotal ?? 0),
    totalItems: Number(data?.total_items ?? 0),
    totalLines: Number(data?.total_lines ?? 0),
  };
};

export const fetchCart = createAsyncThunk("cart/fetch", async (_, thunkAPI) => {
  try {
    const api = getAxiosInstance();
    const res = await api.get("/cart");
    return mapCartResponse(res.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

export const addToCart = createAsyncThunk(
  "cart/add",
  async (payload: { product_id: number; quantity?: number }, thunkAPI) => {
    try {
      const api = getAxiosInstance();
      const res = await api.post("/cart/items", payload);
      return mapCartResponse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const updateCartItemQuantity = createAsyncThunk(
  "cart/updateQty",
  async (payload: { id: number; quantity: number }, thunkAPI) => {
    try {
      const api = getAxiosInstance();
      const res = await api.put(`/cart/items/${payload.id}`, {
        quantity: payload.quantity,
      });
      return mapCartResponse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeItem",
  async (id: number, thunkAPI) => {
    try {
      const api = getAxiosInstance();
      const res = await api.delete(`/cart/items/${id}`);
      return mapCartResponse(res.data);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const clearCart = createAsyncThunk("cart/clear", async (_, thunkAPI) => {
  try {
    const api = getAxiosInstance();
    const res = await api.delete("/cart");
    return mapCartResponse(res.data);
  } catch (error) {
    return thunkAPI.rejectWithValue(error);
  }
});

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.totalItems = action.payload.totalItems;
        state.totalLines = action.payload.totalLines;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as { message?: string } | undefined)?.message ?? null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.totalItems = action.payload.totalItems;
        state.totalLines = action.payload.totalLines;
      })
      .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.totalItems = action.payload.totalItems;
        state.totalLines = action.payload.totalLines;
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.totalItems = action.payload.totalItems;
        state.totalLines = action.payload.totalLines;
      })
      .addCase(clearCart.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.subtotal = action.payload.subtotal;
        state.totalItems = action.payload.totalItems;
        state.totalLines = action.payload.totalLines;
      })
      .addCase(logout, (state) => {
        state.items = [];
        state.subtotal = 0;
        state.totalItems = 0;
        state.totalLines = 0;
        state.loading = false;
        state.error = null;
      });
  },
});

export default cartSlice.reducer;
