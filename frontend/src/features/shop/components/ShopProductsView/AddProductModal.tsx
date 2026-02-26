"use client";

import { useEffect, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import {
  createShopProduct,
  getProductCatalogs,
  getShopBrands,
  getShopProducts,
  requestNewProduct,
} from "../../store";
import BrandRequestModal from "./BrandRequestModal";
import { useDebounce } from "@/utils/debounce";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

const ITEMS_PER_LIMIT = 5;

export default function AddProductModal({
  open,
  onClose,
}: AddProductModalProps) {
  const { themed, theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const { productCatalogs, productCatalogsTotalPages, brands, loading, info } =
    useAppSelector((state: RootState) => state.shop);

  const [mode, setMode] = useState<"existing" | "request">("existing");
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(
    null,
  );
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("10");

  const [requestName, setRequestName] = useState("");
  const [requestBrandId, setRequestBrandId] = useState("");
  const [requestCategoryId, setRequestCategoryId] = useState("");
  const [requestDescription, setRequestDescription] = useState("");

  // Reset page when search query changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (open) {
      dispatch(
        getProductCatalogs({
          page: currentPage,
          limit: ITEMS_PER_LIMIT,
          q: debouncedQuery,
          append: false,
        }),
      );
      dispatch(getShopBrands());
    }
  }, [open, dispatch, currentPage, debouncedQuery]);

  const handleAddExisting = async () => {
    if (!selectedCatalogId || !price || !quantity) {
      alert("Vui lòng nhập đầy đủ thông tin giá và số lượng");
      return;
    }
    const shopId = info?.id;
    if (!shopId) {
      alert("Không tìm thấy thông tin cửa hàng");
      return;
    }
    try {
      await dispatch(
        createShopProduct({
          catalog_id: parseInt(selectedCatalogId),
          store_id: parseInt(shopId),
          price: parseFloat(price),
          quantity: parseInt(quantity),
        }),
      ).unwrap();
      alert("Thêm sản phẩm thành công!");
      dispatch(getShopProducts({ page: 1, size: 10 }));
      onClose();
    } catch (err) {
      alert("Có lỗi xảy ra khi thêm sản phẩm");
    }
  };

  const handleSendRequest = async () => {
    if (!requestName || !requestCategoryId) {
      alert("Vui lòng nhập tên sản phẩm và chọn danh mục");
      return;
    }
    try {
      await dispatch(
        requestNewProduct({
          name: requestName,
          category_id: parseInt(requestCategoryId),
          brand_id: requestBrandId ? parseInt(requestBrandId) : undefined,
          description: requestDescription,
        }),
      ).unwrap();
      alert("Gửi yêu cầu thành công!");
      onClose();
    } catch (err) {
      alert("Có lỗi xảy ra khi gửi yêu cầu");
    }
  };

  if (!open) return null;

  return (
    <>
      <div style={themed(styles.modalOverlay)}>
        <div style={themed(styles.modalCard)}>
          <div style={themed(styles.modalHeader)}>
            <h3 style={themed(styles.modalTitle)}>Thêm sản phẩm</h3>
            <button
              type="button"
              style={themed(styles.modalClose)}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div style={themed(styles.modalTabs)}>
            <button
              type="button"
              style={
                mode === "existing"
                  ? themed(styles.modalTabActive)
                  : themed(styles.modalTab)
              }
              onClick={() => setMode("existing")}
            >
              Chọn từ catalog
            </button>
            <button
              type="button"
              style={
                mode === "request"
                  ? themed(styles.modalTabActive)
                  : themed(styles.modalTab)
              }
              onClick={() => setMode("request")}
            >
              Tạo request sản phẩm mới
            </button>
          </div>

          <div style={themed(styles.modalBody)}>
            {mode === "existing" ? (
              <>
                <div style={themed(styles.modalSearchRow)}>
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm trong catalog..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    style={themed(styles.modalInput)}
                  />
                </div>
                <div style={themed(styles.modalList)}>
                  {loading && productCatalogs.length === 0 ? (
                    <div style={themed(styles.modalHint)}>Đang tải...</div>
                  ) : productCatalogs.length === 0 ? (
                    <div style={themed(styles.modalHint)}>
                      Không có sản phẩm nào phù hợp.
                    </div>
                  ) : (
                    productCatalogs.map((c) => {
                      const isSelected = selectedCatalogId === c.id;
                      return (
                        <div
                          key={c.id}
                          style={themed(
                            isSelected
                              ? styles.modalProductContainerSelected
                              : styles.modalProductContainer,
                          )}
                        >
                          <label
                            style={themed(styles.modalProductRow)}
                            onClick={() => {
                              setSelectedCatalogId(c.id);
                              setPrice(c.msrp || "");
                            }}
                          >
                            <input
                              type="radio"
                              name="catalog"
                              checked={isSelected}
                              readOnly
                            />
                            <div style={themed(styles.modalProductThumb)} />
                            <div style={themed(styles.modalProductInfo)}>
                              <div
                                style={themed(styles.modalProductName)}
                                title={c.name}
                              >
                                {c.name}
                              </div>
                              <div style={themed(styles.modalProductMeta)}>
                                {c.brand?.name ?? ""} · {c.category?.name ?? ""}
                              </div>
                            </div>
                            <div style={themed(styles.modalProductPrice)}>
                              {c.msrp}
                            </div>
                          </label>
                          {isSelected && (
                            <div style={themed(styles.modalProductExpanded)}>
                              <div style={themed(styles.modalProductField)}>
                                <label
                                  style={themed(styles.modalProductSmallLabel)}
                                >
                                  Giá bán
                                </label>
                                <input
                                  type="number"
                                  value={price}
                                  onChange={(e) => setPrice(e.target.value)}
                                  style={themed(styles.modalInputFull)}
                                />
                              </div>
                              <div style={themed(styles.modalProductField)}>
                                <label
                                  style={themed(styles.modalProductSmallLabel)}
                                >
                                  Số lượng
                                </label>
                                <input
                                  type="number"
                                  value={quantity}
                                  onChange={(e) => setQuantity(e.target.value)}
                                  style={themed(styles.modalInputFull)}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                {productCatalogsTotalPages > 1 && (
                  <div
                    style={{
                      ...themed(styles.paginationButtons),
                      justifyContent: "center",
                      marginTop: "16px",
                    }}
                  >
                    <button
                      type="button"
                      style={themed(
                        currentPage === 1
                          ? styles.pageButtonDisabled
                          : styles.pageButton,
                      )}
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      ‹
                    </button>
                    <span style={themed(styles.paginationInfo)}>
                      {currentPage} / {productCatalogsTotalPages}
                    </span>
                    <button
                      type="button"
                      style={themed(
                        currentPage === productCatalogsTotalPages
                          ? styles.pageButtonDisabled
                          : styles.pageButton,
                      )}
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(productCatalogsTotalPages, prev + 1),
                        )
                      }
                      disabled={currentPage === productCatalogsTotalPages}
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={themed(styles.modalForm)}>
                <label style={themed(styles.modalLabel)}>
                  Tên sản phẩm *{" "}
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    style={themed(styles.modalInput)}
                    value={requestName}
                    onChange={(e) => setRequestName(e.target.value)}
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Danh mục (ID) *{" "}
                  <input
                    type="number"
                    placeholder="Nhập ID danh mục"
                    style={themed(styles.modalInput)}
                    value={requestCategoryId}
                    onChange={(e) => setRequestCategoryId(e.target.value)}
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Thương hiệu
                  <select
                    style={themed(styles.modalInput)}
                    value={requestBrandId}
                    onChange={(e) => setRequestBrandId(e.target.value)}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={themed(styles.modalLabel)}>
                  Mô tả sản phẩm{" "}
                  <textarea
                    placeholder="Nhập mô tả sản phẩm"
                    style={{ ...themed(styles.modalInput), height: "100px" }}
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                  />
                </label>
                <button
                  type="button"
                  style={themed(styles.modalLink)}
                  onClick={() => setBrandModalOpen(true)}
                >
                  + Gửi yêu cầu brand
                </button>
              </div>
            )}
          </div>

          <div style={themed(styles.modalFooter)}>
            <button
              type="button"
              style={{
                ...themed(styles.primaryButton),
                marginRight: "12px",
                background: "transparent",
                color: themed(styles.muted).color,
                border: `1px solid ${themed(styles.search).borderColor}`,
              }}
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="button"
              style={themed(styles.primaryButton)}
              onClick={
                mode === "existing" ? handleAddExisting : handleSendRequest
              }
              disabled={loading}
            >
              {loading
                ? "Đang xử lý..."
                : mode === "existing"
                  ? "Thêm vào cửa hàng"
                  : "Gửi request"}
            </button>
          </div>
        </div>
      </div>
      <BrandRequestModal
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
      />
    </>
  );
}
