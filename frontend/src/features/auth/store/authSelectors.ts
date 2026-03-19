import type { RootState } from "@/store";

export const selectAuth = (state: RootState) => state.auth;
export const selectToken = (state: RootState) => state.auth.token;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  Boolean(
    state.auth.isAuthenticated &&
      state.auth.token &&
      state.auth.token !== "undefined" &&
      state.auth.token !== "null"
  );
export const selectLoading = (state: RootState) => state.auth.loading;
export const selectError = (state: RootState) => state.auth.error;
