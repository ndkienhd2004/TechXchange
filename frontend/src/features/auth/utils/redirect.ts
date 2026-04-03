type SearchParamsLike = {
  toString(): string;
} | null | undefined;

const AUTH_PATHS = new Set(["/login", "/register"]);

export function buildCurrentPath(
  pathname: string | null | undefined,
  searchParams?: SearchParamsLike,
) {
  const safePathname = String(pathname || "").trim();
  if (!safePathname.startsWith("/")) return "/";
  const query = String(searchParams?.toString() || "").trim();
  return query ? `${safePathname}?${query}` : safePathname;
}

export function resolveSafeRedirectTarget(
  nextValue: string | null | undefined,
  fallback = "/",
) {
  const raw = String(nextValue || "").trim();
  if (!raw) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;

  try {
    const parsed = new URL(raw, "http://localhost");
    if (AUTH_PATHS.has(parsed.pathname)) return fallback;
    return `${parsed.pathname}${parsed.search}${parsed.hash}` || fallback;
  } catch {
    return fallback;
  }
}

export function buildAuthRedirectHref(
  authPath: "/login" | "/register",
  nextValue?: string | null,
) {
  const safeNext = resolveSafeRedirectTarget(nextValue, "");
  if (!safeNext) return authPath;

  const params = new URLSearchParams({ next: safeNext });
  return `${authPath}?${params.toString()}`;
}
