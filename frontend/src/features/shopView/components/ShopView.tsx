"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useAppTheme } from "@/theme/ThemeProvider";
import { getAxiosInstance } from "@/services/axiosConfig";
import { showErrorToast } from "@/components/commons/Toast";
import * as styles from "./styles";
import { openChatWithStore } from "@/features/chat/utils/openChat";
import ItemCard from "@/components/commons/ItemCard";
import { buildProductDisplayName } from "@/features/products/utils/displayName";

type StoreInfo = {
  id: number;
  name: string;
  logo?: string | null;
  description?: string | null;
  rating?: number | null;
  address_line?: string | null;
  district?: string | null;
  province?: string | null;
  created_at?: string;
  owner?: { id: number; username?: string; phone?: string | null };
  stats?: {
    products_count?: number;
    active_products?: number;
    sold_count?: number;
  };
};

type StoreProduct = {
  id: number;
  name: string;
  price: number | string;
  status: string;
  quantity?: number;
  rating?: number;
  reviewCount?: number | string | null;
  review_count?: number | string | null;
  buyturn?: number | string | null;
  created_at?: string;
  images?: Array<{ id: number; url: string }>;
  default_image?: string;
  catalog?: {
    category?: { id: number; name: string };
  };
};

type SortBy = "latest" | "priceAsc" | "priceDesc";
type MainTab = "products" | "reviews" | "about";

