"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as shopStyles from "../styles";
import * as styles from "../ShopInventoryView/styles";
import {
  getShopInventoryTransactionsService,
  importShopInventoryService,
} from "../../sevices";

type InventoryVariant = {
  inventory_id: number;
  serial_id: number;
  serial_code: string | null;
  variant_label: string;
  on_hand: number;
  reserved: number;
  available: number;
};

type InventoryTransaction = {
  id: number;
  type: "import" | "export";
  quantity: number;
  unit_cost: number | null;
  sale_price: number;
  note: string | null;
  reference_type: string | null;
  reference_id: number | null;
  serial_id: number;
  variant_label: string;
  created_at: string;
};

type InventoryResponse = {
  product: {
    id: number;
    name: string;
    sale_price: number;
    status: string;
  };
  summary: {
    total_on_hand: number;
    total_reserved: number;
    total_available: number;
  };
  variants: InventoryVariant[];
  transactions: InventoryTransaction[];
};

const formatVnd = (value: number | null | undefined) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export default function ShopInventoryTransactionsView() {
  const { themed } = useAppTheme();
  const params = useParams<{ productId: string }>();
  const productId = Number(params?.productId || 0);

  const [loading, setLoading] = useState(false);
  const [savingImport, setSavingImport] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [data, setData] = useState<InventoryResponse | null>(null);
  const [form, setForm] = useState({
    serial_id: 0,
    quantity: "1",
    unit_cost: "0",
    note: "",
  });

  const loadData = async () => {
    if (!productId) return;
    try {
      setLoading(true);
      const res = await getShopInventoryTransactionsService(productId, {
        limit: 100,
        offset: 0,
      });
      setData((res?.data || null) as InventoryResponse | null);
    } catch (error) {
      setData(null);
      showErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!data?.variants?.length) return;
    setForm((prev) => ({
      ...prev,
      serial_id: prev.serial_id || Number(data.variants[0].serial_id),
    }));
  }, [data?.variants]);

  const selectedVariant = useMemo(
    () => data?.variants.find((item) => Number(item.serial_id) === Number(form.serial_id)),
    [data?.variants, form.serial_id],
  );
  const salePrice = Number(data?.product?.sale_price || 0);
  const importUnitCost = Number(form.unit_cost || 0);
  const isImportHigherThanSale = importUnitCost > salePrice;

  const onSubmitImport = async () => {
    if (!productId) return;
    const serialId = Number(form.serial_id || 0);
    const quantity = Number(form.quantity || 0);
    const unitCost = Number(form.unit_cost || 0);
    if (!serialId) {
      showErrorToast("Vui lòng chọn biến thể cần nhập kho");
      return;
    }
    if (!Number.isInteger(quantity) || quantity <= 0) {
      showErrorToast("Số lượng nhập phải là số nguyên dương");
      return;
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) {
      showErrorToast("Giá nhập không hợp lệ");
      return;
    }

    try {
      setSavingImport(true);
      await importShopInventoryService({
        product_id: productId,
        serial_id: serialId,
        quantity,
        unit_cost: unitCost,
        note: form.note.trim() || undefined,
      });
      showSuccessToast("Nhập kho thành công");
      setOpenImportModal(false);
      setForm((prev) => ({ ...prev, quantity: "1", unit_cost: prev.unit_cost, note: "" }));
      await loadData();
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSavingImport(false);
    }
  };

  return (
    <ShopLayout>
      <header style={themed(shopStyles.pageHeader)}>
        <div style={themed(styles.headerRow)}>
          <div>
            <h1 style={themed(shopStyles.pageTitle)}>
              Lịch sử giao dịch kho
              {data?.product?.name ? `: ${data.product.name}` : ""}
            </h1>
            <p style={themed(shopStyles.pageSubtitle)}>
              Quản lý toàn bộ lịch sử nhập/xuất và giữ hàng của sản phẩm
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <Link href="/shop/inventory" style={themed(styles.backBtn)}>
              ← Quay lại kho
            </Link>
            <button
              type="button"
              style={themed(styles.importBtn)}
              onClick={() => setOpenImportModal(true)}
              disabled={!data?.variants?.length}
            >
              Nhập kho
            </button>
          </div>
        </div>
      </header>

      <section style={themed(styles.statsGrid)}>
        <div style={themed(styles.statCard)}>
          <div style={themed(styles.statTitle)}>Tổng tồn kho</div>
          <div style={themed(styles.statValue)}>
            {loading ? "..." : data?.summary?.total_on_hand ?? 0}
          </div>
        </div>
        <div style={themed(styles.statCard)}>
          <div style={themed(styles.statTitle)}>Có sẵn</div>
          <div style={themed(styles.statValue)}>
            {loading ? "..." : data?.summary?.total_available ?? 0}
          </div>
        </div>
        <div style={themed(styles.statCard)}>
          <div style={themed(styles.statTitle)}>Đang giữ (reserved)</div>
          <div style={themed(styles.statValue)}>
            {loading ? "..." : data?.summary?.total_reserved ?? 0}
          </div>
        </div>
      </section>

      <section style={themed(styles.sectionCard)}>
        <div style={themed(styles.tableWrap)}>
          <table style={themed(styles.table)}>
            <thead>
              <tr>
                <th style={themed(styles.th)}>Loại giao dịch</th>
                <th style={themed(styles.th)}>Variant</th>
                <th style={themed(styles.th)}>Số lượng</th>
                <th style={themed(styles.th)}>Giá nhập</th>
                <th style={themed(styles.th)}>Giá bán</th>
                <th style={themed(styles.th)}>Ghi chú</th>
                <th style={themed(styles.th)}>Thời điểm</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={7}>
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : !data?.transactions?.length ? (
                <tr>
                  <td style={themed(styles.td)} colSpan={7}>
                    Chưa có giao dịch kho cho sản phẩm này.
                  </td>
                </tr>
              ) : (
                data.transactions.map((item) => (
                  <tr key={item.id}>
                    <td style={themed(styles.td)}>
                      <span
                        style={{
                          ...themed(shopStyles.statusPill),
                          ...(item.type === "import"
                            ? themed(shopStyles.statusConfirmed)
                            : themed(shopStyles.statusShipping)),
                        }}
                      >
                        {item.type === "import" ? "Nhập kho" : "Xuất kho"}
                      </span>
                    </td>
                    <td style={themed(styles.td)}>{item.variant_label}</td>
                    <td style={themed(styles.td)}>{item.quantity}</td>
                    <td style={themed(styles.td)}>
                      {item.unit_cost !== null ? formatVnd(item.unit_cost) : "—"}
                    </td>
                    <td style={themed(styles.td)}>{formatVnd(item.sale_price)}</td>
                    <td style={themed(styles.td)}>
                      {item.note ||
                        (item.reference_type === "order" && item.reference_id
                          ? `Xuất kho từ đơn #${item.reference_id}`
                          : "—")}
                    </td>
                    <td style={themed(styles.td)}>
                      {new Date(item.created_at).toLocaleString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {openImportModal && (
        <div style={themed(styles.modalOverlay)}>
          <div style={themed(styles.modalCard)}>
            <h2 style={themed(styles.modalTitle)}>Nhập kho</h2>
            <div style={themed(styles.formRow)}>
              <label style={themed(styles.label)}>Sản phẩm nhập kho</label>
              <input
                style={themed(styles.input)}
                value={data?.product?.name || ""}
                readOnly
              />
            </div>

            <div style={themed(styles.formRow)}>
              <label style={themed(styles.label)}>Chọn phân loại nhập kho</label>
              <select
                value={form.serial_id || ""}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    serial_id: Number(event.target.value || 0),
                  }))
                }
                style={themed(styles.input)}
              >
                {data?.variants?.map((variant) => (
                  <option key={variant.serial_id} value={variant.serial_id}>
                    {variant.variant_label} - {variant.serial_code}
                  </option>
                ))}
              </select>
              {selectedVariant ? (
                <>
                  <div style={themed(styles.valueMuted)}>
                    Tồn khả dụng hiện tại: {selectedVariant.available}
                  </div>
                  <div style={themed(styles.valueMuted)}>
                    Giá bán hiện tại: {formatVnd(salePrice)}
                  </div>
                </>
              ) : null}
            </div>

            <div style={themed(styles.formRow)}>
              <label style={themed(styles.label)}>Số lượng</label>
              <input
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, quantity: event.target.value }))
                }
                style={themed(styles.input)}
              />
            </div>

            <div style={themed(styles.formRow)}>
              <label style={themed(styles.label)}>Giá nhập (mỗi đơn vị)</label>
              <input
                type="number"
                min={0}
                value={form.unit_cost}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, unit_cost: event.target.value }))
                }
                style={themed(styles.input)}
              />
              {isImportHigherThanSale ? (
                <div style={themed(styles.valueDanger)}>
                  Giá nhập đang lớn hơn giá bán hiện tại.
                </div>
              ) : null}
            </div>

            <div style={themed(styles.formRow)}>
              <label style={themed(styles.label)}>Ghi chú</label>
              <textarea
                value={form.note}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, note: event.target.value }))
                }
                style={themed(styles.textarea)}
                placeholder="Ghi chú nhập kho (tùy chọn)"
              />
            </div>

            <div style={themed(styles.modalActions)}>
              <button
                type="button"
                style={themed(styles.buttonGhost)}
                onClick={() => setOpenImportModal(false)}
                disabled={savingImport}
              >
                Hủy
              </button>
              <button
                type="button"
                style={themed(styles.buttonPrimary)}
                onClick={() => void onSubmitImport()}
                disabled={savingImport}
              >
                {savingImport ? "Đang nhập..." : "Nhập"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ShopLayout>
  );
}
