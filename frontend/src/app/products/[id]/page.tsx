"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import ItemCard from "@/components/commons/ItemCard";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const PRODUCTS = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    price: "$1,199",
    compareAtPrice: "$1,299",
    rating: 4,
    reviewCount: 120,
    badgeText: "-8%",
  },
  {
    id: "2",
    title: "DJI Mini 3 Pro Drone",
    price: "$759",
    compareAtPrice: "$859",
    rating: 4,
    reviewCount: 32,
    badgeText: "-12%",
  },
  {
    id: "3",
    title: "DELL Gaming G15 5520",
    price: "$1,170",
    compareAtPrice: "$1,300",
    rating: 4,
    reviewCount: 45,
    badgeText: "-10%",
  },
  {
    id: "4",
    title: "Sony WH-1000XM5 Wireless Headphones",
    price: "$349",
    compareAtPrice: "$399",
    rating: 4.5,
    reviewCount: 89,
    badgeText: "-13%",
    sold: 250,
  },
  {
    id: "5",
    title: "Samsung Galaxy S24 Ultra",
    price: "$1,099",
    compareAtPrice: "$1,199",
    rating: 5,
    reviewCount: 210,
    badgeText: "-8%",
  },
  {
    id: "6",
    title: "MacBook Pro 14 M3 Pro",
    price: "$1,999",
    compareAtPrice: "$2,199",
    rating: 5,
    reviewCount: 156,
    badgeText: "-9%",
  },
  {
    id: "7",
    title: "iPad Pro 12.9 M2",
    price: "$1,099",
    compareAtPrice: "$1,199",
    rating: 4,
    reviewCount: 78,
    badgeText: "-8%",
  },
  {
    id: "8",
    title: "Bose QuietComfort Ultra",
    price: "$429",
    compareAtPrice: "$449",
    rating: 4,
    reviewCount: 64,
    badgeText: "-4%",
  },
];

const PRODUCT_DETAIL: Record<string, { description: string; specs: string[] }> =
  {
    "4": {
      description:
        "Industry-leading noise canceling with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming microphones. Up to 30-hour battery life with quick charging. Premium sound with Edge-AI and LDAC.",
      specs: [
        "Driver: 30mm",
        "Frequency: 4Hz - 40kHz",
        "Bluetooth: 5.2",
        "Battery: Up to 30h (NC on)",
        "Weight: 250g",
      ],
    },
  };

const DEFAULT_DETAIL = {
  description: "Premium product with best-in-class features and build quality.",
  specs: ["High quality materials", "Warranty included", "Certified"],
};

const MOCK_REVIEWS = [
  {
    id: "1",
    author: "Nguyễn Văn A",
    date: "2024-01-15",
    rating: 5,
    body: "Sản phẩm tuyệt vời, âm thanh sống động, chống ồn rất tốt. Giao hàng nhanh.",
  },
  {
    id: "2",
    author: "Trần Thị B",
    date: "2024-01-10",
    rating: 4,
    body: "Rất hài lòng với chất lượng. Pin trâu, đeo cả ngày không mỏi. Một chút đắt nhưng xứng đáng.",
  },
  {
    id: "3",
    author: "Lê Văn C",
    date: "2024-01-05",
    rating: 5,
    body: "Đây là lần thứ 2 mua tai nghe Sony. Luôn tin tưởng thương hiệu này.",
  },
];

