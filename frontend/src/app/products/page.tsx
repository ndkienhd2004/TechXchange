"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ItemCard from "@/components/commons/ItemCard";
import Pagination from "@/components/commons/Pagination";
import ProductSideHeader from "@/components/commons/ProductSideHeader";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

const ITEMS_PER_PAGE = 8;

const ALL_PRODUCTS = [
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
  {
    id: "9",
    title: "LG C3 55 OLED TV",
    price: "$1,297",
    compareAtPrice: "$1,499",
    rating: 5,
    reviewCount: 92,
    badgeText: "-13%",
  },
  {
    id: "10",
    title: "Nikon Z8 Body",
    price: "$3,497",
    compareAtPrice: "$3,997",
    rating: 5,
    reviewCount: 41,
    badgeText: "-12%",
  },
  {
    id: "11",
    title: "PlayStation 5 Slim",
    price: "$449",
    compareAtPrice: "$499",
    rating: 4,
    reviewCount: 320,
    badgeText: "-10%",
  },
  {
    id: "12",
    title: "Xbox Series X",
    price: "$499",
    compareAtPrice: "$549",
    rating: 4,
    reviewCount: 288,
    badgeText: "-9%",
  },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const { themed } = useAppTheme();

  const currentPage = useMemo(() => {
    const p = searchParams.get("page");
    const n = p ? parseInt(p, 10) : 1;
    return Number.isFinite(n) && n >= 1 ? n : 1;
  }, [searchParams]);

  const totalPages = Math.ceil(ALL_PRODUCTS.length / ITEMS_PER_PAGE);
  const safePage = Math.min(currentPage, totalPages) || 1;
  const start = (safePage - 1) * ITEMS_PER_PAGE;
  const productsOnPage = ALL_PRODUCTS.slice(start, start + ITEMS_PER_PAGE);

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.contentRow)}>
          <ProductSideHeader />
          <div style={themed(styles.mainContent)}>
            <main style={themed(styles.shell)}>
              <h1 style={themed(styles.title)}>Sản phẩm</h1>
              <div style={themed(styles.grid)}>
                {productsOnPage.map((product) => (
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
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                basePath="/products"
                searchParam="page"
              />
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const { themed } = useAppTheme();

  return (
    <Suspense fallback={<div style={themed(styles.fallback)}>Đang tải...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
