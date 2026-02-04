import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/authSlice";
import userReducer from "@/features/user/store/userSlice";
import storeRequestReducer from "@/features/storeRequest/store/storeRequestSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  storeRequest: storeRequestReducer,
});

export default rootReducer;
