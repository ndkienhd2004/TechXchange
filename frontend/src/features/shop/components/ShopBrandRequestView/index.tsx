"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { uploadImageToS3 } from "@/services/uploadApi";
import {
  createBrandRequestService,
  getMyBrandRequestsService,
} from "../../sevices";

type RequestStatus = "pending" | "approved" | "rejected";
type RequestStatusFilter = "all" | RequestStatus;

type ShopBrandRequest = {
  id: number;
  name: string;
  status: RequestStatus;
  created_at: string;
  admin_note?: string | null;
};

const statusTabs: Array<{ key: RequestStatusFilter; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
];

const PAGE_SIZE = 10;

export default function ShopBrandRequestView() {
  const { themed, theme } = useAppTheme();
  const [brandName, setBrandName] = useState("");
  const [logoImage, setLogoImage] = useState<{ url: string; key: string } | null>(
    null,
  );
  const [logoUploading, setLogoUploading] = useState(false);
  const [status, setStatus] = useState<RequestStatusFilter>("all");
  const [requests, setRequests] = useState<ShopBrandRequest[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maxUploadBytes = 10 * 1024 * 1024;
  const allowedUploadTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  const getStatusLabel = (value: RequestStatus) => {
    if (value === "approved") return "Đã duyệt";
    if (value === "rejected") return "Từ chối";
    return "Chờ duyệt";
  };

  const getStatusTone = (value: RequestStatus) => {
    if (value === "approved") return theme.colors.palette.status.approved;
    if (value === "rejected") return theme.colors.palette.status.rejected;
    return theme.colors.palette.status.pending;
  };

  const fetchMyRequests = useCallback(
    async (targetPage: number, targetStatus: RequestStatusFilter) => {
      try {
        setLoading(true);
        const response = await getMyBrandRequestsService({
          page: targetPage,
          limit: PAGE_SIZE,
          status: targetStatus,
        });
        const data = response?.data || {};
        setRequests(Array.isArray(data.requests) ? data.requests : []);
        setTotal(Number(data.total || 0));
        setTotalPages(Math.max(1, Number(data.totalPages || 1)));
        setPage(Number(data.page || targetPage));
      } catch (error) {
        setRequests([]);
        setTotal(0);
        setTotalPages(1);
        showErrorToast(error);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void fetchMyRequests(page, status);
  }, [fetchMyRequests, page, status]);

  const onLogoFileChange = async (file: File) => {
    if (!allowedUploadTypes.includes(file.type)) {
      showErrorToast("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > maxUploadBytes) {
      showErrorToast("Ảnh vượt quá 10MB");
      return;
    }

    try {
      setLogoUploading(true);
      const uploaded = await uploadImageToS3({ file, folder: "brands" });
      setLogoImage(uploaded);
      showSuccessToast("Upload logo thành công");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLogoUploading(false);
    }
  };

  const onSubmitRequest = async () => {
    const name = brandName.trim();
    if (!name) {
      showErrorToast("Vui lòng nhập tên thương hiệu");
      return;
    }

    try {
      setSubmitting(true);
      await createBrandRequestService({
        name,
        image: logoImage?.url || undefined,
      });
      showSuccessToast("Đã gửi yêu cầu thương hiệu");
      setBrandName("");
      setLogoImage(null);
      if (page !== 1) setPage(1);
      if (status !== "all") setStatus("all");
      await fetchMyRequests(1, "all");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Yêu cầu tạo thương hiệu</h1>
        <p style={themed(styles.pageSubtitle)}>
          Gửi yêu cầu để admin duyệt thương hiệu mới
        </p>
      </header>

      <section style={themed(styles.formCard)}>
        <div style={themed(styles.formGrid)}>
          <div style={themed(styles.formField)}>
            <label style={themed(styles.formLabel)}>Tên thương hiệu</label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="Ví dụ: UGREEN"
              style={themed(styles.formInput)}
            />
          </div>
          <div style={themed(styles.formField)}>
            <label style={themed(styles.formLabel)}>Logo thương hiệu (tuỳ chọn)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  void onLogoFileChange(file);
                }
                e.currentTarget.value = "";
              }}
              style={themed(styles.formInput)}
            />
            <div style={themed(styles.muted)}>
              {logoUploading
                ? "Đang upload logo..."
                : "JPG, PNG, WEBP, GIF (tối đa 10MB)"}
            </div>
            {logoImage?.url ? (
              <Image
                src={logoImage.url}
                alt="Brand logo preview"
                width={480}
                height={180}
                style={{
                  ...themed(styles.modalUploadPreview),
                  maxWidth: "220px",
                  maxHeight: "120px",
                }}
              />
            ) : null}
          </div>
          <div style={themed(styles.formFieldFull)}>
            <div style={themed(styles.muted)}>
              Bạn có thể upload logo để admin nhận diện thương hiệu nhanh hơn.
            </div>
          </div>
        </div>
        <div style={themed(styles.formActions)}>
          <button
            type="button"
            style={themed(styles.primaryButton)}
            onClick={onSubmitRequest}
            disabled={submitting || logoUploading}
          >
            {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <div style={themed(styles.tableHeader)}>
          <h2 style={themed(styles.cardTitle)}>Yêu cầu đã gửi</h2>
          <div style={themed(styles.tabGroup)}>
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setPage(1);
                  setStatus(tab.key);
                }}
                style={
                  status === tab.key
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
              <th style={themed(styles.th)}>Thương hiệu</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày gửi</th>
              <th style={themed(styles.th)}>Phản hồi admin</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td style={themed(styles.td)} colSpan={4}>
                  Đang tải...
                </td>
              </tr>
            ) : requests.length === 0 ? (
              <tr>
                <td style={themed(styles.td)} colSpan={4}>
                  Chưa có yêu cầu nào
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const tone = getStatusTone(req.status);
                return (
                  <tr key={req.id}>
                    <td style={themed(styles.td)}>{req.name}</td>
                    <td style={themed(styles.td)}>
                      <span
                        style={{
                          ...themed(styles.statusPill),
                          background: tone.bg,
                          color: tone.text,
                        }}
                      >
                        {getStatusLabel(req.status)}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>
                      {new Date(req.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td style={themed(styles.td)}>{req.admin_note || "-"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div style={themed(styles.paginationRow)}>
          <div style={themed(styles.paginationInfo)}>
            Tổng: {total} yêu cầu
          </div>
          <div style={themed(styles.paginationButtons)}>
            <button
              type="button"
              style={themed(page <= 1 ? styles.pageButtonDisabled : styles.pageButton)}
              disabled={page <= 1 || loading}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            >
              Trước
            </button>
            <span style={themed(styles.paginationInfo)}>
              {page}/{totalPages}
            </span>
            <button
              type="button"
              style={themed(
                page >= totalPages ? styles.pageButtonDisabled : styles.pageButton,
              )}
              disabled={page >= totalPages || loading}
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            >
              Sau
            </button>
          </div>
        </div>
      </section>
    </ShopLayout>
  );
}