function renderStars(
  rating: number,
  theme: {
    colors: {
      palette: { semantic: { warning: string }; text: { muted: string } };
    };
  }
) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++)
    stars.push(
      <span key={i} style={{ color: theme.colors.palette.semantic.warning }}>
        ★
      </span>
    );
  if (half)
    stars.push(
      <span key="half" style={{ color: theme.colors.palette.semantic.warning }}>
        ★
      </span>
    );
  for (let i = stars.length; i < 5; i++)
    stars.push(
      <span key={i} style={{ color: theme.colors.palette.text.muted }}>
        ☆
      </span>
    );
  return stars;
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { theme, themed } = useAppTheme();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews"
  >("description");
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const product = useMemo(
    () => PRODUCTS.find((p) => p.id === id) ?? PRODUCTS[0],
    [id]
  );
  const detail = PRODUCT_DETAIL[id] ?? DEFAULT_DETAIL;
  const recommended = useMemo(
    () => PRODUCTS.filter((p) => p.id !== id).slice(0, 4),
    [id]
  );

  const thumbnails = [0, 1, 2].map((i) => (
    <div
      key={i}
      style={themed(styles.thumbnail)}
      onClick={() => setMainImageIndex(i)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setMainImageIndex(i)}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          background: theme.colors.palette.backgrounds.secondary,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: theme.typography.fontSize.xs.size,
          color: theme.colors.palette.text.muted,
        }}
      >
        {i + 1}
      </div>
    </div>
  ));

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.shell)}>
          <nav style={themed(styles.breadcrumb)} aria-label="Breadcrumb">
            <Link href="/" style={themed(styles.breadcrumbLink)}>
              Home
            </Link>
            {" > "}
            <Link href="/products" style={themed(styles.breadcrumbLink)}>
              Categories
            </Link>
            {" > "}
            <span style={{ color: theme.colors.palette.text.primary }}>
              {product.title}
            </span>
          </nav>

          <div style={themed(styles.mainRow)}>
            <div style={themed(styles.galleryWrap)}>
              <div style={themed(styles.thumbnails)}>{thumbnails}</div>
              <div style={themed(styles.mainImage)}>
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    background: theme.colors.palette.backgrounds.secondary,
                    borderRadius: theme.spacing.lg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: theme.colors.palette.text.muted,
                    fontSize: theme.typography.fontSize.sm.size,
                  }}
                >
                  Product image {mainImageIndex + 1}
                </div>
                <button
                  type="button"
                  style={{
                    ...themed(styles.galleryNav),
                    left: theme.spacing[2],
                  }}
                  aria-label="Previous"
                >
                  ‹
                </button>
                <button
                  type="button"
                  style={{
                    ...themed(styles.galleryNav),
                    right: theme.spacing[2],
                  }}
                  aria-label="Next"
                >
                  ›
                </button>
              </div>
            </div>

            <div style={themed(styles.infoColumn)}>
              <h1 style={themed(styles.productTitle)}>{product.title}</h1>
              <div style={themed(styles.ratingRow)}>
                <span style={{ display: "flex", gap: 2 }}>
                  {renderStars(product.rating, theme)}
                </span>
                <span>({product.reviewCount} reviews)</span>
                {"sold" in product && product.sold && (
                  <span>| {product.sold} sold</span>
                )}
              </div>
              <div style={themed(styles.priceRow)}>
                <span style={themed(styles.price)}>{product.price}</span>
                {product.compareAtPrice && (
                  <span style={themed(styles.comparePrice)}>
                    {product.compareAtPrice}
                  </span>
                )}
                {product.badgeText && (
                  <span style={themed(styles.discountBadge)}>
                    {product.badgeText}
                  </span>
                )}
              </div>
              <p style={themed(styles.description)}>{detail.description}</p>

              <div style={themed(styles.fieldRow)}>
                <span style={themed(styles.fieldLabel)}>Color</span>
                <select style={themed(styles.select)}>
                  <option>Black</option>
                  <option>Silver</option>
                  <option>White</option>
                </select>
              </div>
              <div style={themed(styles.fieldRow)}>
                <span style={themed(styles.fieldLabel)}>Quantity</span>
                <div style={themed(styles.quantityWrap)}>
                  <button
                    type="button"
                    style={themed(styles.quantityBtn)}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Giảm số lượng"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(100, Number(e.target.value) || 1))
                      )
                    }
                    style={themed(styles.quantityInput)}
                    aria-label="Số lượng"
                  />
                  <button
                    type="button"
                    style={themed(styles.quantityBtn)}
                    onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                    aria-label="Tăng số lượng"
                  >
                    +
                  </button>
                </div>
                <span style={themed(styles.quantityNote)}>100 available</span>
              </div>
              <div style={themed(styles.buttonRow)}>
                <button type="button" style={themed(styles.primaryButton)}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  Add to cart
                </button>
                <button type="button" style={themed(styles.secondaryButton)}>
                  Buy now
                </button>
              </div>
              <ul style={themed(styles.policyList)}>
                <li style={themed(styles.policyItem)}>
                  ✓ Free shipping for orders over $100
                </li>
                <li style={themed(styles.policyItem)}>
                  ✓ 30-day return policy
                </li>
                <li style={themed(styles.policyItem)}>✓ Secure payment</li>
              </ul>
            </div>
          </div>

          <div style={themed(styles.shopCard)}>
            <div style={themed(styles.shopInfo)}>
              <span style={themed(styles.shopAvatar)}>🏠</span>
              <div>
                <h3 style={themed(styles.shopName)}>UGREEN Vietnam Shop</h3>
                <p style={themed(styles.shopMeta)}>★ 4.9 · 85 sản phẩm</p>
              </div>
            </div>
            <div style={themed(styles.shopButtons)}>
              <button type="button" style={themed(styles.outlineButton)}>
                Chat now
              </button>
              <button type="button" style={themed(styles.outlineButton)}>
                Visit shop
              </button>
            </div>
          </div>

          <div style={{ marginTop: theme.spacing["2xl"] }}>
            <div style={themed(styles.tabs)}>
              <button
                type="button"
                style={
                  activeTab === "description"
                    ? themed(styles.tabActive)
                    : themed(styles.tab)
                }
                onClick={() => setActiveTab("description")}
              >
                Product Description
              </button>
              <button
                type="button"
                style={
                  activeTab === "specs"
                    ? themed(styles.tabActive)
                    : themed(styles.tab)
                }
                onClick={() => setActiveTab("specs")}
              >
                Specifications
              </button>
              <button
                type="button"
                style={
                  activeTab === "reviews"
                    ? themed(styles.tabActive)
                    : themed(styles.tab)
                }
                onClick={() => setActiveTab("reviews")}
              >
                Reviews ({MOCK_REVIEWS.length})
              </button>
            </div>
            {activeTab === "description" && (
              <p style={themed(styles.tabContent)}>{detail.description}</p>
            )}
            {activeTab === "specs" && (
              <ul
                style={{
                  margin: 0,
                  paddingLeft: theme.spacing.lg,
                  color: theme.colors.palette.text.secondary,
                  fontSize: theme.typography.fontSize.sm.size,
                  lineHeight: 1.8,
                }}
              >
                {detail.specs.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            )}
            {activeTab === "reviews" && (
              <ul style={themed(styles.reviewsList)}>
                {MOCK_REVIEWS.map((r) => (
                  <li key={r.id} style={themed(styles.reviewCard)}>
                    <div style={themed(styles.reviewHeader)}>
                      <div style={themed(styles.reviewAvatar)}>
                        {r.author.charAt(0)}
                      </div>
                      <div style={themed(styles.reviewMeta)}>
                        <p style={themed(styles.reviewAuthor)}>{r.author}</p>
                        <p style={themed(styles.reviewDate)}>{r.date}</p>
                      </div>
                      <span
                        style={{
                          display: "flex",
                          gap: 2,
                          color: theme.colors.palette.semantic.warning,
                        }}
                      >
                        {renderStars(r.rating, theme)}
                      </span>
                    </div>
                    <p style={themed(styles.reviewBody)}>{r.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <section style={{ marginTop: theme.spacing["3xl"] }}>
            <h2 style={themed(styles.sectionTitle)}>Recommended for you</h2>
            <div style={themed(styles.recommendedGrid)}>
              {recommended.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <ItemCard
                    title={p.title}
                    price={p.price}
                    compareAtPrice={p.compareAtPrice}
                    rating={p.rating}
                    reviewCount={p.reviewCount}
                    badgeText={p.badgeText}
                  />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
