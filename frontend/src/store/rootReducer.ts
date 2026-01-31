import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./rtkQuery/baseApi";
import authReducer from "@/features/auth/store/authSlice";
import userReducer from "@/features/user/store/userSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  
  // RTK Query API
  [baseApi.reducerPath]: baseApi.reducer,
});

export default rootReducer;
