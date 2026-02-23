import { configureStore } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootReducer from "./rootReducer";
import { createAxiosInstance } from "@/services/axiosConfig";

const noopStorage = {
  getItem: (_key: string) => Promise.resolve(null as string | null),
  setItem: (_key: string, value: unknown) => Promise.resolve(value),
  removeItem: (_key: string) => Promise.resolve(),
};

const storageSafe =
  typeof window !== "undefined" ? storage : noopStorage;

// Chỉ persist các slice cần thiết
const persistConfig = {
  key: "root",
  version: 1,
  storage: storageSafe,
  whitelist: ["auth", "cart"], // hoặc dùng blacklist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

createAxiosInstance(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
