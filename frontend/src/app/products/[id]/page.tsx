"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import ItemCard from "@/components/commons/ItemCard";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Theme } from "@/theme";
import { fetchProductById, clearSelectedProduct } from "@/features/products/store/productSlice";
import { 
  selectSelectedProduct, 
  selectProductDetailLoading,
  selectProducts 
} from "@/features/products/store/productSelectors";
import { addToCart } from "@/features/cart/store/cartSlice";
import { selectIsAuthenticated } from "@/features/auth";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { getAxiosInstance } from "@/services/axiosConfig";
import { formatPrice } from "@/utils/formatPrice";
import * as styles from "./styles";

function renderStars(
  rating: number,
  theme: Theme
) {
  const safeRating = rating || 0;
  const full = Math.floor(safeRating);
  const half = safeRating % 1 >= 0.5;
  const stars = [];
  for (let i = 0; i < full; i++)
    stars.push(
      <span key={`full-${i}`} style={{ color: theme.colors.palette.semantic.warning }}>
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
      <span key={`empty-${i}`} style={{ color: theme.colors.palette.text.muted }}>
        ☆
      </span>
    );
  return stars;
}

function parseVariantKey(raw?: string | null) {
  if (!raw) return {};
  return raw
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const [key, ...rest] = item.split("=");
      const normalizedKey = (key || "").trim().toLowerCase();
      const value = rest.join("=").trim();
      if (!normalizedKey || !value) return acc;
      acc[normalizedKey] = value;
      return acc;
    }, {});
}

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const dispatch = useAppDispatch();
  const { theme, themed } = useAppTheme();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  
  const product = useAppSelector(selectSelectedProduct);
  const loading = useAppSelector(selectProductDetailLoading);
  const allProducts = useAppSelector(selectProducts);

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
      reviewer?: { id: number; username: string };
    }>
  >([]);

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
        setReviews(Array.isArray(res?.data?.data?.reviews) ? res.data.data.reviews : []);
      } catch {
        setReviews([]);
      }
    };
    run();
  }, [id]);

  const recommended = useMemo(
    () => allProducts.filter((p) => String(p.id) !== id).slice(0, 4),
    [id, allProducts]
  );

  const specOptions = useMemo(() => product?.spec_options ?? [], [product]);
  const variantInventory = useMemo(
    () => product?.variant_inventory ?? [],
    [product],
  );

  useEffect(() => {
    if (!product) return;
    const fromVariant = parseVariantKey(
      typeof product.variant_key === "string" ? product.variant_key : null,
    );
    const defaults: Record<string, string> = { ...fromVariant };
    specOptions.forEach((opt) => {
      if (!defaults[opt.key] && opt.values.length > 0) {
        defaults[opt.key] = opt.values[0].value;
      }
    });
    setSelectedSpecs(defaults);
  }, [product, specOptions]);

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

  const ensureAuth = () => {
    if (isAuthenticated) return true;
    showErrorToast("Vui lòng đăng nhập để tiếp tục");
    router.push("/login");
    return false;
  };

  const handleAddToCart = async () => {
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
              {product.name}
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
              <h1 style={themed(styles.productTitle)}>{product.name}</h1>
              <div style={themed(styles.ratingRow)}>
                <span style={{ display: "flex", gap: 2 }}>
                  {renderStars(product.rating, theme)}
                </span>
                <span>({reviews.length || product.reviewCount || 0} đánh giá)</span>
                {product.buyturn && (
                  <span>| {product.buyturn} đã bán</span>
                )}
              </div>
              <div style={themed(styles.priceRow)}>
                <span style={themed(styles.price)}>{formatPrice(product.price)}</span>
                {product.compareAtPrice && (
                  <span style={themed(styles.comparePrice)}>
                    {formatPrice(product.compareAtPrice)}
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
                    ...(isOutOfStock ? { color: "#ef4444", fontWeight: 700 } : {}),
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
                  disabled={addingToCart || !selectedListingId || isOutOfStock}
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
                  disabled={addingToCart || !selectedListingId || isOutOfStock}
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
                <span style={themed(styles.shopAvatar)}>🏠</span>
                <div>
                  <h3 style={themed(styles.shopName)}>{product.store.name}</h3>
                  <p style={themed(styles.shopMeta)}>★ {product.store.rating || 0} · 85 sản phẩm</p>
                </div>
              </div>
              <div style={themed(styles.shopButtons)}>
                <button
                  type="button"
                  style={themed(styles.outlineButton)}
                  onClick={() => showSuccessToast("Tính năng chat đang được cập nhật")}
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
                  {product.attributes && product.attributes.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: theme.spacing.lg, color: theme.colors.palette.text.secondary, fontSize: theme.typography.fontSize.sm.size, lineHeight: 1.8 }}>
                      {product.attributes.map((attr) => (
                        <li key={attr.id}>
                          <strong>{attr.attr_key}:</strong> {attr.attr_value}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Không có thông số kỹ thuật chi tiết.</p>
                  )}
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
                        {variantInventory.map((variant) => (
                          <li key={variant.variant_key}>
                            <strong>{variant.variant_key}</strong>: {variant.quantity} sản phẩm
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {activeTab === "reviews" && (
              <div style={themed(styles.tabContent)}>
                {reviews.length === 0 ? (
                  <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                ) : (
                  <div style={{ display: "grid", gap: 12 }}>
                    {reviews.map((review) => (
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
                        </div>
                        <div>{review.comment || "(Không có nhận xét)"}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {recommended.length > 0 && (
            <section style={{ marginTop: theme.spacing["3xl"] }}>
              <h2 style={themed(styles.sectionTitle)}>Gợi ý cho bạn</h2>
              <div style={themed(styles.recommendedGrid)}>
                {recommended.map((p) => (
                  <Link key={p.id} href={`/products/${p.id}`} style={{ textDecoration: "none" }}>
                    <ItemCard
                      productId={Number(p.id)}
                      title={p.name}
                      price={formatPrice(p.price)}
                      compareAtPrice={p.compareAtPrice ? formatPrice(p.compareAtPrice) : undefined}
                      rating={p.rating}
                      reviewCount={p.reviewCount}
                      badgeText={p.badgeText}
                      imageSrc={p.default_image}
                    />
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
