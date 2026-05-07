"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import type { CSSProperties, RefObject } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppTheme } from "@/theme/ThemeProvider";
import type { Theme } from "@/theme";
import { getAxiosInstance } from "@/services/axiosConfig";
import {
  selectIsAuthenticated,
  selectUser,
  User,
  logout,
} from "@/features/auth";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import * as styles from "./styles";
import menuCss from "./header.module.css";
import { selectCatalogCategoriesTree } from "@/features/catalog/store/catalogSelectors";
import type { CatalogCategory } from "@/features/catalog/store/catalogSlice";
import { selectCartTotalItems } from "@/features/cart/store/cartSelectors";
import {
  buildAuthRedirectHref,
  buildCurrentPath,
} from "@/features/auth/utils/redirect";

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
  initialCategory,
  initialQuery,
  onSubmit,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  items: { name: string; value: string }[];
  initialCategory: string;
  initialQuery: string;
  onSubmit: (payload: { category: string; query: string }) => void;
}) => (
  <form
    style={themed(styles.searchContainer)}
    onSubmit={(e) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      onSubmit({
        category: String(formData.get("category_id") ?? "all"),
        query: String(formData.get("q") ?? ""),
      });
    }}
  >
    <select
      style={themed(styles.categorySelect)}
      name="category_id"
      defaultValue={initialCategory}
    >
      {items.map((category) => (
        <option key={category.value} value={category.value}>
          {category.name}
        </option>
      ))}
    </select>
    <input
      type="text"
      placeholder="Tìm kiếm sản phẩm..."
      style={themed(styles.searchInput)}
      name="q"
      defaultValue={initialQuery}
    />
    <button
      type="submit"
      style={
        hoveredElement === "search"
          ? {
              ...themed(styles.searchButton),
              ...themed(styles.searchButtonHover),
            }
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
  </form>
);

