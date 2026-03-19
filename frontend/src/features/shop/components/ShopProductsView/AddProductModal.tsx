"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import {
  createShopProduct,
  getProductCatalogs,
  getShopBrands,
  getShopProducts,
  requestCatalogSpec,
  requestNewProduct,
} from "../../store";
import BrandRequestModal from "./BrandRequestModal";
import { useDebounce } from "@/utils/debounce";
import { fetchCatalogCategories } from "@/features/catalog/store/catalogSlice";
import AppIcon from "@/components/commons/AppIcon";
import { uploadImageToS3 } from "@/services/uploadApi";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

const ITEMS_PER_LIMIT = 5;

function extractErrorMessage(error: unknown, fallbackMessage: string): string {
  if (typeof error === "string" && error.trim()) {
    return error.trim();
  }

  if (error && typeof error === "object") {
    const directMessage = (error as { message?: unknown }).message;
    if (typeof directMessage === "string" && directMessage.trim()) {
      return directMessage.trim();
    }

    const responseData = (error as { response?: { data?: unknown } }).response
      ?.data;
    if (responseData && typeof responseData === "object") {
      const responseMessage = (responseData as { message?: unknown }).message;
      if (typeof responseMessage === "string" && responseMessage.trim()) {
        return responseMessage.trim();
      }
    }
  }

  return fallbackMessage;
}

