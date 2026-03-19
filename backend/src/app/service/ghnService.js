class GhnService {
  static shouldDebug() {
    return String(process.env.GHN_DEBUG || "true").toLowerCase() !== "false";
  }

  static maskToken(token) {
    const value = String(token || "");
    if (!value) return "";
    if (value.length <= 8) return "****";
    return `${value.slice(0, 4)}...${value.slice(-4)}`;
  }

  static normalizeVnPhone(input) {
    const raw = String(input || "").trim();
    if (!raw) return "";
    let digits = raw.replace(/\D/g, "");
    if (digits.startsWith("84")) digits = `0${digits.slice(2)}`;
    return digits;
  }

  static buildRegisterAddress(payload = {}) {
    const line = String(payload.address || "").trim();
    const ward = String(payload.ward || "").trim();
    const district = String(payload.district || "").trim();
    const province = String(payload.province || "").trim();
    return [line, ward, district, province].filter(Boolean).join(", ");
  }

  static getBaseUrl() {
    return String(
      process.env.GHN_BASE_URL || "https://online-gateway.ghn.vn",
    ).replace(/\/$/, "");
  }

  static getToken() {
    return String(process.env.GHN_TOKEN || "").trim();
  }

  static getShopId() {
    const raw = String(process.env.GHN_SHOP_ID || "").trim();
    return raw ? Number(raw) : null;
  }

  static ensureConfigured() {
    if (!this.getToken()) {
      throw new Error("Thiếu cấu hình GHN_TOKEN");
    }
  }

  static async request(path, payload = null, headers = {}) {
    this.ensureConfigured();
    const url = `${this.getBaseUrl()}${path}`;
    const reqHeaders = {
      "Content-Type": "application/json",
      Token: this.getToken(),
      ...headers,
    };
    const reqBody = payload ? JSON.stringify(payload) : JSON.stringify({});

    if (this.shouldDebug()) {
      // eslint-disable-next-line no-console
      console.log("[GHN][REQUEST]", {
        url,
        headers: {
          ...reqHeaders,
          Token: this.maskToken(reqHeaders.Token),
        },
        body: payload || {},
      });
    }

    const response = await fetch(url, {
      method: "POST",
      headers: reqHeaders,
      body: reqBody,
    });

    let json = null;
    try {
      json = await response.json();
    } catch (error) {
      throw new Error(`GHN trả về dữ liệu không hợp lệ (${response.status})`);
    }

    if (this.shouldDebug()) {
      // eslint-disable-next-line no-console
      console.log("[GHN][RESPONSE]", {
        url,
        httpStatus: response.status,
        body: json,
      });
    }

    if (!response.ok || Number(json?.code) !== 200) {
      const rawMessage =
        typeof json?.message === "string" ? json.message : "";
      const detail =
        typeof json?.code_message === "string" ? ` [${json.code_message}]` : "";
      const payloadHint =
        json?.data && typeof json.data === "object"
          ? ` - ${JSON.stringify(json.data)}`
          : "";
      if (this.shouldDebug()) {
        // eslint-disable-next-line no-console
        console.error("[GHN][ERROR]", {
          url,
          httpStatus: response.status,
          response: json,
        });
      }
      throw new Error(
        (rawMessage || `GHN request thất bại (${response.status})`) +
          detail +
          payloadHint,
      );
    }

    return json.data;
  }

  static async getProvinces() {
    const data = await this.request("/shiip/public-api/master-data/province");
    return Array.isArray(data) ? data : [];
  }

  static async getDistricts(provinceId) {
    const pid = Number(provinceId);
    if (!pid) throw new Error("province_id không hợp lệ");

    const data = await this.request("/shiip/public-api/master-data/district", {
      province_id: pid,
    });
    return Array.isArray(data) ? data : [];
  }

  static async getWards(districtId) {
    const did = Number(districtId);
    if (!did) throw new Error("district_id không hợp lệ");

    const data = await this.request("/shiip/public-api/master-data/ward", {
      district_id: did,
    });
    return Array.isArray(data) ? data : [];
  }

  static async getAvailableServices({ fromDistrict, toDistrict, shopId }) {
    const from = Number(fromDistrict);
    const to = Number(toDistrict);
    const sid = Number(shopId || this.getShopId());

    if (!from || !to) {
      throw new Error("Thiếu from_district/to_district để lấy dịch vụ GHN");
    }
    if (!sid) {
      throw new Error("Thiếu GHN shop_id (GHN_SHOP_ID)");
    }

    const data = await this.request(
      "/shiip/public-api/v2/shipping-order/available-services",
      {
        shop_id: sid,
        from_district: from,
        to_district: to,
      },
    );

    return Array.isArray(data) ? data : [];
  }

  static async calculateFee(payload = {}) {
    const shopId = Number(payload.shop_id || this.getShopId());
    if (!shopId) throw new Error("Thiếu shop_id để tính phí GHN");

    const body = {
      shop_id: shopId,
      from_district_id: Number(payload.from_district_id),
      from_ward_code: String(payload.from_ward_code || ""),
      to_district_id: Number(payload.to_district_id),
      to_ward_code: String(payload.to_ward_code || ""),
      service_id: payload.service_id ? Number(payload.service_id) : undefined,
      service_type_id: payload.service_type_id
        ? Number(payload.service_type_id)
        : undefined,
      height: Number(payload.height || 10),
      length: Number(payload.length || 20),
      weight: Number(payload.weight || 200),
      width: Number(payload.width || 20),
      insurance_value: Number(payload.insurance_value || 0),
      cod_value: Number(payload.cod_value || 0),
      coupon: payload.coupon || null,
      items: Array.isArray(payload.items) ? payload.items : [],
    };

    if (!body.from_district_id || !body.to_district_id || !body.to_ward_code) {
      throw new Error(
        "Thiếu from_district_id/to_district_id/to_ward_code để tính phí GHN",
      );
    }

    return this.request("/shiip/public-api/v2/shipping-order/fee", body, {
      ShopId: String(shopId),
    });
  }

  static extractOrderDetailData(rawData) {
    if (Array.isArray(rawData)) {
      return rawData[0] || null;
    }
    if (rawData && typeof rawData === "object") {
      return rawData;
    }
    return null;
  }

  static async getOrderDetail(payload = {}) {
    const orderCode = String(payload.order_code || "").trim();
    if (!orderCode) {
      throw new Error("Thiếu order_code để lấy chi tiết đơn GHN");
    }
    const shopId = Number(payload.shop_id || this.getShopId() || 0);
    const headers = {};
    if (shopId) {
      headers.ShopId = String(shopId);
    }
    const data = await this.request(
      "/shiip/public-api/v2/shipping-order/detail",
      {
        order_code: orderCode,
      },
      headers,
    );
    return this.extractOrderDetailData(data);
  }

  static async createOrder(payload = {}) {
    const shopId = Number(payload.shop_id || this.getShopId());
    if (!shopId) throw new Error("Thiếu shop_id để tạo đơn GHN");

    const toName = String(payload.to_name || "").trim();
    const toPhone = this.normalizeVnPhone(payload.to_phone);
    const toAddress = String(payload.to_address || "").trim();
    const toWardCode = String(payload.to_ward_code || "").trim();
    const toDistrictId = Number(payload.to_district_id || 0);

    if (!toName || !toPhone || !toAddress || !toWardCode || !toDistrictId) {
      throw new Error(
        "Thiếu thông tin người nhận GHN (to_name/to_phone/to_address/to_ward_code/to_district_id)",
      );
    }

    const body = {
      payment_type_id: Number(payload.payment_type_id || 1),
      required_note: String(payload.required_note || "KHONGCHOXEMHANG"),
      note: String(payload.note || "").trim() || "",
      client_order_code: String(payload.client_order_code || "").trim() || "",
      to_name: toName,
      to_phone: toPhone,
      to_address: toAddress,
      to_ward_code: toWardCode,
      to_district_id: toDistrictId,
      cod_amount: Number(payload.cod_amount || 0),
      content: String(payload.content || "").trim() || "TechXchange Order",
      weight: Number(payload.weight || 200),
      length: Number(payload.length || 20),
      width: Number(payload.width || 20),
      height: Number(payload.height || 10),
      insurance_value: Number(payload.insurance_value || 0),
      service_id: payload.service_id ? Number(payload.service_id) : undefined,
      service_type_id: payload.service_type_id
        ? Number(payload.service_type_id)
        : undefined,
      items: Array.isArray(payload.items) ? payload.items : [],
    };

    if (payload.return_phone) {
      body.return_phone = this.normalizeVnPhone(payload.return_phone);
    }
    if (payload.return_address) {
      body.return_address = String(payload.return_address).trim();
    }
    if (payload.return_ward_code) {
      body.return_ward_code = String(payload.return_ward_code).trim();
    }
    if (payload.return_district_id) {
      body.return_district_id = Number(payload.return_district_id);
    }
    if (payload.coupon) {
      body.coupon = String(payload.coupon).trim();
    }
    if (Array.isArray(payload.pick_shift) && payload.pick_shift.length > 0) {
      body.pick_shift = payload.pick_shift.map((item) => Number(item)).filter(Boolean);
    }

    return this.request("/shiip/public-api/v2/shipping-order/create", body, {
      ShopId: String(shopId),
    });
  }

  static async registerShop(payload = {}) {
    const normalizedPhone = this.normalizeVnPhone(payload.phone);
    const fullAddress = this.buildRegisterAddress(payload);
    const body = {
      name: String(payload.name || "").trim(),
      phone: normalizedPhone,
      address: fullAddress,
      ward_code: String(payload.ward_code || "").trim(),
      district_id: Number(payload.district_id || 0),
    };

    if (!body.name || !body.phone || !body.address) {
      throw new Error("Thiếu thông tin tạo GHN shop (name/phone/address)");
    }
    if (!/^0\d{9,10}$/.test(body.phone)) {
      throw new Error("Số điện thoại shop không hợp lệ (cần 10-11 số, bắt đầu bằng 0)");
    }
    if (!body.ward_code || !body.district_id) {
      throw new Error("Thiếu district_id/ward_code để tạo GHN shop");
    }

    return this.request("/shiip/public-api/v2/shop/register", body);
  }
}

module.exports = GhnService;
