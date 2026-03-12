"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export default function NProgressProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const clicked = e.target as Element | null;
      if (!clicked) return;
      if (clicked.closest('[data-nprogress-ignore="true"]')) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (e.button !== 0) return;

      // Ignore action controls rendered inside links (e.g. add-to-cart button in product card)
      const actionControl = clicked.closest(
        'button,[role="button"],input,select,textarea'
      );
      if (actionControl && actionControl.closest("a")) return;

      const target = (e.target as Element).closest("a");
      if (!target?.href) return;
      try {
        const url = new URL(target.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === pathname) return;
        NProgress.start();
      } catch {
        // ignore
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname]);

  return <>{children}</>;
}
