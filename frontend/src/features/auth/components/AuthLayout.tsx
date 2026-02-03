"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

interface AuthLayoutProps {
  title: string;
  children: ReactNode;
  footerLabel: string;
  footerLinkHref: string;
  footerLinkText: string;
}

export default function AuthLayout({
  title,
  children,
  footerLabel,
  footerLinkHref,
  footerLinkText,
}: AuthLayoutProps) {
  const { themed } = useAppTheme();

  return (
    <div style={themed(styles.page)}>
      <div style={themed(styles.backdrop)}>
        <div style={themed(styles.card)}>
          <h1 style={themed(styles.title)}>{title}</h1>
          {children}
          <p style={themed(styles.footer)}>
            {footerLabel}{" "}
            <Link href={footerLinkHref} style={themed(styles.footerLink)}>
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
