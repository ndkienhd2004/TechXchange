"use client";

import Link from "next/link";
import { useAppTheme } from "@/theme/ThemeProvider";
import * as styles from "./styles";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
  searchParam?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath = "/products",
  searchParam = "page",
}: PaginationProps) {
  const { themed } = useAppTheme();

  const href = (page: number) =>
    page <= 1 ? basePath : `${basePath}?${searchParam}=${page}`;

  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | "ellipsis")[] = [];
    let l: number | undefined;
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }
    for (const i of range) {
      if (l !== undefined && i - l > 1) {
        rangeWithDots.push("ellipsis");
      }
      rangeWithDots.push(i);
      l = i;
    }
    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <nav style={themed(styles.container)} aria-label="Phân trang">
      <Link
        href={href(currentPage - 1)}
        style={
          currentPage <= 1
            ? themed(styles.pageButtonDisabled)
            : themed(styles.pageButton)
        }
        aria-disabled={currentPage <= 1}
        onClick={(e) => currentPage <= 1 && e.preventDefault()}
      >
        ← Trước
      </Link>
      {getVisiblePages().map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} style={themed(styles.ellipsis)}>
            …
          </span>
        ) : (
          <Link
            key={page}
            href={href(page)}
            style={
              page === currentPage
                ? themed(styles.pageButtonActive)
                : themed(styles.pageButton)
            }
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </Link>
        )
      )}
      <Link
        href={href(currentPage + 1)}
        style={
          currentPage >= totalPages
            ? themed(styles.pageButtonDisabled)
            : themed(styles.pageButton)
        }
        aria-disabled={currentPage >= totalPages}
        onClick={(e) => currentPage >= totalPages && e.preventDefault()}
      >
        Sau →
      </Link>
    </nav>
  );
}
