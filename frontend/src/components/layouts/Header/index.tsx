"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

export default function Header() {
  const { themed } = useAppTheme();
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const categories = [
    "Tất cả danh mục",
    "Điện thoại",
    "Laptop",
    "Tablet",
    "Phụ kiện",
    "Âm thanh",
  ];

  const brands = [
    { name: "🍎", label: "Apple" },
    { name: "Nikon", label: "Nikon" },
    { name: "hp", label: "HP" },
    { name: "realme", label: "Realme" },
    { name: "LG", label: "LG" },
    { name: "SAMSUNG", label: "Samsung" },
    { name: "OPPO", label: "Oppo" },
    { name: "DJI", label: "DJI" },
  ];

  return (
    <header style={themed(styles.header)}>
      <div style={themed(styles.topBar)}>
        <Link href="/" style={themed(styles.logo)}>
          <span style={themed(styles.logoText)}>Tech</span>
          <span style={themed(styles.logoAccent)}>Xchange</span>
        </Link>

        {/* Search Bar */}
        <div style={themed(styles.searchContainer)}>
          <select style={themed(styles.categorySelect)}>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            style={themed(styles.searchInput)}
          />
          <button
            type="button"
            style={
              hoveredElement === "search"
                ? themed(styles.searchButtonHover)
                : themed(styles.searchButton)
            }
            onMouseEnter={() => setHoveredElement("search")}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        <div style={themed(styles.actions)}>
          {/* Cart */}
          <button
            style={{ ...themed(styles.cartButton), ...(hoveredElement === "cart" ? themed(styles.cartButtonHover) : {}) }}
            onMouseEnter={() => setHoveredElement("cart")}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
            </svg>
            <span style={themed(styles.cartBadge)}>3</span>
          </button>

          {/* User */}
          <Link
            href="/profile"
            style={
              hoveredElement === "user"
                ? themed(styles.userInfoHover)
                : themed(styles.userInfo)
            }
            onMouseEnter={() => setHoveredElement("user")}
            onMouseLeave={() => setHoveredElement(null)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {windowWidth > 700 && <span>22028285 Nguyễn Đức Kiên</span>}
          </Link>
        </div>
      </div>

      {/* Navigation */}
      <nav style={themed(styles.nav)}>
        <Link
          href="/"
          style={themed(styles.navLinkActive)}
        >
          Trang chủ
        </Link>
        <Link
          href="/products"
          style={
            hoveredElement === "products"
              ? themed(styles.navLinkHover)
              : themed(styles.navLink)
          }
          onMouseEnter={() => setHoveredElement("products")}
          onMouseLeave={() => setHoveredElement(null)}
        >
          Sản phẩm
        </Link>
        <div
          style={
            hoveredElement === "categories"
              ? themed(styles.navLinkHover)
              : themed(styles.navLink)
          }
          onMouseEnter={() => setHoveredElement("categories")}
          onMouseLeave={() => setHoveredElement(null)}
        >
          Danh mục
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
        <Link
          href="/promotions"
          style={
            hoveredElement === "promotions"
              ? themed(styles.navLinkHover)
              : themed(styles.navLink)
          }
          onMouseEnter={() => setHoveredElement("promotions")}
          onMouseLeave={() => setHoveredElement(null)}
        >
          Khuyến mãi
        </Link>
      </nav>

      {/* Brands Bar */}
      <div style={themed(styles.brandsBar)}>
        {brands.map((brand) => (
          <Link
            key={brand.label}
            href={`/brand/${brand.label.toLowerCase()}`}
            style={
              hoveredElement === `brand-${brand.label}`
                ? themed(styles.brandLogoHover)
                : themed(styles.brandLogo)
            }
            onMouseEnter={() => setHoveredElement(`brand-${brand.label}`)}
            onMouseLeave={() => setHoveredElement(null)}
          >
            {brand.name}
          </Link>
        ))}
      </div>
    </header>
  );
}