const Actions = ({
  themed,
  hoveredElement,
  setHoveredElement,
  windowWidth,
  isAuthenticated,
  user,
  userMenuOpen,
  setUserMenuOpen,
  userMenuRef,
  onLogout,
  cartTotalItems,
  loginHref,
  registerHref,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  windowWidth: number;
  isAuthenticated: boolean;
  user: User | null;
  userMenuOpen: boolean;
  setUserMenuOpen: (v: boolean) => void;
  userMenuRef: RefObject<HTMLDivElement | null>;
  onLogout: () => void;
  cartTotalItems: number;
  loginHref: string;
  registerHref: string;
}) => (
  <div style={themed(styles.actions)}>
    <Link
      href="/cart"
      style={{
        ...themed(styles.cartButton),
        ...(hoveredElement === "cart" ? themed(styles.cartButtonHover) : {}),
      }}
      onMouseEnter={() => setHoveredElement("cart")}
      onMouseLeave={() => setHoveredElement(null)}
      aria-label="Giỏ hàng"
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
      <span style={themed(styles.cartBadge)}>{cartTotalItems}</span>
    </Link>
    {isAuthenticated && user ? (
      <div ref={userMenuRef} style={themed(styles.userMenuWrap)}>
        <button
          type="button"
          style={{
            ...themed(styles.userMenuButton),
            ...(hoveredElement === "user"
              ? themed(styles.userMenuButtonHover)
              : {}),
          }}
          onMouseEnter={() => setHoveredElement("user")}
          onMouseLeave={() => setHoveredElement(null)}
          onClick={() => setUserMenuOpen(!userMenuOpen)}
          aria-haspopup="menu"
          aria-expanded={userMenuOpen}
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
        </button>
        {userMenuOpen && (
          <div style={themed(styles.userMenu)} role="menu">
            <Link
              href="/orders"
              style={themed(styles.userMenuItem)}
              onClick={() => setUserMenuOpen(false)}
            >
              Đơn hàng của tôi
            </Link>
            <Link
              href="/profile"
              style={themed(styles.userMenuItem)}
              onClick={() => setUserMenuOpen(false)}
            >
              Tài khoản
            </Link>
            {user.role === "admin" && (
              <Link
                href="/admin"
                style={themed(styles.userMenuItem)}
                onClick={() => setUserMenuOpen(false)}
              >
                Admin
              </Link>
            )}
            {user.role === "shop" && (
              <Link
                href="/shop"
                style={themed(styles.userMenuItem)}
                onClick={() => setUserMenuOpen(false)}
              >
                Cửa hàng của tôi
              </Link>
            )}
            <button
              type="button"
              style={themed(styles.userMenuItemDanger)}
              onClick={onLogout}
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    ) : (
      <>
        <Link
          href={loginHref}
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
          href={registerHref}
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

const getCategoryColumns = (
  roots: CatalogCategory[],
  path: number[]
): CatalogCategory[][] => {
  const columns: CatalogCategory[][] = [roots];
  let currentNodes = roots;

  for (const id of path) {
    const selected = currentNodes.find((item) => Number(item.id) === Number(id));
    if (!selected || !Array.isArray(selected.children) || selected.children.length === 0) {
      break;
    }
    columns.push(selected.children);
    currentNodes = selected.children;
  }

  return columns;
};

const Nav = ({
  themed,
  hoveredElement,
  setHoveredElement,
  categoriesTree,
  brands,
  categoriesOpen,
  setCategoriesOpen,
  categoriesRef,
  brandsOpen,
  setBrandsOpen,
  brandsRef,
  activeBrandId,
}: {
  themed: Themed;
  hoveredElement: string | null;
  setHoveredElement: (v: string | null) => void;
  categoriesTree: CatalogCategory[];
  brands: { id: number; name: string }[];
  categoriesOpen: boolean;
  setCategoriesOpen: (v: boolean) => void;
  categoriesRef: RefObject<HTMLDivElement | null>;
  brandsOpen: boolean;
  setBrandsOpen: (v: boolean) => void;
  brandsRef: RefObject<HTMLDivElement | null>;
  activeBrandId: number | null;
}) => {
  const firstColumnNodes = useMemo(() => {
    if (
      categoriesTree.length === 1 &&
      Array.isArray(categoriesTree[0]?.children) &&
      categoriesTree[0].children.length > 0
    ) {
      return categoriesTree[0].children;
    }
    return categoriesTree;
  }, [categoriesTree]);

  const [categoryPath, setCategoryPath] = useState<number[]>([]);

  const categoryColumns = useMemo(
    () => getCategoryColumns(firstColumnNodes, categoryPath),
    [firstColumnNodes, categoryPath]
  );

  const onCategoryItemHover = (
    item: CatalogCategory,
    columnIndex: number,
    hasChildren: boolean
  ) => {
    setCategoryPath((prev) => {
      const nextBase = prev.slice(0, columnIndex);
      if (!hasChildren) return nextBase;
      return [...nextBase, Number(item.id)];
    });
  };

  return (
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
          onClick={() => {
            if (categoriesOpen) {
              setCategoriesOpen(false);
              setCategoryPath([]);
              return;
            }
            setCategoryPath([]);
            setCategoriesOpen(true);
          }}
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
          <div style={themed(styles.navCategoryMegaMenu)}>
            {categoryColumns.map((column, columnIndex) => (
              <div
                key={`column-${columnIndex}`}
                style={{
                  ...themed(styles.navCategoryColumn),
                  borderRight:
                    columnIndex === categoryColumns.length - 1
                      ? "none"
                      : themed(styles.navCategoryColumn).borderRight,
                }}
                className={menuCss.hideScrollbar}
              >
                {columnIndex === 0 && (
                  <Link
                    href="/products"
                    style={themed(styles.navDropdownItem)}
                    onClick={() => {
                      setCategoriesOpen(false);
                      setCategoryPath([]);
                    }}
                  >
                    Tất cả danh mục
                  </Link>
                )}

                {column.map((category) => {
                  const hasChildren =
                    Array.isArray(category.children) && category.children.length > 0;
                  const isActive =
                    hasChildren && categoryPath[columnIndex] === Number(category.id);

                  return (
                    <Link
                      key={category.id}
                      href={`/products?category_id=${category.id}`}
                      style={
                        isActive
                          ? {
                              ...themed(styles.navDropdownItem),
                              ...themed(styles.navDropdownItemActive),
                            }
                          : themed(styles.navDropdownItem)
                      }
                      onMouseEnter={() =>
                        onCategoryItemHover(category, columnIndex, hasChildren)
                      }
                      onClick={() => {
                        setCategoriesOpen(false);
                        setCategoryPath([]);
                      }}
                    >
                      <span>{category.name}</span>
                      {hasChildren && (
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={themed(styles.navCategoryArrow)}
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>
      <div ref={brandsRef} style={themed(styles.navDropdownWrap)}>
        <button
          type="button"
          style={
            hoveredElement === "brands" || brandsOpen
              ? {
                  ...themed(styles.navLinkButton),
                  ...themed(styles.navLinkHover),
                }
              : themed(styles.navLinkButton)
          }
          onMouseEnter={() => setHoveredElement("brands")}
          onMouseLeave={() => setHoveredElement(null)}
          onClick={() => setBrandsOpen(!brandsOpen)}
        >
          Hãng
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
              transform: brandsOpen ? "rotate(180deg)" : "none",
              transition: "transform 0.2s ease",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
        {brandsOpen && (
          <div style={themed(styles.navDropdownMenu)} className={menuCss.hideScrollbar}>
            <Link
              href="/products?page=1"
              style={themed(styles.navDropdownItem)}
              onClick={() => setBrandsOpen(false)}
            >
              Tất cả hãng
            </Link>
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/products?brand_id=${brand.id}&page=1`}
                style={
                  activeBrandId === brand.id
                    ? {
                        ...themed(styles.navDropdownItem),
                        ...themed(styles.navDropdownItemActive),
                      }
                    : themed(styles.navDropdownItem)
                }
                onClick={() => setBrandsOpen(false)}
              >
                {brand.name}
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
};

export default function Header() {
  const { themed } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const categoriesRef = useRef<HTMLDivElement | null>(null);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const brandsRef = useRef<HTMLDivElement | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const categoryTree = useAppSelector(selectCatalogCategoriesTree);
  const cartTotalItems = useAppSelector(selectCartTotalItems);
  const currentPath = buildCurrentPath(pathname, searchParams);
  const loginHref = buildAuthRedirectHref("/login", currentPath);
  const registerHref = buildAuthRedirectHref("/register", currentPath);
  const activeBrandId = (() => {
    const value = searchParams.get("brand_id");
    const parsed = value ? Number(value) : NaN;
    return Number.isFinite(parsed) ? parsed : null;
  })();

  const flattenWithDepth = (
    nodes: CatalogCategory[],
    depth = 0
  ): Array<{ id: number; name: string; depth: number }> =>
    nodes.flatMap((node) => [
      { id: node.id, name: node.name, depth },
      ...(Array.isArray(node.children)
        ? flattenWithDepth(node.children, depth + 1)
        : []),
    ]);

  const categories = [
    { name: "Tất cả danh mục", value: "all" },
    ...flattenWithDepth(categoryTree).map((item) => ({
      name: item.name,
      value: String(item.id),
    })),
  ];

  useEffect(() => {
    let active = true;
    const loadBrands = async () => {
      try {
        const api = getAxiosInstance();
        const response = await api.get("/brands");
        const payload = response?.data as
          | Array<{ id: number | string; name: string }>
          | { data?: Array<{ id: number | string; name: string }> };
        const rows = Array.isArray(payload)
          ? payload
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        if (!active) return;
        setBrands(
          rows
            .map((item) => ({
              id: Number(item.id),
              name: String(item.name || "").trim(),
            }))
            .filter((item) => item.id && item.name),
        );
      } catch {
        if (active) setBrands([]);
      }
    };
    void loadBrands();
    return () => {
      active = false;
    };
  }, []);

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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        brandsRef.current &&
        !brandsRef.current.contains(e.target as Node)
      ) {
        setBrandsOpen(false);
      }
    };
    if (brandsOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [brandsOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [userMenuOpen]);

  const handleLogout = () => {
    dispatch(logout());
    setUserMenuOpen(false);
    router.replace("/");
  };

  const handleSearchSubmit = ({
    category,
    query,
  }: {
    category: string;
    query: string;
  }) => {
    const params = new URLSearchParams();
    const q = query.trim();
    if (q) params.set("q", q);
    if (category && category !== "all") {
      params.set("category_id", category);
    }
    const currentBrandId = searchParams.get("brand_id");
    if (currentBrandId) params.set("brand_id", currentBrandId);
    params.set("page", "1");
    router.push(`/products${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <header style={themed(styles.header)}>
      <div style={themed(styles.topBar)}>
        <Logo themed={themed} />
        <SearchBar
          key={`${pathname}?${searchParams.toString()}`}
          themed={themed}
          hoveredElement={hoveredElement}
          setHoveredElement={setHoveredElement}
          items={categories}
          initialCategory={searchParams.get("category_id") ?? "all"}
          initialQuery={searchParams.get("q") ?? ""}
          onSubmit={handleSearchSubmit}
        />
        <Actions
          themed={themed}
          hoveredElement={hoveredElement}
          setHoveredElement={setHoveredElement}
          windowWidth={windowWidth}
          isAuthenticated={isAuthenticated}
          user={user}
          userMenuOpen={userMenuOpen}
          setUserMenuOpen={setUserMenuOpen}
          userMenuRef={userMenuRef}
          onLogout={handleLogout}
          cartTotalItems={cartTotalItems}
          loginHref={loginHref}
          registerHref={registerHref}
        />
      </div>
      <Nav
        themed={themed}
        hoveredElement={hoveredElement}
        setHoveredElement={setHoveredElement}
        categoriesTree={categoryTree}
        brands={brands}
        categoriesOpen={categoriesOpen}
        setCategoriesOpen={setCategoriesOpen}
        categoriesRef={categoriesRef}
        brandsOpen={brandsOpen}
        setBrandsOpen={setBrandsOpen}
        brandsRef={brandsRef}
        activeBrandId={activeBrandId}
      />
    </header>
  );
}
