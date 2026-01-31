import type { RootState } from "@/store";

export const selectUser = (state: RootState) => state.user.currentUser;
export const selectUserProfile = (state: RootState) => state.user.profile;
export const selectUserState = (state: RootState) => state.user;
