"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "./ShopLayout";
import * as styles from "./styles";

const tabs = [
  { key: "all", label: "Tất cả", count: 8 },
  { key: "confirmed", label: "Chờ xác nhận", count: 0 },
  { key: "shipping", label: "Đang giao", count: 1 },
  { key: "delivered", label: "Đã giao", count: 6 },
];

const orders = [
  {
    id: "ORD2025121903",
    customer: "Lê Văn C",
    phone: "0923456789",
    items: "1 sản phẩm",
    total: "$789",
    status: "confirmed",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121902",
    customer: "Trần Thị B",
    phone: "0912345678",
    items: "1 sản phẩm",
    total: "$713",
    status: "shipping",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121901",
    customer: "Nguyễn Văn A",
    phone: "0901234567",
    items: "1 sản phẩm",
    total: "$1,195",
    status: "delivered",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121904",
    customer: "Phạm Văn D",
    phone: "0934567890",
    items: "2 sản phẩm",
    total: "$1,544",
    status: "delivered",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121605",
    customer: "Đỗ Thị G",
    phone: "0967890123",
    items: "1 sản phẩm",
    total: "$2,365",
    status: "delivered",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121801",
    customer: "Hoàng Thị E",
    phone: "0945678901",
    items: "1 sản phẩm",
    total: "$364",
    status: "delivered",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121701",
    customer: "Vũ Văn F",
    phone: "0956789012",
    items: "1 sản phẩm",
    total: "$789",
    status: "delivered",
    date: "19/12/2025",
  },
  {
    id: "ORD2025121501",
    customer: "Bùi Văn H",
    phone: "0978901234",
    items: "1 sản phẩm",
    total: "$1,062",
    status: "delivered",
    date: "19/12/2025",
  },
];

export default function ShopOrdersView() {
  const { themed } = useAppTheme();

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý đơn hàng</h1>
        <p style={themed(styles.pageSubtitle)}>8 đơn hàng</p>
      </header>

      <section style={themed(styles.ordersToolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>🔍</span>
          <input
            type="text"
            placeholder="Tìm theo mã đơn, tên khách hàng..."
            style={themed(styles.searchInput)}
          />
        </div>
        <div style={themed(styles.tabGroup)}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              style={
                tab.key === "all"
                  ? themed(styles.tabButtonActive)
                  : themed(styles.tabButton)
              }
            >
              {tab.label} ({tab.count})
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
            {orders.map((order) => (
              <tr key={order.id}>
                <td style={themed(styles.td)}>{order.id}</td>
                <td style={themed(styles.td)}>
                  <div style={themed(styles.orderName)}>{order.customer}</div>
                  <div style={themed(styles.orderMeta)}>{order.phone}</div>
                </td>
                <td style={themed(styles.td)}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={themed(styles.orderThumb)} />
                    <div style={themed(styles.orderMeta)}>{order.items}</div>
                  </div>
                </td>
                <td style={themed(styles.td)}>
                  <span style={themed(styles.price)}>{order.total}</span>
                </td>
                <td style={themed(styles.td)}>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...(order.status === "confirmed"
                        ? themed(styles.statusConfirmed)
                        : order.status === "shipping"
                        ? themed(styles.statusShipping)
                        : themed(styles.statusDelivered)),
                    }}
                  >
                    {order.status === "confirmed"
                      ? "Đã xác nhận"
                      : order.status === "shipping"
                      ? "Đang giao"
                      : "Đã giao"}
                  </span>
                </td>
                <td style={themed(styles.td)}>{order.date}</td>
                <td style={themed(styles.td)}>
                  <div style={themed(styles.rowActions)}>
                    <button type="button" style={themed(styles.iconButton)}>
                      👁
                    </button>
                    {order.status === "confirmed" && (
                      <button type="button" style={themed(styles.shipButton)}>
                        Giao hàng
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </ShopLayout>
  );
}
