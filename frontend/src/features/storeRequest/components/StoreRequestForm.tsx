"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated, selectUser } from "@/features/auth";
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
import {
  getGhnDistricts,
  getGhnProvinces,
  getGhnWards,
  type GhnDistrict,
  type GhnProvince,
  type GhnWard,
} from "@/services/ghnApi";
import {
  buildAuthRedirectHref,
  buildCurrentPath,
} from "@/features/auth/utils/redirect";

export default function StoreRequestForm() {
  const { themed } = useAppTheme();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [storeName, setStoreName] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [provinceId, setProvinceId] = useState<number | null>(null);
  const [districtId, setDistrictId] = useState<number | null>(null);
  const [wardCode, setWardCode] = useState("");
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const items = useAppSelector(selectStoreRequestItems);
  const total = useAppSelector(selectStoreRequestTotal);
  const listLoading = useAppSelector(selectStoreRequestListLoading);
  const submitLoading = useAppSelector(selectStoreRequestSubmitLoading);
  const error = useAppSelector(selectStoreRequestError);
  const canSubmitRequest = isAuthenticated && user?.role === "user" && total === 0;
  const loginHref = buildAuthRedirectHref(
    "/login",
    buildCurrentPath(pathname, searchParams),
  );

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchMyStoreRequests({ limit: 10, offset: 0, status: "all" }));
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    getGhnProvinces().then(setProvinces).catch(() => {});
  }, []);

  useEffect(() => {
    if (!provinceId) {
      return;
    }
    getGhnDistricts(provinceId).then(setDistricts).catch(() => {});
  }, [provinceId]);

  useEffect(() => {
    if (!districtId) {
      return;
    }
    getGhnWards(districtId).then(setWards).catch(() => {});
  }, [districtId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.replace(loginHref);
      return;
    }
    if (!canSubmitRequest) {
      return;
    }
    if (!contactPhone.trim() || !addressLine.trim() || !provinceId || !districtId || !wardCode) {
      return;
    }
    const province = provinces.find((item) => item.ProvinceID === provinceId);
    const district = districts.find((item) => item.DistrictID === districtId);
    const ward = wards.find((item) => item.WardCode === wardCode);
    const result = await dispatch(
      createStoreRequest({
        store_name: storeName.trim(),
        store_description: storeDescription.trim() || undefined,
        contact_phone: contactPhone.trim(),
        address_line: addressLine.trim(),
        ward: ward?.WardName,
        district: district?.DistrictName || "",
        city: province?.ProvinceName,
        province: province?.ProvinceName || "",
        ghn_province_id: provinceId,
        ghn_district_id: districtId,
        ghn_ward_code: wardCode,
      })
    );
    if (createStoreRequest.fulfilled.match(result)) {
      setSubmitted(true);
      setStoreName("");
      setStoreDescription("");
      setContactPhone("");
      setAddressLine("");
      setProvinceId(null);
      setDistrictId(null);
      setWardCode("");
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
          {!canSubmitRequest && (
            <p style={themed(styles.helper)}>
              Bạn không thể tạo thêm yêu cầu mở shop. Mỗi tài khoản chỉ tạo 1 lần.
            </p>
          )}

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

            <div>
              <label htmlFor="store-phone" style={themed(styles.label)}>
                Số điện thoại shop
              </label>
              <input
                id="store-phone"
                type="text"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="09xxxxxxxx"
                required
                style={themed(styles.input)}
              />
            </div>

            <div>
              <label htmlFor="store-address-line" style={themed(styles.label)}>
                Địa chỉ chi tiết
              </label>
              <input
                id="store-address-line"
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="Số nhà, tên đường"
                required
                style={themed(styles.input)}
              />
            </div>

            <div>
              <label style={themed(styles.label)}>Tỉnh/Thành</label>
              <select
                value={provinceId ?? ""}
                onChange={(e) => {
                  setProvinceId(Number(e.target.value || 0) || null);
                  setDistrictId(null);
                  setDistricts([]);
                  setWards([]);
                  setWardCode("");
                }}
                required
                style={themed(styles.input)}
              >
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map((item) => (
                  <option key={item.ProvinceID} value={item.ProvinceID}>
                    {item.ProvinceName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={themed(styles.label)}>Quận/Huyện</label>
              <select
                value={districtId ?? ""}
                onChange={(e) => {
                  setDistrictId(Number(e.target.value || 0) || null);
                  setWards([]);
                  setWardCode("");
                }}
                required
                disabled={!provinceId}
                style={themed(styles.input)}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((item) => (
                  <option key={item.DistrictID} value={item.DistrictID}>
                    {item.DistrictName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={themed(styles.label)}>Phường/Xã</label>
              <select
                value={wardCode}
                onChange={(e) => setWardCode(e.target.value)}
                required
                disabled={!districtId}
                style={themed(styles.input)}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((item) => (
                  <option key={item.WardCode} value={item.WardCode}>
                    {item.WardName}
                  </option>
                ))}
              </select>
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
              disabled={submitLoading || !canSubmitRequest}
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
