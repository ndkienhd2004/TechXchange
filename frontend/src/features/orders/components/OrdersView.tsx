"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import { getAxiosInstance } from "@/services/axiosConfig";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

type OrderItem = {
  id: number;
  product_id: number;
  quantity: number;
  price: number | string;
  can_review: boolean;
  product?: {
    id: number;
    name: string;
    store?: { id: number; name: string };
  };
};

type OrderRow = {
  id: number;
  status: string;
  total_price: number | string;
  created_at: string;
  items: OrderItem[];
};

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "completed", label: "Đã giao" },
  { key: "canceled", label: "Đã huỷ" },
];

const currency = (value: number | string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0),
  );

export default function OrdersView() {
  const { themed } = useAppTheme();
  const [activeTab, setActiveTab] = useState("all");
  const [openId, setOpenId] = useState<number | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const api = getAxiosInstance();
      const res = await api.get("/orders/me");
      const rows = Array.isArray(res?.data?.data?.orders) ? res.data.data.orders : [];
      setOrders(rows);
      if (rows.length > 0 && openId == null) setOpenId(Number(rows[0].id));
    } catch (error) {
      showErrorToast(error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  const onReview = async (productId: number) => {
    const ratingRaw = window.prompt("Đánh giá từ 1-5");
    const comment = window.prompt("Nhận xét của bạn") || "";
    const rating = Number(ratingRaw);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      showErrorToast("Rating không hợp lệ");
      return;
    }
    try {
      const api = getAxiosInstance();
      await api.post("/reviews", {
        product_id: productId,
        rating,
        comment,
      });
      showSuccessToast("Đánh giá thành công");
      await loadOrders();
    } catch (error) {
      showErrorToast(error);
    }
  };

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Đơn hàng của tôi</h1>

        <div style={themed(styles.tabs)}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={
                activeTab === tab.key
                  ? themed(styles.tabButtonActive)
                  : themed(styles.tabButton)
              }
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading && <div style={themed(styles.subText)}>Đang tải đơn hàng...</div>}

        {!loading && filteredOrders.length === 0 && (
          <div style={themed(styles.subText)}>Chưa có đơn hàng nào.</div>
        )}

        {filteredOrders.map((order) => {
          const isOpen = openId === Number(order.id);
          const firstItem = order.items?.[0];
          const shippingStatus =
            order.status === "completed"
              ? "Đã giao"
              : order.status === "shipping"
                ? "Đang giao"
                : order.status === "canceled"
                  ? "Đã hủy"
                  : "Chờ xác nhận";

          return (
            <div key={order.id} style={themed(styles.orderCard)}>
              <div style={themed(styles.orderHeader)}>
                <div style={themed(styles.orderMeta)}>
                  <span>#{order.id}</span>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...(order.status === "completed"
                        ? themed(styles.statusDelivered)
                        : order.status === "shipping"
                          ? themed(styles.statusShipping)
                          : themed(styles.statusConfirmed)),
                    }}
                  >
                    {shippingStatus}
                  </span>
                </div>
                <div style={themed(styles.orderMeta)}>
                  {new Date(order.created_at).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div style={themed(styles.orderBody)}>
                <div style={themed(styles.thumb)} />
                <div>
                  <div style={themed(styles.productName)}>
                    {firstItem?.product?.name || "Sản phẩm"}
                  </div>
                  <div style={themed(styles.subText)}>
                    +{Math.max((order.items?.length || 1) - 1, 0)} sản phẩm khác
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={themed(styles.price)}>{currency(order.total_price)}</div>
                  <button
                    type="button"
                    style={themed(styles.detailToggle)}
                    onClick={() => setOpenId(isOpen ? null : Number(order.id))}
                  >
                    Chi tiết {isOpen ? "▴" : "▾"}
                  </button>
                </div>
              </div>

              <div
                style={{
                  ...themed(styles.detailWrap),
                  maxHeight: isOpen ? "600px" : "0px",
                }}
              >
                <div style={themed(styles.detailInner)}>
                  <div style={themed(styles.shopRow)}>
                    Shop: {firstItem?.product?.store?.name || "TechXchange"}
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} style={themed(styles.itemRow)}>
                      <div style={themed(styles.thumb)} />
                      <div>
                        <div style={themed(styles.productName)}>
                          {item.product?.name || `#${item.product_id}`}
                        </div>
                        <div style={themed(styles.subText)}>x{item.quantity}</div>
                      </div>
                      <div style={themed(styles.price)}>
                        {currency(Number(item.price || 0) * Number(item.quantity || 0))}
                      </div>
                      {item.can_review ? (
                        <button
                          type="button"
                          style={themed(styles.outlineButton)}
                          onClick={() => onReview(item.product_id)}
                        >
                          Đánh giá
                        </button>
                      ) : (
                        <span style={themed(styles.subText)}>Đã đánh giá / Chưa đủ điều kiện</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
