import type { RootState } from "@/store";

export const selectCatalogCategoriesTree = (state: RootState) =>
  state.catalog.categoriesTree;
export const selectCatalogCategoriesFlat = (state: RootState) =>
  state.catalog.categoriesFlat;
export const selectCatalogLoading = (state: RootState) => state.catalog.loading;
