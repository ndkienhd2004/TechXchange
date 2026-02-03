"use client";

import { useState, useEffect, useRef } from "react";
import type { CSSProperties, RefObject } from "react";
import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme";
import { selectIsAuthenticated, selectUser, User } from "@/features/auth";
import { useAppSelector } from "@/store/hooks";
import * as styles from "./styles";

type Themed = (fn: (theme: Theme) => CSSProperties) => CSSProperties;

const Logo = ({ themed }: { themed: Themed }) => (
  <Link href="/" style={themed(styles.logo)}>
    <span style={themed(styles.logoText)}>Tech</span>
    <span style={themed(styles.logoAccent)}>Xchange</span>
  </Link>
);

const SearchBar = ({
  themed,
  hoveredElement,
  setHoveredElement,
  items,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  items: { name: string; label: string }[];
}) => (
  <div style={themed(styles.searchContainer)}>
    <select style={themed(styles.categorySelect)}>
      {items.map((category) => (
        <option key={category.label} value={category.label}>
          {category.name}
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
);

const Actions = ({
  themed,
  hoveredElement,
  setHoveredElement,
  windowWidth,
  isAuthenticated,
  user,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  windowWidth: number;
  isAuthenticated: boolean;
  user: User | null;
}) => (
  <div style={themed(styles.actions)}>
    <button
      style={{
        ...themed(styles.cartButton),
        ...(hoveredElement === "cart" ? themed(styles.cartButtonHover) : {}),
      }}
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
    {isAuthenticated && user ? (
      <>
        <Link
          href="/profile"
          style={{
            ...themed(styles.userInfo),
            ...(hoveredElement === "user" ? themed(styles.userInfoHover) : {}),
          }}
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
          {windowWidth > 700 && <span>{user.username}</span>}
        </Link>
      </>
    ) : (
      <>
        <Link
          href="/login"
          style={{
            ...themed(styles.userInfo),
            ...(hoveredElement === "login" ? themed(styles.userInfoHover) : {}),
          }}
          onMouseEnter={() => setHoveredElement("login")}
          onMouseLeave={() => setHoveredElement(null)}
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          style={{
            ...themed(styles.userInfo),
            ...(hoveredElement === "register"
              ? themed(styles.userInfoHover)
              : {}),
          }}
          onMouseEnter={() => setHoveredElement("register")}
          onMouseLeave={() => setHoveredElement(null)}
        >
          Đăng ký
        </Link>
      </>
    )}
  </div>
);

const Nav = ({
  themed,
  hoveredElement,
  setHoveredElement,
  items,
  categoriesOpen,
  setCategoriesOpen,
  categoriesRef,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  items: { name: string; label: string }[];
  categoriesOpen: boolean;
  setCategoriesOpen: (v: boolean) => void;
  categoriesRef: RefObject<HTMLDivElement | null>;
}) => (
  <nav style={themed(styles.nav)}>
    <Link href="/" style={themed(styles.navLinkActive)}>
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
    <div ref={categoriesRef} style={themed(styles.navDropdownWrap)}>
      <button
        type="button"
        style={
          hoveredElement === "categories" || categoriesOpen
            ? {
                ...themed(styles.navLinkButton),
                ...themed(styles.navLinkHover),
              }
            : themed(styles.navLinkButton)
        }
        onMouseEnter={() => setHoveredElement("categories")}
        onMouseLeave={() => setHoveredElement(null)}
        onClick={() => setCategoriesOpen(!categoriesOpen)}
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
          style={{
            transform: categoriesOpen ? "rotate(180deg)" : "none",
            transition: "transform 0.2s ease",
          }}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {categoriesOpen && (
        <div style={themed(styles.navDropdownMenu)}>
          {items.map((category) => (
            <Link
              key={category.label}
              href={
                category.label === "all"
                  ? "/products"
                  : `/products?category=${category.label}`
              }
              style={themed(styles.navDropdownItem)}
              onClick={() => setCategoriesOpen(false)}
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
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
);

const BrandList = ({
  themed,
  hoveredElement,
  setHoveredElement,
  items,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  items: { name: string; label: string }[];
}) => (
  <div style={themed(styles.brandsBar)}>
    {items.map((brand) => (
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
);

export default function Header() {
  const { themed } = useAppTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  const categories = [
    { name: "Tất cả danh mục", label: "all" },
    { name: "Điện thoại", label: "phone" },
    { name: "Laptop", label: "laptop" },
    { name: "Tablet", label: "tablet" },
    { name: "Phụ kiện", label: "accessories" },
    { name: "Âm thanh", label: "audio" },
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

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(e.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    };
    if (categoriesOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [categoriesOpen]);

  return (
    <header style={themed(styles.header)}>
      <div style={themed(styles.topBar)}>
        <Logo themed={themed} />
        <SearchBar
          themed={themed}
          hoveredElement={hoveredElement}
          setHoveredElement={setHoveredElement}
          items={categories}
        />
        <Actions
          themed={themed}
          hoveredElement={hoveredElement}
          setHoveredElement={setHoveredElement}
          windowWidth={windowWidth}
          isAuthenticated={isAuthenticated}
          user={user}
        />
      </div>
      <Nav
        themed={themed}
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        items={categories}
        categoriesOpen={categoriesOpen}
        setCategoriesOpen={setCategoriesOpen}
        categoriesRef={categoriesRef}
      />
      <BrandList
        themed={themed}
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        items={brands}
      />
    </header>
  );
}
