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
type CatalogSpecDraftRow = {
  id: string;
  key: string;
  value: string;
};

function createCatalogSpecDraftRow(
  key = "",
  value = "",
): CatalogSpecDraftRow {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    key,
    value,
  };
}

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
  const [shopDescription, setShopDescription] = useState("");
  const [catalogSpecRows, setCatalogSpecRows] = useState<CatalogSpecDraftRow[]>(
    [],
  );
  const [catalogSpecComposerOpen, setCatalogSpecComposerOpen] = useState(false);
  const [catalogSpecComposerMode, setCatalogSpecComposerMode] = useState<
    "existing" | "new"
  >("existing");
  const [catalogSpecComposerKey, setCatalogSpecComposerKey] = useState("");
  const [catalogSpecComposerNewKey, setCatalogSpecComposerNewKey] =
    useState("");
  const [catalogSpecComposerValues, setCatalogSpecComposerValues] =
    useState("");
  const [editingCatalogSpecRowId, setEditingCatalogSpecRowId] = useState<
    string | null
  >(null);
  const [catalogSpecsSaving, setCatalogSpecsSaving] = useState(false);

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

  const normalizeSpecKey = (rawKey: string) =>
    rawKey.trim().toLowerCase().replace(/\s+/g, "_");

  const buildCatalogSpecRows = (rawSpecs: unknown): CatalogSpecDraftRow[] => {
    if (!rawSpecs || typeof rawSpecs !== "object") {
      return [];
    }

    return normalizeCatalogSpecEntries(rawSpecs as Record<string, unknown>).map(
      (entry) =>
        createCatalogSpecDraftRow(entry.key, entry.options.join(", ")),
    );
  };

  const buildCatalogSpecsObject = (
    rows: CatalogSpecDraftRow[],
    strict: boolean,
  ): Record<string, string[]> => {
    const specMap = new Map<string, Set<string>>();

    rows.forEach((row, index) => {
      const normalizedKey = normalizeSpecKey(row.key);
      const values = getSpecOptions(row.value);
      const rowIsEmpty = !row.key.trim() && !row.value.trim();

      if (rowIsEmpty) return;

      if (!normalizedKey || values.length === 0) {
        if (strict) {
          throw new Error(`Thông số dòng ${index + 1} cần có tên và giá trị`);
        }
        return;
      }

      if (!specMap.has(normalizedKey)) {
        specMap.set(normalizedKey, new Set<string>());
      }

      const valueSet = specMap.get(normalizedKey)!;
      values.forEach((value) => valueSet.add(value));
    });

    return Object.fromEntries(
      Array.from(specMap.entries()).map(([key, valueSet]) => [
        key,
        Array.from(valueSet),
      ]),
    );
  };

  const syncSelectedSpecs = (
    entries: Array<{ key: string; options: string[] }>,
    currentSelected: Record<string, string>,
  ) => {
    return entries.reduce<Record<string, string>>((acc, entry) => {
      const selectedValue = currentSelected[entry.key];
      if (selectedValue && entry.options.includes(selectedValue)) {
        acc[entry.key] = selectedValue;
      }
      return acc;
    }, {});
  };

  const resetCatalogSpecComposer = () => {
    setCatalogSpecComposerOpen(false);
    setCatalogSpecComposerMode("existing");
    setCatalogSpecComposerKey("");
    setCatalogSpecComposerNewKey("");
    setCatalogSpecComposerValues("");
    setEditingCatalogSpecRowId(null);
  };

  const openCatalogSpecComposer = () => {
    setCatalogSpecComposerOpen(true);
    setCatalogSpecComposerMode(
      editableSpecEntries.length > 0 ? "existing" : "new",
    );
    setCatalogSpecComposerKey(editableSpecEntries[0]?.key ?? "");
    setCatalogSpecComposerNewKey("");
    setCatalogSpecComposerValues("");
    setEditingCatalogSpecRowId(null);
  };

  const applyCatalogSpecRows = (nextRows: CatalogSpecDraftRow[]) => {
    const nextEntries = normalizeCatalogSpecEntries(
      buildCatalogSpecsObject(nextRows, false),
    );
    setCatalogSpecRows(nextRows);
    setSelectedSpecs((prev) => syncSelectedSpecs(nextEntries, prev));
  };

  const handleApplyCatalogSpecComposer = () => {
    const values = getSpecOptions(catalogSpecComposerValues);
    if (values.length === 0) {
      showErrorToast("Vui lòng nhập ít nhất một giá trị");
      return;
    }

    if (catalogSpecComposerMode === "existing") {
      const normalizedKey = normalizeSpecKey(catalogSpecComposerKey);
      if (!normalizedKey) {
        showErrorToast("Vui lòng chọn thông số có sẵn");
        return;
      }

      const targetRow = catalogSpecRows.find(
        (row) => normalizeSpecKey(row.key) === normalizedKey,
      );
      if (!targetRow) {
        showErrorToast("Không tìm thấy thông số cần cập nhật");
        return;
      }

      const mergedValues = Array.from(
        new Set([...getSpecOptions(targetRow.value), ...values]),
      );
      applyCatalogSpecRows(
        catalogSpecRows.map((row) =>
          row.id === targetRow.id
            ? { ...row, value: mergedValues.join(", ") }
            : row,
        ),
      );
      resetCatalogSpecComposer();
      return;
    }

    const normalizedKey = normalizeSpecKey(catalogSpecComposerNewKey);
    if (!normalizedKey) {
      showErrorToast("Vui lòng nhập tên thông số");
      return;
    }

    if (editingCatalogSpecRowId) {
      applyCatalogSpecRows(
        catalogSpecRows.map((row) =>
          row.id === editingCatalogSpecRowId
            ? {
                ...row,
                key: catalogSpecComposerNewKey.trim(),
                value: values.join(", "),
              }
            : row,
        ),
      );
      resetCatalogSpecComposer();
      return;
    }

    const existingRow = catalogSpecRows.find(
      (row) => normalizeSpecKey(row.key) === normalizedKey,
    );
    if (existingRow) {
      const mergedValues = Array.from(
        new Set([...getSpecOptions(existingRow.value), ...values]),
      );
      applyCatalogSpecRows(
        catalogSpecRows.map((row) =>
          row.id === existingRow.id
            ? { ...row, value: mergedValues.join(", ") }
            : row,
        ),
      );
      resetCatalogSpecComposer();
      return;
    }

    applyCatalogSpecRows([
      ...catalogSpecRows,
      createCatalogSpecDraftRow(catalogSpecComposerNewKey.trim(), values.join(", ")),
    ]);
    resetCatalogSpecComposer();
  };

  const handleEditCatalogSpecRow = (row: CatalogSpecDraftRow) => {
    setCatalogSpecComposerOpen(true);
    setCatalogSpecComposerMode("new");
    setCatalogSpecComposerKey("");
    setCatalogSpecComposerNewKey(row.key);
    setCatalogSpecComposerValues(row.value);
    setEditingCatalogSpecRowId(row.id);
  };

  const handleRemoveCatalogSpecRow = (row: CatalogSpecDraftRow) => {
    applyCatalogSpecRows(
      catalogSpecRows.filter((item) => item.id !== row.id),
    );
  };

  const editableCatalogSpecs = buildCatalogSpecsObject(catalogSpecRows, false);
  const editableSpecEntries = normalizeCatalogSpecEntries(editableCatalogSpecs);
  const currentSerialSpecsPreview =
    Object.keys(selectedSpecs).length > 0
      ? JSON.stringify(selectedSpecs)
      : "(trống)";

  const handleAddExisting = async () => {
    if (!selectedCatalogId || !price) {
      alert("Vui lòng nhập đầy đủ thông tin giá");
      return;
    }
    const shopId = info?.id;
    if (!shopId) {
      alert("Không tìm thấy thông tin cửa hàng");
      return;
    }
    try {
      const hasCatalogSpecRows = catalogSpecRows.some(
        (row) => row.key.trim() || row.value.trim(),
      );
      if (hasCatalogSpecRows) {
        const nextCatalogSpecs = buildCatalogSpecsObject(catalogSpecRows, true);
        await dispatch(
          requestCatalogSpec({
            catalog_id: Number(selectedCatalogId),
            specs: nextCatalogSpecs,
          }),
        ).unwrap();
      }

      await dispatch(
        createShopProduct({
          catalog_id: parseInt(selectedCatalogId),
          store_id: parseInt(shopId),
          price: parseFloat(price),
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

  const handleSaveCatalogSpecs = async () => {
    if (!selectedCatalogId) {
      showErrorToast("Vui lòng chọn một sản phẩm từ catalog");
      return;
    }

    try {
      const nextCatalogSpecs = buildCatalogSpecsObject(catalogSpecRows, true);
      setCatalogSpecsSaving(true);
      await dispatch(
        requestCatalogSpec({
          catalog_id: Number(selectedCatalogId),
          specs: nextCatalogSpecs,
        }),
      ).unwrap();

      const nextEntries = normalizeCatalogSpecEntries(nextCatalogSpecs);
      setCatalogSpecRows(buildCatalogSpecRows(nextCatalogSpecs));
      setSelectedSpecs((prev) => syncSelectedSpecs(nextEntries, prev));
      showSuccessToast("Đã cập nhật thông số catalog");

      await dispatch(
        getProductCatalogs({
          page: currentPage,
          limit: ITEMS_PER_LIMIT,
          q: debouncedQuery,
          append: false,
        }),
      ).unwrap();
    } catch (error) {
      showErrorToast(
        extractErrorMessage(error, "Không cập nhật được thông số catalog"),
      );
    } finally {
      setCatalogSpecsSaving(false);
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
                              setListingImages([]);
                              setCatalogSpecRows(buildCatalogSpecRows(c.specs));
                              setSelectedSpecs({});
                              resetCatalogSpecComposer();
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
                                  <div style={themed(styles.modalSectionHeader)}>
                                    <div>
                                      <div
                                        style={themed(
                                          styles.modalRequestHeader,
                                        )}
                                      >
                                        Thông số catalog
                                      </div>
                                      <div
                                        style={themed(styles.modalRequestSub)}
                                      >
                                        Bộ thông số dùng chung cho catalog này.
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      style={themed(styles.modalGhostButton)}
                                      onClick={openCatalogSpecComposer}
                                    >
                                      Thêm thông số
                                    </button>
                                  </div>
                                  <div style={themed(styles.modalRequestPanel)}>
                                    <div
                                      style={themed(styles.modalRequestHeader)}
                                    >
                                      {editableSpecEntries.length === 0
                                        ? "Catalog này chưa có thông số"
                                        : `${editableSpecEntries.length} thông số đang có`}
                                    </div>
                                    <div style={themed(styles.modalRequestSub)}>
                                      Mỗi thông số có thể chứa nhiều giá trị để
                                      shop chọn khi tạo listing.
                                    </div>
                                    {editableSpecEntries.length === 0 ? (
                                      <div style={themed(styles.modalHint)}>
                                        Chưa có thông số.
                                      </div>
                                    ) : (
                                      <div
                                        style={themed(styles.modalSpecSummaryList)}
                                      >
                                        {catalogSpecRows.map((row) => (
                                          <div
                                            key={row.id}
                                            style={themed(styles.modalSpecCard)}
                                          >
                                            <div
                                              style={themed(
                                                styles.modalSpecCardHeader,
                                              )}
                                            >
                                              <div>
                                                <div
                                                  style={themed(
                                                    styles.modalSpecCardTitle,
                                                  )}
                                                >
                                                  {formatSpecLabel(row.key)}
                                                </div>
                                                <div
                                                  style={themed(
                                                    styles.modalRequestSub,
                                                  )}
                                                >
                                                  key: {normalizeSpecKey(row.key)}
                                                </div>
                                              </div>
                                              <div
                                                style={themed(
                                                  styles.modalInlineActions,
                                                )}
                                              >
                                                <button
                                                  type="button"
                                                  style={themed(
                                                    styles.modalGhostButton,
                                                  )}
                                                  onClick={() =>
                                                    handleEditCatalogSpecRow(
                                                      row,
                                                    )
                                                  }
                                                >
                                                  Sửa
                                                </button>
                                                <button
                                                  type="button"
                                                  style={themed(
                                                    styles.modalDangerButton,
                                                  )}
                                                  onClick={() =>
                                                    handleRemoveCatalogSpecRow(
                                                      row,
                                                    )
                                                  }
                                                >
                                                  Xóa
                                                </button>
                                              </div>
                                            </div>
                                            <div
                                              style={themed(
                                                styles.modalTagWrap,
                                              )}
                                            >
                                              {getSpecOptions(row.value).map(
                                                (value) => (
                                                  <span
                                                    key={`${row.id}-${value}`}
                                                    style={themed(
                                                      styles.modalTag,
                                                    )}
                                                  >
                                                    {value}
                                                  </span>
                                                ),
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                    {catalogSpecComposerOpen && (
                                      <div
                                        style={themed(
                                          styles.modalComposerBox,
                                        )}
                                      >
                                        <div
                                          style={themed(
                                            styles.modalSectionHeader,
                                          )}
                                        >
                                          <div
                                            style={themed(
                                              styles.modalRequestHeader,
                                            )}
                                          >
                                            {editingCatalogSpecRowId
                                              ? "Sửa thông số"
                                              : "Thêm thông số"}
                                          </div>
                                          <button
                                            type="button"
                                            style={themed(
                                              styles.modalGhostButton,
                                            )}
                                            onClick={resetCatalogSpecComposer}
                                          >
                                            Đóng
                                          </button>
                                        </div>
                                        {!editingCatalogSpecRowId && (
                                          <div
                                            style={themed(styles.modalInlineTabs)}
                                          >
                                            <button
                                              type="button"
                                              style={
                                                catalogSpecComposerMode ===
                                                "existing"
                                                  ? themed(
                                                      styles.modalTabActive,
                                                    )
                                                  : themed(styles.modalTab)
                                              }
                                              onClick={() =>
                                                setCatalogSpecComposerMode(
                                                  "existing",
                                                )
                                              }
                                              disabled={
                                                editableSpecEntries.length ===
                                                0
                                              }
                                            >
                                              Thêm vào có sẵn
                                            </button>
                                            <button
                                              type="button"
                                              style={
                                                catalogSpecComposerMode === "new"
                                                  ? themed(
                                                      styles.modalTabActive,
                                                    )
                                                  : themed(styles.modalTab)
                                              }
                                              onClick={() =>
                                                setCatalogSpecComposerMode(
                                                  "new",
                                                )
                                              }
                                            >
                                              Tạo thông số mới
                                            </button>
                                          </div>
                                        )}
                                        <div style={themed(styles.modalForm)}>
                                          {catalogSpecComposerMode ===
                                            "existing" &&
                                          !editingCatalogSpecRowId ? (
                                            <label
                                              style={themed(styles.modalLabel)}
                                            >
                                              Chọn thông số
                                              <select
                                                value={catalogSpecComposerKey}
                                                onChange={(e) =>
                                                  setCatalogSpecComposerKey(
                                                    e.target.value,
                                                  )
                                                }
                                                style={themed(
                                                  styles.modalInputFull,
                                                )}
                                              >
                                                {editableSpecEntries.map(
                                                  (entry) => (
                                                    <option
                                                      key={entry.key}
                                                      value={entry.key}
                                                    >
                                                      {entry.label}
                                                    </option>
                                                  ),
                                                )}
                                              </select>
                                            </label>
                                          ) : (
                                            <label
                                              style={themed(styles.modalLabel)}
                                            >
                                              Tên thông số
                                              <input
                                                type="text"
                                                value={
                                                  catalogSpecComposerNewKey
                                                }
                                                onChange={(e) =>
                                                  setCatalogSpecComposerNewKey(
                                                    e.target.value,
                                                  )
                                                }
                                                placeholder="Ví dụ: màu sắc"
                                                style={themed(
                                                  styles.modalInputFull,
                                                )}
                                              />
                                            </label>
                                          )}
                                          <label
                                            style={themed(styles.modalLabel)}
                                          >
                                            Giá trị
                                            <input
                                              type="text"
                                              value={
                                                catalogSpecComposerValues
                                              }
                                              onChange={(e) =>
                                                setCatalogSpecComposerValues(
                                                  e.target.value,
                                                )
                                              }
                                              placeholder="Ví dụ: Đen, Trắng, Xanh"
                                              style={themed(
                                                styles.modalInputFull,
                                              )}
                                            />
                                          </label>
                                        </div>
                                        <div
                                          style={themed(styles.modalActions)}
                                        >
                                          <button
                                            type="button"
                                            style={themed(
                                              styles.modalGhostButton,
                                            )}
                                            onClick={handleApplyCatalogSpecComposer}
                                          >
                                            {editingCatalogSpecRowId
                                              ? "Cập nhật thông số"
                                              : "Thêm vào danh sách"}
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                    <div style={themed(styles.modalActions)}>
                                      <button
                                        type="button"
                                        style={themed(styles.primaryButton)}
                                        onClick={handleSaveCatalogSpecs}
                                        disabled={catalogSpecsSaving}
                                      >
                                        {catalogSpecsSaving
                                          ? "Đang lưu..."
                                          : "Lưu vào catalog"}
                                      </button>
                                    </div>
                                  </div>

                                  <div style={themed(styles.modalRequestPanel)}>
                                    <div
                                      style={themed(styles.modalRequestHeader)}
                                    >
                                      Thông số áp dụng cho sản phẩm này
                                    </div>
                                    <div style={themed(styles.modalRequestSub)}>
                                      Chọn những thông số shop muốn dùng cho
                                      listing hiện tại.
                                    </div>
                                    {editableSpecEntries.length === 0 ? (
                                      <div style={themed(styles.modalHint)}>
                                        Chưa có thông số để chọn.
                                      </div>
                                    ) : (
                                      <div style={themed(styles.modalForm)}>
                                        {editableSpecEntries.map((entry) => {
                                          const isChecked =
                                            entry.key in selectedSpecs;
                                          return (
                                            <div
                                              key={entry.key}
                                              style={themed(
                                                styles.modalSelectionCard,
                                              )}
                                            >
                                              <div
                                                style={themed(
                                                  styles.modalSelectionCardHeader,
                                                )}
                                              >
                                                <label
                                                  style={themed(
                                                    styles.modalCheckboxRow,
                                                  )}
                                                >
                                                  <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={(e) => {
                                                      setSelectedSpecs((prev) => {
                                                        if (!e.target.checked) {
                                                          const next = {
                                                            ...prev,
                                                          };
                                                          delete next[entry.key];
                                                          return next;
                                                        }

                                                        return {
                                                          ...prev,
                                                          [entry.key]:
                                                            prev[entry.key] ??
                                                            entry.options[0] ??
                                                            "",
                                                        };
                                                      });
                                                    }}
                                                />
                                                <div>
                                                  <div
                                                    style={themed(
                                                      styles.modalSpecCardTitle,
                                                    )}
                                                  >
                                                    {entry.label}
                                                  </div>
                                                  <div
                                                    style={themed(
                                                      styles.modalRequestSub,
                                                    )}
                                                  >
                                                    {entry.options.length} giá
                                                    trị có sẵn
                                                  </div>
                                                </div>
                                              </label>
                                              <span
                                                style={themed(
                                                  isChecked
                                                    ? styles.modalTag
                                                    : styles.modalMutedBadge,
                                                )}
                                              >
                                                {isChecked
                                                  ? "Đang áp dụng"
                                                  : "Chưa chọn"}
                                              </span>
                                            </div>
                                            {isChecked ? (
                                              <div
                                                style={themed(
                                                  styles.modalSelectionControl,
                                                )}
                                              >
                                                <select
                                                  value={
                                                    selectedSpecs[entry.key] ??
                                                    entry.options[0]
                                                  }
                                                  onChange={(e) =>
                                                    setSelectedSpecs((prev) => ({
                                                      ...prev,
                                                      [entry.key]:
                                                        e.target.value,
                                                    }))
                                                  }
                                                  style={themed(
                                                    styles.modalInputFull,
                                                  )}
                                                >
                                                  {entry.options.map((opt) => (
                                                    <option
                                                      key={opt}
                                                      value={opt}
                                                    >
                                                      {opt}
                                                    </option>
                                                  ))}
                                                </select>
                                              </div>
                                            ) : (
                                              <div
                                                style={themed(
                                                  styles.modalHint,
                                                )}
                                              >
                                                Chọn để dùng thông số này cho
                                                listing hiện tại.
                                              </div>
                                            )}
                                          </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                    <div
                                      style={themed(styles.modalVariantPreview)}
                                    >
                                      serial_specs:{" "}
                                      {currentSerialSpecsPreview}
                                    </div>
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
    </>
  );
}
