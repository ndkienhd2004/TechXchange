"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { getAxiosInstance } from "@/services/axiosConfig";
import { useAppTheme } from "@/theme/ThemeProvider";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import * as styles from "./transferStyles";

type TransferItem = {
  order_id: number;
  order_status: string;
  payment_status: string;
  transfer_status: "pending" | "paid" | "expired";
  total_price: string;
  currency: string;
  payment_code: string;
  transfer_content: string;
  amount_vnd: number;
  bank_code: string | null;
  account_name: string | null;
  virtual_account: string | null;
  qr_url: string | null;
  expires_at: string;
};

type TransferResponse = {
  all_paid: boolean;
  has_expired: boolean;
  remaining_seconds: number;
  items: TransferItem[];
};

const formatVnd = (value: number | string) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatCountdown = (seconds: number) => {
  const sec = Math.max(0, Number(seconds || 0));
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export default function TransferPaymentView() {
  const { themed } = useAppTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [data, setData] = useState<TransferResponse | null>(null);

  const orderIds = useMemo(() => {
    const raw = String(searchParams.get("order_ids") || "");
    return raw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }, [searchParams]);

  const fetchTransferInfo = useCallback(async () => {
    if (orderIds.length === 0) return;
    try {
      setFetching(true);
      const api = getAxiosInstance();
      const res = await api.get("/orders/transfer-info", {
        params: { order_ids: orderIds.join(",") },
      });
      setData(res?.data?.data || null);
    } catch (error) {
      showErrorToast(error);
    } finally {
      setFetching(false);
      setLoading(false);
    }
  }, [orderIds]);

  useEffect(() => {
    fetchTransferInfo();
  }, [fetchTransferInfo]);

  useEffect(() => {
    if (!data || data.all_paid || data.has_expired) return;
    const timer = setInterval(() => {
      fetchTransferInfo();
    }, 5000);
    return () => clearInterval(timer);
  }, [data, fetchTransferInfo]);

  useEffect(() => {
    if (!data?.all_paid) return;
    showSuccessToast("Thanh toán thành công");
  }, [data?.all_paid]);

  const copyText = async (value: string, successMsg: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showSuccessToast(successMsg);
    } catch {
      showErrorToast("Không thể copy");
    }
  };

  if (orderIds.length === 0) {
    return (
      <div style={themed(styles.page)}>
        <div style={themed(styles.container)}>
          <h1 style={themed(styles.title)}>Thanh toán chuyển khoản</h1>
          <p style={themed(styles.muted)}>Không tìm thấy order_ids hợp lệ.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Thanh toán chuyển khoản</h1>

        {loading ? (
          <p style={themed(styles.muted)}>Đang tải thông tin thanh toán...</p>
        ) : null}

        {data ? (
          <>
            <div style={themed(styles.headerRow)}>
              <div style={themed(styles.muted)}>
                Trạng thái:{" "}
                {data.all_paid
                  ? "Đã thanh toán"
                  : data.has_expired
                    ? "Đã hết hạn"
                    : "Chờ thanh toán"}
              </div>
              <div
                style={
                  data.all_paid
                    ? themed(styles.badgePaid)
                    : data.has_expired
                      ? themed(styles.badgeExpired)
                      : themed(styles.badgePending)
                }
              >
                {data.all_paid
                  ? "THÀNH CÔNG"
                  : data.has_expired
                    ? "HẾT HẠN"
                    : `Còn ${formatCountdown(data.remaining_seconds)}`}
              </div>
            </div>

            {data.items.map((item) => (
              <section key={item.order_id} style={themed(styles.card)}>
                <div style={themed(styles.orderTitle)}>Đơn hàng #{item.order_id}</div>
                <div style={themed(styles.cardGrid)}>
                  <div style={themed(styles.infoCol)}>
                    <div style={themed(styles.infoLine)}>
                      <span>Số tiền</span>
                      <strong>{formatVnd(item.amount_vnd)}</strong>
                    </div>
                    <div style={themed(styles.infoLine)}>
                      <span>Ngân hàng</span>
                      <strong>{item.bank_code || "-"}</strong>
                    </div>
                    <div style={themed(styles.infoLine)}>
                      <span>Chủ tài khoản</span>
                      <strong>{item.account_name || "-"}</strong>
                    </div>
                    {item.virtual_account ? (
                      <div style={themed(styles.infoLine)}>
                        <span>Tài khoản ảo (VA)</span>
                        <strong>{item.virtual_account}</strong>
                      </div>
                    ) : null}
                    <div style={themed(styles.infoLine)}>
                      <span>Nội dung CK</span>
                      <strong>{item.transfer_content || item.payment_code}</strong>
                    </div>
                    <div style={themed(styles.copyRow)}>
                      <button
                        type="button"
                        style={themed(styles.copyButton)}
                        onClick={() =>
                          copyText(item.virtual_account || "", "Đã copy tài khoản ảo")
                        }
                        disabled={!item.virtual_account}
                      >
                        Copy tài khoản ảo
                      </button>
                      <button
                        type="button"
                        style={themed(styles.copyButton)}
                        onClick={() =>
                          copyText(
                            item.transfer_content || item.payment_code,
                            "Đã copy nội dung chuyển khoản",
                          )
                        }
                      >
                        Copy nội dung CK
                      </button>
                    </div>
                  </div>
                  <div style={themed(styles.qrCol)}>
                    {item.qr_url ? (
                      <Image
                        src={item.qr_url}
                        alt={`QR đơn #${item.order_id}`}
                        width={240}
                        height={240}
                        style={themed(styles.qr)}
                      />
                    ) : (
                      <span style={themed(styles.muted)}>
                        Chưa có QR, vui lòng chuyển khoản thủ công.
                      </span>
                    )}
                  </div>
                </div>
              </section>
            ))}

            <div style={themed(styles.footerActions)}>
              {!data.all_paid && !data.has_expired ? (
                <button
                  type="button"
                  style={themed(styles.primaryButton)}
                  onClick={fetchTransferInfo}
                  disabled={fetching}
                >
                  {fetching ? "Đang kiểm tra..." : "Tôi đã thanh toán"}
                </button>
              ) : null}
              <button
                type="button"
                style={themed(styles.ghostButton)}
                onClick={() => router.push("/orders")}
              >
                Xem đơn hàng
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
