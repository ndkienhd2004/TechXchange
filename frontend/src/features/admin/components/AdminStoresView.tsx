"use client";

import { useEffect } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  approveStoreRequestById,
  fetchAdminStoreRequests,
  rejectStoreRequestById,
  setAdminStoreRequestsStatus,
} from "@/features/admin/store/adminSlice";
import { selectAdminStoreRequests } from "@/features/admin/store/adminSelectors";
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

export default function AdminStoresView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { items, page, totalPages, total, status, loading } =
    useAppSelector(selectAdminStoreRequests);

  useEffect(() => {
    dispatch(fetchAdminStoreRequests({ page, status, limit: 10 }));
  }, [dispatch, page, status]);

  const onStatusChange = (nextStatus: AdminStatus) => {
    dispatch(setAdminStoreRequestsStatus(nextStatus));
  };

  const onApprove = async (id: number) => {
    await dispatch(approveStoreRequestById(id));
    dispatch(fetchAdminStoreRequests({ page, status, limit: 10 }));
  };

  const onReject = async (id: number) => {
    const note = window.prompt("Nhập lý do từ chối");
    await dispatch(rejectStoreRequestById({ id, note: note ?? undefined }));
    dispatch(fetchAdminStoreRequests({ page, status, limit: 10 }));
  };

  return (
    <AdminLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Quản lý yêu cầu cửa hàng</h1>
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
              <th style={themed(styles.th)}>Cửa hàng</th>
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
                  <div style={themed(styles.emptyState)}>Không có yêu cầu phù hợp</div>
                </td>
              </tr>
            ) : (
              items.map((store) => (
                <tr key={store.id}>
                  <td style={themed(styles.td)}>{store.store_name}</td>
                  <td style={themed(styles.td)}>{store.user?.email ?? "-"}</td>
                  <td style={themed(styles.td)}>{store.status}</td>
                  <td style={themed(styles.td)}>
                    {new Date(store.created_at).toLocaleDateString("vi-VN")}
                  </td>
                  <td style={themed(styles.td)}>
                    <div style={themed(styles.rowActions)}>
                      {store.status === "pending" && (
                        <>
                          <button
                            type="button"
                            style={themed(styles.primaryButton)}
                            onClick={() => onApprove(store.id)}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            style={themed(styles.dangerButton)}
                            onClick={() => onReject(store.id)}
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
                fetchAdminStoreRequests({
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
                fetchAdminStoreRequests({
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
