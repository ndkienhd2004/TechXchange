"use client";

import { useEffect, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminProductCounts,
  fetchAdminProducts,
  setAdminProductsStatus,
} from "@/features/admin/store/adminSlice";
import {
  selectAdminProducts,
} from "@/features/admin/store/adminSelectors";
import type { AdminStatus } from "@/features/admin/types";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";
import {
  deleteAdminCatalogProduct,
  getAdminCategories,
  getSimpleBrands,
  updateAdminCatalogProduct,
} from "../services/adminApi";
import AppIcon from "@/components/commons/AppIcon";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

type CategoryNode = {
  id: number | string;
  name: string;
  level?: number | string;
  children?: CategoryNode[];
};

type CategoryOption = { id: number; name: string; level?: number };

type CatalogRow = {
  id: number;
  name?: string;
  status?: string;
  msrp?: number | string | null;
  description?: string | null;
  brand?: { id?: number | string };
  category?: { id?: number | string };
};

export default function AdminProductsView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, page, totalPages, total, loading } =
    useAppSelector(selectAdminProducts);
  const productState = useAppSelector(selectAdminProducts);
  const [q, setQ] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingStatus, setEditingStatus] = useState("pending");
  const [editingMsrp, setEditingMsrp] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingBrandId, setEditingBrandId] = useState("");
  const [editingCategoryId, setEditingCategoryId] = useState("");
  const [brandOptions, setBrandOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  const formatVnd = (value?: number | string | null) =>
    value == null || value === ""
      ? "-"
      : new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
          maximumFractionDigits: 0,
        }).format(Number(value || 0));

  useEffect(() => {
    dispatch(
      fetchAdminProducts({
        page,
        status: productState.status,
        limit: 10,
        q: q || undefined,
      }),
    );
  }, [dispatch, page, productState.status, q]);

  useEffect(() => {
    dispatch(fetchAdminProductCounts());
  }, [dispatch]);

  useEffect(() => {
    (async () => {
      try {
        const [brands, categories] = await Promise.all([
          getSimpleBrands(),
          getAdminCategories(),
        ]);
        setBrandOptions(Array.isArray(brands) ? brands : []);
        const rawCats: CategoryNode[] = Array.isArray(categories?.data)
          ? (categories.data as CategoryNode[])
          : [];
        const flat = (nodes: CategoryNode[], depth = 0): CategoryOption[] =>
          nodes.flatMap((n) => [
            { id: Number(n.id), name: n.name, level: Number(n.level || depth + 1) },
            ...(Array.isArray(n.children) ? flat(n.children, depth + 1) : []),
          ]);
        setCategoryOptions(flat(rawCats));
      } catch {
        setBrandOptions([]);
        setCategoryOptions([]);
      }
    })();
  }, []);

  const onDeleteCatalog = async (id: number) => {
    const ok = window.confirm("Xóa catalog này?");
    if (!ok) return;
    try {
      await deleteAdminCatalogProduct(id);
      showSuccessToast("Xóa catalog thành công");
      dispatch(
        fetchAdminProducts({
          page,
          status: productState.status,
          limit: 10,
          q: q || undefined,
        }),
      );
      dispatch(fetchAdminProductCounts());
    } catch (error) {
      showErrorToast(error);
    }
  };

  const openEdit = (product: CatalogRow) => {
    setEditingId(Number(product.id));
    setEditingName(product.name ?? "");
    setEditingStatus(product.status ?? "pending");
    setEditingMsrp(product.msrp != null ? String(product.msrp) : "");
    setEditingDescription(product.description ?? "");
    setEditingBrandId(product.brand?.id ? String(product.brand.id) : "");
    setEditingCategoryId(product.category?.id ? String(product.category.id) : "");
    setEditOpen(true);
  };

  const onSaveEdit = async () => {
    if (!editingId || !editingName.trim()) return;
    await updateAdminCatalogProduct(editingId, {
      name: editingName.trim(),
      status: editingStatus,
      msrp: editingMsrp ? Number(editingMsrp) : undefined,
      description: editingDescription || null,
      brand_id: editingBrandId ? Number(editingBrandId) : undefined,
      category_id: editingCategoryId ? Number(editingCategoryId) : undefined,
    });
    setEditOpen(false);
    dispatch(
      fetchAdminProducts({
        page,
        status: productState.status,
        limit: 10,
        q: q || undefined,
      }),
    );
    dispatch(fetchAdminProductCounts());
  };

  const statusLabel = (value: string) => {
    if (value === "active") return "Đã duyệt";
    if (value === "approved") return "Đã duyệt";
    if (value === "pending") return "Chờ duyệt";
    if (value === "rejected") return "Từ chối";
    return value;
  };

  const productTabs = [
    { key: "all" as const, label: "Tất cả", count: productState.counts.all },
    {
      key: "pending" as const,
      label: "Chờ duyệt",
      count: productState.counts.pending,
    },
    {
      key: "approved" as const,
      label: "Đã duyệt",
      count: productState.counts.approved,
    },
    {
      key: "rejected" as const,
      label: "Từ chối",
      count: productState.counts.rejected,
    },
  ];

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Danh mục sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>
          Quản lý catalog sản phẩm chuẩn, rà soát trạng thái duyệt và cập nhật
          thông tin chung.
        </p>
      </header>

      <section style={themed(styles.summaryGrid)}>
        <div style={themed(styles.summaryCard)}>
          <span style={themed(styles.summaryLabel)}>Tổng catalog</span>
          <strong style={themed(styles.summaryValue)}>
            {productState.counts.all.toLocaleString("vi-VN")}
          </strong>
        </div>
        <div style={themed(styles.summaryCard)}>
          <span style={themed(styles.summaryLabel)}>Chờ duyệt</span>
          <strong style={themed(styles.summaryValue)}>
            {productState.counts.pending.toLocaleString("vi-VN")}
          </strong>
        </div>
        <div style={themed(styles.summaryCard)}>
          <span style={themed(styles.summaryLabel)}>Đã duyệt</span>
          <strong style={themed(styles.summaryValue)}>
            {productState.counts.approved.toLocaleString("vi-VN")}
          </strong>
        </div>
        <div style={themed(styles.summaryCard)}>
          <span style={themed(styles.summaryLabel)}>Từ chối</span>
          <strong style={themed(styles.summaryValue)}>
            {productState.counts.rejected.toLocaleString("vi-VN")}
          </strong>
        </div>
      </section>

      <section style={themed(styles.toolbarStack)}>
        <div style={themed(styles.tabGroup)}>
          {productTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => dispatch(setAdminProductsStatus(tab.key))}
              style={
                tab.key === productState.status
                  ? themed(styles.tabButtonActive)
                  : themed(styles.tabButton)
              }
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div style={themed(styles.toolbarRow)}>
          <div style={themed(styles.searchWrap)}>
            <span style={themed(styles.searchIcon)}>
              <AppIcon name="search" />
            </span>
            <input
              type="text"
              placeholder="Tìm theo tên sản phẩm, thương hiệu hoặc danh mục..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              style={themed(styles.searchInput)}
            />
          </div>
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <div style={themed(styles.tableHeader)}>
          <div style={themed(styles.tableHeaderMeta)}>
            <h2 style={themed(styles.tableHeaderTitle)}>Danh sách catalog</h2>
            <span style={themed(styles.tableHeaderSubtitle)}>
              {loading
                ? "Đang tải dữ liệu..."
                : `${total.toLocaleString("vi-VN")} kết quả phù hợp`}
            </span>
          </div>
        </div>

        <div style={themed(styles.tableWrap)}>
          <table style={themed(styles.table)}>
            <thead>
              <tr>
                <th style={{ ...themed(styles.th), width: "42%" }}>Sản phẩm</th>
                <th style={{ ...themed(styles.th), width: "11%" }}>Thương hiệu</th>
                <th style={{ ...themed(styles.th), width: "11%" }}>Danh mục</th>
                <th style={{ ...themed(styles.th), width: "12%" }}>Giá niêm yết</th>
                <th style={{ ...themed(styles.th), width: "11%" }}>Trạng thái</th>
                <th style={{ ...themed(styles.th), width: "9%" }}>Ngày tạo</th>
                <th style={{ ...themed(styles.th), width: "9%" }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={7}>
                    <div style={themed(styles.emptyState)}>
                      Không có sản phẩm phù hợp
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((product) => (
                  <tr key={product.id}>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.productCell)}>
                        <div style={themed(styles.productTitle)}>{product.name}</div>
                        <div style={themed(styles.inlineMeta)}>
                          <span style={themed(styles.inlineMetaPill)}>
                            ID #{product.id}
                          </span>
                          {product.status && (
                            <span style={themed(styles.inlineMetaPill)}>
                              Mã trạng thái: {product.status}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={themed(styles.td)}>
                      <span style={themed(styles.cellTextStrong)}>
                        {product.brand?.name ?? "-"}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      <span style={themed(styles.cellTextStrong)}>
                        {product.category?.name ?? "-"}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      <span style={themed(styles.cellTextStrong)}>
                        {formatVnd(product.msrp)}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      <span
                        style={{
                          ...themed(styles.statusPill),
                          ...(product.status === "active" ||
                          product.status === "approved"
                            ? themed(styles.statusApproved)
                            : product.status === "rejected"
                              ? themed(styles.statusRejected)
                              : themed(styles.statusPending)),
                        }}
                      >
                        {statusLabel(product.status)}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      <span style={themed(styles.cellTextMuted)}>
                        {new Date(product.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.rowActions)}>
                        <button
                          type="button"
                          style={themed(styles.iconButton)}
                          onClick={() => openEdit(product)}
                          title="Sửa catalog"
                        >
                          <AppIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          style={themed(styles.dangerButton)}
                          onClick={() => onDeleteCatalog(product.id)}
                          title="Xóa catalog"
                        >
                          <AppIcon name="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div style={themed(styles.paginationRow)}>
          <button
            type="button"
            onClick={() =>
              dispatch(
                fetchAdminProducts({
                  page: Math.max(page - 1, 1),
                  status: productState.status,
                  limit: 10,
                  q: q || undefined,
                })
              )
            }
            disabled={page <= 1 || loading}
            style={themed(page <= 1 ? styles.tabButton : styles.tabButtonActive)}
          >
            Trước
          </button>
          <span style={themed(styles.pageSubtitle)}>
            Trang {page}/{Math.max(totalPages, 1)}
          </span>
          <button
            type="button"
            onClick={() =>
              dispatch(
                fetchAdminProducts({
                  page: Math.min(page + 1, Math.max(totalPages, 1)),
                  status: productState.status,
                  limit: 10,
                  q: q || undefined,
                })
              )
            }
            disabled={page >= totalPages || loading}
            style={themed(page >= totalPages ? styles.tabButton : styles.tabButtonActive)}
          >
            Sau
          </button>
        </div>
      </section>

      {editOpen && (
        <div style={themed(styles.modalOverlay)}>
          <div style={{ ...themed(styles.modalCard), width: "min(760px, 94vw)" }}>
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>Chỉnh sửa catalog</h3>
            </div>
            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.formGrid)}>
                <label style={themed(styles.formFieldFull)}>
                  <span style={themed(styles.formLabel)}>Tên sản phẩm</span>
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    placeholder="Nhập tên sản phẩm"
                    style={themed(styles.formInput)}
                  />
                </label>
                <label style={themed(styles.formField)}>
                  <span style={themed(styles.formLabel)}>Giá niêm yết</span>
                  <input
                    value={editingMsrp}
                    onChange={(e) => setEditingMsrp(e.target.value)}
                    placeholder="Nhập MSRP"
                    type="number"
                    style={themed(styles.formInput)}
                  />
                </label>
                <label style={themed(styles.formField)}>
                  <span style={themed(styles.formLabel)}>Trạng thái</span>
                  <select
                    value={editingStatus}
                    onChange={(e) => setEditingStatus(e.target.value)}
                    style={themed(styles.formInput)}
                  >
                    <option value="pending">Chờ duyệt</option>
                    <option value="active">Đã duyệt</option>
                    <option value="inactive">Ngừng hiển thị</option>
                    <option value="rejected">Từ chối</option>
                    <option value="draft">Nháp</option>
                  </select>
                </label>
                <label style={themed(styles.formField)}>
                  <span style={themed(styles.formLabel)}>Thương hiệu</span>
                  <select
                    value={editingBrandId}
                    onChange={(e) => setEditingBrandId(e.target.value)}
                    style={themed(styles.formInput)}
                  >
                    <option value="">Chọn thương hiệu</option>
                    {brandOptions.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={themed(styles.formField)}>
                  <span style={themed(styles.formLabel)}>Danh mục</span>
                  <select
                    value={editingCategoryId}
                    onChange={(e) => setEditingCategoryId(e.target.value)}
                    style={themed(styles.formInput)}
                  >
                    <option value="">Chọn danh mục</option>
                    {categoryOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {`${c.level && c.level > 1 ? "— ".repeat(c.level - 1) : ""}${c.name}`}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={themed(styles.formFieldFull)}>
                  <span style={themed(styles.formLabel)}>Mô tả</span>
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    placeholder="Nhập mô tả sản phẩm"
                    style={themed(styles.formTextarea)}
                  />
                </label>
              </div>
            </div>
            <div style={themed(styles.modalFooter)}>
              <button
                type="button"
                style={themed(styles.tabButton)}
                onClick={() => setEditOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                style={themed(styles.primaryButton)}
                onClick={onSaveEdit}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
