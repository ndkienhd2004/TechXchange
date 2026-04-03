"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import HeroCarousel from "@/components/commons/HeroCarousel";
import SaleBanner from "@/components/commons/SaleBanner";
import ItemCard from "@/components/commons/ItemCard";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth";
import { buildProductDisplayName } from "@/features/products/utils/displayName";
import { useAppTheme } from "@/theme/ThemeProvider";
import { getAxiosInstance } from "@/services/axiosConfig";
import * as styles from "./styles";

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
  const { theme, themed } = useAppTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [featuredProducts, setFeaturedProducts] = useState<ProductRow[]>([]);
  const [personalizedProducts, setPersonalizedProducts] = useState<ProductRow[]>(
    [],
  );
  const [loadingPersonalized, setLoadingPersonalized] = useState(false);

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
  const saleBanners = useMemo(
    () => [
      {
        tag: "Black Friday",
        title: "Special Sale",
        subtitle: "Up to 50% Off",
        background: `linear-gradient(120deg, ${theme.colors.palette.backgrounds.secondary} 0%, ${theme.colors.palette.backgrounds.card} 100%)`,
        imageAlt: "Lifestyle room",
      },
      {
        tag: "VR Headset",
        title: "New Arrival",
        subtitle: "$299.00",
        background: `linear-gradient(120deg, ${theme.colors.palette.brand.purple[900]} 0%, ${theme.colors.palette.brand.purple[600]} 100%)`,
        imageAlt: "VR headset",
      },
      {
        tag: "Special Offer",
        title: "Gaming Gear",
        subtitle: "Up to 30% Off",
        background: `linear-gradient(120deg, ${theme.colors.palette.brand.pink[900]} 0%, ${theme.colors.palette.brand.pink[600]} 100%)`,
        imageAlt: "Gaming controller",
      },
    ],
    [theme.colors],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      setPersonalizedProducts([]);
      return;
    }

    const run = async () => {
      setLoadingPersonalized(true);
      try {
        const api = getAxiosInstance();
        const response = await api.get("/products/recommendations/me", {
          params: { limit: 8, mode: "hybrid" },
        });
        const rows = Array.isArray(response?.data?.data?.products)
          ? response.data.data.products
          : [];
        setPersonalizedProducts(rows);
      } catch {
        setPersonalizedProducts([]);
      } finally {
        setLoadingPersonalized(false);
      }
    };

    void run();
  }, [isAuthenticated]);

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

          {isAuthenticated && (
            <section style={themed(styles.section)}>
              <div style={themed(styles.sectionHeader)}>
                <h2 style={themed(styles.sectionTitle)}>Dành cho bạn</h2>
                <Link href="/products" style={themed(styles.viewAllLink)}>
                  Xem tất cả →
                </Link>
              </div>

              {loadingPersonalized ? (
                <p>Đang tải gợi ý cá nhân...</p>
              ) : personalizedProducts.length === 0 ? (
                <p>Chưa có gợi ý cá nhân phù hợp.</p>
              ) : (
                <div style={themed(styles.productGrid)}>
                  {personalizedProducts.map((product) => (
                    <Link
                      key={`personal-${product.id}`}
                      href={`/products/${product.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <ItemCard
                        productId={Number(product.id)}
                        title={buildProductDisplayName(
                          product.name,
                          product.primary_serial_specs ||
                            (product.catalog?.specs as
                              | Record<string, unknown>
                              | undefined),
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
                        imageSrc={
                          product.images?.[0]?.url || product.default_image || undefined
                        }
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
