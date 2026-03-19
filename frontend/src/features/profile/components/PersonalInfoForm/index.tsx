"use client";

import { useState, useEffect } from "react";
import { useAppTheme } from "@/theme/ThemeProvider";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectError, selectLoading } from "@/features/auth";
import { UpdateUser } from "@/features/auth";
import type { User } from "@/features/auth";
import * as styles from "./styles";

interface PersonalInfoFormProps {
  user: User | null;
}

const GENDER_OPTIONS = [
  { value: "", label: "Chọn giới tính" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

export default function PersonalInfoForm({ user }: PersonalInfoFormProps) {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const error = useAppSelector(selectError);
  const isLoading = useAppSelector(selectLoading);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (user) {
      setUsername(user.username ?? "");
      setEmail(user.email ?? "");
      setGender(user.gender ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(
      UpdateUser({
        username,
        email,
        gender,
        phone,
      })
    );
  };

  if (!user) return null;

  return (
    <section style={themed(styles.section)}>
      <h2 style={themed(styles.sectionTitle)}>Thông tin cá nhân</h2>
      <form style={themed(styles.form)} onSubmit={handleSubmit}>
        <div style={themed(styles.row)}>
          <div style={themed(styles.field)}>
            <label style={themed(styles.label)}>Họ tên</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Họ và tên"
              style={themed(styles.input)}
            />
          </div>
          <div style={themed(styles.field)}>
            <label style={themed(styles.label)}>Email</label>
            <input
              type="email"
              value={email}
              readOnly
              style={themed(styles.inputReadOnly)}
              title="Email không thể thay đổi"
            />
          </div>
        </div>

        <div style={themed(styles.row)}>
          <div style={themed(styles.field)}>
            <label style={themed(styles.label)}>Số điện thoại</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại"
              style={themed(styles.input)}
            />
          </div>
          <div style={themed(styles.field)}>
            <label style={themed(styles.label)}>Giới tính</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={themed(styles.input)}
            >
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Chỉ hiển thị nếu backend trả về */}
        {(user.createdAt || user.updatedAt) && (
          <div style={themed(styles.row)}>
            {user.createdAt && (
              <div style={themed(styles.field)}>
                <label style={themed(styles.label)}>Ngày tạo</label>
                <input
                  type="text"
                  value={user.createdAt}
                  readOnly
                  style={themed(styles.inputReadOnly)}
                />
              </div>
            )}
            {user.updatedAt && (
              <div style={themed(styles.field)}>
                <label style={themed(styles.label)}>Cập nhật lúc</label>
                <input
                  type="text"
                  value={user.updatedAt}
                  readOnly
                  style={themed(styles.inputReadOnly)}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={themed(styles.error)}>
            {typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: string }).message)
              : "Cập nhật thất bại."}
          </p>
        )}
        <button
          type="submit"
          style={{
            ...themed(styles.button),
            ...(isLoading ? themed(styles.buttonDisabled) : {}),
          }}
          disabled={isLoading}
        >
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </form>
    </section>
  );
}
