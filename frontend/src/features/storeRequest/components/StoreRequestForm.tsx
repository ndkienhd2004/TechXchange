"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth";
import { useAppTheme } from "@/theme/ThemeProvider";
import {
  createStoreRequest,
  fetchMyStoreRequests,
} from "../store/storeRequestSlice";
import {
  selectStoreRequestError,
  selectStoreRequestItems,
  selectStoreRequestListLoading,
  selectStoreRequestSubmitLoading,
  selectStoreRequestTotal,
} from "../store/storeRequestSelectors";
import * as styles from "./styles";

export default function StoreRequestForm() {
  const { themed } = useAppTheme();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const items = useAppSelector(selectStoreRequestItems);
  const total = useAppSelector(selectStoreRequestTotal);
  const listLoading = useAppSelector(selectStoreRequestListLoading);
  const submitLoading = useAppSelector(selectStoreRequestSubmitLoading);
  const error = useAppSelector(selectStoreRequestError);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyStoreRequests({ limit: 10, offset: 0, status: "all" }));
    }
  }, [dispatch, isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
    const result = await dispatch(
      createStoreRequest({
        store_name: storeName.trim(),
        store_description: storeDescription.trim() || undefined,
      })
    );
    if (createStoreRequest.fulfilled.match(result)) {
      setSubmitted(true);
      setStoreName("");
      setStoreDescription("");
      dispatch(fetchMyStoreRequests({ limit: 10, offset: 0, status: "all" }));
    }
  };

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.card)}>
          <h1 style={themed(styles.title)}>Đăng ký bán hàng</h1>
          <p style={themed(styles.subtitle)}>
            Gửi thông tin cửa hàng để admin xét duyệt.
          </p>

          <form style={themed(styles.form)} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="store-name" style={themed(styles.label)}>
                Tên cửa hàng
              </label>
              <input
                id="store-name"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="TechX Store"
                required
                style={themed(styles.input)}
              />
              <p style={themed(styles.helper)}>
                Tên hiển thị của cửa hàng trên hệ thống.
              </p>
            </div>

            <div>
              <label htmlFor="store-description" style={themed(styles.label)}>
                Mô tả cửa hàng
              </label>
              <textarea
                id="store-description"
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Cửa hàng đồ công nghệ..."
                style={themed(styles.textarea)}
              />
            </div>

            {error && <p style={themed(styles.error)}>{error}</p>}
            {submitted && !error && (
              <p style={themed(styles.helper)}>
                Yêu cầu đã được gửi. Vui lòng chờ admin xét duyệt.
              </p>
            )}

            <button
              type="submit"
              style={themed(styles.button)}
              disabled={submitLoading}
            >
              {submitLoading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </form>

          <div style={themed(styles.listSection)}>
            <h2 style={themed(styles.listTitle)}>
              Yêu cầu của tôi {total ? `(${total})` : ""}
            </h2>
            {listLoading ? (
              <p style={themed(styles.helper)}>Đang tải danh sách...</p>
            ) : items.length === 0 ? (
              <p style={themed(styles.helper)}>
                Bạn chưa có yêu cầu nào.
              </p>
            ) : (
              <div style={themed(styles.list)}>
                {items.map((item) => (
                  <div key={item.id} style={themed(styles.listItem)}>
                    <div>
                      <div style={themed(styles.listName)}>
                        {item.store_name}
                      </div>
                      {item.store_description && (
                        <div style={themed(styles.listDesc)}>
                          {item.store_description}
                        </div>
                      )}
                    </div>
                    <span
                      style={{
                        ...themed(styles.statusBadge),
                        ...(item.status === "approved"
                          ? themed(styles.statusApproved)
                          : item.status === "rejected"
                          ? themed(styles.statusRejected)
                          : themed(styles.statusPending)),
                      }}
                    >
                      {item.status === "approved"
                        ? "Đã duyệt"
                        : item.status === "rejected"
                        ? "Từ chối"
                        : "Đang chờ"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
