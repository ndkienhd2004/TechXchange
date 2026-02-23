import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/authSlice";
import userReducer from "@/features/user/store/userSlice";
import storeRequestReducer from "@/features/storeRequest/store/storeRequestSlice";
import shopReducer from "@/features/shop/store";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  storeRequest: storeRequestReducer,
  shop: shopReducer,
});

export default rootReducer;
