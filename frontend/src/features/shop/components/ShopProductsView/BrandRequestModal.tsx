"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "../styles";
import AppIcon from "@/components/commons/AppIcon";
import { uploadImageToS3 } from "@/services/uploadApi";
import { showErrorToast, showSuccessToast } from "@/components/commons/Toast";
import { createBrandRequestService } from "../../sevices";

interface BrandRequestModalProps {
  open: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export default function BrandRequestModal({
  open,
  onClose,
  onSubmitted,
}: BrandRequestModalProps) {
  const { themed } = useAppTheme();
  const [brandName, setBrandName] = useState("");
  const [brandImage, setBrandImage] = useState<{ url: string; key: string } | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const maxUploadBytes = 10 * 1024 * 1024;
  const allowedUploadTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  useEffect(() => {
    if (!open) {
      setBrandName("");
      setBrandImage(null);
      setUploading(false);
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const onLogoFileChange = async (file: File) => {
    if (!allowedUploadTypes.includes(file.type)) {
      showErrorToast("Chỉ hỗ trợ ảnh JPG, PNG, WEBP, GIF");
      return;
    }
    if (file.size > maxUploadBytes) {
      showErrorToast("Ảnh vượt quá 10MB");
      return;
    }
    try {
      setUploading(true);
      const uploaded = await uploadImageToS3({ file, folder: "brands" });
      setBrandImage(uploaded);
      showSuccessToast("Upload logo thành công");
    } catch (error) {
      showErrorToast(error);
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async () => {
    const name = brandName.trim();
    if (!name) {
      showErrorToast("Vui lòng nhập tên thương hiệu");
      return;
    }

    try {
      setSubmitting(true);
      await createBrandRequestService({
        name,
        image: brandImage?.url || undefined,
      });
      showSuccessToast("Đã gửi yêu cầu thương hiệu");
      setBrandName("");
      setBrandImage(null);
      onClose();
      onSubmitted?.();
    } catch (error) {
      showErrorToast(error);
    } finally {
      setSubmitting(false);
    }
  };

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
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
              />
            </label>
            <label style={themed(styles.modalLabel)}>
              Logo thương hiệu (tuỳ chọn)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                style={themed(styles.modalInput)}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void onLogoFileChange(file);
                  }
                  e.currentTarget.value = "";
                }}
              />
              <span style={themed(styles.modalHint)}>
                {uploading
                  ? "Đang upload logo..."
                  : "JPG, PNG, WEBP, GIF (tối đa 10MB)"}
              </span>
              {brandImage?.url ? (
                <Image
                  src={brandImage.url}
                  alt="Brand logo preview"
                  width={720}
                  height={240}
                  style={{
                    ...themed(styles.modalUploadPreview),
                    maxWidth: "240px",
                    maxHeight: "140px",
                  }}
                />
              ) : null}
            </label>
          </div>
          <div style={themed(styles.modalActions)}>
            <button
              type="button"
              style={themed(styles.primaryButton)}
              onClick={onSubmit}
              disabled={submitting || uploading}
            >
              {submitting ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
