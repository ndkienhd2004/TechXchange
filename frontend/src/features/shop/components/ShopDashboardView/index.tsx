"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
import {
  getShopAnalyticsService,
  updateShopAddressService,
  updateShopProfileService,
} from "../../sevices";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { uploadImageToS3 } from "@/services/uploadApi";
import { getAxiosInstance } from "@/services/axiosConfig";

type DashboardAnalytics = {
  total_orders: number;
  completed_orders: number;
  total_revenue: number;
};

type DashboardOrder = {
  id: number;
  status: "pending" | "shipping" | "completed" | "canceled";
  created_at: string;
  total_price: number | string;
  items?: Array<{
    id: number;
    quantity: number;
    product?: {
      id?: number;
      name?: string;
    };
  }>;
};

export default function ShopDashboardView() {
  const { themed, theme } = useAppTheme();
  const dispatch = useAppDispatch();
  const { info, productsTotal, loading } = useAppSelector(
    (state: RootState) => state.shop,
  );
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressLine, setAddressLine] = useState("");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState("");
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [logoUploading, setLogoUploading] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [recentOrdersLoading, setRecentOrdersLoading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const logoInputRef = useRef<HTMLInputElement | null>(null);

  const formatVnd = (value: number | string) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

  const getOrderStatusLabel = (status: DashboardOrder["status"]) => {
    if (status === "pending") return "Chờ xác nhận";
    if (status === "shipping") return "Đang giao";
    if (status === "completed") return "Đã giao";
    return "Đã hủy";
  };

  useEffect(() => {
    // Lấy danh sách sản phẩm để biết tổng số lượng
    dispatch(getShopProducts({ page: 1, limit: 1, append: false }));
  }, [dispatch]);

  useEffect(() => {
    const run = async () => {
      try {
        setAnalyticsLoading(true);
        const res = await getShopAnalyticsService("7d");
        setAnalytics(res?.data || null);
      } catch (error) {
        setAnalytics(null);
        showErrorToast(error);
      } finally {
        setAnalyticsLoading(false);
      }
    };
    void run();
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        setRecentOrdersLoading(true);
        const api = getAxiosInstance();
        const res = await api.get("/orders/shop/me");
        const rows = Array.isArray(res?.data?.data?.orders)
          ? res.data.data.orders
          : [];
        setRecentOrders(rows.slice(0, 5));
      } catch (error) {
        setRecentOrders([]);
        showErrorToast(error);
      } finally {
        setRecentOrdersLoading(false);
      }
    };
    void run();
  }, []);

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

  const stats = useMemo(
    () => [
      {
        label: "Tổng sản phẩm",
        value: productsTotal.toString(),
        tone: theme.colors.palette.brand.purple[500],
      },
      {
        label: "Đơn hàng",
        value: analyticsLoading ? "..." : String(analytics?.total_orders ?? 0),
        tone: theme.colors.palette.semantic.info,
        sub: analyticsLoading
          ? ""
          : `${analytics?.completed_orders ?? 0} hoàn thành`,
      },
      {
        label: "Doanh thu",
        value: analyticsLoading
          ? "..."
          : formatVnd(analytics?.total_revenue ?? 0),
        tone: theme.colors.palette.semantic.success,
        sub: "7 ngày gần nhất",
      },
      {
        label: "Đánh giá",
        value: info?.rating?.toString() || "0",
        tone: theme.colors.palette.semantic.warning,
        sub: info?.rating?.toFixed(1) || "0.0",
      },
    ],
    [productsTotal, info, analyticsLoading, analytics, theme.colors],
  );

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

  const onChooseLogo = () => {
    logoInputRef.current?.click();
  };

  const onShopLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.currentTarget.value = "";
    if (!file || !info?.id || logoUploading) return;

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      showErrorToast("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showErrorToast("Ảnh vượt quá 10MB");
      return;
    }

    try {
      setLogoUploading(true);
      const uploaded = await uploadImageToS3({ file, folder: "shops" });
      await updateShopProfileService(Number(info.id), {
        logo: uploaded.url,
      });
      showSuccessToast("Đã cập nhật ảnh đại diện shop");
      dispatch(getShopInfo());
    } catch (error) {
      showErrorToast(error);
    } finally {
      setLogoUploading(false);
    }
  };

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
              <div style={themed(styles.statValue)}>
                {loading ? "..." : stat.value}
              </div>
              {stat.sub && (
                <div style={{ color: stat.tone, marginTop: 4 }}>{stat.sub}</div>
              )}
            </div>
            <div
              style={{
                ...themed(styles.statIcon),
                background: `${stat.tone}22`,
              }}
            >
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

      <section style={{ ...themed(styles.card), marginBottom: 16 }}>
        <div style={themed(styles.cardHeader)}>
          <h2 style={themed(styles.cardTitle)}>Ảnh đại diện cửa hàng</h2>
        </div>
        <div style={themed(styles.shopLogoSection)}>
          <div style={themed(styles.shopLogoPreview)}>
            {info?.logo ? (
              <Image
                src={info.logo}
                alt={info.name || "Shop avatar"}
                fill
                sizes="120px"
                style={{ objectFit: "cover" }}
              />
            ) : (
              <span>🏪</span>
            )}
          </div>
          <div style={themed(styles.shopLogoInfo)}>
            <button
              type="button"
              style={themed(styles.primaryButton)}
              onClick={onChooseLogo}
              disabled={logoUploading}
            >
              {logoUploading ? "Đang upload..." : "Đổi ảnh shop"}
            </button>
            <div style={themed(styles.muted)}>
              JPG, PNG, WEBP, GIF (tối đa 10MB)
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={onShopLogoChange}
              style={themed(styles.hiddenFileInput)}
            />
          </div>
        </div>
      </section>

      <section style={themed(styles.actionGrid)}>
        <Link
          href="/shop/products"
          style={{
            ...themed(styles.actionCard),
            ...themed(styles.actionPurple),
          }}
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
          style={{
            ...themed(styles.actionCard),
            ...themed(styles.actionGreen),
          }}
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
          {/* <button
            type="button"
            style={{ ...themed(styles.primaryButton), marginLeft: 12 }}
            onClick={onRegisterGhnShop}
            disabled={registeringGhn}
          >
            {registeringGhn
              ? "Đang tạo..."
              : info?.ghn_shop_id
                ? "Đã kết nối GHN"
                : "Tạo GHN shop_id"}
          </button> */}
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
          {recentOrdersLoading ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: themed(styles.muted).color,
              }}
            >
              Đang tải đơn hàng...
            </div>
          ) : recentOrders.length > 0 ? (
            recentOrders.map((order) => {
              const itemCount = (order.items || []).reduce(
                (sum, item) => sum + Number(item.quantity || 0),
                0,
              );
              const firstItemName =
                order.items?.[0]?.product?.name || "Sản phẩm";
              const statusStyle =
                order.status === "pending"
                  ? themed(styles.statusConfirmed)
                  : order.status === "shipping"
                    ? themed(styles.statusShipping)
                    : order.status === "completed"
                      ? themed(styles.statusDelivered)
                      : {
                          background: theme.colors.palette.status.cancelled.bg,
                          color: theme.colors.palette.status.cancelled.text,
                        };

              return (
                <div key={order.id} style={themed(styles.orderItem)}>
                  <div style={themed(styles.orderThumb)} />
                  <div>
                    <div style={themed(styles.orderName)}>#{order.id}</div>
                    <div style={themed(styles.orderMeta)}>
                      {itemCount} sản phẩm • {firstItemName}
                    </div>
                    <div style={themed(styles.orderMeta)}>
                      {formatVnd(order.total_price)}
                    </div>
                  </div>
                  <span
                    style={{
                      ...themed(styles.statusPill),
                      ...statusStyle,
                    }}
                  >
                    {getOrderStatusLabel(order.status)}
                  </span>
                  <div style={themed(styles.orderMeta)}>
                    {new Date(order.created_at).toLocaleDateString("vi-VN")}
                  </div>
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: themed(styles.muted).color,
              }}
            >
              Chưa có đơn hàng nào.
            </div>
          )}
        </div>
      </section>
    </ShopLayout>
  );
}
