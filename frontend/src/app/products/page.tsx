"use client";

import { Suspense, useMemo, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ItemCard from "@/components/commons/ItemCard";
import Pagination from "@/components/commons/Pagination";
import ProductSideHeader from "@/components/commons/ProductSideHeader";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts } from "@/features/products/store/productSlice";
import {
  selectProducts,
  selectProductLoading,
  selectProductTotalPages,
} from "@/features/products/store/productSelectors";
import { formatPrice } from "@/utils/formatPrice";
import * as styles from "./styles";

const ITEMS_PER_PAGE = 8;

function ProductsContent() {
  const searchParams = useSearchParams();
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

  useEffect(() => {
    dispatch(fetchProducts({ page: currentPage, limit: ITEMS_PER_PAGE }));
  }, [dispatch, currentPage]);

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.contentRow)}>
          <ProductSideHeader />
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
                            title={product.name}
                            price={formatPrice(product.price)}
                            compareAtPrice={
                              product.compareAtPrice
                                ? formatPrice(product.compareAtPrice)
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
