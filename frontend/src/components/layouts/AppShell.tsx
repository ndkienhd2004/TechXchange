"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isShopRoute = pathname.startsWith("/shop");
  const isAdminRoute = pathname.startsWith("/admin");
  const hideChrome = isShopRoute || isAdminRoute;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!hideChrome && <Header />}
      <main style={{ flex: 1 }}>{children}</main>
      {!hideChrome && <Footer />}
    </div>
  );
}
