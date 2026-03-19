"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/commons/HeroCarousel";
import SaleBanner from "@/components/commons/SaleBanner";
import ItemCard from "@/components/commons/ItemCard";
import { buildProductDisplayName } from "@/features/products/utils/displayName";
import { useAppTheme } from "@/theme/ThemeProvider";
import { getAxiosInstance } from "@/services/axiosConfig";
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

type ProductRow = {
  id: number;
  name: string;
  price: number;
  rating?: number | string | null;
  reviewCount?: number | string | null;
  review_count?: number | string | null;
  buyturn?: number | string | null;
  quantity?: number | string | null;
  images?: { id: number; url: string }[];
  default_image?: string | null;
  primary_serial_specs?: Record<string, string>;
  catalog?: {
    specs?: Record<string, unknown>;
  };
};

export default function HomeView() {
  const { themed } = useAppTheme();
  const [featuredProducts, setFeaturedProducts] = useState<ProductRow[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const api = getAxiosInstance();
        const res = await api.get("/products", { params: { limit: 8, page: 1 } });
        const rows = Array.isArray(res?.data?.data?.products) ? res.data.data.products : [];
        setFeaturedProducts(rows);
      } catch {
        setFeaturedProducts([]);
      }
    };
    void run();
  }, []);

  const shownFeatured = useMemo(() => featuredProducts.slice(0, 4), [featuredProducts]);

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
              {shownFeatured.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <ItemCard
                    productId={Number(product.id)}
                    title={buildProductDisplayName(
                      product.name,
                      product.primary_serial_specs ||
                        (product.catalog?.specs as Record<string, unknown> | undefined),
                    )}
                    price={`${Number(product.price || 0).toLocaleString("vi-VN")} đ`}
                    rating={Number(product.rating || 0)}
                    reviewCount={Number(
                      product.reviewCount ??
                        product.review_count ??
                        product.buyturn ??
                        product.quantity ??
                        0,
                    )}
                    imageSrc={product.images?.[0]?.url || product.default_image || undefined}
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
