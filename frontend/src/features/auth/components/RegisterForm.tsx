"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "./AuthLayout";
import { SignUp } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import { selectError, selectLoading } from "../store/authSelectors";

export default function RegisterForm() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { themed } = useAppTheme();
  const isLoading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(
      SignUp({ id: "", email, password, username, gender: "", phone: "" })
    );
    if (SignUp.fulfilled.match(result)) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthLayout
      title="Đăng ký"
      footerLabel="Đã có tài khoản?"
      footerLinkHref="/login"
      footerLinkText="Đăng nhập"
    >
      <form style={themed(styles.form)} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="register-name" style={themed(styles.label)}>
            Tên người dùng
          </label>
          <input
            id="register-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nguyễn Văn A"
            required
            style={themed(styles.input)}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="register-email" style={themed(styles.label)}>
            Email
          </label>
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
            style={themed(styles.input)}
            autoComplete="email"
          />
        </div>
        <div>
          <label htmlFor="register-password" style={themed(styles.label)}>
            Mật khẩu
          </label>
          <input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={6}
            style={themed(styles.input)}
            autoComplete="new-password"
          />
        </div>
        {error && (
          <p style={themed(styles.error)}>
            {typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: string }).message)
              : "Đăng ký thất bại. Thử lại sau."}
          </p>
        )}
        <button
          type="submit"
          style={themed(styles.button)}
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng ký..." : "Đăng ký..."}
        </button>
      </form>
    </AuthLayout>
  );
}
