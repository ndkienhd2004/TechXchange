"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/features/auth";
import { GetUserProfile, logout } from "@/features/auth";
import PersonalInfoForm from "../PersonalInfoForm";
import * as styles from "./styles";
import { useAppTheme } from "@/theme/ThemeProvider";
import { getAxiosInstance } from "@/services/axiosConfig";
import {
  getGhnDistricts,
  getGhnProvinces,
  getGhnWards,
  type GhnDistrict,
  type GhnProvince,
  type GhnWard,
} from "@/services/ghnApi";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import AppIcon from "@/components/commons/AppIcon";

type TabId = "info" | "address";
type UserAddress = {
  id: number;
  full_name?: string | null;
  phone?: string | null;
  address_line: string;
  ward?: string | null;
  district?: string | null;
  city?: string | null;
  province: string;
  ghn_province_id?: number | null;
  ghn_district_id?: number | null;
  ghn_ward_code?: string | null;
  is_default: boolean;
};

type AddressFormState = {
  full_name: string;
  phone: string;
  address_line: string;
  ward: string;
  district: string;
  city: string;
  province: string;
  ghn_province_id: number | null;
  ghn_district_id: number | null;
  ghn_ward_code: string;
  is_default: boolean;
};

const EMPTY_ADDRESS_FORM: AddressFormState = {
  full_name: "",
  phone: "",
  address_line: "",
  ward: "",
  district: "",
  city: "",
  province: "",
  ghn_province_id: null,
  ghn_district_id: null,
  ghn_ward_code: "",
  is_default: false,
};

