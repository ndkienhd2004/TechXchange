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

export default function AdminDashboardView() {
  const { themed } = useAppTheme();
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
    dispatch(fetchAdminProductRequests({ page: 1, status: "pending", limit: 1 }));
  }, [dispatch]);

  const totalUsers = Number(userStats.data?.totalUsers ?? 0);
  const totalShops = Number(userStats.data?.totalShops ?? 0);

  const stats = [
    { label: "Người dùng", value: String(totalUsers), tone: "#3b82f6" },
    { label: "Cửa hàng", value: String(totalShops), tone: "#a855f7" },
    { label: "Sản phẩm", value: String(products.total), tone: "#22c55e" },
    {
      label: "Yêu cầu chờ duyệt",
      value: String(stores.total + brands.total + productRequests.total),
      tone: "#f59e0b",
    },
  ];

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Admin Dashboard</h1>
        <p style={themed(styles.pageSubtitle)}>Tổng quan hệ thống TechXchange</p>
      </header>

      <section style={themed(styles.statGrid)}>
        {stats.map((stat) => (
          <div key={stat.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{stat.label}</div>
              <div style={themed(styles.statValue)}>{stat.value}</div>
            </div>
            <div style={{ ...themed(styles.statIcon), background: `${stat.tone}22` }}>
              <span style={{ color: stat.tone }}>●</span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.cardRow)}>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Yêu cầu mở cửa hàng chờ duyệt</h2>
            <Link href="/admin/stores" style={themed(styles.cardLink)}>
              Xem tất cả →
            </Link>
          </div>
          <div style={themed(styles.pageSubtitle)}>{stores.total} yêu cầu đang chờ</div>
        </div>
        <div style={themed(styles.card)}>
          <div style={themed(styles.cardHeader)}>
            <h2 style={themed(styles.cardTitle)}>Yêu cầu sản phẩm chờ duyệt</h2>
            <Link href="/admin/reviews" style={themed(styles.cardLink)}>
              Xem tất cả →
            </Link>
          </div>
          <div style={themed(styles.pageSubtitle)}>{productRequests.total} yêu cầu đang chờ</div>
        </div>
      </section>
    </AdminLayout>
  );
}
