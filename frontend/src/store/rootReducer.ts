import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/store/authSlice";
import userReducer from "@/features/user/store/userSlice";
import storeRequestReducer from "@/features/storeRequest/store/storeRequestSlice";
import shopReducer from "@/features/shop/store";
import productReducer from "@/features/products/store/productSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,
  storeRequest: storeRequestReducer,
  shop: shopReducer,
  products: productReducer,
});

export default rootReducer;
