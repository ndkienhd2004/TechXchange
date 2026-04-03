"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  getSimpleBrands,
  updateAdminCategory,
} from "@/features/admin/services/adminApi";
import type { AdminCategory } from "@/features/admin/types";
import AppIcon from "@/components/commons/AppIcon";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

type FlatCategory = AdminCategory & { depth: number };

const flatten = (nodes: AdminCategory[], depth = 0): FlatCategory[] => {
  return nodes.flatMap((node) => {
    const current: FlatCategory = { ...node, depth };
    const children = Array.isArray(node.children)
      ? flatten(node.children, depth + 1)
      : [];
    return [current, ...children];
  });
};

export default function AdminCategoriesView() {
  const { theme, themed } = useAppTheme();
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [createType, setCreateType] = useState<"root" | "child">("root");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
  const [brands, setBrands] = useState<Array<{ id: number; name: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (err: unknown, fallback: string) => {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      (err as { response?: { data?: { message?: string } } }).response?.data
        ?.message
    ) {
      return (
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? fallback
      );
    }
    return fallback;
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getAdminCategories();
      setItems(res?.data ?? []);
      const brandRes = await getSimpleBrands();
      setBrands(Array.isArray(brandRes) ? brandRes : []);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Không tải được danh mục"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const flatItems = useMemo(() => flatten(items), [items]);
  const brandNameSet = useMemo(
    () => new Set(brands.map((b) => b.name.trim().toLowerCase())),
    [brands],
  );

  const onCreate = async () => {
    if (!name.trim()) {
      setError("Tên danh mục là bắt buộc");
      return;
    }
    if (createType === "child" && !parentId) {
      setError("Vui lòng chọn category cha");
      return;
    }
    if (brandNameSet.has(name.trim().toLowerCase())) {
      setError("Tên này đang thuộc brand. Hãy tạo/chỉnh ở trang Thương hiệu.");
      return;
    }
    try {
      setError(null);
      await createAdminCategory({
        name: name.trim(),
        slug: slug.trim() || undefined,
        parent_id:
          createType === "child" && parentId ? Number(parentId) : null,
      });
      setName("");
      setSlug("");
      setParentId("");
      setModalOpen(false);
      await loadCategories();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Tạo danh mục thất bại"));
    }
  };

  const onToggleActive = async (item: FlatCategory) => {
    try {
      await updateAdminCategory(item.id, { is_active: !item.is_active });
      await loadCategories();
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Cập nhật thất bại"));
    }
  };

  const onDelete = async (item: FlatCategory) => {
    const ok = window.confirm(`Xóa danh mục "${item.name}"?`);
    if (!ok) return;
    try {
      await deleteAdminCategory(item.id);
      showSuccessToast("Xóa danh mục thành công");
      await loadCategories();
    } catch (e: unknown) {
      const message = getErrorMessage(e, "Xóa thất bại");
      setError(message);
      showErrorToast(message);
    }
  };

  const openCreateModal = (type: "root" | "child", parent?: number) => {
    setCreateType(type);
    setParentId(parent ? String(parent) : "");
    setName("");
    setSlug("");
    setError(null);
    setModalOpen(true);
  };

  const renderTreeNode = (node: AdminCategory, depth = 0): React.ReactNode => {
    const children = Array.isArray(node.children) ? node.children : [];
    return (
      <div key={node.id} style={{ display: "grid", gap: 8 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: 8,
            borderRadius: 10,
            padding: "10px 12px",
            marginLeft: depth * 16,
            background: `${theme.colors.palette.backgrounds.hover}33`,
            border: `1px solid ${theme.colors.palette.borders.default}`,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <span style={{ fontWeight: 600 }}>{node.name}</span>
          </div>
          <div style={themed(styles.rowActions)}>
            <button
              type="button"
              style={themed(styles.tabButton)}
              onClick={() => openCreateModal("child", node.id)}
            >
              + Thêm nhánh
            </button>
            <button
              type="button"
              style={themed(styles.tabButton)}
              onClick={() => onToggleActive({ ...node, depth } as FlatCategory)}
            >
              {node.is_active ? "Ẩn" : "Hiện"}
            </button>
            <button
              type="button"
              style={themed(styles.dangerButton)}
              onClick={() => onDelete({ ...node, depth } as FlatCategory)}
            >
              <AppIcon name="delete" />
            </button>
          </div>
        </div>
        {children.length > 0 && (
          <div
            style={{
              display: "grid",
              gap: 8,
              marginLeft: 8,
              paddingLeft: 12,
              borderLeft: `1px dashed ${theme.colors.palette.borders.light}`,
            }}
          >
            {children.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý danh mục</h1>
        <p style={themed(styles.pageSubtitle)}>Cây danh mục sản phẩm</p>
      </header>

      <section style={themed(styles.tableCard)}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div />
          <button
            type="button"
            style={themed(styles.primaryButton)}
            onClick={() => openCreateModal("root")}
          >
            + Tạo category
          </button>
        </div>

        {error && (
          <div
            style={{
              ...themed(styles.muted),
              marginTop: 12,
              color: theme.colors.palette.semantic.error,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
          {!loading && items.length === 0 ? (
            <div style={themed(styles.emptyState)}>Chưa có danh mục</div>
          ) : (
            items.map((item) => renderTreeNode(item, 0))
          )}
        </div>
      </section>

      {modalOpen && (
        <div style={themed(styles.modalOverlay)}>
          <div style={themed(styles.modalCard)}>
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>
                {createType === "root" ? "Tạo danh mục chính" : "Tạo nhánh danh mục"}
              </h3>
              <button type="button" style={themed(styles.iconButton)} onClick={() => setModalOpen(false)}>
                <AppIcon name="close" />
              </button>
            </div>

            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.modalSection)}>
                <label style={themed(styles.muted)}>Loại category</label>
                <div style={themed(styles.rowActions)}>
                  <button
                    type="button"
                    style={
                      createType === "root"
                        ? themed(styles.tabButtonActive)
                        : themed(styles.tabButton)
                    }
                    onClick={() => setCreateType("root")}
                  >
                    Danh mục chính
                  </button>
                  <button
                    type="button"
                    style={
                      createType === "child"
                        ? themed(styles.tabButtonActive)
                        : themed(styles.tabButton)
                    }
                    onClick={() => setCreateType("child")}
                  >
                    Nhánh danh mục
                  </button>
                </div>
              </div>

              {createType === "child" && (
                <div style={themed(styles.modalSection)}>
                  <label style={themed(styles.muted)}>Thuộc danh mục</label>
                  <select
                    value={parentId}
                    onChange={(e) => setParentId(e.target.value)}
                    style={themed(styles.searchInput)}
                  >
                    <option value="">Chọn danh mục</option>
                    {flatItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {"-".repeat(item.depth)} {item.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div style={themed(styles.modalSection)}>
                <label style={themed(styles.muted)}>Tên danh mục</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Linh kiện, RAM, CPU..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={themed(styles.searchInput)}
                />
              </div>

              <div style={themed(styles.modalSection)}>
                <label style={themed(styles.muted)}>Slug (tuỳ chọn)</label>
                <input
                  type="text"
                  placeholder="Tuỳ chọn, để trống sẽ tự sinh"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={themed(styles.searchInput)}
                />
              </div>
            </div>

            <div style={themed(styles.modalFooter)}>
              <button type="button" style={themed(styles.tabButton)} onClick={() => setModalOpen(false)}>
                Hủy
              </button>
              <button type="button" style={themed(styles.primaryButton)} onClick={onCreate}>
                Tạo
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
