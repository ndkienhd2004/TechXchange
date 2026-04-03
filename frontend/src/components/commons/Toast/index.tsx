"use client";

import type React from "react";
import toast, { Toaster } from "react-hot-toast";
import { useAppTheme } from "@/theme/ThemeProvider";

export function ThemedToaster() {
  const { theme } = useAppTheme();

  const successToastStyle: React.CSSProperties = {
    background: theme.colors.palette.status.delivered.bg,
    color: theme.colors.palette.status.delivered.text,
    border: `1px solid ${theme.colors.palette.semantic.success}`,
    borderRadius: 12,
    padding: "12px 16px",
    boxShadow: theme.shadows.md,
  };

  const errorToastStyle: React.CSSProperties = {
    ...successToastStyle,
    background: theme.colors.palette.status.cancelled.bg,
    color: theme.colors.palette.status.cancelled.text,
    border: `1px solid ${theme.colors.palette.semantic.error}`,
  };

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 4000,
        style: successToastStyle,
        success: {
          style: successToastStyle,
          iconTheme: {
            primary: theme.colors.palette.semantic.success,
            secondary: theme.colors.palette.status.delivered.bg,
          },
        },
        error: {
          style: errorToastStyle,
          iconTheme: {
            primary: theme.colors.palette.semantic.error,
            secondary: theme.colors.palette.status.cancelled.bg,
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
