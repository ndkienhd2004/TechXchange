"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Header from "@/components/layouts/Header";
import Footer from "@/components/layouts/Footer";
import GlobalChatWidget from "@/components/layouts/GlobalChatWidget";
import { useAppSelector } from "@/store/hooks";
import {
  selectIsAuthenticated,
  selectUser,
} from "@/features/auth/store/authSelectors";
import {
  buildAuthRedirectHref,
  buildCurrentPath,
} from "@/features/auth/utils/redirect";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const isShopRoute = pathname.startsWith("/shop");
  const isAdminRoute = pathname.startsWith("/admin");
  const hideChrome = isShopRoute || isAdminRoute;
  const loginHref = buildAuthRedirectHref(
    "/login",
    buildCurrentPath(pathname, searchParams),
  );

  useEffect(() => {
    if (isAdminRoute) {
      if (!isAuthenticated) {
        router.replace(loginHref);
        return;
      }

      const userRole =
        user?.role != null ? String(user.role).toLowerCase() : "";
      if (user && userRole !== "admin") {
        router.replace("/");
      }
      return;
    }

    const userRole = user?.role != null ? String(user.role).toLowerCase() : "";
    if (isAuthenticated && userRole === "admin") {
      router.replace("/admin");
    }
  }, [isAdminRoute, isAuthenticated, loginHref, router, user]);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {!hideChrome && <Header />}
      <main style={{ flex: 1 }}>{children}</main>
      {!hideChrome && <Footer />}
      <GlobalChatWidget />
    </div>
  );
}
