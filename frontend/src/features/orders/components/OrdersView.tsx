"use client";

import { useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const orders = [
  {
    id: "ORD2025121904",
    status: "delivered",
    date: "19/12/2025",
    total: "$1,544",
    items: [
      { name: "DELL Gaming G15 5520", price: "$1,170" },
      { name: "Sony WH-1000XM5 Wireless Headphones", price: "$349" },
    ],
    shop: "UGREEN Vietnam Shop",
    address: "Phạm Văn D | 0934567890 | 321 Đường GHI, Hà Nội",
  },
  {
    id: "ORD2025121902",
    status: "shipping",
    date: "19/12/2025",
    total: "$713",
    items: [{ name: "Sony WH-1000XM5 Wireless Headphones", price: "$349" }],
    shop: "TechMart Store",
    address: "Lê Văn C | 0923456789 | 221 Đường ABC, Hà Nội",
  },
];

const tabs = [
  { key: "all", label: "Tất cả" },
  { key: "confirmed", label: "Chờ xác nhận" },
  { key: "shipping", label: "Đang giao" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã huỷ" },
];

export default function OrdersView() {
  const { themed } = useAppTheme();
  const [activeTab, setActiveTab] = useState("all");
  const [openId, setOpenId] = useState<string | null>(orders[0]?.id ?? null);

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

        {orders.map((order) => {
          const isOpen = openId === order.id;
          return (
            <div key={order.id} style={themed(styles.orderCard)}>
              <div style={themed(styles.orderHeader)}>
                <div style={themed(styles.orderMeta)}>
                  <span>{order.id}</span>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...(order.status === "delivered"
                        ? themed(styles.statusDelivered)
                        : order.status === "shipping"
                        ? themed(styles.statusShipping)
                        : themed(styles.statusConfirmed)),
                    }}
                  >
                    {order.status === "delivered"
                      ? "Đã giao"
                      : order.status === "shipping"
                      ? "Đang giao"
                      : "Đã xác nhận"}
                  </span>
                </div>
                <div style={themed(styles.orderMeta)}>{order.date}</div>
              </div>

              <div style={themed(styles.orderBody)}>
                <div style={themed(styles.thumb)} />
                <div>
                  <div style={themed(styles.productName)}>
                    {order.items[0]?.name}
                  </div>
                  <div style={themed(styles.subText)}>
                    +{Math.max(order.items.length - 1, 0)} sản phẩm khác
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={themed(styles.price)}>{order.total}</div>
                  <button
                    type="button"
                    style={themed(styles.detailToggle)}
                    onClick={() => setOpenId(isOpen ? null : order.id)}
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
                    Shop: {order.shop}
                  </div>
                  {order.items.map((item) => (
                    <div key={item.name} style={themed(styles.itemRow)}>
                      <div style={themed(styles.thumb)} />
                      <div>
                        <div style={themed(styles.productName)}>{item.name}</div>
                        <div style={themed(styles.subText)}>x1</div>
                      </div>
                      <div style={themed(styles.price)}>{item.price}</div>
                    </div>
                  ))}
                  <div style={themed(styles.addressBox)}>
                    Địa chỉ giao hàng: {order.address}
                  </div>
                  <div style={themed(styles.actionsRow)}>
                    <button type="button" style={themed(styles.button)}>
                      Mua lại
                    </button>
                    <button type="button" style={themed(styles.outlineButton)}>
                      Đánh giá
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
