"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AppIcon from "@/components/commons/AppIcon";
import { showErrorToast } from "@/components/commons/Toast";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as shopStyles from "../styles";
import * as styles from "./styles";
import { getShopInventoryOverviewService } from "../../sevices";

const PAGE_SIZE = 10;

type InventoryOverviewItem = {
  product_id: number;
  product_name: string;
  sale_price: number;
  latest_import_cost: number;
  total_on_hand: number;
  total_reserved: number;
  total_available: number;
  variant_count: number;
  status: string;
};

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ShopInventoryView() {
  const { themed } = useAppTheme();
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [items, setItems] = useState<InventoryOverviewItem[]>([]);

  const loadData = async (q?: string, pageNumber = 1) => {
    try {
      setLoading(true);
      const res = await getShopInventoryOverviewService({
        q,
        page: pageNumber,
        limit: PAGE_SIZE,
      });
      const rows = Array.isArray(res?.data?.items) ? res.data.items : [];
      const totalCount = Number(res?.data?.pagination?.total ?? rows.length);
      const totalPagesCount = Number(
        res?.data?.pagination?.totalPages ??
          (totalCount > 0 ? Math.ceil(totalCount / PAGE_SIZE) : 0),
      );
      setItems(rows);
      setTotal(totalCount);
      setTotalPages(totalPagesCount);
    } catch (error) {
      setItems([]);
      setTotal(0);
      setTotalPages(0);
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData(appliedQuery, page);
  }, [appliedQuery, page]);

  const totals = useMemo(
    () => ({
      onHand: items.reduce((sum, item) => sum + Number(item.total_on_hand || 0), 0),
      available: items.reduce(
        (sum, item) => sum + Number(item.total_available || 0),
        0,
      ),
    }),
    [items],
  );

  return (
    <ShopLayout>
      <header style={themed(shopStyles.pageHeader)}>
        <h1 style={themed(shopStyles.pageTitle)}>Quản lý kho hàng</h1>
        <p style={themed(shopStyles.pageSubtitle)}>
          {loading && items.length === 0
            ? "Đang tải..."
            : `${total} sản phẩm trong kho`}
        </p>
      </header>

      <section style={{ ...themed(shopStyles.statGrid), marginBottom: 16 }}>
        <div style={themed(shopStyles.statCard)}>
          <div>
            <div style={themed(shopStyles.statLabel)}>Tổng tồn kho</div>
            <div style={themed(shopStyles.statValue)}>{totals.onHand}</div>
          </div>
          <span style={themed(shopStyles.statIcon)}>
            <AppIcon name="box" />
          </span>
        </div>
        <div style={themed(shopStyles.statCard)}>
          <div>
            <div style={themed(shopStyles.statLabel)}>Có sẵn</div>
            <div style={themed(shopStyles.statValue)}>{totals.available}</div>
          </div>
          <span style={themed(shopStyles.statIcon)}>
            <AppIcon name="cart" />
          </span>
        </div>
      </section>

      <section style={themed(styles.sectionCard)}>
        <div style={themed(styles.toolbar)}>
          <div style={themed(styles.searchWrap)}>
            <AppIcon name="search" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm sản phẩm trong kho..."
              style={themed(styles.searchInput)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  setPage(1);
                  setAppliedQuery(query.trim());
                }
              }}
            />
          </div>
          <button
            type="button"
            style={themed(styles.buttonRefresh)}
            onClick={() => {
              setPage(1);
              setAppliedQuery(query.trim());
            }}
          >
            Refresh
          </button>
        </div>

        <div style={themed(styles.tableWrap)}>
          <table style={themed(styles.table)}>
            <thead>
              <tr>
                <th style={themed(styles.th)}>Sản phẩm</th>
                <th style={themed(styles.th)}>Giá nhập/Bán</th>
                <th style={themed(styles.th)}>Tồn hệ thống</th>
                <th style={themed(styles.th)}>Tồn khả dụng</th>
                <th style={themed(styles.th)}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={5}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={5}>
                    {appliedQuery
                      ? "Không tìm thấy sản phẩm phù hợp."
                      : "Chưa có dữ liệu kho."}
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.product_id}>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.productCell)}>
                        <p style={themed(styles.productTitle)}>{item.product_name}</p>
                        <div style={themed(styles.productSub)}>
                          {item.variant_count} biến thể • trạng thái {item.status}
                        </div>
                      </div>
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.valueMuted)}>
                        G.Nhập: {formatVnd(Number(item.latest_import_cost || 0))}
                      </div>
                      <div>G.Bán: {formatVnd(Number(item.sale_price || 0))}</div>
                    </td>
                    <td style={themed(styles.td)}>{item.total_on_hand}</td>
                    <td style={themed(styles.td)}>{item.total_available}</td>
                    <td style={themed(styles.td)}>
                      <Link
                        href={`/shop/inventory/${item.product_id}`}
                        style={themed(styles.actionBtn)}
                      >
                        Chi tiết kho
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && totalPages > 0 && (
          <div style={themed(shopStyles.paginationRow)}>
            <span style={themed(shopStyles.paginationInfo)}>
              Trang {page} / {Math.max(1, totalPages)}
            </span>
            <div style={themed(shopStyles.paginationButtons)}>
              <button
                type="button"
                style={
                  page > 1
                    ? themed(shopStyles.pageButton)
                    : themed(shopStyles.pageButtonDisabled)
                }
                onClick={() => page > 1 && setPage(page - 1)}
                disabled={page <= 1}
              >
                Trước
              </button>
              {Array.from({ length: Math.min(5, Math.max(1, totalPages)) }).map(
                (_, index) => {
                  const maxPage = Math.max(1, totalPages);
                  const start = Math.max(1, Math.min(page - 2, maxPage - 4));
                  const currentPage = start + index;
                  if (currentPage > maxPage) return null;
                  return (
                    <button
                      key={currentPage}
                      type="button"
                      style={
                        currentPage === page
                          ? themed(shopStyles.pageButtonActive)
                          : themed(shopStyles.pageButton)
                      }
                      onClick={() => setPage(currentPage)}
                    >
                      {currentPage}
                    </button>
                  );
                },
              )}
              <button
                type="button"
                style={
                  page < totalPages
                    ? themed(shopStyles.pageButton)
                    : themed(shopStyles.pageButtonDisabled)
                }
                onClick={() => page < totalPages && setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>
    </ShopLayout>
  );
}
