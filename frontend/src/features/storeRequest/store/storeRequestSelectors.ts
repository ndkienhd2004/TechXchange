import type { RootState } from "@/store";

export const selectStoreRequestItems = (state: RootState) =>
  state.storeRequest.items;

export const selectStoreRequestTotal = (state: RootState) =>
  state.storeRequest.total;

export const selectStoreRequestPage = (state: RootState) =>
  state.storeRequest.page;

export const selectStoreRequestTotalPages = (state: RootState) =>
  state.storeRequest.totalPages;

export const selectStoreRequestListLoading = (state: RootState) =>
  state.storeRequest.listLoading;

export const selectStoreRequestSubmitLoading = (state: RootState) =>
  state.storeRequest.submitLoading;

export const selectStoreRequestError = (state: RootState) =>
  state.storeRequest.error;
