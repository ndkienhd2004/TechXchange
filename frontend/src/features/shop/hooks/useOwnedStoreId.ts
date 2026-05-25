"use client";

import { useEffect, useState } from "react";
import { selectUser } from "@/features/auth";
import { getShopInfoService } from "../sevices";
import { useAppSelector } from "@/store/hooks";

export function useOwnedStoreId() {
  const user = useAppSelector(selectUser);
  const [ownedStoreId, setOwnedStoreId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "shop") {
      setOwnedStoreId(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const response = await getShopInfoService();
        const rows = Array.isArray(response?.data) ? response.data : [];
        const nextStoreId = Number(rows[0]?.id || 0);
        if (!cancelled) {
          setOwnedStoreId(nextStoreId > 0 ? nextStoreId : null);
        }
      } catch {
        if (!cancelled) {
          setOwnedStoreId(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [user?.role]);

  return { ownedStoreId, loading };
}
