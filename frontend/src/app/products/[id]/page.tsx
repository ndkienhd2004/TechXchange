"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Theme } from "@/theme";
import type { Product as ProductRow } from "@/features/products/types";
import { fetchProductById, clearSelectedProduct } from "@/features/products/store/productSlice";
import { 
  selectSelectedProduct, 
  selectProductDetailLoading
} from "@/features/products/store/productSelectors";
import { addToCart } from "@/features/cart/store/cartSlice";
import ItemCard from "@/components/commons/ItemCard";
import { selectIsAuthenticated } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { getAxiosInstance } from "@/services/axiosConfig";
import { openChatWithStore } from "@/features/chat/utils/openChat";
import { buildProductDisplayName } from "@/features/products/utils/displayName";
import {
  buildAuthRedirectHref,
  buildCurrentPath,
} from "@/features/auth/utils/redirect";
import * as styles from "./styles";

function renderStars(
  rating: number,
  theme: Theme
) {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const fillPercent = Math.max(0, Math.min(100, (safeRating - (i - 1)) * 100));
    stars.push(
      <span
        key={`star-${i}`}
        style={{
          position: "relative",
          width: 16,
          height: 16,
          display: "inline-block",
          lineHeight: "16px",
        }}
      >
        <span style={{ color: theme.colors.palette.text.muted, position: "absolute", inset: 0 }}>
          ★
        </span>
        <span
          style={{
            color: theme.colors.palette.semantic.warning,
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            width: `${fillPercent}%`,
            whiteSpace: "nowrap",
          }}
        >
          ★
        </span>
      </span>
    );
  }
  return stars;
}

function toHalfStep(value: number) {
  const v = Number.isFinite(Number(value)) ? Number(value) : 0;
  const clamped = Math.max(0, Math.min(5, v));
  return Math.round(clamped * 2) / 2;
}

function formatVariantLabel(variant: {
  variant_label?: string;
  serial_code?: string;
  attributes?: Record<string, string>;
}) {
  if (variant.variant_label) return variant.variant_label;
  const attributes = variant.attributes || {};
  const entries = Object.entries(attributes).filter(
    ([key, value]) => Boolean(key && value),
  );
  if (entries.length > 0) {
    return entries
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([key, value]) => `${key}=${value}`)
      .join("|");
  }
  return variant.serial_code || "Mặc định";
}

