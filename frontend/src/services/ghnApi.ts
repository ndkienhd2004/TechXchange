import { getAxiosInstance } from "@/services/axiosConfig";

const api = () => getAxiosInstance();

export type GhnProvince = {
  ProvinceID: number;
  ProvinceName: string;
};

export type GhnDistrict = {
  DistrictID: number;
  DistrictName: string;
  ProvinceID?: number;
};

export type GhnWard = {
  WardCode: string;
  WardName: string;
  DistrictID?: number;
};

export async function getGhnProvinces(): Promise<GhnProvince[]> {
  const res = await api().get("/ghn/provinces");
  const rows = res?.data?.data?.provinces;
  return Array.isArray(rows) ? rows : [];
}

export async function getGhnDistricts(provinceId: number): Promise<GhnDistrict[]> {
  const res = await api().get("/ghn/districts", {
    params: { province_id: provinceId },
  });
  const rows = res?.data?.data?.districts;
  return Array.isArray(rows) ? rows : [];
}

export async function getGhnWards(districtId: number): Promise<GhnWard[]> {
  const res = await api().get("/ghn/wards", {
    params: { district_id: districtId },
  });
  const rows = res?.data?.data?.wards;
  return Array.isArray(rows) ? rows : [];
}