export default function AddProductModal({
  open,
  onClose,
}: AddProductModalProps) {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { productCatalogs, productCatalogsTotalPages, brands, loading, info } =
    useAppSelector((state: RootState) => state.shop);
  const categories = useAppSelector(
    (state: RootState) => state.catalog.categoriesFlat,
  );
  const safeBrands = Array.isArray(brands) ? brands : [];

  const [mode, setMode] = useState<"existing" | "request">("existing");
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 500);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(
    null,
  );
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>(
    {},
  );
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("10");
  const [shopDescription, setShopDescription] = useState("");
  const [specRequestOpen, setSpecRequestOpen] = useState(false);
  const [specRequestMode, setSpecRequestMode] = useState<"existing" | "new">(
    "existing",
  );
  const [requestExistingKey, setRequestExistingKey] = useState("");
  const [requestNewKey, setRequestNewKey] = useState("");
  const [requestSpecValues, setRequestSpecValues] = useState("");

  const [requestName, setRequestName] = useState("");
  const [requestBrandId, setRequestBrandId] = useState("");
  const [requestCategoryId, setRequestCategoryId] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [listingImages, setListingImages] = useState<
    Array<{
      url: string;
      key: string;
    }>
  >([]);
  const [listingImageUploading, setListingImageUploading] = useState(false);
  const [requestImage, setRequestImage] = useState<{
    url: string;
    key: string;
  } | null>(null);
  const [requestImageUploading, setRequestImageUploading] = useState(false);

  const maxUploadBytes = 10 * 1024 * 1024;
  const allowedUploadTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  // Reset page when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  useEffect(() => {
    if (open) {
      if (!categories || categories.length === 0) {
        dispatch(fetchCatalogCategories());
      }
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
  }, [open, dispatch, currentPage, debouncedQuery, categories]);

  const getSpecOptions = (value: unknown): string[] => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean);
    }
    if (typeof value === "string") {
      return value
        .split(/[,;|]/g)
        .map((item) => item.trim())
        .filter(Boolean);
    }
    if (value === null || value === undefined) return [];
    const normalized = String(value).trim();
    return normalized ? [normalized] : [];
  };

  const formatSpecLabel = (key: string) =>
    key
      .split(/[_\s-]+/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const normalizeCatalogSpecEntries = (
    rawSpecs: Record<string, unknown>,
  ): Array<{ key: string; label: string; options: string[] }> => {
    const map = new Map<string, Set<string>>();

    Object.entries(rawSpecs).forEach(([rawKey, rawValue]) => {
      const normalizedKey = rawKey.trim().toLowerCase();
      if (!normalizedKey) return;

      const values = getSpecOptions(rawValue);
      if (!map.has(normalizedKey)) {
        map.set(normalizedKey, new Set<string>());
      }
      const valueSet = map.get(normalizedKey)!;
      values.forEach((value) => valueSet.add(value));
    });

    return Array.from(map.entries())
      .map(([key, valueSet]) => ({
        key,
        label: formatSpecLabel(key),
        options: Array.from(valueSet),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  };

  const currentSerialSpecsPreview =
    Object.keys(selectedSpecs).length > 0
      ? JSON.stringify(selectedSpecs)
      : "(trống)";
  const selectedCatalog = productCatalogs.find(
    (item) => item.id === selectedCatalogId,
  );
  const selectedCatalogSpecEntries =
    selectedCatalog &&
    selectedCatalog.specs &&
    typeof selectedCatalog.specs === "object"
      ? normalizeCatalogSpecEntries(
          selectedCatalog.specs as Record<string, unknown>,
        )
      : [];
  const selectedCatalogSpecKeys = selectedCatalogSpecEntries.map(
    (item) => item.key,
  );

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
          variant_options:
            Object.keys(selectedSpecs).length > 0 ? selectedSpecs : undefined,
          description: shopDescription.trim() || undefined,
          images: listingImages.length
            ? listingImages.map((item, index) => ({
                url: item.url,
                sort_order: index,
              }))
            : undefined,
        }),
      ).unwrap();
      showSuccessToast("Thêm sản phẩm thành công!");
      dispatch(getShopProducts({ page: 1, limit: 10 }));
      onClose();
    } catch (error) {
      showErrorToast(
        extractErrorMessage(error, "Có lỗi xảy ra khi thêm sản phẩm"),
      );
    }
  };

  const handleSendRequest = async () => {
    if (!requestName || !requestCategoryId || !requestBrandId) {
      alert("Vui lòng nhập tên sản phẩm, chọn thương hiệu và danh mục");
      return;
    }
    try {
      await dispatch(
        requestNewProduct({
          name: requestName,
          category_id: parseInt(requestCategoryId),
          brand_id: parseInt(requestBrandId),
          description: requestDescription,
          default_image: requestImage?.url,
        }),
      ).unwrap();
      alert("Gửi yêu cầu thành công!");
      onClose();
    } catch {
      alert("Có lỗi xảy ra khi gửi yêu cầu");
    }
  };

  const validateBeforeUpload = (file: File) => {
    if (!allowedUploadTypes.includes(file.type)) {
      throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
    }
    if (file.size > maxUploadBytes) {
      throw new Error("Ảnh vượt quá 10MB");
    }
  };

  const handleUploadImage = async (
    file: File,
    target: "listing" | "request",
  ) => {
    try {
      validateBeforeUpload(file);
      if (target === "listing" && listingImages.length >= 6) {
        throw new Error("Tối đa 6 ảnh cho mỗi listing");
      }
      if (target === "listing") {
        setListingImageUploading(true);
      } else {
        setRequestImageUploading(true);
      }

      const uploaded = await uploadImageToS3({
        file,
        folder: target === "listing" ? "products" : "requests",
      });

      if (target === "listing") {
        setListingImages((prev) => [...prev, uploaded].slice(0, 6));
      } else {
        setRequestImage(uploaded);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Upload ảnh thất bại";
      alert(message);
    } finally {
      if (target === "listing") {
        setListingImageUploading(false);
      } else {
        setRequestImageUploading(false);
      }
    }
  };

  const handleRequestSpec = async () => {
    const resolvedKey =
      specRequestMode === "existing"
        ? requestExistingKey.trim().toLowerCase()
        : requestNewKey.trim().toLowerCase();

    if (!selectedCatalogId || !resolvedKey || !requestSpecValues.trim()) {
      alert("Vui lòng chọn catalog và nhập key/value thông số");
      return;
    }

    const values = requestSpecValues
      .split(/[,;|]/g)
      .map((item) => item.trim())
      .filter(Boolean);

    if (values.length === 0) {
      alert("Vui lòng nhập ít nhất 1 giá trị");
      return;
    }

    try {
      await dispatch(
        requestCatalogSpec({
          catalog_id: Number(selectedCatalogId),
          spec_key: resolvedKey,
          proposed_values: values,
        }),
      ).unwrap();
      alert("Đã gửi yêu cầu thêm thông số, chờ admin duyệt");
      setRequestNewKey("");
      setRequestSpecValues("");
      setSpecRequestOpen(false);
    } catch {
      alert("Không gửi được yêu cầu thêm thông số");
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
              <AppIcon name="close" />
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
                      const catalogSpecs =
                        c.specs && typeof c.specs === "object" ? c.specs : {};
                      const specEntries = normalizeCatalogSpecEntries(
                        catalogSpecs as Record<string, unknown>,
                      );
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
                              setShopDescription("");
                              setRequestNewKey("");
                              setRequestSpecValues("");
                              setSpecRequestMode("existing");
                              setRequestExistingKey("");
                              setListingImages([]);
                              const defaultSpecs: Record<string, string> = {};
                              specEntries.forEach((entry) => {
                                if (entry.options.length > 0) {
                                  defaultSpecs[entry.key] = entry.options[0];
                                }
                              });
                              setSelectedSpecs(defaultSpecs);
                            }}
                          >
                            <input
                              type="radio"
                              name="catalog"
                              checked={isSelected}
                              readOnly
                            />
                            <div
                              style={{
                                ...themed(styles.modalProductThumb),
                                backgroundImage: c.default_image
                                  ? `url(${c.default_image})`
                                  : undefined,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                              }}
                            />
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
                              <div style={themed(styles.modalExpandedGrid)}>
                                <div style={themed(styles.modalPanel)}>
                                  <label
                                    style={themed(
                                      styles.modalProductSmallLabel,
                                    )}
                                  >
                                    Giá bán
                                  </label>
                                  <input
                                    type="number"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    style={themed(styles.modalInputFull)}
                                  />
                                  <label
                                    style={themed(
                                      styles.modalProductSmallLabel,
                                    )}
                                  >
                                    Số lượng
                                  </label>
                                  <input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) =>
                                      setQuantity(e.target.value)
                                    }
                                    style={themed(styles.modalInputFull)}
                                  />
                                  <label
                                    style={themed(
                                      styles.modalProductSmallLabel,
                                    )}
                                  >
                                    Mô tả riêng của shop (tuỳ chọn)
                                  </label>
                                  <textarea
                                    value={shopDescription}
                                    onChange={(e) =>
                                      setShopDescription(e.target.value)
                                    }
                                    placeholder="Ví dụ: Hàng mới 99%, bảo hành cửa hàng 6 tháng..."
                                    style={themed(styles.modalTextarea)}
                                  />
                                  <label
                                    style={themed(
                                      styles.modalProductSmallLabel,
                                    )}
                                  >
                                    Ảnh listing (tối đa 6 ảnh)
                                  </label>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    multiple
                                    onChange={(e) => {
                                      const files = Array.from(
                                        e.target.files || [],
                                      );
                                      if (files.length > 0) {
                                        void (async () => {
                                          for (const file of files) {
                                            await handleUploadImage(
                                              file,
                                              "listing",
                                            );
                                          }
                                        })();
                                      }
                                      e.currentTarget.value = "";
                                    }}
                                    style={themed(styles.modalInputFull)}
                                  />
                                  {listingImageUploading && (
                                    <div style={themed(styles.modalHint)}>
                                      Đang upload ảnh...
                                    </div>
                                  )}
                                  {listingImages.length > 0 && (
                                    <div
                                      style={themed(
                                        styles.modalUploadPreviewGrid,
                                      )}
                                    >
                                      {listingImages.map((item, index) => (
                                        <div
                                          key={item.key}
                                          style={themed(
                                            styles.modalUploadPreviewItem,
                                          )}
                                        >
                                          <Image
                                            src={item.url}
                                            alt={`Listing preview ${index + 1}`}
                                            width={180}
                                            height={140}
                                            style={themed(
                                              styles.modalUploadPreview,
                                            )}
                                          />
                                          <button
                                            type="button"
                                            style={themed(
                                              styles.modalUploadRemoveButton,
                                            )}
                                            onClick={() =>
                                              setListingImages((prev) =>
                                                prev.filter(
                                                  (image) =>
                                                    image.key !== item.key,
                                                ),
                                              )
                                            }
                                          >
                                            Xóa
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div style={themed(styles.modalPanel)}>
                                  <label
                                    style={themed(
                                      styles.modalProductSmallLabel,
                                    )}
                                  >
                                    Tùy chọn có sẵn từ catalog
                                  </label>
                                  <div style={themed(styles.modalSpecGrid)}>
                                    {specEntries.length === 0 ? (
                                      <div style={themed(styles.modalHint)}>
                                        Catalog chưa có thông số chọn sẵn.
                                      </div>
                                    ) : (
                                      specEntries.map((entry) => {
                                        if (entry.options.length === 0)
                                          return null;

                                        return (
                                          <label
                                            key={entry.key}
                                            style={themed(styles.modalSpecItem)}
                                          >
                                            <span
                                              style={themed(
                                                styles.modalProductSmallLabel,
                                              )}
                                            >
                                              {entry.label}
                                            </span>
                                            <select
                                              value={
                                                selectedSpecs[entry.key] ??
                                                entry.options[0]
                                              }
                                              onChange={(e) =>
                                                setSelectedSpecs((prev) => ({
                                                  ...prev,
                                                  [entry.key]: e.target.value,
                                                }))
                                              }
                                              style={themed(
                                                styles.modalInputFull,
                                              )}
                                            >
                                              {entry.options.map((opt) => (
                                                <option key={opt} value={opt}>
                                                  {opt}
                                                </option>
                                              ))}
                                            </select>
                                          </label>
                                        );
                                      })
                                    )}
                                  </div>

                                  <div
                                    style={themed(styles.modalVariantPreview)}
                                  >
                                    serial_specs: {currentSerialSpecsPreview}
                                  </div>
                                </div>
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
                {selectedCatalogId && (
                  <div style={themed(styles.modalRequestPanel)}>
                    <div style={themed(styles.modalRequestHeader)}>
                      Cần thêm thông số cho catalog?
                    </div>
                    <div style={themed(styles.modalRequestSub)}>
                      Mở form riêng để đề xuất cho admin, tránh lẫn với thông số
                      listing.
                    </div>
                    <button
                      type="button"
                      style={themed(styles.modalGhostButton)}
                      onClick={() => {
                        if (selectedCatalogSpecKeys.length > 0) {
                          setRequestExistingKey(
                            selectedCatalogSpecKeys[0] ?? "",
                          );
                        }
                        setSpecRequestMode(
                          selectedCatalogSpecKeys.length > 0
                            ? "existing"
                            : "new",
                        );
                        setSpecRequestOpen(true);
                      }}
                    >
                      Đề xuất thông số mới
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
                  Thương hiệu *
                  <select
                    style={themed(styles.modalInput)}
                    value={requestBrandId}
                    onChange={(e) => setRequestBrandId(e.target.value)}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {safeBrands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={themed(styles.modalLabel)}>
                  Danh mục *
                  <select
                    style={themed(styles.modalInput)}
                    value={requestCategoryId}
                    onChange={(e) => setRequestCategoryId(e.target.value)}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {`${c.level && c.level > 1 ? "— ".repeat(c.level - 1) : ""}${c.name}`}
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
                <label style={themed(styles.modalLabel)}>
                  Ảnh đại diện sản phẩm (tuỳ chọn)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleUploadImage(file, "request");
                      }
                      e.currentTarget.value = "";
                    }}
                    style={themed(styles.modalInput)}
                  />
                  {requestImageUploading && (
                    <span style={themed(styles.modalHint)}>
                      Đang upload ảnh...
                    </span>
                  )}
                  {requestImage?.url && (
                    <Image
                      src={requestImage.url}
                      alt="Request preview"
                      width={720}
                      height={240}
                      style={themed(styles.modalUploadPreview)}
                    />
                  )}
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
              disabled={
                loading ||
                (mode === "existing" && listingImageUploading) ||
                (mode === "request" && requestImageUploading)
              }
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
      {specRequestOpen && (
        <div style={themed(styles.modalOverlay)}>
          <div style={themed(styles.specRequestModalCard)}>
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>
                Đề xuất thông số catalog
              </h3>
              <button
                type="button"
                style={themed(styles.modalClose)}
                onClick={() => setSpecRequestOpen(false)}
              >
                <AppIcon name="close" />
              </button>
            </div>
            <div style={themed(styles.specRequestBody)}>
              <div style={themed(styles.specRequestTabs)}>
                <button
                  type="button"
                  style={
                    specRequestMode === "existing"
                      ? themed(styles.specRequestTabActive)
                      : themed(styles.specRequestTab)
                  }
                  onClick={() => setSpecRequestMode("existing")}
                  disabled={selectedCatalogSpecKeys.length === 0}
                >
                  Thêm vào key có sẵn
                </button>
                <button
                  type="button"
                  style={
                    specRequestMode === "new"
                      ? themed(styles.specRequestTabActive)
                      : themed(styles.specRequestTab)
                  }
                  onClick={() => setSpecRequestMode("new")}
                >
                  Tạo key mới
                </button>
              </div>

              {specRequestMode === "existing" ? (
                <label style={themed(styles.modalLabel)}>
                  Chọn key có sẵn
                  <select
                    value={requestExistingKey}
                    onChange={(e) => setRequestExistingKey(e.target.value)}
                    style={themed(styles.modalInput)}
                  >
                    {selectedCatalogSpecKeys.length === 0 ? (
                      <option value="">Catalog chưa có key nào</option>
                    ) : (
                      selectedCatalogSpecEntries.map((item) => (
                        <option key={item.key} value={item.key}>
                          {item.label}
                        </option>
                      ))
                    )}
                  </select>
                </label>
              ) : (
                <label style={themed(styles.modalLabel)}>
                  Key mới
                  <input
                    type="text"
                    value={requestNewKey}
                    onChange={(e) => setRequestNewKey(e.target.value)}
                    placeholder="vd: material"
                    style={themed(styles.modalInput)}
                  />
                </label>
              )}

              <label style={themed(styles.modalLabel)}>
                Giá trị đề xuất
                <input
                  type="text"
                  value={requestSpecValues}
                  onChange={(e) => setRequestSpecValues(e.target.value)}
                  placeholder="vd: vàng|đỏ|xanh"
                  style={themed(styles.modalInput)}
                />
              </label>

              <div style={themed(styles.modalActions)}>
                <button
                  type="button"
                  style={themed(styles.modalGhostButton)}
                  onClick={() => setSpecRequestOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  style={themed(styles.primaryButton)}
                  onClick={handleRequestSpec}
                  disabled={
                    specRequestMode === "existing" &&
                    selectedCatalogSpecKeys.length === 0
                  }
                >
                  Gửi đề xuất
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