export default function ShopView() {
  const { themed } = useAppTheme();
  const params = useParams();
  const storeId = Number(params?.id);
  const [viewportWidth, setViewportWidth] = useState(1280);

  const [store, setStore] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState<MainTab>("products");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("latest");
  const [storeLogoError, setStoreLogoError] = useState(false);

  useEffect(() => {
    const update = () => setViewportWidth(window.innerWidth || 1280);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const loadStoreData = async (nextPage = 1) => {
    if (!storeId) return;
    try {
      setLoading(true);
      const api = getAxiosInstance();
      const sortByParam = sortBy === "latest" ? "created_at" : "price";
      const sortOrderParam = sortBy === "priceAsc" ? "ASC" : "DESC";
      const [storeRes, productRes] = await Promise.all([
        api.get(`/stores/${storeId}`),
        api.get("/products", {
          params: {
            store_id: storeId,
            status: "active,sold_out",
            page: nextPage,
            limit: 12,
            q: debouncedSearch || undefined,
            sort_by: sortByParam,
            sort_order: sortOrderParam,
          },
        }),
      ]);

      setStore(storeRes?.data?.data || null);

      const productRows = Array.isArray(productRes?.data?.data?.products)
        ? productRes.data.data.products
        : [];
      setProducts(productRows);
      setTotalPages(Number(productRes?.data?.data?.totalPages || 1));
    } catch (error) {
      showErrorToast(error);
      setStore(null);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [sortBy]);

  useEffect(() => {
    if (!storeId) return;
    loadStoreData(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, page, debouncedSearch, sortBy]);

  useEffect(() => {
    setStoreLogoError(false);
  }, [store?.logo]);

  const visibleProducts = useMemo(() => products, [products]);

  if (!storeId) {
    return (
      <div style={themed(styles.page)}>
        <div style={themed(styles.container)}>ID cửa hàng không hợp lệ.</div>
      </div>
    );
  }

  const joinDate = store?.created_at
    ? new Date(store.created_at).toLocaleDateString("vi-VN")
    : "-";
  const locationText =
    [store?.district, store?.province].filter(Boolean).join(", ") || "Việt Nam";
  const isTablet = viewportWidth < 1180;
  const isMobile = viewportWidth < 500;
  const storeLogoUrl = String(store?.logo || "").trim();
  const hasStoreLogo =
    Boolean(storeLogoUrl) &&
    storeLogoUrl !== "null" &&
    storeLogoUrl !== "undefined" &&
    !storeLogoError;

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.cover)} />
      <div style={themed(styles.container)}>
        {loading && (
          <div style={themed(styles.emptyText)}>
            Đang tải dữ liệu cửa hàng...
          </div>
        )}
        {!loading && !store && (
          <div style={themed(styles.emptyText)}>Không tìm thấy cửa hàng.</div>
        )}

        {store && (
          <>
            <section style={themed(styles.heroCard)}>
              <div
                style={{
                  ...themed(styles.heroTop),
                  gridTemplateColumns: isTablet
                    ? "minmax(0,1fr)"
                    : "160px minmax(0, 1fr) 170px",
                }}
              >
                <div style={themed(styles.avatarWrap)}>
                  <div style={themed(styles.avatarBox)}>
                    {hasStoreLogo ? (
                      <Image
                        fill
                        src={storeLogoUrl}
                        alt={store.name || "Store logo"}
                        sizes="160px"
                        style={themed(styles.avatarImage)}
                        onError={() => setStoreLogoError(true)}
                      />
                    ) : (
                      (store.name || "S").charAt(0).toUpperCase()
                    )}
                  </div>
                  <span style={themed(styles.verifiedDot)}>✓</span>
                </div>

                <div style={themed(styles.heroContent)}>
                  <div style={themed(styles.titleRow)}>
                    <h1 style={themed(styles.shopName)}>{store.name}</h1>
                    <span style={themed(styles.verifiedBadge)}>
                      Verified Seller
                    </span>
                  </div>
                  <p style={themed(styles.subtitle)}>
                    {store.description || "Cửa hàng công nghệ chất lượng cao"}
                  </p>

                  <div
                    style={{
                      ...themed(styles.kpiRow),
                      gridTemplateColumns: isMobile
                        ? "repeat(2, minmax(120px, 1fr))"
                        : "repeat(4, minmax(120px, 1fr))",
                    }}
                  >
                    <div style={themed(styles.kpiCard)}>
                      <div style={themed(styles.kpiValue)}>
                        ⭐ {Number(store.rating || 0).toFixed(1)}
                      </div>
                      <div style={themed(styles.kpiLabel)}>Đánh giá</div>
                    </div>
                    <div style={themed(styles.kpiCard)}>
                      <div style={themed(styles.kpiValue)}>
                        {Number(store.stats?.products_count || 0)}
                      </div>
                      <div style={themed(styles.kpiLabel)}>Sản phẩm</div>
                    </div>
                    <div style={themed(styles.kpiCard)}>
                      <div style={themed(styles.kpiValue)}>
                        {Number(store.stats?.sold_count || 0)}
                      </div>
                      <div style={themed(styles.kpiLabel)}>Đã bán</div>
                    </div>
                    <div style={themed(styles.kpiCard)}>
                      <div style={themed(styles.kpiValue)}>85%</div>
                      <div style={themed(styles.kpiLabel)}>Phản hồi</div>
                    </div>
                  </div>

                  <div style={themed(styles.metaRow)}>
                    <span>{locationText}</span>
                    <span>{store.owner?.phone || "Chưa cập nhật SĐT"}</span>
                    <span>Tham gia: {joinDate}</span>
                  </div>
                </div>

                <div
                  style={{
                    ...themed(styles.actionColumn),
                    gridTemplateColumns: isTablet ? "1fr 1fr" : undefined,
                  }}
                >
                  <button type="button" style={themed(styles.followButton)}>
                    Theo dõi
                  </button>
                  <button
                    type="button"
                    style={themed(styles.chatButton)}
                    onClick={() => openChatWithStore(Number(store.id))}
                  >
                    Chat ngay
                  </button>
                </div>
              </div>
            </section>

            <div style={themed(styles.mainTabs)}>
              <button
                type="button"
                style={
                  activeTab === "products"
                    ? themed(styles.mainTabActive)
                    : themed(styles.mainTab)
                }
                onClick={() => setActiveTab("products")}
              >
                Sản phẩm ({Number(store.stats?.products_count || 0)})
              </button>
              <button
                type="button"
                style={
                  activeTab === "reviews"
                    ? themed(styles.mainTabActive)
                    : themed(styles.mainTab)
                }
                onClick={() => setActiveTab("reviews")}
              >
                Đánh giá
              </button>
              <button
                type="button"
                style={
                  activeTab === "about"
                    ? themed(styles.mainTabActive)
                    : themed(styles.mainTab)
                }
                onClick={() => setActiveTab("about")}
              >
                Giới thiệu
              </button>
            </div>

            {activeTab === "about" && (
              <section style={themed(styles.descriptionCard)}>
                {store.description || "Cửa hàng chưa cập nhật mô tả."}
              </section>
            )}

            {activeTab === "reviews" && (
              <section style={themed(styles.descriptionCard)}>
                Đánh giá sẽ được hiển thị tại đây.
              </section>
            )}

            {activeTab === "products" && (
              <section>
                <div
                  style={{
                    ...themed(styles.toolbar),
                    gridTemplateColumns: isTablet ? "1fr" : "1fr 260px",
                    justifyContent: "stretch",
                  }}
                >
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    style={themed(styles.searchInput)}
                  />

                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                    style={themed(styles.sortSelect)}
                  >
                    <option value="latest">Mới nhất</option>
                    <option value="priceAsc">Giá tăng dần</option>
                    <option value="priceDesc">Giá giảm dần</option>
                  </select>
                </div>

                {visibleProducts.length === 0 ? (
                  <div style={themed(styles.emptyText)}>
                    Không có sản phẩm phù hợp.
                  </div>
                ) : (
                  <div style={themed(styles.productGrid)}>
                    {visibleProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        style={{ textDecoration: "none", display: "block" }}
                      >
                        <div style={themed(styles.itemCardWrap)}>
                          {Number(product.quantity || 0) <= 0 && (
                            <div style={themed(styles.soldOutLabel)}>Hết hàng</div>
                          )}
                          <ItemCard
                            productId={Number(product.id)}
                            title={buildProductDisplayName(
                              product.name,
                              product.primary_serial_specs ||
                                (product.catalog?.specs as Record<string, unknown> | undefined),
                            )}
                            price={`${Number(product.price || 0).toLocaleString("vi-VN")} đ`}
                            compareAtPrice={undefined}
                            rating={Number(
                              product.rating || store?.rating || 0,
                            )}
                            reviewCount={Number(
                              product.reviewCount ??
                                product.review_count ??
                                product.buyturn ??
                                product.quantity ??
                                0,
                            )}
                            badgeText={Number(product.quantity || 0) > 0 ? "-8%" : "Hết hàng"}
                            imageSrc={
                              product.images?.[0]?.url ||
                              product.default_image ||
                              undefined
                            }
                            imageAlt={product.name}
                            ctaLabel={Number(product.quantity || 0) > 0 ? "Buy now" : "Hết hàng"}
                          />
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                <div style={themed(styles.pagination)}>
                  <button
                    type="button"
                    style={themed(styles.pageButton)}
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  >
                    Trước
                  </button>
                  <span style={themed(styles.pageText)}>
                    Trang {page}/{Math.max(1, totalPages)}
                  </span>
                  <button
                    type="button"
                    style={themed(styles.pageButton)}
                    disabled={page >= totalPages}
                    onClick={() =>
                      setPage((prev) => Math.min(totalPages, prev + 1))
                    }
                  >
                    Sau
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
