import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "../types";

interface UserState {
  currentUser: User | null;
  profile: {
    avatar?: string;
    phone?: string;
    address?: string;
  } | null;
}

const initialState: UserState = {
  currentUser: null,
  profile: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    setProfile: (
      state,
      action: PayloadAction<UserState["profile"]>
    ) => {
      state.profile = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.profile = null;
    },
  },
});

export const { setUser, setProfile, clearUser } = userSlice.actions;
export default userSlice.reducer;
