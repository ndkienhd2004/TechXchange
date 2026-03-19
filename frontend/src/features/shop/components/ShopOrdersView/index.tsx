"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import AppIcon from "@/components/commons/AppIcon";
import { getAxiosInstance } from "@/services/axiosConfig";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

type ShopOrderItem = {
  id: number;
  quantity: number;
  price: number | string;
  product?: {
    id: number;
    name: string;
    images?: Array<{ id: number; url: string }>;
  };
};

type ShopOrder = {
  id: number;
  status: "pending" | "shipping" | "completed" | "canceled";
  total_price: number | string;
  shipment_fee?: number | string | null;
  shipment_provider?: string | null;
  created_at: string;
  customer?: {
    id: number;
    username?: string;
    phone?: string;
    email?: string;
  };
  items: ShopOrderItem[];
};

const statusTabs = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Đã giao" },
  { key: "canceled", label: "Đã hủy" },
] as const;

const currency = (value: number | string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0),
  );

export default function ShopOrdersView() {
  const { themed } = useAppTheme();
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<(typeof statusTabs)[number]["key"]>("all");
  const [search, setSearch] = useState("");

  const loadOrders = async (status: string) => {
    try {
      setLoading(true);
      const api = getAxiosInstance();
      const res = await api.get("/orders/shop/me", {
        params: status === "all" ? undefined : { status },
      });
      const rows = Array.isArray(res?.data?.data?.orders) ? res.data.data.orders : [];
      setOrders(rows);
    } catch (error) {
      showErrorToast(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders(activeTab);
  }, [activeTab]);

  const counts = useMemo(() => {
    const total = orders.length;
    return {
      all: total,
      pending: orders.filter((o) => o.status === "pending").length,
      shipping: orders.filter((o) => o.status === "shipping").length,
      completed: orders.filter((o) => o.status === "completed").length,
      canceled: orders.filter((o) => o.status === "canceled").length,
    };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((order) => {
      const haystack = [
        String(order.id),
        order.customer?.username || "",
        order.customer?.phone || "",
        ...(order.items || []).map((i) => i.product?.name || ""),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [orders, search]);

  const onApprove = async (orderId: number) => {
    try {
      const api = getAxiosInstance();
      const res = await api.put(`/orders/shop/${orderId}/approve`);
      const shippingFee = Number(res?.data?.data?.shipment?.shipping_fee || 0);
      showSuccessToast(
        shippingFee > 0
          ? `Đã duyệt đơn. Phí GHN: ${currency(shippingFee)}`
          : "Đã duyệt đơn, trạng thái chuyển sang đang giao",
      );
      await loadOrders(activeTab);
    } catch (error) {
      showErrorToast(error);
    }
  };

  const onReject = async (orderId: number) => {
    const accepted = window.confirm(
      "Bạn chắc chắn muốn từ chối đơn này? Hệ thống sẽ nhả lại tồn kho đã giữ chỗ.",
    );
    if (!accepted) return;

    try {
      const api = getAxiosInstance();
      await api.put(`/orders/shop/${orderId}/reject`);
      showSuccessToast("Đã từ chối đơn hàng và nhả lại tồn kho");
      await loadOrders(activeTab);
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý đơn hàng</h1>
        <p style={themed(styles.pageSubtitle)}>{counts.all} đơn hàng</p>
      </header>

      <section style={themed(styles.ordersToolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>
            <AppIcon name="search" />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách hàng..."
            style={themed(styles.searchInput)}
          />
        </div>
        <div style={themed(styles.tabGroup)}>
          {statusTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={
                tab.key === activeTab
                  ? themed(styles.tabButtonActive)
                  : themed(styles.tabButton)
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Mã đơn hàng</th>
              <th style={themed(styles.th)}>Khách hàng</th>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Tổng tiền</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày đặt</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={themed(styles.td)} colSpan={7}>
                  Đang tải...
                </td>
              </tr>
            ) : visibleOrders.length === 0 ? (
              <tr>
                <td style={themed(styles.td)} colSpan={7}>
                  Không có đơn hàng
                </td>
              </tr>
            ) : (
              visibleOrders.map((order) => {
                const firstItem = order.items?.[0];
                return (
                  <tr key={order.id}>
                    <td style={themed(styles.td)}>#{order.id}</td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.orderName)}>
                        {order.customer?.username || "Khách hàng"}
                      </div>
                      <div style={themed(styles.orderMeta)}>
                        {order.customer?.phone || order.customer?.email || "-"}
                      </div>
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={themed(styles.orderThumb)} />
                        <div style={themed(styles.orderMeta)}>
                          {(order.items || []).length} sản phẩm
                          {firstItem?.product?.name ? ` • ${firstItem.product.name}` : ""}
                        </div>
                      </div>
                    </td>
                    <td style={themed(styles.td)}>
                      <span style={themed(styles.price)}>{currency(order.total_price)}</span>
                      {Number(order.shipment_fee || 0) > 0 ? (
                        <div style={themed(styles.orderMeta)}>
                          GHN: {currency(Number(order.shipment_fee || 0))}
                        </div>
                      ) : null}
                    </td>
                    <td style={themed(styles.td)}>
                      <span
                        style={{
                          ...themed(styles.statusPill),
                          ...(order.status === "pending"
                            ? themed(styles.statusConfirmed)
                            : order.status === "shipping"
                              ? themed(styles.statusShipping)
                              : themed(styles.statusDelivered)),
                        }}
                      >
                        {order.status === "pending"
                          ? "Chờ xác nhận"
                          : order.status === "shipping"
                            ? "Đang giao"
                            : order.status === "completed"
                              ? "Đã giao"
                              : "Đã hủy"}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      {new Date(order.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.rowActions)}>
                        {order.status === "pending" ? (
                          <>
                            <button
                              type="button"
                              style={themed(styles.shipButton)}
                              onClick={() => onApprove(Number(order.id))}
                            >
                              Duyệt giao hàng
                            </button>
                            <button
                              type="button"
                              style={themed(styles.rejectButton)}
                              onClick={() => onReject(Number(order.id))}
                            >
                              Từ chối
                            </button>
                          </>
                        ) : (
                          <span style={themed(styles.orderMeta)}>—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>
    </ShopLayout>
  );
}
