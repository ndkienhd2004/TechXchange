"use client";

import { useEffect } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveProductRequestById,
  fetchAdminProductRequests,
  rejectProductRequestById,
  setAdminProductRequestsStatus,
} from "@/features/admin/store/adminSlice";
import { selectAdminProductRequests } from "@/features/admin/store/adminSelectors";
import type { AdminStatus } from "@/features/admin/types";
import AdminLayout from "./AdminLayout";
import * as styles from "./styles";
import AppIcon from "@/components/commons/AppIcon";

const tabs: { key: AdminStatus; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Chờ duyệt" },
  { key: "approved", label: "Đã duyệt" },
  { key: "rejected", label: "Từ chối" },
];

export default function AdminReviewsView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, page, totalPages, total, status, loading } =
    useAppSelector(selectAdminProductRequests);

  useEffect(() => {
    dispatch(fetchAdminProductRequests({ page, status, limit: 10 }));
  }, [dispatch, page, status]);

  const onStatusChange = (nextStatus: AdminStatus) => {
    dispatch(setAdminProductRequestsStatus(nextStatus));
  };

  const onApprove = async (id: number) => {
    await dispatch(approveProductRequestById(id));
    dispatch(fetchAdminProductRequests({ page, status, limit: 10 }));
  };

  const onReject = async (id: number) => {
    const note = window.prompt("Nhập lý do từ chối");
    await dispatch(rejectProductRequestById({ id, note: note ?? undefined }));
    dispatch(fetchAdminProductRequests({ page, status, limit: 10 }));
  };

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý yêu cầu sản phẩm</h1>
        <p style={themed(styles.pageSubtitle)}>{total} yêu cầu</p>
      </header>

      <section style={themed(styles.toolbar)}>
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
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      <section style={themed(styles.tableCard)}>
        <table style={themed(styles.table)}>
          <thead>
            <tr>
              <th style={themed(styles.th)}>Sản phẩm</th>
              <th style={themed(styles.th)}>Danh mục</th>
              <th style={themed(styles.th)}>Người gửi</th>
              <th style={themed(styles.th)}>Trạng thái</th>
              <th style={themed(styles.th)}>Ngày tạo</th>
              <th style={themed(styles.th)}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && items.length === 0 ? (
              <tr>
                <td style={themed(styles.td)} colSpan={6}>
                  <div style={themed(styles.emptyState)}>Không có yêu cầu phù hợp</div>
                </td>
              </tr>
            ) : (
              items.map((request) => (
                <tr key={request.id}>
                  <td style={themed(styles.td)}>{request.name}</td>
                  <td style={themed(styles.td)}>{request.category?.name ?? "-"}</td>
                  <td style={themed(styles.td)}>{request.requester?.email ?? "-"}</td>
                  <td style={themed(styles.td)}>{request.status}</td>
                  <td style={themed(styles.td)}>
                    {new Date(request.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={themed(styles.td)}>
                    <div style={themed(styles.rowActions)}>
                      {request.status === "pending" && (
                        <>
                          <button
                            type="button"
                            style={themed(styles.primaryButton)}
                            onClick={() => onApprove(request.id)}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            style={themed(styles.dangerButton)}
                            onClick={() => onReject(request.id)}
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
                fetchAdminProductRequests({
                  page: Math.max(page - 1, 1),
                  status,
                  limit: 10,
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
                fetchAdminProductRequests({
                  page: Math.min(page + 1, Math.max(totalPages, 1)),
                  status,
                  limit: 10,
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
    </AdminLayout>
  );
}
