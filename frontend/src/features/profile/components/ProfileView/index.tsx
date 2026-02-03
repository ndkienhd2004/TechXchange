"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { selectUser, selectIsAuthenticated } from "@/features/auth";
import { GetUserProfile, logout } from "@/features/auth";
import PersonalInfoForm from "../PersonalInfoForm";
import * as styles from "./styles";
import { useAppTheme } from "@/theme/ThemeProvider";

type TabId = "info" | "address";

export default function ProfileView() {
  const { themed } = useAppTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const [activeTab, setActiveTab] = useState<TabId>("info");
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(GetUserProfile());
    }
  }, [isAuthenticated, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  if (!isAuthenticated || !user) {
    return null;
  }

  const initial =
    user.username?.charAt(0)?.toUpperCase() ||
    user.email?.charAt(0)?.toUpperCase() ||
    "?";

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.container)}>
        {/* Card tóm tắt: avatar, tên, email, thống kê đơn hàng, Đăng ký bán hàng */}
        <div style={themed(styles.summaryCard)}>
          <div style={themed(styles.summaryLeft)}>
            {user.avatar && !avatarError ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.avatar}
                alt=""
                style={themed(styles.summaryAvatarImg)}
                onError={() => setAvatarError(true)}
              />
            ) : (
              <div style={themed(styles.summaryAvatar)}>{initial}</div>
            )}
            <div style={themed(styles.summaryInfo)}>
              <h1 style={themed(styles.summaryName)}>
                {user.username || user.email}
              </h1>
              <p style={themed(styles.summaryEmail)}>{user.email}</p>
              <div style={themed(styles.summaryStats)}>
                <span style={themed(styles.summaryStat)}>0 Đơn hàng</span>
                <span style={themed(styles.summaryStat)}>0 Đang xử lý</span>
                <span style={themed(styles.summaryStat)}>0 Đã giao</span>
              </div>
            </div>
          </div>
          <button type="button" style={themed(styles.summaryButton)}>
            Đăng ký bán hàng
          </button>
        </div>

        {/* 4 nút hành động */}
        <div style={themed(styles.actionsRow)}>
          <Link href="/orders" style={themed(styles.actionCard)}>
            <div style={themed(styles.actionIcon)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
                <path d="M12 11v6" />
                <path d="M9 14h6" />
              </svg>
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Đơn hàng</span>
              <span style={themed(styles.actionSub)}>Xem tất cả</span>
            </div>
          </Link>
          <Link href="/wishlist" style={themed(styles.actionCard)}>
            <div style={themed(styles.actionIcon)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Yêu thích</span>
              <span style={themed(styles.actionSub)}>0 sản phẩm</span>
            </div>
          </Link>
          <Link
            href="#address"
            style={themed(styles.actionCard)}
            onClick={() => setActiveTab("address")}
          >
            <div style={themed(styles.actionIcon)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Địa chỉ</span>
              <span style={themed(styles.actionSub)}>0 địa chỉ</span>
            </div>
          </Link>
          <button
            type="button"
            style={themed(styles.actionCard)}
            onClick={handleLogout}
          >
            <div style={themed(styles.actionIcon)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div style={themed(styles.actionContent)}>
              <span style={themed(styles.actionTitle)}>Đăng xuất</span>
              <span style={themed(styles.actionSub)}>Thoát tài khoản</span>
            </div>
          </button>
        </div>

        {/* Tabs Thông tin cá nhân / Địa chỉ */}
        <div style={themed(styles.tabsRow)}>
          <button
            type="button"
            style={
              activeTab === "info"
                ? themed(styles.tabActive)
                : themed(styles.tab)
            }
            onClick={() => setActiveTab("info")}
          >
            Thông tin cá nhân
          </button>
          <button
            type="button"
            style={
              activeTab === "address"
                ? themed(styles.tabActive)
                : themed(styles.tab)
            }
            onClick={() => setActiveTab("address")}
          >
            Địa chỉ
          </button>
        </div>

        {activeTab === "info" && <PersonalInfoForm user={user} />}
        {activeTab === "address" && (
          <div style={themed(styles.section)}>
            <h2 style={themed(styles.sectionTitle)}>Địa chỉ</h2>
            <p style={{ ...themed(styles.summaryEmail), marginTop: 0 }}>
              Chưa có địa chỉ. Thêm địa chỉ giao hàng của bạn.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
