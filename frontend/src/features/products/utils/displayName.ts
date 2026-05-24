type ProductSpecValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ProductSpecValue[]
  | Record<string, unknown>;

function toSentenceCase(input: string): string {
  const normalized = input.trim().toLowerCase();
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatSpecKeyLabel(key: string): string {
  return key
    .split(/[_\s-]+/g)
    .filter(Boolean)
    .map((part, index) => {
      const normalized = part.trim().toLowerCase();
      if (!normalized) return "";
      if (index === 0) {
        return normalized.charAt(0).toUpperCase() + normalized.slice(1);
      }
      return normalized;
    })
    .join(" ");
}

export function formatSpecValueLabel(value: unknown): string {
  return toSentenceCase(normalizeSpecValue(value));
}

function normalizeSpecValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeSpecValue(item))
      .filter(Boolean)
      .join("/");
  }

  if (typeof value === "object") {
    const valueFromValues = Array.isArray((value as { values?: unknown[] }).values)
      ? (value as { values: unknown[] }).values
      : null;
    if (valueFromValues) {
      return valueFromValues
        .map((item) => normalizeSpecValue(item as ProductSpecValue))
        .filter(Boolean)
        .join("/");
    }

    const valueFromOptions = Array.isArray((value as { options?: unknown[] }).options)
      ? (value as { options: unknown[] }).options
      : null;
    if (valueFromOptions) {
      return valueFromOptions
        .map((item) => normalizeSpecValue(item as ProductSpecValue))
        .filter(Boolean)
        .join("/");
    }

    if (typeof (value as { value?: unknown }).value === "string") {
      return String((value as { value: string }).value).trim();
    }

    return "";
  }

  return String(value).trim();
}

export function buildSpecsSuffix(specs?: Record<string, unknown> | null): string {
  if (!specs || typeof specs !== "object") {
    return "";
  }

  const entries = Object.entries(specs)
    .map(([key, rawValue]) => ({
      key: formatSpecKeyLabel(String(key || "").trim()),
      value: formatSpecValueLabel(rawValue),
    }))
    .filter((entry) => Boolean(entry.key) && Boolean(entry.value))
    .sort((a, b) => a.key.localeCompare(b.key));

  if (entries.length === 0) {
    return "";
  }

  return entries.map((entry) => `${entry.key}: ${entry.value}`).join(", ");
}

export function buildProductDisplayName(
  baseName: string,
  specs?: Record<string, unknown> | null,
): string {
  const safeBaseName = String(baseName || "").trim();
  const suffix = buildSpecsSuffix(specs);

  if (!suffix) {
    return safeBaseName;
  }

  return `${safeBaseName} (${suffix})`;
}
