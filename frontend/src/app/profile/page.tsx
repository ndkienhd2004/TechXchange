"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectIsAuthenticated } from "@/features/auth";
import ProfileView from "@/features/profile/components/ProfileView";
import {
  buildAuthRedirectHref,
  buildCurrentPath,
} from "@/features/auth/utils/redirect";

export default function ProfilePage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loginHref = buildAuthRedirectHref(
    "/login",
    buildCurrentPath(pathname, searchParams),
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(loginHref);
    }
  }, [isAuthenticated, loginHref, router]);

  if (!isAuthenticated) {
    return null;
  }

  return <ProfileView />;
}
