"use client";

import { useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const tabs = ["Đạo", "Tất cả sản phẩm", "Winter Collection", "Áo khoác", "Quần"];

const products = Array.from({ length: 8 }).map((_, i) => ({
  id: i + 1,
  name: `Áo khoác nam ${i + 1}`,
  price: "$49",
}));

export default function ShopView() {
  const { themed } = useAppTheme();
  const [activeTab, setActiveTab] = useState(tabs[0]);

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <section style={themed(styles.hero)}>
          <div style={themed(styles.heroCard)}>
            <div style={themed(styles.shopBanner)}>
              <div style={themed(styles.shopAvatar)}>R</div>
              <div>
                <div style={themed(styles.shopName)}>ROWAY official</div>
                <div style={themed(styles.shopBadge)}>TechX Mall</div>
              </div>
            </div>
            <div style={themed(styles.heroActions)}>
              <button type="button" style={themed(styles.button)}>
                + Theo dõi
              </button>
              <button type="button" style={themed(styles.outlineButton)}>
                Chat
              </button>
            </div>
          </div>

          <div style={themed(styles.stats)}>
            <div style={themed(styles.statItem)}>
              <span>🛍️ Sản phẩm:</span>
              <span style={themed(styles.statValue)}>301</span>
            </div>
            <div style={themed(styles.statItem)}>
              <span>👥 Người theo dõi:</span>
              <span style={themed(styles.statValue)}>511,5k</span>
            </div>
            <div style={themed(styles.statItem)}>
              <span>⭐ Đánh giá:</span>
              <span style={themed(styles.statValue)}>4.9</span>
            </div>
            <div style={themed(styles.statItem)}>
              <span>👤 Đang theo:</span>
              <span style={themed(styles.statValue)}>47</span>
            </div>
            <div style={themed(styles.statItem)}>
              <span>💬 Phản hồi:</span>
              <span style={themed(styles.statValue)}>100%</span>
            </div>
            <div style={themed(styles.statItem)}>
              <span>⏱️ Tham gia:</span>
              <span style={themed(styles.statValue)}>5 năm trước</span>
            </div>
          </div>
        </section>

        <nav style={themed(styles.tabs)}>
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              style={tab === activeTab ? themed(styles.tabActive) : themed(styles.tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        <section style={themed(styles.voucherRow)}>
          <div style={themed(styles.voucherCard)}>
            <div>
              <div style={themed(styles.voucherTitle)}>Giảm 15%</div>
              <div>Đơn tối thiểu $29 · Giảm tối đa $5</div>
              <div style={{ marginTop: 6, color: "#9ca3af" }}>
                HSD: 28.02.2026
              </div>
            </div>
            <button type="button" style={themed(styles.voucherButton)}>
              Lưu
            </button>
          </div>
          <div style={themed(styles.voucherCard)}>
            <div>
              <div style={themed(styles.voucherTitle)}>Freeship</div>
              <div>Đơn tối thiểu $49 · Giảm tối đa $3</div>
              <div style={{ marginTop: 6, color: "#9ca3af" }}>
                HSD: 01.03.2026
              </div>
            </div>
            <button type="button" style={themed(styles.voucherButton)}>
              Lưu
            </button>
          </div>
        </section>

        <section>
          <div style={themed(styles.sectionHeader)}>
            <div style={themed(styles.sectionTitle)}>Gợi ý cho bạn</div>
            <button type="button" style={themed(styles.linkButton)}>
              Xem tất cả →
            </button>
          </div>
          <div style={themed(styles.productGrid)}>
            {products.map((product) => (
              <div key={product.id} style={themed(styles.productCard)}>
                <div style={themed(styles.productThumb)} />
                <div style={themed(styles.productName)}>{product.name}</div>
                <div style={themed(styles.productPrice)}>{product.price}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
