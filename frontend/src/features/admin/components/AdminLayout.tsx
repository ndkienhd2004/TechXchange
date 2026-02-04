"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themed } = useAppTheme();
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/admin" },
    { label: "Cửa hàng", href: "/admin/stores" },
    { label: "Thương hiệu", href: "/admin/brands" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: "Đánh giá", href: "/admin/reviews" },
    { label: "Danh mục", href: "/admin/categories" },
    { label: "Người dùng", href: "/admin/users" },
  ];

  return (
    <div style={themed(styles.page)}>
      <aside style={themed(styles.sidebar)}>
        <Link href="/" style={themed(styles.backLink)}>
          <span aria-hidden>←</span> Về trang chủ
        </Link>

        <div style={themed(styles.adminCard)}>
          <div style={themed(styles.adminAvatar)}>⚙️</div>
          <div>
            <div style={themed(styles.adminName)}>Admin Panel</div>
            <div style={themed(styles.adminSubtitle)}>TechXchange</div>
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
