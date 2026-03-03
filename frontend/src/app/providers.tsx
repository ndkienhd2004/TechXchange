"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";

import NProgressProvider from "@/components/commons/NProgress";
import { persistor, store } from "@/store";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCatalogCategories } from "@/features/catalog/store/catalogSlice";
import { fetchCart } from "@/features/cart/store/cartSlice";

function AppBootstrap() {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.catalog.categoriesFlat);
  const token = useAppSelector((state) => state.auth.token);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCatalogCategories());
    }
  }, [dispatch, categories]);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchCart());
    }
  }, [dispatch, isAuthenticated, token]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <AppBootstrap />
          <NProgressProvider>{children}</NProgressProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
