"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch } from "@/store/hooks";
import { logout } from "@/features/auth";
import * as styles from "./styles";
import AppIcon from "@/components/commons/AppIcon";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { themed } = useAppTheme();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const navItems = [
    { label: "Tổng quan", href: "/admin" },
    { label: "Cửa hàng", href: "/admin/stores" },
    { label: "Thương hiệu", href: "/admin/brands" },
    { label: "Sản phẩm", href: "/admin/products" },
    { label: "Yêu cầu sản phẩm", href: "/admin/reviews" },
    { label: "Danh mục", href: "/admin/categories" },
  ];

  return (
    <div style={themed(styles.page)}>
      <aside style={themed(styles.sidebar)}>
        <div style={themed(styles.adminCard)}>
          <div style={themed(styles.adminAvatar)}>
            <AppIcon name="settings" size={18} />
          </div>
          <div>
            <div style={themed(styles.adminName)}>Trang quản trị</div>
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
          <button
            type="button"
            style={themed(styles.logoutButton)}
            onClick={() => {
              dispatch(logout());
              router.replace("/");
            }}
          >
            Đăng xuất
          </button>
        </nav>
      </aside>

      <main style={themed(styles.content)}>{children}</main>
    </div>
  );
}
