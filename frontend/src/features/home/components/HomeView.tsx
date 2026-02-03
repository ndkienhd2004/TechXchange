"use client";

import Link from "next/link";
import HeroCarousel from "@/components/commons/HeroCarousel";
import SaleBanner from "@/components/commons/SaleBanner";
import ItemCard from "@/components/commons/ItemCard";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const saleBanners = [
  {
    tag: "Black Friday",
    title: "Special Sale",
    subtitle: "Up to 50% Off",
    background:
      "linear-gradient(120deg, rgba(17, 24, 39, 1) 0%, rgba(30, 41, 59, 1) 100%)",
    imageAlt: "Lifestyle room",
  },
  {
    tag: "VR Headset",
    title: "New Arrival",
    subtitle: "$299.00",
    background: "linear-gradient(120deg, #5B21B6 0%, #7C3AED 100%)",
    imageAlt: "VR headset",
  },
  {
    tag: "Special Offer",
    title: "Gaming Gear",
    subtitle: "Up to 30% Off",
    background: "linear-gradient(120deg, #831843 0%, #DB2777 100%)",
    imageAlt: "Gaming controller",
  },
];

const featuredProducts = [
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
    rating: 4,
    reviewCount: 89,
    badgeText: "-13%",
  },
];

export default function HomeView() {
  const { themed } = useAppTheme();

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <main style={themed(styles.shell)}>
          <HeroCarousel />

          <section style={themed(styles.section)}>
            <div style={themed(styles.sectionHeader)}>
              <h2 style={themed(styles.sectionTitle)}>Khuyến mãi nổi bật</h2>
            </div>
            <div style={themed(styles.saleBannerList)}>
              {saleBanners.map((banner) => (
                <SaleBanner key={banner.title} {...banner} />
              ))}
            </div>
          </section>

          <section style={themed(styles.section)}>
            <div style={themed(styles.sectionHeader)}>
              <h2 style={themed(styles.sectionTitle)}>Featured Products</h2>
              <Link href="/products" style={themed(styles.viewAllLink)}>
                Xem tất cả →
              </Link>
            </div>
            <div style={themed(styles.productGrid)}>
              {featuredProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <ItemCard
                    title={product.title}
                    price={product.price}
                    compareAtPrice={product.compareAtPrice}
                    rating={product.rating}
                    reviewCount={product.reviewCount}
                    badgeText={product.badgeText}
                  />
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
