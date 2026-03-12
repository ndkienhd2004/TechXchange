"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import ShopLayout from "../ShopLayout";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { getShopInfo, getShopProducts } from "../../store";
import AppIcon from "@/components/commons/AppIcon";
import {
  getGhnDistricts,
  getGhnProvinces,
  getGhnWards,
  type GhnDistrict,
  type GhnProvince,
  type GhnWard,
} from "@/services/ghnApi";
import { registerShopGhnService, updateShopAddressService } from "../../sevices";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";

export default function ShopDashboardView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { info, productsTotal, loading } = useAppSelector(
    (state: RootState) => state.shop
  );
  const [savingAddress, setSavingAddress] = useState(false);
  const [registeringGhn, setRegisteringGhn] = useState(false);
  const [addressLine, setAddressLine] = useState("");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState("");
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);

  useEffect(() => {
    // Lấy danh sách sản phẩm để biết tổng số lượng
    dispatch(getShopProducts({ page: 1, limit: 1, append: false }));
  }, [dispatch]);

  useEffect(() => {
    getGhnProvinces().then(setProvinces).catch(showErrorToast);
  }, []);

  useEffect(() => {
    if (!info) return;
    setAddressLine(info.address_line || "");
    setProvinceId(info.ghn_province_id || null);
    setDistrictId(info.ghn_district_id || null);
    setWardCode(info.ghn_ward_code || "");
  }, [info]);

  useEffect(() => {
    if (!provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }
    getGhnDistricts(provinceId).then(setDistricts).catch(showErrorToast);
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      setWards([]);
      return;
    }
    getGhnWards(districtId).then(setWards).catch(showErrorToast);
  }, [districtId]);

  const stats = useMemo(() => [
    { label: "Tổng sản phẩm", value: productsTotal.toString(), tone: "#7c3aed" },
    { label: "Đơn hàng", value: "0", tone: "#3b82f6" }, // Tạm thời để 0 vì chưa có API
    { label: "Doanh thu", value: "$0", tone: "#22c55e" }, // Tạm thời để 0 vì chưa có API
    { label: "Đánh giá", value: info?.rating?.toString() || "0", tone: "#f59e0b", sub: info?.rating?.toFixed(1) || "0.0" },
  ], [productsTotal, info]);

  const onSaveAddress = async () => {
    if (!info?.id) return;
    if (!addressLine.trim() || !provinceId || !districtId || !wardCode) {
      showErrorToast("Vui lòng nhập địa chỉ và chọn đủ Tỉnh/Quận/Phường");
      return;
    }

    const province = provinces.find((item) => item.ProvinceID === provinceId);
    const district = districts.find((item) => item.DistrictID === districtId);
    const ward = wards.find((item) => item.WardCode === wardCode);

    try {
      setSavingAddress(true);
      await updateShopAddressService(Number(info.id), {
        address_line: addressLine.trim(),
        province: province?.ProvinceName || "",
        city: province?.ProvinceName || "",
        district: district?.DistrictName || "",
        ward: ward?.WardName || "",
        ghn_province_id: provinceId,
        ghn_district_id: districtId,
        ghn_ward_code: wardCode,
      });
      showSuccessToast("Đã lưu địa chỉ shop");
      dispatch(getShopInfo());
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSavingAddress(false);
    }
  };

  const onRegisterGhnShop = async () => {
    if (!info?.id) return;
    try {
      setRegisteringGhn(true);
      const res = await registerShopGhnService(Number(info.id));
      const ghnShopId = Number(res?.data?.ghn_shop_id || 0);
      showSuccessToast(
        ghnShopId
          ? `GHN shop đã sẵn sàng (shop_id: ${ghnShopId})`
          : "Đăng ký GHN shop thành công",
      );
      dispatch(getShopInfo());
    } catch (error) {
      showErrorToast(error);
    } finally {
      setRegisteringGhn(false);
    }
  };

  // Dữ liệu giả cho đơn hàng gần đây cho đến khi có API
  const orders: Array<{
    id: string;
    items: string;
    status: "confirmed" | "shipping" | "delivered";
    date: string;
  }> = [];

  return (
    <ShopLayout>
      <header style={themed(styles.pageHeader)}>
        <h1 style={themed(styles.pageTitle)}>Dashboard</h1>
        <p style={themed(styles.pageSubtitle)}>
          Chào mừng trở lại, {info?.name || "Shop của bạn"}!
        </p>
      </header>

      <section style={themed(styles.statGrid)}>
        {stats.map((stat) => (
          <div key={stat.label} style={themed(styles.statCard)}>
            <div>
              <div style={themed(styles.statLabel)}>{stat.label}</div>
              <div style={themed(styles.statValue)}>{loading ? "..." : stat.value}</div>
              {stat.sub && (
                <div style={{ color: stat.tone, marginTop: 4 }}>{stat.sub}</div>
              )}
            </div>
            <div style={{ ...themed(styles.statIcon), background: `${stat.tone}22` }}>
              <span style={{ color: stat.tone }}>
                {stat.label === "Đơn hàng" ? (
                  <AppIcon name="box" />
                ) : stat.label === "Tổng sản phẩm" ? (
                  <AppIcon name="cart" />
                ) : stat.label === "Đánh giá" ? (
                  <AppIcon name="star" />
                ) : (
                  "$"
                )}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section style={themed(styles.actionGrid)}>
        <Link
          href="/shop/products"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionPurple) }}
        >
          Quản lý sản phẩm
        </Link>
        <Link
          href="/shop/orders"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionBlue) }}
        >
          Xử lý đơn hàng
        </Link>
        <Link
          href="/shop/analytics"
          style={{ ...themed(styles.actionCard), ...themed(styles.actionGreen) }}
        >
          Xem thống kê
        </Link>
      </section>

      <section style={{ ...themed(styles.card), marginBottom: 16 }}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Địa chỉ lấy hàng (GHN)</h2>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <input
            style={themed(styles.formInput)}
            placeholder="Số nhà, đường..."
            value={addressLine}
            onChange={(e) => setAddressLine(e.target.value)}
          />
          <select
            style={themed(styles.formInput)}
            value={provinceId ?? ""}
            onChange={(e) => {
              const next = Number(e.target.value || 0) || null;
              setProvinceId(next);
              setDistrictId(null);
              setWardCode("");
            }}
          >
            <option value="">Tỉnh/Thành</option>
            {provinces.map((item) => (
              <option key={item.ProvinceID} value={item.ProvinceID}>
                {item.ProvinceName}
              </option>
            ))}
          </select>
          <select
            style={themed(styles.formInput)}
            value={districtId ?? ""}
            onChange={(e) => {
              setDistrictId(Number(e.target.value || 0) || null);
              setWardCode("");
            }}
            disabled={!provinceId}
          >
            <option value="">Quận/Huyện</option>
            {districts.map((item) => (
              <option key={item.DistrictID} value={item.DistrictID}>
                {item.DistrictName}
              </option>
            ))}
          </select>
          <select
            style={themed(styles.formInput)}
            value={wardCode}
            onChange={(e) => setWardCode(e.target.value)}
            disabled={!districtId}
          >
            <option value="">Phường/Xã</option>
            {wards.map((item) => (
              <option key={item.WardCode} value={item.WardCode}>
                {item.WardName}
              </option>
            ))}
          </select>
        </div>
        <div style={{ marginTop: 12 }}>
          <button
            type="button"
            style={themed(styles.primaryButton)}
            onClick={onSaveAddress}
            disabled={savingAddress}
          >
            {savingAddress ? "Đang lưu..." : "Lưu địa chỉ shop"}
          </button>
          <button
            type="button"
            style={{ ...themed(styles.primaryButton), marginLeft: 12 }}
            onClick={onRegisterGhnShop}
            disabled={registeringGhn}
          >
            {registeringGhn
              ? "Đang tạo..."
              : info?.ghn_shop_id
                ? `GHN shop_id: ${info.ghn_shop_id}`
                : "Tạo GHN shop_id"}
          </button>
        </div>
      </section>

      <section style={themed(styles.card)}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Đơn hàng gần đây</h2>
          <Link href="/shop/orders" style={themed(styles.cardLink)}>
            Xem tất cả →
          </Link>
        </div>
        <div style={themed(styles.orderList)}>
          {orders.length > 0 ? (
            orders.map((order) => (
              <div key={order.id} style={themed(styles.orderItem)}>
                <div style={themed(styles.orderThumb)} />
                <div>
                  <div style={themed(styles.orderName)}>{order.id}</div>
                  <div style={themed(styles.orderMeta)}>{order.items}</div>
                </div>
                <span
                  style={{
                    ...themed(styles.statusPill),
                    ...(order.status === "confirmed"
                      ? themed(styles.statusConfirmed)
                      : order.status === "shipping"
                      ? themed(styles.statusShipping)
                      : themed(styles.statusDelivered)),
                  }}
                >
                  {order.status === "confirmed"
                    ? "Đã xác nhận"
                    : order.status === "shipping"
                    ? "Đang giao"
                    : "Đã giao"}
                </span>
                <div style={themed(styles.orderMeta)}>{order.date}</div>
              </div>
            ))
          ) : (
            <div style={{ padding: "24px", textAlign: "center", color: themed(styles.muted).color }}>
              Chưa có đơn hàng nào.
            </div>
          )}
        </div>
      </section>
    </ShopLayout>
  );
}
