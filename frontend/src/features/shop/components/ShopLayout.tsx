"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themed } = useAppTheme();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/shop" },
    { label: "Sản phẩm", href: "/shop/products" },
    { label: "Đơn hàng", href: "/shop/orders" },
    { label: "Thống kê", href: "/shop/analytics" },
    { label: "Thương hiệu", href: "/shop/brands/request" },
  ];

  return (
    <div style={themed(styles.page)}>
      <aside style={themed(styles.sidebar)}>
        <Link href="/" style={themed(styles.backLink)}>
          <span aria-hidden>←</span> Về trang chủ
        </Link>

        <div style={themed(styles.shopCard)}>
          <div style={themed(styles.shopAvatar)}>🏪</div>
          <div>
            <div style={themed(styles.shopName)}>UGREEN Vietnam Shop</div>
            <div style={themed(styles.shopSubtitle)}>Seller Center</div>
          </div>
        </div>

        <nav style={themed(styles.nav)}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={
                  isActive
                    ? themed(styles.navItemActive)
                    : themed(styles.navItem)
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main style={themed(styles.content)}>{children}</main>
    </div>
  );
}
