"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AuthLayout from "./AuthLayout";
import { SignIn } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";
import { selectError, selectLoading } from "../store/authSelectors";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { themed } = useAppTheme();
  const isLoading = useAppSelector(selectLoading);
  const error = useAppSelector(selectError);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await dispatch(SignIn({ email, password }));
    if (SignIn.fulfilled.match(result)) {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <AuthLayout
      title="Đăng nhập"
      footerLabel="Chưa có tài khoản?"
      footerLinkHref="/register"
      footerLinkText="Đăng ký"
    >
      <form style={themed(styles.form)} onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" style={themed(styles.label)}>
            Email
          </label>
          <input
            id="login-email"
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
          <label htmlFor="login-password" style={themed(styles.label)}>
            Mật khẩu
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={themed(styles.input)}
            autoComplete="current-password"
          />
        </div>
        {error && (
          <p style={themed(styles.error)}>
            {typeof error === "object" && error !== null && "message" in error
              ? String((error as { message?: string }).message)
              : "Đăng nhập thất bại. Kiểm tra email và mật khẩu."}
          </p>
        )}
        <button
          type="submit"
          style={themed(styles.button)}
          disabled={isLoading}
        >
          {isLoading ? "Đang đăng nhập" : "Đăng nhập"}
        </button>
      </form>
    </AuthLayout>
  );
}
