"use client";

import { Suspense, useMemo, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ItemCard from "@/components/commons/ItemCard";
import Pagination from "@/components/commons/Pagination";
import ProductSideHeader, {
  ProductSideHeaderFilters,
} from "@/components/commons/ProductSideHeader";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/features/products/store/productSlice";
import {
  selectProducts,
  selectProductLoading,
  selectProductTotalPages,
} from "@/features/products/store/productSelectors";
import * as styles from "./styles";

const ITEMS_PER_PAGE = 8;

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { themed } = useAppTheme();

  const products = useAppSelector(selectProducts);
  const loading = useAppSelector(selectProductLoading);
  const totalPages = useAppSelector(selectProductTotalPages);

  const currentPage = useMemo(() => {
    const p = searchParams.get("page");
    const n = p ? parseInt(p, 10) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const categoryId = useMemo(() => {
    const value = searchParams.get("category_id");
    const parsed = value ? Number(value) : undefined;
    return parsed && Number.isFinite(parsed) ? parsed : undefined;
  }, [searchParams]);

  const searchQuery = useMemo(() => {
    const value = searchParams.get("q");
    return value?.trim() || undefined;
  }, [searchParams]);

  const filters = useMemo<ProductSideHeaderFilters>(
    () => ({
      newArrivalsOnly: false,
      onSale: false,
      categoryId: categoryId ?? null,
    }),
    [categoryId]
  );

  const onFiltersChange = useCallback(
    (nextFilters: ProductSideHeaderFilters) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", "1");
      if (nextFilters.categoryId) {
        params.set("category_id", String(nextFilters.categoryId));
      } else {
        params.delete("category_id");
      }
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        category_id: categoryId,
        q: searchQuery,
      })
    );
  }, [dispatch, currentPage, categoryId, searchQuery]);

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.contentRow)}>
          <ProductSideHeader filters={filters} onFiltersChange={onFiltersChange} />
          <div style={themed(styles.mainContent)}>
            <main style={themed(styles.shell)}>
              <h1 style={themed(styles.title)}>Sản phẩm</h1>
              
              {loading ? (
                <div style={themed(styles.fallback)}>Đang tải sản phẩm...</div>
              ) : (
                <>
                  <div style={themed(styles.grid)}>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          style={{ textDecoration: "none" }}
                        >
                          <ItemCard
                            productId={Number(product.id)}
                            title={product.name}
                            price={`${Number(product.price || 0).toLocaleString("vi-VN")} đ`}
                            compareAtPrice={
                              product.compareAtPrice
                                ? `${Number(product.compareAtPrice || 0).toLocaleString("vi-VN")} đ`
                                : undefined
                            }
                            rating={product.rating}
                            reviewCount={product.reviewCount || 0}
                            badgeText={product.badgeText}
                            imageSrc={product.default_image}
                          />
                        </Link>
                      ))
                    ) : (
                      <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "40px" }}>
                        Không tìm thấy sản phẩm nào.
                      </div>
                    )}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      basePath="/products"
                      searchParam="page"
                      queryParams={{
                        q: searchQuery,
                        category_id: categoryId,
                      }}
                    />
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { themed } = useAppTheme();

  return (
    <Suspense fallback={<div style={themed(styles.fallback)}>Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
