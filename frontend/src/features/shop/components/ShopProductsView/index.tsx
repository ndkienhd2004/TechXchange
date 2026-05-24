"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getMyProductRequests,
  getShopProducts,
} from "../../store";
import { RootState } from "@/store";
import AddProductModal from "./AddProductModal";
import AppIcon from "@/components/commons/AppIcon";
import {
  deleteShopProductService,
  updateShopProductService,
} from "../../sevices";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { uploadImageToS3 } from "@/services/uploadApi";

const PAGE_SIZE = 10;

type EditProductForm = {
  id: number;
  name: string;
  price: string;
  status: "active" | "inactive" | "sold_out";
  description: string;
  images: Array<{ key: string; url: string }>;
};

export default function ShopProductsView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const {
    products,
    productsTotalPages,
    loading,
    productsTotal,
    productRequests,
    requestsLoading,
  } =
    useAppSelector((state: RootState) => state.shop);
  const [page, setPage] = useState(1);
  const [openModal, setOpenModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [viewingProduct, setViewingProduct] = useState<(typeof products)[number] | null>(
    null,
  );
  const [editingProduct, setEditingProduct] = useState<EditProductForm | null>(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editImageUploading, setEditImageUploading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<number | null>(null);
  const [requestStatus, setRequestStatus] = useState("all");
  const totalItems = productsTotal;

  useEffect(() => {
    dispatch(
      getShopProducts({
        page,
        limit: PAGE_SIZE,
        append: false,
        q: appliedSearch || undefined,
      }),
    );
  }, [dispatch, page, appliedSearch]);

  useEffect(() => {
    dispatch(
      getMyProductRequests({ page: 1, limit: 10, status: requestStatus }),
    );
  }, [dispatch, requestStatus]);

  const totalPages = Math.max(1, productsTotalPages);
  const hasPrev = page > 1;
  const hasNext = page < totalPages;

  const pageNumbers: number[] = [];
  const showPages = 5;
  let start = Math.max(1, page - Math.floor(showPages / 2));
  const end = Math.min(totalPages, start + showPages - 1);
  if (end - start + 1 < showPages) start = Math.max(1, end - showPages + 1);
  for (let i = start; i <= end; i++) pageNumbers.push(i);

  const handlePageChange = (next: number) => {
    setPage(next);
  };

  const openViewProduct = (product: (typeof products)[number]) => {
    setViewingProduct(product);
  };

  const openEditProduct = (product: (typeof products)[number]) => {
    const safePrice = Number(product.price ?? product.msrp ?? 0);
    const status = String(product.status || "active").toLowerCase();
    const existingImages = Array.isArray(product.images)
      ? product.images
          .map((image, index) => ({
            key: String(image.id ?? `existing-${index}`),
            url: String(image.url || "").trim(),
          }))
          .filter((image) => image.url)
      : [];

    const fallbackCatalogImage =
      typeof product.catalog?.default_image === "string"
        ? product.catalog.default_image.trim()
        : typeof product.default_image === "string"
          ? product.default_image.trim()
          : "";

    const initialImages =
      existingImages.length > 0
        ? existingImages
        : fallbackCatalogImage
          ? [{ key: "catalog-default", url: fallbackCatalogImage }]
          : [];

    setEditingProduct({
      id: Number(product.id),
      name: product.name || "",
      price: Number.isFinite(safePrice) ? String(safePrice) : "0",
      status:
        status === "inactive" || status === "sold_out" ? status : "active",
      description: String(product.description || ""),
      images: initialImages,
    });
  };

  const closeEditModal = () => {
    if (savingEdit) return;
    setEditingProduct(null);
  };

  const onSaveEditProduct = async () => {
    if (!editingProduct) return;
    const price = Number(editingProduct.price);
    if (!Number.isFinite(price) || price < 0) {
      showErrorToast("Giá sản phẩm không hợp lệ");
      return;
    }

    try {
      setSavingEdit(true);
      await updateShopProductService(editingProduct.id, {
        price,
        status: editingProduct.status,
        description: editingProduct.description.trim() || "",
        images: editingProduct.images.map((image, index) => ({
          url: image.url,
          sort_order: index,
        })),
      });
      showSuccessToast("Cập nhật sản phẩm thành công");
      setEditingProduct(null);
      dispatch(
        getShopProducts({
          page,
          limit: PAGE_SIZE,
          append: false,
          q: appliedSearch || undefined,
        }),
      );
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUploadEditImages = async (files: FileList | null) => {
    if (!editingProduct || !files || files.length === 0) return;

    const maxUploadBytes = 10 * 1024 * 1024;
    const allowedUploadTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ];

    try {
      const selectedFiles = Array.from(files);
      if (editingProduct.images.length + selectedFiles.length > 6) {
        showErrorToast("Tối đa 6 ảnh cho mỗi sản phẩm");
        return;
      }

      setEditImageUploading(true);
      for (const file of selectedFiles) {
        if (!allowedUploadTypes.includes(file.type)) {
          throw new Error("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
        }
        if (file.size > maxUploadBytes) {
          throw new Error("Ảnh vượt quá 10MB");
        }
        const uploaded = await uploadImageToS3({ file, folder: "products" });
        setEditingProduct((prev) =>
          prev
            ? {
                ...prev,
                images: [...prev.images, { key: uploaded.key, url: uploaded.url }],
              }
            : prev,
        );
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setEditImageUploading(false);
    }
  };

  const getProductPreviewImage = (product: (typeof products)[number]) => {
    const firstImage = Array.isArray(product.images) ? product.images[0]?.url : "";
    if (firstImage) return firstImage;

    if (typeof product.catalog?.default_image === "string" && product.catalog.default_image.trim()) {
      return product.catalog.default_image.trim();
    }
    if (typeof product.default_image === "string" && product.default_image.trim()) {
      return product.default_image.trim();
    }
    return "";
  };

  const onDeleteProduct = async (product: (typeof products)[number]) => {
    const productId = Number(product.id);
    if (!productId || deletingProductId) return;

    const confirmed = window.confirm(
      `Bạn chắc chắn muốn xoá sản phẩm "${product.name}"?`,
    );
    if (!confirmed) return;

    try {
      setDeletingProductId(productId);
      await deleteShopProductService(productId);
      showSuccessToast("Xoá sản phẩm thành công");
      setPage(1);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setDeletingProductId(null);
    }
  };

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>
          {loading && products.length === 0
            ? "Đang tải..."
            : `${totalItems} sản phẩm`}
        </p>
      </header>

      <section style={themed(styles.tableCard)}>
        <div style={themed(styles.tableHeader)}>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            style={themed(styles.search)}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const nextSearch = searchKeyword.trim();
                setPage(1);
                setAppliedSearch(nextSearch);
              }
            }}
          />
          <button
            type="button"
            style={themed(styles.primaryButton)}
            onClick={() => setOpenModal(true)}
          >
            + Thêm sản phẩm
          </button>
        </div>

        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Giá</th>
              <th style={themed(styles.th)}>Kho</th>
              <th style={themed(styles.th)}>Đã bán</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading && products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    ...themed(styles.td),
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  Đang tải...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    ...themed(styles.td),
                    textAlign: "center",
                    padding: 24,
                  }}
                >
                  {appliedSearch
                    ? "Không tìm thấy sản phẩm phù hợp."
                    : "Chưa có sản phẩm nào."}
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const previewImage = getProductPreviewImage(product);
                return (
                  <tr key={product.id}>
                    <td style={themed(styles.td)}>
                      <div
                        style={{ display: "flex", gap: 12, alignItems: "center" }}
                      >
                        <div
                          style={{
                            ...themed(styles.orderThumb),
                            backgroundImage: previewImage
                              ? `url(${previewImage})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <div>
                          <div style={themed(styles.orderName)}>
                            {product.name}
                          </div>
                          <div style={themed(styles.orderMeta)}>
                            {product.category?.name ?? "-"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.price)}>
                        {product.price ?? product.msrp}
                      </div>
                      <div style={themed(styles.muted)}>MSRP: {product.msrp}</div>
                    </td>
                    <td style={themed(styles.td)}>{product.quantity ?? "-"}</td>
                    <td style={themed(styles.td)}>{product.buyturn ?? "-"}</td>
                    <td style={themed(styles.td)}>{product.status ?? "-"}</td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.rowActions)}>
                        <button
                          type="button"
                          style={themed(styles.iconButton)}
                          onClick={() => openViewProduct(product)}
                        >
                          <AppIcon name="view" />
                        </button>
                        <button
                          type="button"
                          style={themed(styles.iconButton)}
                          onClick={() => openEditProduct(product)}
                        >
                          <AppIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          style={themed(styles.iconButton)}
                          onClick={() => onDeleteProduct(product)}
                          disabled={deletingProductId === Number(product.id)}
                        >
                          <AppIcon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {!loading && productsTotalPages > 0 && (
          <div style={themed(styles.paginationRow)}>
            <span style={themed(styles.paginationInfo)}>
              Trang {page} / {totalPages}
            </span>
            <div style={themed(styles.paginationButtons)}>
              <button
                type="button"
                style={
                  hasPrev
                    ? themed(styles.pageButton)
                    : themed(styles.pageButtonDisabled)
                }
                onClick={() => hasPrev && handlePageChange(page - 1)}
                disabled={!hasPrev}
              >
                Trước
              </button>
              {pageNumbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  style={
                    n === page
                      ? themed(styles.pageButtonActive)
                      : themed(styles.pageButton)
                  }
                  onClick={() => handlePageChange(n)}
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                style={
                  hasNext
                    ? themed(styles.pageButton)
                    : themed(styles.pageButtonDisabled)
                }
                onClick={() => hasNext && handlePageChange(page + 1)}
                disabled={!hasNext}
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </section>

      <AddProductModal open={openModal} onClose={() => setOpenModal(false)} />

      {viewingProduct && (
        <div style={themed(styles.modalOverlay)} onClick={() => setViewingProduct(null)}>
          <div
            style={themed(styles.modalCard)}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>Chi tiết sản phẩm</h3>
              <button
                type="button"
                style={themed(styles.modalClose)}
                onClick={() => setViewingProduct(null)}
              >
                <AppIcon name="close" />
              </button>
            </div>

            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.modalForm)}>
                <label style={themed(styles.modalLabel)}>
                  Tên sản phẩm
                  <input
                    type="text"
                    value={viewingProduct.name || ""}
                    style={themed(styles.modalInput)}
                    readOnly
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Danh mục
                  <input
                    type="text"
                    value={viewingProduct.category?.name ?? "-"}
                    style={themed(styles.modalInput)}
                    readOnly
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Giá
                  <input
                    type="text"
                    value={String(viewingProduct.price ?? viewingProduct.msrp ?? "-")}
                    style={themed(styles.modalInput)}
                    readOnly
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Kho
                  <input
                    type="text"
                    value={String(viewingProduct.quantity ?? "-")}
                    style={themed(styles.modalInput)}
                    readOnly
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Trạng thái
                  <input
                    type="text"
                    value={viewingProduct.status ?? "-"}
                    style={themed(styles.modalInput)}
                    readOnly
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Mô tả
                  <textarea
                    value={String(viewingProduct.description || "")}
                    style={themed(styles.modalTextarea)}
                    readOnly
                  />
                </label>
              </div>
            </div>

            <div style={themed(styles.modalFooter)}>
              <button
                type="button"
                style={themed(styles.primaryButton)}
                onClick={() => setViewingProduct(null)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {editingProduct && (
        <div style={themed(styles.modalOverlay)} onClick={closeEditModal}>
          <div
            style={themed(styles.modalCard)}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>Sửa sản phẩm</h3>
              <button
                type="button"
                style={themed(styles.modalClose)}
                onClick={closeEditModal}
                disabled={savingEdit}
              >
                <AppIcon name="close" />
              </button>
            </div>

            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.modalForm)}>
                <label style={themed(styles.modalLabel)}>
                  Tên sản phẩm
                  <input
                    type="text"
                    value={editingProduct.name}
                    style={themed(styles.modalInput)}
                    readOnly
                  />
                </label>

                <label style={themed(styles.modalLabel)}>
                  Giá bán
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, price: e.target.value } : prev,
                      )
                    }
                    style={themed(styles.modalInput)}
                  />
                </label>

                <label style={themed(styles.modalLabel)}>
                  Trạng thái
                  <select
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              status: e.target.value as EditProductForm["status"],
                            }
                          : prev,
                      )
                    }
                    style={themed(styles.modalInput)}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </label>

                <label style={themed(styles.modalLabel)}>
                  Mô tả
                  <textarea
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct((prev) =>
                        prev ? { ...prev, description: e.target.value } : prev,
                      )
                    }
                    style={themed(styles.modalTextarea)}
                  />
                </label>

                <label style={themed(styles.modalLabel)}>
                  Ảnh sản phẩm (tối đa 6 ảnh)
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(e) => {
                      void handleUploadEditImages(e.target.files);
                      e.currentTarget.value = "";
                    }}
                    style={themed(styles.modalInput)}
                    disabled={savingEdit || editImageUploading}
                  />
                </label>

                {editImageUploading && (
                  <div style={themed(styles.modalHint)}>Đang upload ảnh...</div>
                )}

                {editingProduct.images.length > 0 && (
                  <div style={themed(styles.modalUploadPreviewGrid)}>
                    {editingProduct.images.map((image) => (
                      <div
                        key={image.key}
                        style={themed(styles.modalUploadPreviewItem)}
                      >
                        <Image
                          src={image.url}
                          alt="Product preview"
                          width={180}
                          height={140}
                          unoptimized
                          style={themed(styles.modalUploadPreview)}
                        />
                        <button
                          type="button"
                          style={themed(styles.modalUploadRemoveButton)}
                          onClick={() =>
                            setEditingProduct((prev) =>
                              prev
                                ? {
                                    ...prev,
                                    images: prev.images.filter(
                                      (item) => item.key !== image.key,
                                    ),
                                  }
                                : prev,
                            )
                          }
                          disabled={savingEdit}
                        >
                          Xóa
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
                onClick={closeEditModal}
                disabled={savingEdit}
              >
                Hủy
              </button>
              <button
                type="button"
                style={themed(styles.primaryButton)}
                onClick={onSaveEditProduct}
                disabled={savingEdit}
              >
                {savingEdit ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      <section style={{ ...themed(styles.tableCard), marginTop: 16 }}>
        <div style={themed(styles.tableHeader)}>
          <div>
            <h3 style={{ margin: 0 }}>Theo dõi yêu cầu của bạn</h3>
            <p style={themed(styles.pageSubtitle)}>Yêu cầu tạo sản phẩm</p>
          </div>
          <select
            value={requestStatus}
            onChange={(e) => setRequestStatus(e.target.value)}
            style={themed(styles.search)}
          >
            <option value="all">Tất cả</option>
            <option value="pending">Chờ duyệt</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
        </div>

        <div style={themed(styles.requestGrid)}>
          <div style={themed(styles.requestBox)}>
            <h4 style={themed(styles.requestTitle)}>Yêu cầu tạo sản phẩm</h4>
            {requestsLoading && productRequests.length === 0 ? (
              <div style={themed(styles.muted)}>Đang tải...</div>
            ) : productRequests.length === 0 ? (
              <div style={themed(styles.muted)}>Chưa có yêu cầu.</div>
            ) : (
              productRequests.map((item) => (
                <div key={item.id} style={themed(styles.requestItem)}>
                  <div style={themed(styles.requestItemMain)}>
                    <div style={themed(styles.orderName)}>{item.name}</div>
                    <div style={themed(styles.orderMeta)}>
                      {item.category?.name ?? "-"} •{" "}
                      {new Date(item.created_at).toLocaleDateString("vi-VN")}
                    </div>
                  </div>
                  <span style={themed(styles.requestStatusPill)}>
                    {item.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
