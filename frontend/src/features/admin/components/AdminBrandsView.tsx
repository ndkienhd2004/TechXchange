"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveBrandRequestById,
  fetchAdminBrandRequests,
  rejectBrandRequestById,
  setAdminBrandRequestsStatus,
} from "@/features/admin/store/adminSlice";
import { selectAdminBrandRequests } from "@/features/admin/store/adminSelectors";
import type { AdminStatus } from "@/features/admin/types";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";
import AppIcon from "@/components/commons/AppIcon";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { uploadImageToS3 } from "@/services/uploadApi";
import {
  createAdminBrand,
  deleteAdminBrand,
  getSimpleBrands,
  updateAdminBrand,
} from "../services/adminApi";

const requestTabs: { key: AdminStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
];

type BrandMode = "brands" | "requests";
type BrandOption = { id: number; name: string; image?: string };

const BRAND_PAGE_SIZE = 10;

export default function AdminBrandsView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, page, totalPages, total, status, loading } =
    useAppSelector(selectAdminBrandRequests);

  const [mode, setMode] = useState<BrandMode>("brands");
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [brandsLoading, setBrandsLoading] = useState(false);
  const [brandQuery, setBrandQuery] = useState("");
  const [brandPage, setBrandPage] = useState(1);

  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState<number | null>(null);
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState("");
  const [brandImageUploading, setBrandImageUploading] = useState(false);
  const maxUploadBytes = 10 * 1024 * 1024;
  const allowedUploadTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  const loadBrands = async () => {
    try {
      setBrandsLoading(true);
      const result = await getSimpleBrands();
      const rows = Array.isArray(result) ? result : [];
      setBrands(rows);
    } catch {
      setBrands([]);
    } finally {
      setBrandsLoading(false);
    }
  };

  useEffect(() => {
    if (mode === "requests") {
      dispatch(fetchAdminBrandRequests({ page, status, limit: 10 }));
    }
  }, [dispatch, mode, page, status]);

  useEffect(() => {
    void loadBrands();
  }, []);

  const onStatusChange = (nextStatus: AdminStatus) => {
    dispatch(setAdminBrandRequestsStatus(nextStatus));
  };

  const onApprove = async (id: number) => {
    await dispatch(approveBrandRequestById(id));
    dispatch(fetchAdminBrandRequests({ page, status, limit: 10 }));
    await loadBrands();
  };

  const onReject = async (id: number) => {
    const note = window.prompt("Nhập lý do từ chối");
    await dispatch(rejectBrandRequestById({ id, note: note ?? undefined }));
    dispatch(fetchAdminBrandRequests({ page, status, limit: 10 }));
  };

  const filteredBrands = useMemo(() => {
    const keyword = brandQuery.trim().toLowerCase();
    if (!keyword) return brands;
    return brands.filter((brand) => brand.name.toLowerCase().includes(keyword));
  }, [brands, brandQuery]);

  const totalBrandPages = Math.max(
    1,
    Math.ceil(filteredBrands.length / BRAND_PAGE_SIZE),
  );

  useEffect(() => {
    if (brandPage > totalBrandPages) {
      setBrandPage(totalBrandPages);
    }
  }, [brandPage, totalBrandPages]);

  const pagedBrands = useMemo(() => {
    const start = (brandPage - 1) * BRAND_PAGE_SIZE;
    return filteredBrands.slice(start, start + BRAND_PAGE_SIZE);
  }, [filteredBrands, brandPage]);

  const openCreateBrand = () => {
    setEditingBrandId(null);
    setBrandName("");
    setBrandImage("");
    setBrandModalOpen(true);
  };

  const openEditBrand = (brand: BrandOption) => {
    setEditingBrandId(brand.id);
    setBrandName(brand.name);
    setBrandImage(brand.image ?? "");
    setBrandModalOpen(true);
  };

  const onSaveBrand = async () => {
    if (!brandName.trim()) return;
    try {
      if (editingBrandId) {
        await updateAdminBrand(editingBrandId, {
          name: brandName.trim(),
          image: brandImage.trim() || undefined,
        });
        showSuccessToast("Cập nhật thương hiệu thành công");
      } else {
        await createAdminBrand({
          name: brandName.trim(),
          image: brandImage.trim() || undefined,
        });
        showSuccessToast("Tạo thương hiệu thành công");
      }
      setBrandModalOpen(false);
      await loadBrands();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const onBrandImageFileChange = async (file: File) => {
    if (!allowedUploadTypes.includes(file.type)) {
      showErrorToast("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > maxUploadBytes) {
      showErrorToast("Ảnh vượt quá 10MB");
      return;
    }

    try {
      setBrandImageUploading(true);
      const uploaded = await uploadImageToS3({ file, folder: "brands" });
      setBrandImage(uploaded.url);
      showSuccessToast("Upload logo thương hiệu thành công");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setBrandImageUploading(false);
    }
  };

  const onDeleteBrand = async (id: number) => {
    const ok = window.confirm("Xóa brand này?");
    if (!ok) return;
    try {
      await deleteAdminBrand(id);
      showSuccessToast("Xóa thương hiệu thành công");
      await loadBrands();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const requestStatusLabel = (value: string) => {
    if (value === "pending") return "Chờ duyệt";
    if (value === "approved") return "Đã duyệt";
    if (value === "rejected") return "Từ chối";
    return value;
  };

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý thương hiệu</h1>
        <p style={themed(styles.pageSubtitle)}>
          {mode === "brands"
            ? `${brands.length} thương hiệu có sẵn`
            : `${total} yêu cầu tạo thương hiệu`}
        </p>
      </header>

      <section style={themed(styles.toolbar)}>
        <div style={themed(styles.tabGroup)}>
          <button
            type="button"
            style={
              mode === "brands"
                ? themed(styles.tabButtonActive)
                : themed(styles.tabButton)
            }
            onClick={() => setMode("brands")}
          >
            Brand có sẵn
          </button>
          <button
            type="button"
            style={
              mode === "requests"
                ? themed(styles.tabButtonActive)
                : themed(styles.tabButton)
            }
            onClick={() => setMode("requests")}
          >
            Brand request
          </button>
        </div>

        {mode === "brands" ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={themed(styles.searchWrap)}>
              <span style={themed(styles.searchIcon)}>
                <AppIcon name="search" />
              </span>
              <input
                type="text"
                value={brandQuery}
                onChange={(e) => setBrandQuery(e.target.value)}
                placeholder="Tìm thương hiệu..."
                style={themed(styles.searchInput)}
              />
            </div>
            <button
              type="button"
              style={themed(styles.primaryButton)}
              onClick={openCreateBrand}
            >
              + Tạo brand
            </button>
          </div>
        ) : (
          <div style={themed(styles.tabGroup)}>
            {requestTabs.map((tab) => (
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
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </section>

      {mode === "brands" ? (
        <section style={themed(styles.tableCard)}>
          <table style={themed(styles.table)}>
            <thead>
              <tr>
                <th style={themed(styles.th)}>ID</th>
                <th style={themed(styles.th)}>Tên thương hiệu</th>
                <th style={themed(styles.th)}>Logo</th>
                <th style={themed(styles.th)}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!brandsLoading && pagedBrands.length === 0 ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={4}>
                    <div style={themed(styles.emptyState)}>
                      Không có thương hiệu phù hợp
                    </div>
                  </td>
                </tr>
              ) : (
                pagedBrands.map((brand) => (
                  <tr key={brand.id}>
                    <td style={themed(styles.td)}>{brand.id}</td>
                    <td style={themed(styles.td)}>{brand.name}</td>
                    <td style={themed(styles.td)}>
                      {brand.image ? (
                        <Image
                          src={brand.image}
                          alt={brand.name}
                          width={120}
                          height={68}
                          style={{
                            width: "72px",
                            height: "42px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid rgba(148,163,184,0.25)",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.rowActions)}>
                        <button
                          type="button"
                          style={themed(styles.iconButton)}
                          onClick={() => openEditBrand(brand)}
                          title="Sửa"
                        >
                          <AppIcon name="edit" />
                        </button>
                        <button
                          type="button"
                          style={themed(styles.dangerButton)}
                          onClick={() => onDeleteBrand(brand.id)}
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
              onClick={() => setBrandPage((p) => Math.max(1, p - 1))}
              disabled={brandPage <= 1 || brandsLoading}
              style={themed(brandPage <= 1 ? styles.tabButton : styles.tabButtonActive)}
            >
              Trước
            </button>
            <span style={themed(styles.pageSubtitle)}>
              Trang {brandPage}/{totalBrandPages}
            </span>
            <button
              type="button"
              onClick={() => setBrandPage((p) => Math.min(totalBrandPages, p + 1))}
              disabled={brandPage >= totalBrandPages || brandsLoading}
              style={themed(
                brandPage >= totalBrandPages ? styles.tabButton : styles.tabButtonActive,
              )}
            >
              Sau
            </button>
          </div>
        </section>
      ) : (
        <section style={themed(styles.tableCard)}>
          <table style={themed(styles.table)}>
            <thead>
              <tr>
                <th style={themed(styles.th)}>Tên thương hiệu</th>
                <th style={themed(styles.th)}>Người gửi</th>
                <th style={themed(styles.th)}>Trạng thái</th>
                <th style={themed(styles.th)}>Ngày tạo</th>
                <th style={themed(styles.th)}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && items.length === 0 ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={5}>
                    <div style={themed(styles.emptyState)}>
                      Không có yêu cầu phù hợp
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((brand) => (
                  <tr key={brand.id}>
                    <td style={themed(styles.td)}>{brand.name}</td>
                    <td style={themed(styles.td)}>
                      {brand.requester?.email ?? "-"}
                    </td>
                    <td style={themed(styles.td)}>
                      {requestStatusLabel(brand.status)}
                    </td>
                    <td style={themed(styles.td)}>
                      {new Date(brand.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={themed(styles.td)}>
                      <div style={themed(styles.rowActions)}>
                        {brand.status === "pending" && (
                          <>
                            <button
                              type="button"
                              style={themed(styles.primaryButton)}
                              onClick={() => onApprove(brand.id)}
                            >
                              Duyệt
                            </button>
                            <button
                              type="button"
                              style={themed(styles.dangerButton)}
                              onClick={() => onReject(brand.id)}
                            >
                              <AppIcon name="reject" />
                            </button>
                          </>
                        )}
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
                  fetchAdminBrandRequests({
                    page: Math.max(page - 1, 1),
                    status,
                    limit: 10,
                  }),
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
                  fetchAdminBrandRequests({
                    page: Math.min(page + 1, Math.max(totalPages, 1)),
                    status,
                    limit: 10,
                  }),
                )
              }
              disabled={page >= totalPages || loading}
              style={themed(page >= totalPages ? styles.tabButton : styles.tabButtonActive)}
            >
              Sau
            </button>
          </div>
        </section>
      )}

      {brandModalOpen && (
        <div style={themed(styles.modalOverlay)}>
          <div style={themed(styles.modalCard)}>
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>
                {editingBrandId ? "Sửa thương hiệu" : "Tạo thương hiệu mới"}
              </h3>
              <button
                type="button"
                style={themed(styles.iconButton)}
                onClick={() => setBrandModalOpen(false)}
              >
                <AppIcon name="close" />
              </button>
            </div>

            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.modalSection)}>
                <label style={themed(styles.muted)}>Tên thương hiệu</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="Nhập tên thương hiệu"
                  style={themed(styles.searchInput)}
                />
              </div>
              <div style={themed(styles.modalSection)}>
                <label style={themed(styles.muted)}>
                  Logo thương hiệu (tuỳ chọn)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void onBrandImageFileChange(file);
                    }
                    e.currentTarget.value = "";
                  }}
                  style={themed(styles.searchInput)}
                />
                <span style={themed(styles.muted)}>
                  {brandImageUploading
                    ? "Đang upload..."
                    : "JPG, PNG, WEBP, GIF (tối đa 10MB)"}
                </span>
                {brandImage ? (
                  <Image
                    src={brandImage}
                    alt="Brand logo preview"
                    width={360}
                    height={140}
                    style={{
                      width: "140px",
                      height: "80px",
                      objectFit: "cover",
                      borderRadius: "8px",
                      border: "1px solid rgba(148,163,184,0.25)",
                    }}
                  />
                ) : null}
              </div>
            </div>

            <div style={themed(styles.modalFooter)}>
              <button
                type="button"
                style={themed(styles.tabButton)}
                onClick={() => setBrandModalOpen(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                style={themed(styles.primaryButton)}
                onClick={onSaveBrand}
                disabled={brandImageUploading}
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
