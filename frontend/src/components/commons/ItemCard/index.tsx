"use client";

import Image from "next/image";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth";
import { addToCart } from "@/features/cart/store/cartSlice";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { useAppTheme } from "@/theme/ThemeProvider";
import { getAxiosInstance } from "@/services/axiosConfig";
import * as styles from "./styles";
import { ItemCardProps } from "@/types/itemCard";

const clampRating = (value: number) => Math.min(5, Math.max(0, value));

export default function ItemCard({
  productId,
  title,
  price,
  compareAtPrice,
  rating = 0,
  reviewCount = 0,
  badgeText = "-8%",
  imageSrc,
  imageAlt = "Product image",
  ctaLabel = "Buy now",
}: ItemCardProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [adding, setAdding] = useState(false);
  const [safeImageSrc, setSafeImageSrc] = useState<string | null>(
    imageSrc || null,
  );
  const lastClickTrackRef = useRef(0);
  const { theme, themed } = useAppTheme();

  useEffect(() => {
    setSafeImageSrc(imageSrc || null);
  }, [imageSrc]);

  const normalizedRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const normalizedReviewCount = Number.isFinite(Number(reviewCount))
    ? Math.max(0, Number(reviewCount))
    : 0;
  const filledStars = Math.round(clampRating(normalizedRating));
  const emptyStarColor = theme.colors.palette.text.muted;
  const filledStarColor = theme.colors.palette.semantic.warning;

  const handleAddToCart = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productId || !Number.isFinite(productId)) {
      showErrorToast("Sản phẩm này chưa thể thêm vào giỏ");
      return;
    }
    if (!isAuthenticated) {
      showErrorToast("Vui lòng đăng nhập để thêm vào giỏ hàng");
      router.push("/login");
      return;
    }
    if (adding) return;

    try {
      setAdding(true);
      await dispatch(
        addToCart({ product_id: Number(productId), quantity: 1 }),
      ).unwrap();
      showSuccessToast("Đã thêm vào giỏ hàng");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setAdding(false);
    }
  };

  const trackCardClick = () => {
    if (!isAuthenticated) return;
    if (!productId || !Number.isFinite(productId)) return;
    const now = Date.now();
    if (now - lastClickTrackRef.current < 500) return;
    lastClickTrackRef.current = now;
    const api = getAxiosInstance();
    void api
      .post("/events/product", {
        product_id: Number(productId),
        event_type: "click",
        meta: { source: "item_card" },
      })
      .catch(() => {});
  };

  return (
    <article style={themed(styles.card)} onClick={trackCardClick}>
      <div style={themed(styles.media)}>
        {safeImageSrc ? (
          <Image
            src={safeImageSrc}
            alt={imageAlt}
            width={320}
            height={400}
            style={themed(styles.mediaImage)}
            unoptimized
            onError={() => setSafeImageSrc(null)}
          />
        ) : (
          <div style={themed(styles.mediaPlaceholder)}>Preview</div>
        )}
        <span style={themed(styles.badge)}>{badgeText}</span>
      </div>
      <div style={themed(styles.content)}>
        <h3 style={themed(styles.title)}>{title}</h3>
        <div style={themed(styles.priceRow)}>
          <span style={themed(styles.price)}>{price}</span>
          {compareAtPrice ? (
            <span style={themed(styles.comparePrice)}>{compareAtPrice}</span>
          ) : null}
        </div>
        <div style={themed(styles.ratingRow)}>
          <div style={themed(styles.ratingStars)} aria-hidden="true">
            {Array.from({ length: 5 }).map((_, index) => {
              const isFilled = index < filledStars;
              return (
                <svg
                  key={index}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill={isFilled ? "currentColor" : "none"}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    ...themed(styles.star),
                    color: isFilled ? filledStarColor : emptyStarColor,
                  }}
                >
                  <path d="m12 2 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 16.9 6.1 20l1.2-6.5L2.5 8.9l6.6-.9z" />
                </svg>
              );
            })}
          </div>
          <span style={themed(styles.ratingCount)}>
            ({normalizedReviewCount})
          </span>
        </div>
      </div>
      <div style={themed(styles.actions)}>
        <button type="button" style={themed(styles.primaryButton)}>
          {ctaLabel}
        </button>
        <button
          type="button"
          style={themed(styles.iconButton)}
          aria-label="Add to cart"
          data-nprogress-ignore="true"
          onClick={handleAddToCart}
          disabled={adding}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
          </svg>
        </button>
      </div>
    </article>
  );
}
