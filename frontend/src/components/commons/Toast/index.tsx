"use client";

import type React from "react";
import toast, { Toaster } from "react-hot-toast";

const PALE_GREEN = "#f0fdf4";
const ACCENT_GREEN = "#22c55e";
const TEXT_GREEN = "#166534";

const successToastStyle = (): React.CSSProperties => ({
  background: PALE_GREEN,
  color: TEXT_GREEN,
  border: "1px solid " + ACCENT_GREEN,
  borderRadius: 12,
  padding: "12px 16px",
  boxShadow: "0 4px 20px rgba(34, 197, 94, 0.15)",
});

export function ThemedToaster() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: successToastStyle(),
        success: {
          style: successToastStyle(),
          iconTheme: {
            primary: ACCENT_GREEN,
            secondary: PALE_GREEN,
          },
        },
        error: {
          style: {
            ...successToastStyle(),
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #dc2626",
          },
          iconTheme: {
            primary: "#dc2626",
            secondary: "#fef2f2",
          },
        },
      }}
    />
  );
}

function toMessage(value: unknown): string {
  if (typeof value === "string") return value;
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof (value as { message?: unknown }).message === "string"
  ) {
    return (value as { message: string }).message;
  }
  return "Đã có lỗi xảy ra";
}

export const showSuccessToast = (message: string) => {
  toast.success(message);
};

export const showErrorToast = (message: unknown) => {
  toast.error(toMessage(message));
};
