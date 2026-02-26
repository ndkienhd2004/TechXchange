import { RootState } from "@/store";

export const selectProducts = (state: RootState) => state.products.items;
export const selectProductLoading = (state: RootState) => state.products.loading;
export const selectProductTotal = (state: RootState) => state.products.total;
export const selectProductPage = (state: RootState) => state.products.page;
export const selectProductTotalPages = (state: RootState) => state.products.totalPages;
export const selectProductError = (state: RootState) => state.products.error;

// Detail selectors
export const selectSelectedProduct = (state: RootState) => state.products.selectedProduct;
export const selectProductDetailLoading = (state: RootState) => state.products.detailLoading;
