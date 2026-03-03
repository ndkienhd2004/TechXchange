import type { RootState } from "@/store";

export const selectAdminProducts = (state: RootState) => state.admin.products;
export const selectAdminStoreRequests = (state: RootState) => state.admin.storeRequests;
export const selectAdminBrandRequests = (state: RootState) => state.admin.brandRequests;
export const selectAdminProductRequests = (state: RootState) => state.admin.productRequests;
export const selectAdminCatalogSpecRequests = (state: RootState) =>
  state.admin.catalogSpecRequests;
export const selectAdminUserStats = (state: RootState) => state.admin.userStats;
