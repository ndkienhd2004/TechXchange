"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/commons/HeroCarousel";
import SaleBanner from "@/components/commons/SaleBanner";
import ItemCard from "@/components/commons/ItemCard";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth";
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
  rating?: number;
  images?: { id: number; url: string }[];
  default_image?: string | null;
};

export default function HomeView() {
  const { themed } = useAppTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [featuredProducts, setFeaturedProducts] = useState<ProductRow[]>([]);
  const [forYouProducts, setForYouProducts] = useState<ProductRow[]>([]);

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

  useEffect(() => {
    const run = async () => {
      if (!isAuthenticated) {
        setForYouProducts([]);
        return;
      }
      try {
        const api = getAxiosInstance();
        const res = await api.get("/recommendations/home", { params: { limit: 8 } });
        const rows = Array.isArray(res?.data?.data?.products) ? res.data.data.products : [];
        setForYouProducts(rows);
      } catch {
        setForYouProducts([]);
      }
    };
    void run();
  }, [isAuthenticated]);

  const shownForYou = useMemo(() => forYouProducts.slice(0, 4), [forYouProducts]);
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

          {shownForYou.length > 0 && (
            <section style={themed(styles.section)}>
              <div style={themed(styles.sectionHeader)}>
                <h2 style={themed(styles.sectionTitle)}>For You</h2>
                <Link href="/products" style={themed(styles.viewAllLink)}>
                  Xem tất cả →
                </Link>
              </div>
              <div style={themed(styles.productGrid)}>
                {shownForYou.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <ItemCard
                      productId={Number(product.id)}
                      title={product.name}
                      price={`${Number(product.price || 0).toLocaleString("vi-VN")} đ`}
                      rating={Number(product.rating || 0)}
                      imageSrc={product.images?.[0]?.url || product.default_image || undefined}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}

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
                    title={product.name}
                    price={`${Number(product.price || 0).toLocaleString("vi-VN")} đ`}
                    rating={Number(product.rating || 0)}
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
