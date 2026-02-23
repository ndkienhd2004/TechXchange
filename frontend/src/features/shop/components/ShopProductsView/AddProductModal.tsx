"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "../styles";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { RootState } from "@/store";
import { getProductCatalogs, getShopBrands } from "../../store";
import BrandRequestModal from "./BrandRequestModal";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AddProductModal({
  open,
  onClose,
}: AddProductModalProps) {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const { productCatalogs, brands, loading } = useAppSelector(
    (state: RootState) => state.shop,
  );
  const [mode, setMode] = useState<"existing" | "request">("existing");
  const [brandModalOpen, setBrandModalOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(getProductCatalogs({ page: 1, size: 20, append: false }));

      dispatch(getShopBrands());
    }
  }, [open, dispatch]);

  const filteredProductsCatalogs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return productCatalogs;
    return productCatalogs.filter((c) => c.name.toLowerCase().includes(q));
  }, [productCatalogs, query]);

  if (!open) return null;

  return (
    <>
      <div style={themed(styles.modalOverlay)}>
        <div style={themed(styles.modalCard)}>
          <div style={themed(styles.modalHeader)}>
            <h3 style={themed(styles.modalTitle)}>Thêm sản phẩm</h3>
            <button
              type="button"
              style={themed(styles.modalClose)}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <div style={themed(styles.modalTabs)}>
            <button
              type="button"
              style={
                mode === "existing"
                  ? themed(styles.modalTabActive)
                  : themed(styles.modalTab)
              }
              onClick={() => setMode("existing")}
            >
              Chọn từ catalog
            </button>
            <button
              type="button"
              style={
                mode === "request"
                  ? themed(styles.modalTabActive)
                  : themed(styles.modalTab)
              }
              onClick={() => setMode("request")}
            >
              Tạo request sản phẩm mới
            </button>
          </div>

          {mode === "existing" ? (
            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.modalSearchRow)}>
                <input
                  type="text"
                  placeholder="Tìm sản phẩm trong catalog..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={themed(styles.modalInput)}
                />
              </div>
              <div style={themed(styles.modalList)}>
                {loading && productCatalogs.length === 0 ? (
                  <div style={themed(styles.modalHint)}>
                    Đang tải catalog...
                  </div>
                ) : filteredProductsCatalogs.length === 0 ? (
                  <div style={themed(styles.modalHint)}>
                    Không có sản phẩm phù hợp.
                  </div>
                ) : (
                  filteredProductsCatalogs.map((c) => (
                    <label key={c.id} style={themed(styles.modalProductRow)}>
                      <input type="checkbox" />
                      <div style={themed(styles.modalProductThumb)} />
                      <div style={themed(styles.modalProductInfo)}>
                        <div style={themed(styles.modalProductName)}>
                          {c.name}
                        </div>
                        <div style={themed(styles.modalProductMeta)}>
                          {c.brand?.name ?? ""} · {c.category?.name ?? ""}
                        </div>
                      </div>
                      <div style={themed(styles.modalProductPrice)}>
                        {c.msrp}
                      </div>
                    </label>
                  ))
                )}
              </div>
              <div style={themed(styles.modalActions)}>
                <button type="button" style={themed(styles.primaryButton)}>
                  Thêm sản phẩm
                </button>
              </div>
            </div>
          ) : (
            <div style={themed(styles.modalBody)}>
              <div style={themed(styles.modalForm)}>
                <label style={themed(styles.modalLabel)}>
                  Tên sản phẩm
                  <input
                    type="text"
                    placeholder="Nhập tên sản phẩm"
                    style={themed(styles.modalInput)}
                  />
                </label>
                <label style={themed(styles.modalLabel)}>
                  Thương hiệu
                  <select style={themed(styles.modalInput)}>
                    <option>Chọn thương hiệu</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label style={themed(styles.modalLabel)}>
                  Chưa có thương hiệu?
                  <button
                    type="button"
                    style={themed(styles.modalLink)}
                    onClick={() => setBrandModalOpen(true)}
                  >
                    + Gửi yêu cầu brand
                  </button>
                </label>
              </div>
              <div style={themed(styles.modalActions)}>
                <button type="button" style={themed(styles.primaryButton)}>
                  Gửi request
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <BrandRequestModal
        open={brandModalOpen}
        onClose={() => setBrandModalOpen(false)}
      />
    </>
  );
}
