"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminBrandRequests,
  fetchAdminProductRequests,
  fetchAdminProducts,
  fetchAdminStoreRequests,
  fetchAdminUserStats,
} from "@/features/admin/store/adminSlice";
import {
  selectAdminBrandRequests,
  selectAdminProductRequests,
  selectAdminProducts,
  selectAdminStoreRequests,
  selectAdminUserStats,
} from "@/features/admin/store/adminSelectors";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";
import { showErrorToast } from "@/components/commons/Toast";

const formatVnd = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function AdminDashboardView() {
  const { themed, theme } = useAppTheme();
  const dispatch = useAppDispatch();

  const userStats = useAppSelector(selectAdminUserStats);
  const products = useAppSelector(selectAdminProducts);
  const stores = useAppSelector(selectAdminStoreRequests);
  const brands = useAppSelector(selectAdminBrandRequests);
  const productRequests = useAppSelector(selectAdminProductRequests);

  useEffect(() => {
    dispatch(fetchAdminUserStats());
    dispatch(fetchAdminProducts({ page: 1, status: "all", limit: 1 }));
    dispatch(fetchAdminStoreRequests({ page: 1, status: "pending", limit: 1 }));
    dispatch(fetchAdminBrandRequests({ page: 1, status: "pending", limit: 1 }));
    dispatch(
      fetchAdminProductRequests({ page: 1, status: "pending", limit: 1 }),
    );
  }, [dispatch]);

  useEffect(() => {
    if (userStats.error) showErrorToast(userStats.error);
  }, [userStats.error]);

  useEffect(() => {
    if (products.error) showErrorToast(products.error);
  }, [products.error]);

  useEffect(() => {
    if (stores.error) showErrorToast(stores.error);
  }, [stores.error]);

  useEffect(() => {
    if (brands.error) showErrorToast(brands.error);
  }, [brands.error]);

  useEffect(() => {
    if (productRequests.error) showErrorToast(productRequests.error);
  }, [productRequests.error]);

  const totalUsers = Number(
    userStats.data?.totalUsers ?? userStats.data?.total ?? 0,
  );
  const totalShops = Number(
    userStats.data?.totalShops ?? userStats.data?.totalShopAccounts ?? 0,
  );
  const totalPendingRequests =
    Number(stores.total ?? 0) +
    Number(brands.total ?? 0) +
    Number(productRequests.total ?? 0);

  const new7 = Number(userStats.data?.newCustomersLast7Days ?? 0);
  const new30 = Number(userStats.data?.newCustomersLast30Days ?? 0);
  const topShops = userStats.data?.topSellingShops ?? [];

  const stats = [
    {
      label: "Người dùng",
      value: String(totalUsers),
      tone: theme.colors.palette.semantic.info,
    },
    {
      label: "Cửa hàng",
      value: String(totalShops),
      tone: theme.colors.palette.brand.purple[500],
    },
    {
      label: "Sản phẩm",
      value: String(products.total),
      tone: theme.colors.palette.semantic.success,
    },
    {
      label: "Yêu cầu chờ duyệt",
      value: String(totalPendingRequests),
      tone: theme.colors.palette.semantic.warning,
    },
    {
      label: "Khách mới (Hôm nay)",
      value: String(new7),
      tone: theme.colors.palette.brand.purple[400],
    },
    {
      label: "Khách mới (Trong tháng)",
      value: String(new30),
      tone: theme.colors.palette.semantic.success,
    },
  ];

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Admin Dashboard</h1>
        <p style={themed(styles.pageSubtitle)}>
          Tổng quan hệ thống TechXchange
        </p>
      </header>

      <section style={themed(styles.statGrid)}>
        {stats.map((stat) => (
          <div key={stat.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{stat.label}</div>
              <div style={themed(styles.statValue)}>{stat.value}</div>
            </div>
            <div
              style={{
                ...themed(styles.statIcon),
                background: `${stat.tone}22`,
              }}
            >
              <span style={{ color: stat.tone }}>●</span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.dashboardWideCard)}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Top shop bán chạy</h2>
          <span style={themed(styles.pageSubtitle)}>
            Theo doanh thu sản phẩm (không gồm phí ship, top 5)
          </span>
        </div>
        {topShops.length === 0 ? (
          <div style={themed(styles.emptyState)}>
            Chưa có đơn hoàn thành theo cửa hàng
          </div>
        ) : (
          topShops.map((shop, index) => (
            <div
              key={shop.storeId}
              style={{
                ...themed(styles.topShopRow),
                ...(index === topShops.length - 1
                  ? { borderBottom: "none" }
                  : {}),
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <span style={themed(styles.topShopRank)}>{index + 1}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={themed(styles.statValue)}>
                    {shop.storeName || `Cửa hàng #${shop.storeId}`}
                  </div>
                  <div style={themed(styles.topShopMeta)}>
                    {shop.completedOrders} đơn hoàn thành
                  </div>
                </div>
              </div>
              <div style={themed(styles.statValue)}>
                {formatVnd(shop.revenue)}
              </div>
            </div>
          ))
        )}
      </section>

      <section style={themed(styles.cardRow)}>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>
              Yêu cầu mở cửa hàng chờ duyệt
            </h2>
            <Link href="/admin/stores" style={themed(styles.cardLink)}>
              Xem tất cả →
            </Link>
          </div>
          <div style={themed(styles.pageSubtitle)}>
            {stores.total} yêu cầu đang chờ
          </div>
        </div>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Yêu cầu sản phẩm chờ duyệt</h2>
            <Link href="/admin/reviews" style={themed(styles.cardLink)}>
              Xem tất cả →
            </Link>
          </div>
          <div style={themed(styles.pageSubtitle)}>
            {productRequests.total} yêu cầu đang chờ
          </div>
        </div>
      </section>
    </AdminLayout>
  );
}
