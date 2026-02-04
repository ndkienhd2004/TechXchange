"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const cartGroups = [
  {
    shop: "TechMart Store",
    badge: "Mall",
    items: [
      {
        id: 1,
        name: "iPhone 15 Pro Max 256GB",
        meta: "Storage: 256GB, Color: Natural Titanium",
        price: "$1,199",
        qty: 1,
      },
      {
        id: 2,
        name: "iPhone 15 Pro Max 256GB",
        meta: "Storage: 1TB, Color: Natural Titanium",
        price: "$1,199",
        qty: 1,
      },
    ],
  },
  {
    shop: "UGREEN Vietnam Shop",
    badge: "Yêu thích",
    items: [
      {
        id: 3,
        name: "Sony WH-1000XM5 Wireless Headphones",
        meta: "Color: Midnight",
        price: "$349",
        qty: 1,
      },
    ],
  },
];

export default function CartView() {
  const { themed } = useAppTheme();

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Giỏ hàng (3 sản phẩm)</h1>

        <div style={themed(styles.layout)}>
          <div style={themed(styles.tableHeader)}>
            <span />
            <span>Mặt hàng</span>
            <span>Đơn giá</span>
            <span>Số lượng</span>
            <span>Tạm tính</span>
            <span>Thao tác</span>
          </div>

          <div style={themed(styles.selectAll)}>
            <input type="checkbox" checked readOnly />
            Chọn tất cả (3 sản phẩm)
          </div>

          {cartGroups.map((group) => (
            <div key={group.shop} style={themed(styles.groupCard)}>
              <div style={themed(styles.shopHeader)}>
                <input type="checkbox" checked readOnly />
                <span>{group.shop}</span>
                <span style={themed(styles.shopPill)}>{group.badge}</span>
              </div>
              {group.items.map((item) => (
                <div key={item.id} style={themed(styles.itemRow)}>
                  <input type="checkbox" checked readOnly />
                  <div style={themed(styles.productCell)}>
                    <div style={themed(styles.thumb)} />
                    <div>
                      <div style={themed(styles.itemName)}>{item.name}</div>
                      <div style={themed(styles.itemMeta)}>{item.meta}</div>
                    </div>
                  </div>
                  <div style={themed(styles.itemPrice)}>{item.price}</div>
                  <div style={themed(styles.qtyWrap)}>
                    <button type="button" style={themed(styles.qtyButton)}>
                      –
                    </button>
                    <span style={themed(styles.qtyValue)}>{item.qty}</span>
                    <button type="button" style={themed(styles.qtyButton)}>
                      +
                    </button>
                  </div>
                  <div style={themed(styles.itemPrice)}>{item.price}</div>
                  <button type="button" style={themed(styles.removeButton)}>
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          ))}

          <div style={themed(styles.cartFooter)}>
            <div style={themed(styles.footerLeft)}>
              <input type="checkbox" checked readOnly />
              Chọn tất cả (3)
              <span>·</span>
              <span>Xóa</span>
              <span>·</span>
              <span>Lưu vào mục đã thích</span>
              <div style={themed(styles.couponRow)}>
                <input
                  type="text"
                  placeholder="Mã giảm giá"
                  style={themed(styles.couponInput)}
                />
                <button type="button" style={themed(styles.applyButton)}>
                  Áp dụng
                </button>
              </div>
            </div>
            <div style={themed(styles.footerTotal)}>
              <span>Tổng cộng (3 sản phẩm):</span>
              <span style={themed(styles.summaryTotal)}>$3,597</span>
              <button type="button" style={themed(styles.primaryButton)}>
                Mua hàng (3)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