export default function ProductDetailPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const dispatch = useAppDispatch();
  const { theme, themed } = useAppTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const product = useAppSelector(selectSelectedProduct);
  const loading = useAppSelector(selectProductDetailLoading);

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<
    "description" | "specs" | "reviews"
  >("description");
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [reviews, setReviews] = useState<
    Array<{
      id: number;
      rating: number;
      comment: string;
      created_at: string;
      images?: string[];
      reviewer?: { id: number; username: string };
    }>
  >([]);
  const [reviewFilter, setReviewFilter] = useState<"all" | number>("all");
  const [recommendedProducts, setRecommendedProducts] = useState<ProductRow[]>(
    [],
  );
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [shopLogoError, setShopLogoError] = useState(false);
  const [resolvedStoreLogoUrl, setResolvedStoreLogoUrl] = useState("");

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (!id) return;
    const run = async () => {
      try {
        const api = getAxiosInstance();
        const res = await api.get(`/reviews/product/${id}`);
        const rows = Array.isArray(res?.data?.data?.reviews) ? res.data.data.reviews : [];
        setReviews(
          rows.map((item) => ({
            ...item,
            rating: toHalfStep(Number(item.rating || 0)),
          })),
        );
      } catch {
        setReviews([]);
      }
    };
    run();
  }, [id]);

  useEffect(() => {
    if (!id) {
      setRecommendedProducts([]);
      return;
    }

    const run = async () => {
      setLoadingRecommendations(true);
      try {
        const api = getAxiosInstance();
        const res = await api.get(`/products/${id}/recommendations`, {
          params: { limit: 8, mode: "content" },
        });
        const rows = Array.isArray(res?.data?.data?.products)
          ? res.data.data.products
          : [];
        const currentProductId = Number(id);
        setRecommendedProducts(
          rows.filter(
            (row: ProductRow) => Number(row?.id) !== currentProductId,
          ),
        );
      } catch {
        setRecommendedProducts([]);
      } finally {
        setLoadingRecommendations(false);
      }
    };

    void run();
  }, [id]);

  useEffect(() => {
    const storeId = Number(product?.store_id || 0);
    const inlineLogo = String(product?.store?.logo || "").trim();
    if (!storeId) {
      setResolvedStoreLogoUrl("");
      return;
    }
    if (inlineLogo) {
      setResolvedStoreLogoUrl(inlineLogo);
      return;
    }

    let isCancelled = false;
    const run = async () => {
      try {
        const api = getAxiosInstance();
        const storeRes = await api.get(`/stores/${storeId}`);
        const storeLogo = String(storeRes?.data?.data?.logo || "").trim();
        if (!isCancelled) {
          setResolvedStoreLogoUrl(storeLogo);
        }
      } catch {
        if (!isCancelled) {
          setResolvedStoreLogoUrl("");
        }
      }
    };
    void run();

    return () => {
      isCancelled = true;
    };
  }, [product?.store?.logo, product?.store_id]);

  const specOptions = useMemo(() => product?.spec_options ?? [], [product]);
  const variantInventory = useMemo(
    () => product?.variant_inventory ?? [],
    [product],
  );
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return Number(product?.rating || 0);
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0);
    return toHalfStep(total / reviews.length);
  }, [reviews, product?.rating]);
  const ratingSteps = useMemo(() => {
    const rows: number[] = [];
    for (let value = 5; value >= 1; value -= 0.5) {
      rows.push(Number(value.toFixed(1)));
    }
    return rows;
  }, []);
  const reviewBuckets = useMemo(() => {
    const bucket: Record<string, number> = {};
    ratingSteps.forEach((step) => {
      bucket[String(step)] = 0;
    });
    reviews.forEach((item) => {
      const key = String(toHalfStep(Number(item.rating || 0)));
      bucket[key] = (bucket[key] || 0) + 1;
    });
    return bucket;
  }, [reviews, ratingSteps]);
  const filteredReviews = useMemo(() => {
    if (reviewFilter === "all") return reviews;
    return reviews.filter((item) => toHalfStep(Number(item.rating || 0)) === reviewFilter);
  }, [reviews, reviewFilter]);

  useEffect(() => {
    if (!product) return;
    const currentListingId = Number(id);
    const variantFromCurrentListing = Number.isFinite(currentListingId)
      ? variantInventory.find((variant) =>
          Array.isArray(variant.listing_ids) &&
          variant.listing_ids.some((listingId) => Number(listingId) === currentListingId),
        )
      : undefined;
    const defaultsFromCurrentListing = variantFromCurrentListing?.attributes
      ? { ...variantFromCurrentListing.attributes }
      : {};
    const defaultsFromFirstAvailable =
      variantInventory.length > 0 ? { ...(variantInventory[0].attributes || {}) } : {};
    const defaults: Record<string, string> = {
      ...defaultsFromFirstAvailable,
      ...defaultsFromCurrentListing,
    };
    specOptions.forEach((opt) => {
      if (!defaults[opt.key] && opt.values.length > 0) {
        defaults[opt.key] = opt.values[0].value;
      }
    });

    const matched = variantInventory.find((variant) =>
      specOptions.every((opt) => defaults[opt.key] === variant.attributes?.[opt.key]),
    );
    if (!matched && variantInventory[0]?.attributes) {
      setSelectedSpecs({ ...(variantInventory[0].attributes || {}) });
      return;
    }
    setSelectedSpecs(defaults);
  }, [id, product, specOptions, variantInventory]);

  useEffect(() => {
    setShopLogoError(false);
  }, [product?.store?.logo, resolvedStoreLogoUrl]);

  if (loading && !product) {
    return (
      <div style={{ ...themed(styles.page), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: theme.colors.palette.text.primary }}>Đang tải thông tin sản phẩm...</p>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div style={{ ...themed(styles.page), display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: theme.colors.palette.text.primary }}>Không tìm thấy sản phẩm.</p>
      </div>
    );
  }

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : [{ id: 0, url: product?.default_image || "", sort_order: 0 }];

  const currentMainImage = productImages[mainImageIndex]?.url || product?.default_image;

  if (!product) return null;

  const shopLogoUrl = String(product.store?.logo || resolvedStoreLogoUrl || "").trim();
  const hasShopLogo =
    Boolean(shopLogoUrl) &&
    shopLogoUrl !== "null" &&
    shopLogoUrl !== "undefined" &&
    !shopLogoError;
  const shopInitial = String(product.store?.name || "S").charAt(0).toUpperCase();

  const selectedVariant = variantInventory.find((variant) =>
    specOptions.every((opt) => selectedSpecs[opt.key] === variant.attributes?.[opt.key]),
  );
  const hasVariantSelection = specOptions.length > 0;
  const availableStock = hasVariantSelection
    ? Number(selectedVariant?.quantity ?? 0)
    : Number(product.quantity ?? 0);
  const isOutOfStock = availableStock <= 0;
  const selectedListingId = hasVariantSelection
    ? selectedVariant?.listing_ids?.[0]
      ? Number(selectedVariant.listing_ids[0])
      : null
    : Number(product.id);
  const maxStock = Math.max(1, availableStock);
  const normalizedQuantity = Math.max(1, Math.min(maxStock, quantity));
  const displayPrice = hasVariantSelection
    ? Number(selectedVariant?.min_price ?? product.price ?? 0)
    : Number(product.price || 0);
  const displayProductName = buildProductDisplayName(
    product.name,
    hasVariantSelection ? selectedSpecs : product.primary_serial_specs,
  );
  const loginRedirectHref = buildAuthRedirectHref(
    "/login",
    buildCurrentPath(pathname, searchParams),
  );

  const ensureAuth = () => {
    if (isAuthenticated) return true;
    showErrorToast("Vui lòng đăng nhập để tiếp tục");
    router.push(loginRedirectHref);
    return false;
  };

  const handleAddToCart = async () => {
    if (isOutOfStock) {
      showErrorToast("Sản phẩm đã hết hàng");
      return;
    }
    if (!selectedListingId) {
      showErrorToast("Biến thể đã hết hàng");
      return;
    }
    if (!ensureAuth()) return;
    if (addingToCart) return;
    if (!product.id) {
      showErrorToast("Không thể thêm sản phẩm này vào giỏ");
      return;
    }

    try {
      setAddingToCart(true);
      await dispatch(
        addToCart({
          product_id: selectedListingId,
          quantity: normalizedQuantity,
        }),
      ).unwrap();
      showSuccessToast("Đã thêm sản phẩm vào giỏ hàng");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (isOutOfStock) {
      showErrorToast("Sản phẩm đã hết hàng");
      return;
    }
    if (!selectedListingId) {
      showErrorToast("Biến thể đã hết hàng");
      return;
    }
    if (!ensureAuth()) return;
    if (addingToCart) return;
    if (!product.id) {
      showErrorToast("Không thể mua sản phẩm này");
      return;
    }

    try {
      setAddingToCart(true);
      const cartData = await dispatch(
        addToCart({
          product_id: selectedListingId,
          quantity: normalizedQuantity,
        }),
      ).unwrap();
      const addedLine = Array.isArray(cartData?.items)
        ? cartData.items.find((item) => Number(item.product_id) === selectedListingId)
        : undefined;
      if (addedLine?.id) {
        router.push(`/checkout?cart_item_ids=${addedLine.id}`);
      } else {
        router.push("/checkout");
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.shell)}>
          <nav style={themed(styles.breadcrumb)} aria-label="Breadcrumb">
            <Link href="/" style={themed(styles.breadcrumbLink)}>
              Trang chủ
            </Link>
            {" > "}
            <Link href="/products" style={themed(styles.breadcrumbLink)}>
              Sản phẩm
            </Link>
            {" > "}
            <span style={{ color: theme.colors.palette.text.primary }}>
              {displayProductName}
            </span>
          </nav>

          <div style={themed(styles.mainRow)}>
            <div style={themed(styles.galleryWrap)}>
              <div style={themed(styles.thumbnails)}>
                {productImages.map((img, i) => (
                  <div
                    key={img.id || i}
                    style={{
                      ...themed(styles.thumbnail),
                      border: i === mainImageIndex ? `2px solid ${theme.colors.palette.brand.purple[500]}` : "none"
                    }}
                    onClick={() => setMainImageIndex(i)}
                    role="button"
                    tabIndex={0}
                  >
                    {img.url ? (
                      <Image 
                        src={img.url} 
                        alt={`${product.name} ${i}`} 
                        width={80} 
                        height={80} 
                        style={{ objectFit: "cover", borderRadius: "4px" }}
                      />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: theme.colors.palette.backgrounds.secondary }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={themed(styles.mainImage)}>
                {currentMainImage ? (
                  <Image 
                    src={currentMainImage} 
                    alt={product.name} 
                    fill
                    style={{ objectFit: "contain", borderRadius: theme.spacing.lg }}
                  />
                ) : (
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
                    Không có ảnh
                  </div>
                )}
                <button
                  type="button"
                  style={{ ...themed(styles.galleryNav), left: theme.spacing[2] }}
                  onClick={() => setMainImageIndex(prev => prev > 0 ? prev - 1 : productImages.length - 1)}
                >
                  ‹
                </button>
                <button
                  type="button"
                  style={{ ...themed(styles.galleryNav), right: theme.spacing[2] }}
                  onClick={() => setMainImageIndex(prev => (prev + 1) % productImages.length)}
                >
                  ›
                </button>
              </div>
            </div>

            <div style={themed(styles.infoColumn)}>
              <h1 style={themed(styles.productTitle)}>{displayProductName}</h1>
              <div style={themed(styles.ratingRow)}>
                <span style={{ display: "flex", gap: 2 }}>
                  {renderStars(averageRating, theme)}
                </span>
                <span>{averageRating.toFixed(1)}</span>
                <span>({reviews.length || product.reviewCount || 0} đánh giá)</span>
                {product.buyturn && (
                  <span>| {product.buyturn} đã bán</span>
                )}
              </div>
              <div style={themed(styles.priceRow)}>
                <span style={themed(styles.price)}>
                  {`${displayPrice.toLocaleString("vi-VN")} đ`}
                </span>
                {product.compareAtPrice && (
                  <span style={themed(styles.comparePrice)}>
                    {`${Number(product.compareAtPrice || 0).toLocaleString("vi-VN")} đ`}
                  </span>
                )}
                {product.badgeText && (
                  <span style={themed(styles.discountBadge)}>
                    {product.badgeText}
                  </span>
                )}
              </div>
              <p style={themed(styles.description)}>{product.description}</p>

              {product.brand && (
                <div style={themed(styles.fieldRow)}>
                  <span style={themed(styles.fieldLabel)}>Thương hiệu</span>
                  <span style={{ color: theme.colors.palette.text.primary }}>{product.brand.name}</span>
                </div>
              )}

              {specOptions.length > 0 && (
                <div style={themed(styles.fieldRow)}>
                  <span style={themed(styles.fieldLabel)}>Tùy chọn</span>
                  <div style={{ display: "grid", gap: 10, flex: 1 }}>
                    {specOptions.map((spec) => (
                      <div
                        key={spec.key}
                        style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}
                      >
                        <span style={{ minWidth: 90, color: theme.colors.palette.text.secondary }}>
                          {spec.key}
                        </span>
                        <select
                          value={selectedSpecs[spec.key] ?? ""}
                          onChange={(e) =>
                            setSelectedSpecs((prev) => ({
                              ...prev,
                              [spec.key]: e.target.value,
                            }))
                          }
                          style={themed(styles.select)}
                        >
                          {spec.values.map((valueRow) => (
                            <option key={`${spec.key}-${valueRow.value}`} value={valueRow.value}>
                              {valueRow.value}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={themed(styles.fieldRow)}>
                <span style={themed(styles.fieldLabel)}>Số lượng</span>
                <div style={themed(styles.quantityWrap)}>
                  <button
                    type="button"
                    style={themed(styles.quantityBtn)}
                    onClick={() => setQuantity(Math.max(1, normalizedQuantity - 1))}
                    disabled={isOutOfStock}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={maxStock}
                    value={normalizedQuantity}
                    onChange={(e) =>
                      setQuantity(
                        Math.max(1, Math.min(maxStock, Number(e.target.value) || 1))
                      )
                    }
                    style={themed(styles.quantityInput)}
                    disabled={isOutOfStock}
                  />
                  <button
                    type="button"
                    style={themed(styles.quantityBtn)}
                    onClick={() => setQuantity(Math.min(maxStock, normalizedQuantity + 1))}
                    disabled={isOutOfStock}
                  >
                    +
                  </button>
                </div>
                <span
                  style={{
                    ...themed(styles.quantityNote),
                    ...(isOutOfStock
                      ? {
                          color: theme.colors.palette.semantic.error,
                          fontWeight: 700,
                        }
                      : {}),
                  }}
                >
                  {isOutOfStock ? "Không có hàng" : `${availableStock} sản phẩm có sẵn`}
                </span>
              </div>
              <div style={themed(styles.buttonRow)}>
                <button
                  type="button"
                  style={themed(styles.primaryButton)}
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6" />
                  </svg>
                  {addingToCart ? "Đang xử lý..." : "Thêm vào giỏ hàng"}
                </button>
                <button
                  type="button"
                  style={themed(styles.secondaryButton)}
                  onClick={handleBuyNow}
                  disabled={addingToCart}
                >
                  Mua ngay
                </button>
              </div>
              <ul style={themed(styles.policyList)}>
                <li style={themed(styles.policyItem)}>✓ Miễn phí vận chuyển cho đơn hàng trên 500k</li>
                <li style={themed(styles.policyItem)}>✓ Đổi trả trong vòng 30 ngày</li>
                <li style={themed(styles.policyItem)}>✓ Thanh toán an toàn và bảo mật</li>
              </ul>
            </div>
          </div>

          {product.store && (
            <div style={themed(styles.shopCard)}>
              <div style={themed(styles.shopInfo)}>
                <span style={themed(styles.shopAvatar)}>
                  {hasShopLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={shopLogoUrl}
                      alt={product.store.name || "Shop logo"}
                      style={themed(styles.shopAvatarImage)}
                      onError={() => setShopLogoError(true)}
                    />
                  ) : (
                    shopInitial
                  )}
                </span>
                <div>
                  <h3 style={themed(styles.shopName)}>{product.store.name}</h3>
                  <p style={themed(styles.shopMeta)}>★ {product.store.rating || 0} · 85 sản phẩm</p>
                </div>
              </div>
              <div style={themed(styles.shopButtons)}>
                <button
                  type="button"
                  style={themed(styles.outlineButton)}
                  onClick={() => openChatWithStore(Number(product.store_id))}
                >
                  Chat ngay
                </button>
                <Link href={`/shops/${product.store_id}`} style={{ textDecoration: "none" }}>
                  <button type="button" style={themed(styles.outlineButton)}>Xem cửa hàng</button>
                </Link>
              </div>
            </div>
          )}

          <div style={{ marginTop: theme.spacing["2xl"] }}>
            <div style={themed(styles.tabs)}>
              <button
                type="button"
                style={activeTab === "description" ? themed(styles.tabActive) : themed(styles.tab)}
                onClick={() => setActiveTab("description")}
              >
                Mô tả sản phẩm
              </button>
              <button
                type="button"
                style={activeTab === "specs" ? themed(styles.tabActive) : themed(styles.tab)}
                onClick={() => setActiveTab("specs")}
              >
                Thông số kỹ thuật
              </button>
              <button
                type="button"
                style={activeTab === "reviews" ? themed(styles.tabActive) : themed(styles.tab)}
                onClick={() => setActiveTab("reviews")}
              >
                Đánh giá ({reviews.length})
              </button>
            </div>
            
            {activeTab === "description" && (
              <div style={themed(styles.tabContent)}>
                <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
              </div>
            )}
            
            {activeTab === "specs" && (
              <div style={themed(styles.tabContent)}>
                <div style={{ display: "grid", gap: 12 }}>
                  {variantInventory.length > 0 && (
                    <div>
                      <h4 style={{ margin: "0 0 8px 0", color: theme.colors.palette.text.primary }}>
                        Tồn kho theo biến thể
                      </h4>
                      <ul
                        style={{
                          margin: 0,
                          paddingLeft: theme.spacing.lg,
                          color: theme.colors.palette.text.secondary,
                          fontSize: theme.typography.fontSize.sm.size,
                          lineHeight: 1.8,
                        }}
                      >
                        {variantInventory.map((variant, variantIndex) => (
                          <li
                            key={
                              variant.serial_id
                                ? String(variant.serial_id)
                                : `${variant.serial_code || "variant"}-${variantIndex}`
                            }
                          >
                            <strong>{formatVariantLabel(variant)}</strong>: {variant.quantity} sản phẩm
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {variantInventory.length === 0 && (
                    <p>Không có thông số kỹ thuật chi tiết.</p>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "reviews" && (
              <div style={themed(styles.tabContent)}>
                <div style={themed(styles.reviewFilterRow)}>
                  <button
                    type="button"
                    style={
                      reviewFilter === "all"
                        ? themed(styles.reviewFilterButtonActive)
                        : themed(styles.reviewFilterButton)
                    }
                    onClick={() => setReviewFilter("all")}
                  >
                    Tất cả ({reviews.length})
                  </button>
                  {ratingSteps.map((star) => (
                    <button
                      key={star}
                      type="button"
                      style={
                        reviewFilter === star
                          ? themed(styles.reviewFilterButtonActive)
                          : themed(styles.reviewFilterButton)
                      }
                      onClick={() => setReviewFilter(star)}
                    >
                      {star.toFixed(1)} sao ({reviewBuckets[String(star)] || 0})
                    </button>
                  ))}
                </div>

                {reviews.length === 0 ? (
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : filteredReviews.length === 0 ? (
                  <p>Không có đánh giá ở mức {reviewFilter === "all" ? "này" : `${Number(reviewFilter).toFixed(1)} sao`}.</p>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {filteredReviews.map((review) => (
                      <div
                        key={review.id}
                        style={{
                          border: `1px solid ${theme.colors.palette.borders.dark}`,
                          borderRadius: theme.spacing.md,
                          padding: theme.spacing.md,
                          background: theme.colors.palette.backgrounds.card,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: 8,
                            color: theme.colors.palette.text.secondary,
                          }}
                        >
                          <span>{review.reviewer?.username || "Người dùng"}</span>
                          <span>
                            {new Date(review.created_at).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                        <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
                          {renderStars(review.rating, theme)}
                          <span style={{ color: theme.colors.palette.text.secondary }}>
                            {Number(review.rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <div>{review.comment || "(Không có nhận xét)"}</div>
                        {Array.isArray(review.images) && review.images.length > 0 && (
                          <div style={themed(styles.reviewImagesGrid)}>
                            {review.images.map((imageUrl, imageIndex) => (
                              <Image
                                key={`${review.id}-${imageIndex}`}
                                src={imageUrl}
                                alt={`review-${review.id}-${imageIndex + 1}`}
                                width={120}
                                height={88}
                                style={themed(styles.reviewImageItem)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {(loadingRecommendations || recommendedProducts.length > 0) && (
            <section style={{ marginTop: theme.spacing["3xl"] }}>
              <h2 style={themed(styles.sectionTitle)}>Gợi ý cho bạn</h2>
              {loadingRecommendations ? (
                <p style={{ color: theme.colors.palette.text.secondary }}>
                  Đang tải gợi ý sản phẩm...
                </p>
              ) : (
                <div style={themed(styles.recommendedGrid)}>
                  {recommendedProducts.map((recommendedProduct) => (
                    <Link
                      key={String(recommendedProduct.id)}
                      href={`/products/${recommendedProduct.id}`}
                      style={{ textDecoration: "none" }}
                    >
                      <ItemCard
                        productId={Number(recommendedProduct.id)}
                        title={buildProductDisplayName(
                          recommendedProduct.name,
                          recommendedProduct.primary_serial_specs ||
                            (recommendedProduct.catalog?.specs as
                              | Record<string, unknown>
                              | undefined),
                        )}
                        price={`${Number(
                          recommendedProduct.price || 0,
                        ).toLocaleString("vi-VN")} đ`}
                        rating={Number(recommendedProduct.rating || 0)}
                        reviewCount={Number(
                          recommendedProduct.reviewCount ??
                            recommendedProduct.review_count ??
                            recommendedProduct.buyturn ??
                            recommendedProduct.quantity ??
                            0,
                        )}
                        imageSrc={
                          recommendedProduct.images?.[0]?.url ||
                          recommendedProduct.default_image ||
                          undefined
                        }
                      />
                    </Link>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
