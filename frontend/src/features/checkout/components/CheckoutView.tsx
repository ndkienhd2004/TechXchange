"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import AppIcon from "@/components/commons/AppIcon";
import { fetchCart } from "@/features/cart/store/cartSlice";
import { selectCartItems } from "@/features/cart/store/cartSelectors";
import { getAxiosInstance } from "@/services/axiosConfig";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

const currency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    Number(value || 0),
  );

export default function CheckoutView() {
  const { themed } = useAppTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);

  const [method, setMethod] = useState<"cod" | "bank_transfer">("cod");
  const [note, setNote] = useState("");
  const [placing, setPlacing] = useState(false);
  const [transferInstructions, setTransferInstructions] = useState<
    Array<{
      order_id: number;
      payment_code: string;
      transfer_content?: string;
      amount_vnd: number;
      bank_code: string | null;
      account_name: string | null;
      virtual_account: string | null;
      qr_url: string | null;
      currency: string;
    }>
  >([]);
  const [addresses, setAddresses] = useState<
    Array<{
      id: number;
      full_name?: string | null;
      phone?: string | null;
      address_line: string;
      ward?: string | null;
      district?: string | null;
      city?: string | null;
      province: string;
      is_default: boolean;
    }>
  >([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  useEffect(() => {
    const loadAddresses = async () => {
      try {
        setAddressLoading(true);
        const api = getAxiosInstance();
        const res = await api.get("/users/addresses");
        const rows = Array.isArray(res?.data?.data?.addresses)
          ? res.data.data.addresses
          : [];
        setAddresses(rows);
        const defaultAddress = rows.find((item: { is_default: boolean }) => item.is_default);
        setSelectedAddressId(
          defaultAddress ? Number(defaultAddress.id) : rows[0] ? Number(rows[0].id) : null,
        );
      } catch (error) {
        showErrorToast(error);
        setAddresses([]);
        setSelectedAddressId(null);
      } finally {
        setAddressLoading(false);
      }
    };

    loadAddresses();
  }, []);

  const selectedCartIds = useMemo(() => {
    const rawMulti = searchParams.get("cart_item_ids");
    const rawSingle = searchParams.get("cart_item_id");
    const raw = rawMulti || rawSingle;
    if (!raw) return [];
    return raw
      .split(",")
      .map((id) => Number(id.trim()))
      .filter(Boolean);
  }, [searchParams]);

  const checkoutItems = useMemo(() => {
    if (selectedCartIds.length === 0) return cartItems;
    return cartItems.filter((item) => selectedCartIds.includes(Number(item.id)));
  }, [cartItems, selectedCartIds]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + Number(item.subtotal || 0), 0),
    [checkoutItems],
  );
  const totalAmount = useMemo(
    () => Number(subtotal || 0) + Number(shippingFee || 0),
    [subtotal, shippingFee],
  );

  useEffect(() => {
    if (!selectedAddressId || checkoutItems.length === 0) {
      setShippingFee(0);
      setShippingError(null);
      return;
    }

    let mounted = true;
    const run = async () => {
      try {
        setShippingLoading(true);
        setShippingError(null);
        const api = getAxiosInstance();
        const res = await api.post("/orders/shipping-fee-estimate", {
          cart_item_ids: checkoutItems.map((item) => Number(item.id)),
          items: checkoutItems.map((item) => ({
            product_id: Number(item.product_id),
            quantity: Number(item.quantity || 1),
          })),
          address_id: selectedAddressId,
        });
        const fee = Number(res?.data?.data?.total_shipping_fee || 0);
        if (mounted) setShippingFee(fee);
      } catch (error: unknown) {
        if (!mounted) return;
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Không tính được phí vận chuyển";
        setShippingError(String(message));
        setShippingFee(0);
      } finally {
        if (mounted) setShippingLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [selectedAddressId, checkoutItems]);

  const onPlaceOrder = async () => {
    if (placing) return;
    if (checkoutItems.length === 0) {
      showErrorToast("Không có sản phẩm để thanh toán");
      return;
    }
    if (!selectedAddressId) {
      showErrorToast("Vui lòng chọn địa chỉ giao hàng");
      return;
    }
    try {
      setPlacing(true);
      if (method === "cod") setTransferInstructions([]);
      const api = getAxiosInstance();
      const res = await api.post("/orders/checkout", {
        cart_item_ids: checkoutItems.map((item) => Number(item.id)),
        items: checkoutItems.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity || 1),
        })),
        address_id: selectedAddressId,
        payment_method: method,
        note: note.trim() || undefined,
      });
      const instructions = Array.isArray(res?.data?.data?.transfer_instructions)
        ? res.data.data.transfer_instructions
        : [];
      const createdOrders = Array.isArray(res?.data?.data?.orders)
        ? res.data.data.orders
        : [];
      setTransferInstructions(instructions);
      showSuccessToast(
        method === "bank_transfer"
          ? "Tạo đơn chuyển khoản thành công"
          : "Đặt hàng thành công",
      );
      dispatch(fetchCart());
      if (method === "cod") {
        router.push("/orders");
      } else {
        const orderIds = createdOrders
          .map((o: { id?: number }) => Number(o.id))
          .filter(Boolean);
        if (orderIds.length > 0) {
          router.push(`/checkout/transfer?order_ids=${orderIds.join(",")}`);
        }
      }
    } catch (error) {
      showErrorToast(error);
    } finally {
      setPlacing(false);
    }
  };

  const selectedAddress = useMemo(
    () => addresses.find((item) => Number(item.id) === Number(selectedAddressId)) || null,
    [addresses, selectedAddressId],
  );

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <h1 style={themed(styles.title)}>Thanh toán</h1>

        <div style={themed(styles.layout)}>
          <div>
            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>
                    <AppIcon name="location" />
                  </span>{" "}
                  Địa chỉ giao hàng
                </div>
              </div>
              {addressLoading ? (
                <p style={themed(styles.emptyText)}>Đang tải địa chỉ...</p>
              ) : addresses.length === 0 ? (
                <div>
                  <p style={themed(styles.emptyText)}>Bạn chưa có địa chỉ giao hàng.</p>
                  <button
                    type="button"
                    style={themed(styles.linkButton)}
                    onClick={() => router.push("/profile?tab=address")}
                  >
                    Thêm địa chỉ
                  </button>
                </div>
              ) : (
                <div style={themed(styles.addressGrid)}>
                  {selectedAddress && (
                    <div style={{ ...themed(styles.addressCard), gridColumn: "1 / -1" }}>
                      <div style={themed(styles.addressNameRow)}>
                        <strong>{selectedAddress.full_name || "Địa chỉ nhận hàng"}</strong>
                        {selectedAddress.is_default && (
                          <span style={themed(styles.defaultBadge)}>Mặc định</span>
                        )}
                      </div>
                      <span style={themed(styles.emptyText)}>
                        {selectedAddress.phone || "Không có số điện thoại"}
                      </span>
                      <span style={themed(styles.emptyText)}>
                        {[
                          selectedAddress.address_line,
                          selectedAddress.ward,
                          selectedAddress.district,
                          selectedAddress.city,
                          selectedAddress.province,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                  <select
                    style={{ ...themed(styles.input), gridColumn: "1 / -1" }}
                    value={selectedAddressId || ""}
                    onChange={(e) => setSelectedAddressId(Number(e.target.value) || null)}
                  >
                    {addresses.map((addr) => (
                      <option key={addr.id} value={addr.id}>
                        #{addr.id} - {addr.full_name || "Người nhận"} -{" "}
                        {addr.address_line}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>
                    <AppIcon name="bag" />
                  </span>{" "}
                  Sản phẩm
                </div>
              </div>
              {checkoutItems.length === 0 ? (
                <p style={themed(styles.emptyText)}>Không có sản phẩm để thanh toán.</p>
              ) : (
                checkoutItems.map((item) => (
                  <div key={item.id} style={themed(styles.productRow)}>
                    <div style={themed(styles.thumb)} />
                    <div>
                      <div style={themed(styles.productName)}>
                        {item.product?.name || `#${item.product_id}`}
                      </div>
                      <div style={themed(styles.productMeta)}>x{item.quantity}</div>
                    </div>
                    <div style={themed(styles.price)}>
                      {currency(Number(item.subtotal || 0))}
                    </div>
                  </div>
                ))
              )}
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <span>
                    <AppIcon name="payment" />
                  </span>{" "}
                  Phương thức thanh toán
                </div>
              </div>
              <div style={themed(styles.paymentList)}>
                <button
                  type="button"
                  onClick={() => setMethod("cod")}
                  style={
                    method === "cod"
                      ? themed(styles.paymentOptionActive)
                      : themed(styles.paymentOption)
                  }
                >
                  <input type="radio" checked={method === "cod"} readOnly />
                  Thanh toán khi nhận hàng (COD)
                </button>
                <button
                  type="button"
                  onClick={() => setMethod("bank_transfer")}
                  style={
                    method === "bank_transfer"
                      ? themed(styles.paymentOptionActive)
                      : themed(styles.paymentOption)
                  }
                >
                  <input
                    type="radio"
                    checked={method === "bank_transfer"}
                    readOnly
                  />
                  Chuyển khoản ngân hàng (SePay)
                </button>
              </div>
            </section>

            <section style={themed(styles.card)}>
              <div style={themed(styles.cardHeader)}>
                <div style={themed(styles.cardTitle)}>
                  <AppIcon name="note" /> Ghi chú
                </div>
              </div>
              <textarea
                style={themed(styles.noteArea)}
                placeholder="Ghi chú cho đơn hàng..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </section>
          </div>

          <aside style={themed(styles.card)}>
            <div style={themed(styles.summaryTitle)}>Tổng đơn hàng</div>
            <div style={themed(styles.summaryRow)}>
              <span>Tạm tính</span>
              <span>{currency(subtotal)}</span>
            </div>
            <div style={themed(styles.summaryRow)}>
              <span>Phí vận chuyển</span>
              <span style={{ color: shippingError ? "#ef4444" : undefined }}>
                {shippingLoading
                  ? "Đang tính..."
                  : shippingError
                    ? "Lỗi tính phí"
                    : currency(shippingFee)}
              </span>
            </div>
            <div style={themed(styles.summaryRow)}>
              <span>Tổng cộng</span>
              <span style={themed(styles.summaryTotal)}>{currency(totalAmount)}</span>
            </div>
            {shippingError ? (
              <div style={themed(styles.emptyText)}>{shippingError}</div>
            ) : null}
            <button
              type="button"
              style={themed(styles.primaryButton)}
              onClick={onPlaceOrder}
              disabled={placing || shippingLoading}
            >
              {placing
                ? "Đang đặt..."
                : method === "bank_transfer"
                  ? "Tạo đơn chuyển khoản"
                  : "Đặt hàng"}
            </button>
            {transferInstructions.length > 0 && (
              <div style={themed(styles.transferWrap)}>
                <div style={themed(styles.transferTitle)}>Thông tin chuyển khoản</div>
                {transferInstructions.map((item) => (
                  <div
                    key={`${item.order_id}-${item.payment_code}`}
                    style={themed(styles.transferCard)}
                  >
                    <div style={themed(styles.transferText)}>
                      <span>Đơn hàng: #{item.order_id}</span>
                      <span>
                        Nội dung CK: {item.transfer_content || item.payment_code}{" "}
                        <button
                          type="button"
                          style={themed(styles.inlineCopyButton)}
                          onClick={() =>
                            copyText(
                              item.transfer_content || item.payment_code,
                              "Đã copy nội dung chuyển khoản",
                            )
                          }
                        >
                          Copy
                        </button>
                      </span>
                      <span>Số tiền: {currency(item.amount_vnd)}</span>
                      <span>Ngân hàng: {item.bank_code || "-"}</span>
                      {item.virtual_account ? (
                        <span>
                          Tài khoản ảo (VA): {item.virtual_account}{" "}
                          <button
                            type="button"
                            style={themed(styles.inlineCopyButton)}
                            onClick={() =>
                              copyText(item.virtual_account || "", "Đã copy tài khoản ảo")
                            }
                          >
                            Copy
                          </button>
                        </span>
                      ) : null}
                      <span>Chủ TK: {item.account_name || "-"}</span>
                    </div>
                    {item.qr_url ? (
                      <Image
                        src={item.qr_url}
                        alt={`QR Order ${item.order_id}`}
                        width={120}
                        height={120}
                        style={themed(styles.transferQr)}
                      />
                    ) : (
                      <span style={themed(styles.emptyText)}>
                        Backend chưa cấu hình QR (SEPAY_BANK_ACCOUNT / SEPAY_BANK_CODE).
                      </span>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  style={themed(styles.linkButton)}
                  onClick={() => router.push("/orders")}
                >
                  Xem đơn hàng của tôi
                </button>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showSuccessToast(successMessage);
    } catch {
      showErrorToast("Không thể copy");
    }
  };