export default function ProfileView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);

  const [activeTab, setActiveTab] = useState<TabId>(
    searchParams.get("tab") === "address" ? "address" : "info",
  );
  const [avatarError, setAvatarError] = useState(false);

  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState<AddressFormState>(
    EMPTY_ADDRESS_FORM,
  );
  const [provinces, setProvinces] = useState<GhnProvince[]>([]);
  const [districts, setDistricts] = useState<GhnDistrict[]>([]);
  const [wards, setWards] = useState<GhnWard[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [canCreateStoreRequest, setCanCreateStoreRequest] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(GetUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  useEffect(() => {
    const loadStoreRequestPermission = async () => {
      if (!isAuthenticated || !user) {
        setCanCreateStoreRequest(false);
        return;
      }
      if (user.role !== "user") {
        setCanCreateStoreRequest(false);
        return;
      }
      try {
        const api = getAxiosInstance();
        const [storesRes, requestsRes] = await Promise.all([
          api.get("/stores/me"),
          api.get("/stores/requests/me", {
            params: { limit: 1, offset: 0, status: "all" },
          }),
        ]);
        const myStores = Array.isArray(storesRes?.data?.data)
          ? storesRes.data.data
          : [];
        const totalRequests = Number(requestsRes?.data?.data?.total || 0);
        setCanCreateStoreRequest(myStores.length === 0 && totalRequests === 0);
      } catch {
        setCanCreateStoreRequest(false);
      }
    };
    void loadStoreRequestPermission();
  }, [isAuthenticated, user]);

  useEffect(() => {
    setActiveTab(searchParams.get("tab") === "address" ? "address" : "info");
  }, [searchParams]);

  const loadAddresses = useCallback(async () => {
    try {
      setAddressLoading(true);
      const api = getAxiosInstance();
      const res = await api.get("/users/addresses");
      const rows = Array.isArray(res?.data?.data?.addresses)
        ? res.data.data.addresses
        : [];
      setAddresses(rows);
    } catch (error) {
      showErrorToast(error);
      setAddresses([]);
    } finally {
      setAddressLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    loadAddresses();
  }, [isAuthenticated, loadAddresses]);

  useEffect(() => {
    if (!addressModalOpen) return;
    let mounted = true;

    const run = async () => {
      try {
        setLocationLoading(true);
        const rows = await getGhnProvinces();
        if (mounted) setProvinces(rows);
      } catch (error) {
        showErrorToast(error);
      } finally {
        if (mounted) setLocationLoading(false);
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [addressModalOpen]);

  useEffect(() => {
    const provinceId = addressForm.ghn_province_id;
    if (!addressModalOpen || !provinceId) {
      setDistricts([]);
      setWards([]);
      return;
    }

    let mounted = true;
    getGhnDistricts(provinceId)
      .then((rows) => {
        if (mounted) setDistricts(rows);
      })
      .catch(showErrorToast);

    return () => {
      mounted = false;
    };
  }, [addressModalOpen, addressForm.ghn_province_id]);

  useEffect(() => {
    const districtId = addressForm.ghn_district_id;
    if (!addressModalOpen || !districtId) {
      setWards([]);
      return;
    }

    let mounted = true;
    getGhnWards(districtId)
      .then((rows) => {
        if (mounted) setWards(rows);
      })
      .catch(showErrorToast);

    return () => {
      mounted = false;
    };
  }, [addressModalOpen, addressForm.ghn_district_id]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  const resetAddressForm = () => {
    setAddressForm(EMPTY_ADDRESS_FORM);
  };

  const openCreateAddressModal = () => {
    setEditingAddressId(null);
    resetAddressForm();
    setAddressModalOpen(true);
  };

  const openEditAddressModal = (address: UserAddress) => {
    setEditingAddressId(Number(address.id));
    setAddressForm({
      full_name: address.full_name || "",
      phone: address.phone || "",
      address_line: address.address_line || "",
      ward: address.ward || "",
      district: address.district || "",
      city: address.city || "",
      province: address.province || "",
      ghn_province_id: address.ghn_province_id || null,
      ghn_district_id: address.ghn_district_id || null,
      ghn_ward_code: address.ghn_ward_code || "",
      is_default: Boolean(address.is_default),
    });
    setAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setAddressModalOpen(false);
    setEditingAddressId(null);
    resetAddressForm();
  };

  const onSubmitAddress = async () => {
    if (
      !addressForm.address_line.trim() ||
      !addressForm.ghn_province_id ||
      !addressForm.ghn_district_id ||
      !addressForm.ghn_ward_code
    ) {
      showErrorToast("Vui lòng nhập địa chỉ và chọn đủ Tỉnh/Quận/Phường");
      return;
    }

    const payload = {
      ...addressForm,
      full_name: addressForm.full_name.trim() || undefined,
      phone: addressForm.phone.trim() || undefined,
      address_line: addressForm.address_line.trim(),
      ward: addressForm.ward.trim() || undefined,
      district: addressForm.district.trim() || undefined,
      city: addressForm.city.trim() || undefined,
      province: addressForm.province.trim(),
      ghn_province_id: addressForm.ghn_province_id,
      ghn_district_id: addressForm.ghn_district_id,
      ghn_ward_code: addressForm.ghn_ward_code,
    };

    try {
      setSavingAddress(true);
      const api = getAxiosInstance();
      if (editingAddressId) {
        await api.put(`/users/addresses/${editingAddressId}`, payload);
        showSuccessToast("Cập nhật địa chỉ thành công");
      } else {
        await api.post("/users/addresses", payload);
        showSuccessToast("Thêm địa chỉ thành công");
      }
      await loadAddresses();
      closeAddressModal();
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSavingAddress(false);
    }
  };

  const onSetDefault = async (id: number) => {
    try {
      const api = getAxiosInstance();
      await api.put(`/users/addresses/${id}/default`);
      showSuccessToast("Đã đặt địa chỉ mặc định");
      await loadAddresses();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const onDeleteAddress = async (id: number) => {
    try {
      const api = getAxiosInstance();
      await api.delete(`/users/addresses/${id}`);
      showSuccessToast("Đã xóa địa chỉ");
      await loadAddresses();
    } catch (error) {
      showErrorToast(error);
    }
  };

  const addressCount = addresses.length;

  const initial =
    user?.username?.charAt(0)?.toUpperCase() ||
    user?.email?.charAt(0)?.toUpperCase() ||
    "?";

  const sortedAddresses = useMemo(() => {
    return [...addresses].sort((a, b) => Number(b.is_default) - Number(a.is_default));
  }, [addresses]);

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        <div style={themed(styles.summaryCard)}>
          <div style={themed(styles.summaryLeft)}>
            {user.avatar && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                style={themed(styles.summaryAvatarImg)}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div style={themed(styles.summaryAvatar)}>{initial}</div>
            )}
            <div style={themed(styles.summaryInfo)}>
              <h1 style={themed(styles.summaryName)}>{user.username || user.email}</h1>
              <p style={themed(styles.summaryEmail)}>{user.email}</p>
              <div style={themed(styles.summaryStats)}>
                <span style={themed(styles.summaryStat)}>0 Đơn hàng</span>
                <span style={themed(styles.summaryStat)}>0 Đang xử lý</span>
                <span style={themed(styles.summaryStat)}>0 Đã giao</span>
              </div>
            </div>
          </div>
          {canCreateStoreRequest && (
            <Link href="/store-request" style={themed(styles.summaryButton)}>
              Đăng ký bán hàng
            </Link>
          )}
        </div>

        <div style={themed(styles.actionsRow)}>
          <Link href="/orders" style={themed(styles.actionCard)}>
            <div style={themed(styles.actionIcon)}>
              <AppIcon name="bag" />
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Đơn hàng</span>
              <span style={themed(styles.actionSub)}>Xem tất cả</span>
            </div>
          </Link>
          <Link href="/wishlist" style={themed(styles.actionCard)}>
            <div style={themed(styles.actionIcon)}>
              <AppIcon name="star" />
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Yêu thích</span>
              <span style={themed(styles.actionSub)}>0 sản phẩm</span>
            </div>
          </Link>
          <Link
            href="#address"
            style={themed(styles.actionCard)}
            onClick={() => setActiveTab("address")}
          >
            <div style={themed(styles.actionIcon)}>
              <AppIcon name="location" />
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Địa chỉ</span>
              <span style={themed(styles.actionSub)}>{addressCount} địa chỉ</span>
            </div>
          </Link>
          <button type="button" style={themed(styles.actionCard)} onClick={handleLogout}>
            <div style={themed(styles.actionIcon)}>
              <AppIcon name="reject" />
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Đăng xuất</span>
              <span style={themed(styles.actionSub)}>Thoát tài khoản</span>
            </div>
          </button>
        </div>

        <div style={themed(styles.tabsRow)}>
          <button
            type="button"
            style={activeTab === "info" ? themed(styles.tabActive) : themed(styles.tab)}
            onClick={() => setActiveTab("info")}
          >
            Thông tin cá nhân
          </button>
          <button
            type="button"
            style={
              activeTab === "address" ? themed(styles.tabActive) : themed(styles.tab)
            }
            onClick={() => setActiveTab("address")}
          >
            Địa chỉ
          </button>
        </div>

        {activeTab === "info" && <PersonalInfoForm user={user} />}

        {activeTab === "address" && (
          <div style={themed(styles.section)}>
            <div style={themed(styles.addressSectionHeader)}>
              <h2 style={themed(styles.sectionTitle)}>Địa chỉ của tôi</h2>
              <button
                type="button"
                style={themed(styles.addAddressButton)}
                onClick={openCreateAddressModal}
              >
                + Thêm địa chỉ mới
              </button>
            </div>

            {addressLoading ? (
              <p style={themed(styles.summaryEmail)}>Đang tải địa chỉ...</p>
            ) : sortedAddresses.length === 0 ? (
              <p style={themed(styles.summaryEmail)}>Chưa có địa chỉ nào.</p>
            ) : (
              <div style={themed(styles.addressPanel)}>
                {sortedAddresses.map((addr, index) => (
                  <div key={addr.id} style={themed(styles.addressRow)}>
                    <div style={themed(styles.addressMain)}>
                      <div style={themed(styles.addressNameLine)}>
                        <span style={themed(styles.addressName)}>
                          {addr.full_name || "Địa chỉ giao hàng"}
                        </span>
                        {addr.phone ? (
                          <span style={themed(styles.addressPhone)}>{addr.phone}</span>
                        ) : null}
                      </div>
                      <div style={themed(styles.addressText)}>
                        {[addr.address_line, addr.ward, addr.district]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                      <div style={themed(styles.addressText)}>
                        {[addr.city, addr.province].filter(Boolean).join(", ")}
                      </div>
                      {addr.is_default && (
                        <span style={themed(styles.defaultBadge)}>Mặc định</span>
                      )}
                    </div>

                    <div style={themed(styles.addressActionCol)}>
                      <div style={themed(styles.addressLinkActions)}>
                        <button
                          type="button"
                          style={themed(styles.linkActionButton)}
                          onClick={() => openEditAddressModal(addr)}
                        >
                          Cập nhật
                        </button>
                        <button
                          type="button"
                          style={themed(styles.linkActionButton)}
                          onClick={() => onDeleteAddress(addr.id)}
                        >
                          Xóa
                        </button>
                      </div>
                      {!addr.is_default && (
                        <button
                          type="button"
                          style={themed(styles.ghostButton)}
                          onClick={() => onSetDefault(addr.id)}
                        >
                          Thiết lập mặc định
                        </button>
                      )}
                    </div>

                    {index < sortedAddresses.length - 1 && (
                      <div style={themed(styles.addressDivider)} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {addressModalOpen && (
        <div style={themed(styles.modalOverlay)} onClick={closeAddressModal}>
          <div
            style={themed(styles.modalCard)}
            onClick={(event) => event.stopPropagation()}
          >
            <div style={themed(styles.modalHeader)}>
              <h3 style={themed(styles.modalTitle)}>
                {editingAddressId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
              </h3>
              <button
                type="button"
                style={themed(styles.modalCloseButton)}
                onClick={closeAddressModal}
              >
                <AppIcon name="close" />
              </button>
            </div>

            <div style={themed(styles.addressFormGrid)}>
              <input
                style={themed(styles.input)}
                placeholder="Họ và tên"
                value={addressForm.full_name}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, full_name: e.target.value }))
                }
              />
              <input
                style={themed(styles.input)}
                placeholder="Số điện thoại"
                value={addressForm.phone}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <input
                style={{ ...themed(styles.input), gridColumn: "1 / -1" }}
                placeholder="Địa chỉ chi tiết"
                value={addressForm.address_line}
                onChange={(e) =>
                  setAddressForm((prev) => ({ ...prev, address_line: e.target.value }))
                }
              />
              <select
                style={themed(styles.input)}
                value={addressForm.ghn_province_id ?? ""}
                disabled={locationLoading}
                onChange={(e) => {
                  const provinceId = Number(e.target.value || 0) || null;
                  const selected = provinces.find(
                    (item) => Number(item.ProvinceID) === Number(provinceId || 0),
                  );
                  setAddressForm((prev) => ({
                    ...prev,
                    ghn_province_id: provinceId,
                    province: selected?.ProvinceName || "",
                    city: selected?.ProvinceName || "",
                    ghn_district_id: null,
                    district: "",
                    ghn_ward_code: "",
                    ward: "",
                  }));
                }}
              >
                <option value="">Chọn Tỉnh/Thành</option>
                {provinces.map((item) => (
                  <option key={item.ProvinceID} value={item.ProvinceID}>
                    {item.ProvinceName}
                  </option>
                ))}
              </select>
              <select
                style={themed(styles.input)}
                value={addressForm.ghn_district_id ?? ""}
                disabled={!addressForm.ghn_province_id}
                onChange={(e) => {
                  const districtId = Number(e.target.value || 0) || null;
                  const selected = districts.find(
                    (item) => Number(item.DistrictID) === Number(districtId || 0),
                  );
                  setAddressForm((prev) => ({
                    ...prev,
                    ghn_district_id: districtId,
                    district: selected?.DistrictName || "",
                    ghn_ward_code: "",
                    ward: "",
                  }));
                }}
              >
                <option value="">Chọn Quận/Huyện</option>
                {districts.map((item) => (
                  <option key={item.DistrictID} value={item.DistrictID}>
                    {item.DistrictName}
                  </option>
                ))}
              </select>
              <select
                style={themed(styles.input)}
                value={addressForm.ghn_ward_code}
                disabled={!addressForm.ghn_district_id}
                onChange={(e) => {
                  const wardCode = e.target.value;
                  const selected = wards.find((item) => item.WardCode === wardCode);
                  setAddressForm((prev) => ({
                    ...prev,
                    ghn_ward_code: wardCode,
                    ward: selected?.WardName || "",
                  }));
                }}
              >
                <option value="">Chọn Phường/Xã</option>
                {wards.map((item) => (
                  <option key={item.WardCode} value={item.WardCode}>
                    {item.WardName}
                  </option>
                ))}
              </select>

              <label style={{ ...themed(styles.checkboxRow), gridColumn: "1 / -1" }}>
                <input
                  type="checkbox"
                  checked={addressForm.is_default}
                  onChange={(e) =>
                    setAddressForm((prev) => ({
                      ...prev,
                      is_default: e.target.checked,
                    }))
                  }
                />
                Đặt làm mặc định
              </label>
            </div>

            <div style={themed(styles.modalActions)}>
              <button
                type="button"
                style={themed(styles.ghostButton)}
                onClick={closeAddressModal}
              >
                Hủy
              </button>
              <button
                type="button"
                style={themed(styles.addAddressButton)}
                onClick={onSubmitAddress}
                disabled={savingAddress}
              >
                {savingAddress
                  ? "Đang lưu..."
                  : editingAddressId
                    ? "Lưu thay đổi"
                    : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
