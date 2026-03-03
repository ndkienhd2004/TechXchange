import type { RootState } from "@/store";

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartSubtotal = (state: RootState) => state.cart.subtotal;
export const selectCartTotalItems = (state: RootState) => state.cart.totalItems;
export const selectCartLoading = (state: RootState) => state.cart.loading;
