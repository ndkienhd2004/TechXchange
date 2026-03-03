"use client";

import { useEffect, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveCatalogSpecRequestById,
  approveAdminProductById,
  cancelAdminProductById,
  fetchAdminCatalogSpecRequests,
  fetchAdminProductCounts,
  fetchAdminProducts,
  rejectCatalogSpecRequestById,
  setAdminCatalogSpecRequestsStatus,
  setAdminProductsStatus,
} from "@/features/admin/store/adminSlice";
import {
  selectAdminCatalogSpecRequests,
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

type CategoryNode = {
  id: number | string;
  name: string;
  level?: number | string;
  children?: CategoryNode[];
};

type CatalogRow = {
  id: number;
  name?: string;
  status?: string;
  msrp?: number | string | null;
  description?: string | null;
  brand?: { id?: number | string };
  category?: { id?: number | string };
};

const tabs: { key: AdminStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
];

export default function AdminProductsView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, page, totalPages, total, status, loading, counts } =
    useAppSelector(selectAdminProducts);
  const specRequests = useAppSelector(selectAdminCatalogSpecRequests);
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
  const [categoryOptions, setCategoryOptions] = useState<Array<{ id: number; name: string; level?: number }>>([]);

  useEffect(() => {
    dispatch(fetchAdminProducts({ page, status, limit: 10, q: q || undefined }));
  }, [dispatch, page, status, q]);

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
        const flat = (nodes: CategoryNode[], depth = 0) =>
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

  useEffect(() => {
    dispatch(
      fetchAdminCatalogSpecRequests({
        page: specRequests.page,
        status: specRequests.status,
        limit: 10,
      }),
    );
  }, [dispatch, specRequests.page, specRequests.status]);

  const onStatusChange = (nextStatus: AdminStatus) => {
    dispatch(setAdminProductsStatus(nextStatus));
  };

  const onApprove = async (id: number) => {
    await dispatch(approveAdminProductById(id));
    dispatch(fetchAdminProducts({ page, status, limit: 10, q: q || undefined }));
    dispatch(fetchAdminProductCounts());
  };

  const onReject = async (id: number) => {
    await dispatch(cancelAdminProductById(id));
    dispatch(fetchAdminProducts({ page, status, limit: 10, q: q || undefined }));
    dispatch(fetchAdminProductCounts());
  };

  const onApproveSpec = async (id: number) => {
    await dispatch(approveCatalogSpecRequestById(id));
    dispatch(
      fetchAdminCatalogSpecRequests({
        page: specRequests.page,
        status: specRequests.status,
        limit: 10,
      }),
    );
  };

  const onRejectSpec = async (id: number) => {
    await dispatch(rejectCatalogSpecRequestById({ id }));
    dispatch(
      fetchAdminCatalogSpecRequests({
        page: specRequests.page,
        status: specRequests.status,
        limit: 10,
      }),
    );
  };

  const onDeleteCatalog = async (id: number) => {
    const ok = window.confirm("Xóa catalog này?");
    if (!ok) return;
    await deleteAdminCatalogProduct(id);
    dispatch(fetchAdminProducts({ page, status, limit: 10, q: q || undefined }));
    dispatch(fetchAdminProductCounts());
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
    dispatch(fetchAdminProducts({ page, status, limit: 10, q: q || undefined }));
    dispatch(fetchAdminProductCounts());
  };

  const statusLabel = (value: string) => {
    if (value === "active") return "Đã duyệt";
    if (value === "approved") return "Đã duyệt";
    if (value === "pending") return "Chờ duyệt";
    if (value === "rejected") return "Từ chối";
    return value;
  };

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>{total} sản phẩm</p>
      </header>

      <section style={themed(styles.toolbar)}>
        <div style={themed(styles.searchWrap)}>
          <span style={themed(styles.searchIcon)}>
            <AppIcon name="search" />
          </span>
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={themed(styles.searchInput)}
          />
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={themed(styles.tabGroup)}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => onStatusChange(tab.key)}
                style={
                  tab.key === status
                    ? themed(styles.tabButtonActive)
                    : themed(styles.tabButton)
                }
              >
                {tab.label} ({counts[tab.key] ?? 0})
              </button>
            ))}
          </div>
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Thương hiệu</th>
              <th style={themed(styles.th)}>Danh mục</th>
              <th style={themed(styles.th)}>Giá niêm yết</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày tạo</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td style={themed(styles.td)} colSpan={7}>
                  <div style={themed(styles.emptyState)}>Không có sản phẩm phù hợp</div>
                </td>
              </tr>
            ) : (
              items.map((product) => (
                <tr key={product.id}>
                  <td style={themed(styles.td)}>{product.name}</td>
                  <td style={themed(styles.td)}>{product.brand?.name ?? "-"}</td>
                  <td style={themed(styles.td)}>{product.category?.name ?? "-"}</td>
                  <td style={themed(styles.td)}>
                    {product.msrp ?? "-"}
                  </td>
                  <td style={themed(styles.td)}>
                    <span
                      style={{
                        ...themed(styles.statusPill),
                        ...(product.status === "active"
                          ? themed(styles.statusApproved)
                          : themed(styles.statusPending)),
                      }}
                    >
                      {statusLabel(product.status)}
                    </span>
                  </td>
                  <td style={themed(styles.td)}>
                    {new Date(product.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={themed(styles.td)}>
                    <div style={themed(styles.rowActions)}>
                      <button
                        type="button"
                        style={themed(styles.iconButton)}
                        onClick={() => openEdit(product)}
                        title="Sửa"
                      >
                        <AppIcon name="edit" />
                      </button>
                      {product.status === "pending" && (
                        <button
                          type="button"
                          style={themed(styles.primaryButton)}
                          onClick={() => onApprove(product.id)}
                        >
                          Duyệt
                        </button>
                      )}
                      {product.status === "pending" && (
                        <button
                          type="button"
                          style={{
                            ...themed(styles.tabButton),
                            border: "1px solid #ef4444",
                            color: "#ef4444",
                          }}
                          onClick={() => onReject(product.id)}
                        >
                          Từ chối
                        </button>
                      )}
                      <button
                        type="button"
                        style={themed(styles.dangerButton)}
                        onClick={() => onDeleteCatalog(product.id)}
                        title="Xóa"
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

        <div style={themed(styles.paginationRow)}>
          <button
            type="button"
            onClick={() =>
              dispatch(
                fetchAdminProducts({
                  page: Math.max(page - 1, 1),
                  status,
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
                  status,
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
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.65)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1200,
            padding: 16,
          }}
        >
          <div style={{ ...themed(styles.tableCard), width: "min(760px, 94vw)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                placeholder="Tên sản phẩm"
                style={themed(styles.searchInput)}
              />
              <input
                value={editingMsrp}
                onChange={(e) => setEditingMsrp(e.target.value)}
                placeholder="MSRP"
                type="number"
                style={themed(styles.searchInput)}
              />
              <select
                value={editingStatus}
                onChange={(e) => setEditingStatus(e.target.value)}
                style={themed(styles.searchInput)}
              >
                <option value="pending">pending</option>
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="rejected">rejected</option>
                <option value="draft">draft</option>
              </select>
              <select
                value={editingBrandId}
                onChange={(e) => setEditingBrandId(e.target.value)}
                style={themed(styles.searchInput)}
              >
                <option value="">Chọn brand</option>
                {brandOptions.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
              <select
                value={editingCategoryId}
                onChange={(e) => setEditingCategoryId(e.target.value)}
                style={themed(styles.searchInput)}
              >
                <option value="">Chọn category</option>
                {categoryOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {`${c.level && c.level > 1 ? "— ".repeat(c.level - 1) : ""}${c.name}`}
                  </option>
                ))}
              </select>
              <span />
              <textarea
                value={editingDescription}
                onChange={(e) => setEditingDescription(e.target.value)}
                placeholder="Mô tả"
                style={{ ...themed(styles.searchInput), minHeight: 120, gridColumn: "1 / -1" }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              <button type="button" style={themed(styles.tabButton)} onClick={() => setEditOpen(false)}>
                Hủy
              </button>
              <button type="button" style={themed(styles.primaryButton)} onClick={onSaveEdit}>
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      <section style={{ ...themed(styles.tableCard), marginTop: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Yêu cầu thêm thông số</h3>
          <div style={themed(styles.tabGroup)}>
            {tabs.map((tab) => (
              <button
                key={`spec-${tab.key}`}
                type="button"
                onClick={() => dispatch(setAdminCatalogSpecRequestsStatus(tab.key))}
                style={
                  tab.key === specRequests.status
                    ? themed(styles.tabButtonActive)
                    : themed(styles.tabButton)
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Catalog</th>
              <th style={themed(styles.th)}>Spec key</th>
              <th style={themed(styles.th)}>Giá trị đề xuất</th>
              <th style={themed(styles.th)}>Người gửi</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!specRequests.loading && specRequests.items.length === 0 ? (
              <tr>
                <td style={themed(styles.td)} colSpan={6}>
                  <div style={themed(styles.emptyState)}>Không có yêu cầu thông số</div>
                </td>
              </tr>
            ) : (
              specRequests.items.map((row) => (
                <tr key={row.id}>
                  <td style={themed(styles.td)}>{row.catalog?.name ?? `#${row.catalog_id}`}</td>
                  <td style={themed(styles.td)}>{row.spec_key}</td>
                  <td style={themed(styles.td)}>
                    {Array.isArray(row.proposed_values)
                      ? row.proposed_values.join(" | ")
                      : "-"}
                  </td>
                  <td style={themed(styles.td)}>{row.requester?.username ?? "-"}</td>
                  <td style={themed(styles.td)}>{statusLabel(row.status)}</td>
                  <td style={themed(styles.td)}>
                    {row.status === "pending" ? (
                      <div style={themed(styles.rowActions)}>
                        <button
                          type="button"
                          style={themed(styles.primaryButton)}
                          onClick={() => onApproveSpec(row.id)}
                        >
                          Duyệt
                        </button>
                        <button
                          type="button"
                          style={themed(styles.dangerButton)}
                          onClick={() => onRejectSpec(row.id)}
                        >
                          Từ chối
                        </button>
                      </div>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </AdminLayout>
  );
}
