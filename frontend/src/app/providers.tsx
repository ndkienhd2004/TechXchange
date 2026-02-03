"use client";

import { Provider } from "react-redux";

import NProgressProvider from "@/components/commons/NProgress";
import { persistor, store } from "@/store";
import { PersistGate } from "redux-persist/integration/react";
import ThemeProvider from "@/theme/ThemeProvider";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <NProgressProvider>{children}</NProgressProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}
