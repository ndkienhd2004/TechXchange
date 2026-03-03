"use client";

import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "../styles";
import AppIcon from "@/components/commons/AppIcon";

interface BrandRequestModalProps {
  open: boolean;
  onClose: () => void;
}

export default function BrandRequestModal({ open, onClose }: BrandRequestModalProps) {
  const { themed } = useAppTheme();

  if (!open) return null;

  return (
    <div style={themed(styles.modalOverlay)}>
      <div style={themed(styles.modalCard)}>
        <div style={themed(styles.modalHeader)}>
          <h3 style={themed(styles.modalTitle)}>Yêu cầu tạo thương hiệu</h3>
          <button type="button" style={themed(styles.modalClose)} onClick={onClose}>
            <AppIcon name="close" />
          </button>
        </div>

        <div style={themed(styles.modalBody)}>
          <div style={themed(styles.modalForm)}>
            <label style={themed(styles.modalLabel)}>
              Tên thương hiệu
              <input
                type="text"
                placeholder="Nhập tên thương hiệu"
                style={themed(styles.modalInput)}
              />
            </label>
            <label style={themed(styles.modalLabel)}>
              Logo URL
              <input
                type="text"
                placeholder="https://..."
                style={themed(styles.modalInput)}
              />
            </label>
            <label style={themed(styles.modalLabel)}>
              Mô tả
              <textarea
                placeholder="Giới thiệu thương hiệu..."
                style={themed(styles.modalTextarea)}
              />
            </label>
          </div>
          <div style={themed(styles.modalActions)}>
            <button type="button" style={themed(styles.primaryButton)}>
              Gửi yêu cầu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
