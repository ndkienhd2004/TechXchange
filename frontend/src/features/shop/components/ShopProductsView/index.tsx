"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useRef, useState } from "react";
import { getShopProducts } from "../../store";
import { RootState } from "@/store";
import AddProductModal from "./AddProductModal";

const PAGE_SIZE = 10;

export default function ShopProductsView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { products, productsTotalPages, loading, productsTotal } =
    useAppSelector((state: RootState) => state.shop);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const totalItems = productsTotal;

  useEffect(() => {
    dispatch(getShopProducts({ page: 1, limit: PAGE_SIZE, append: false }));
  }, [dispatch]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || productsTotalPages <= 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting || loading || page >= productsTotalPages)
          return;
        const nextPage = page + 1;
        dispatch(
          getShopProducts({
            page: nextPage,
            limit: PAGE_SIZE,
            append: true,
          }),
        );
        setPage(nextPage);
      },
      { rootMargin: "200px", threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [dispatch, loading, page, productsTotalPages]);

  const totalPages = Math.max(1, productsTotalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const pageNumbers: number[] = [];
  const showPages = 5;
  let start = Math.max(1, page - Math.floor(showPages / 2));
  const end = Math.min(totalPages, start + showPages - 1);
  if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const handlePageChange = (next: number) => {
    setPage(next);
    dispatch(getShopProducts({ page: next, limit: PAGE_SIZE, append: false }));
  };

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>
          {loading && products.length === 0
            ? "Đang tải..."
            : `${totalItems} sản phẩm`}
        </p>
      </header>

      <section style={themed(styles.tableCard)}>
        <div style={themed(styles.tableHeader)}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            style={themed(styles.search)}
          />
          <button
            type="button"
            style={themed(styles.primaryButton)}
            onClick={() => setOpenModal(true)}
          >
            + Thêm sản phẩm
          </button>
        </div>

        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Giá</th>
              <th style={themed(styles.th)}>Kho</th>
              <th style={themed(styles.th)}>Đã bán</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    ...themed(styles.td),
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  Đang tải...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    ...themed(styles.td),
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  Chưa có sản phẩm nào.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td style={themed(styles.td)}>
                    <div
                      style={{ display: "flex", gap: 12, alignItems: "center" }}
                    >
                      <div style={themed(styles.orderThumb)} />
                      <div>
                        <div style={themed(styles.orderName)}>
                          {product.name}
                        </div>
                        <div style={themed(styles.orderMeta)}>
                          {product.category?.name ?? "-"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={themed(styles.td)}>
                    <div style={themed(styles.price)}>{product.msrp}</div>
                    <div style={themed(styles.muted)}>MSRP: {product.msrp}</div>
                  </td>
                  <td style={themed(styles.td)}>{product.quantity ?? "-"}</td>
                  <td style={themed(styles.td)}>{product.buyturn ?? "-"}</td>
                  <td style={themed(styles.td)}>{product.status ?? "-"}</td>
                  <td style={themed(styles.td)}>
                    <div style={themed(styles.rowActions)}>
                      <button type="button" style={themed(styles.iconButton)}>
                        👁
                      </button>
                      <button type="button" style={themed(styles.iconButton)}>
                        ✏️
                      </button>
                      <button type="button" style={themed(styles.iconButton)}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {productsTotalPages > 1 && page < productsTotalPages && (
          <div
            ref={loadMoreRef}
            style={{
              minHeight: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 16,
            }}
          >
            {loading && products.length > 0 && (
              <span style={themed(styles.paginationInfo)}>
                Đang tải thêm...
              </span>
            )}
          </div>
        )}

        {!loading && productsTotalPages > 0 && (
          <div style={themed(styles.paginationRow)}>
            <span style={themed(styles.paginationInfo)}>
              Trang {page} / {totalPages}
            </span>
            <div style={themed(styles.paginationButtons)}>
              <button
                type="button"
                style={
                  hasPrev
                    ? themed(styles.pageButton)
                    : themed(styles.pageButtonDisabled)
                }
                onClick={() => hasPrev && handlePageChange(page - 1)}
                disabled={!hasPrev}
              >
                Trước
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  style={
                    n === page
                      ? themed(styles.pageButtonActive)
                      : themed(styles.pageButton)
                  }
                  onClick={() => handlePageChange(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                style={
                  hasNext
                    ? themed(styles.pageButton)
                    : themed(styles.pageButtonDisabled)
                }
                onClick={() => hasNext && handlePageChange(page + 1)}
                disabled={!hasNext}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>

      <AddProductModal open={openModal} onClose={() => setOpenModal(false)} />
    </ShopLayout>
  );
}
