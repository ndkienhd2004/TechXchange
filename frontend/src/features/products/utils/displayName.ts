type ProductSpecValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ProductSpecValue[]
  | Record<string, unknown>;

function normalizeSpecValue(value: ProductSpecValue): string {
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

export function buildSpecsSuffix(specs?: Record<string, ProductSpecValue> | null): string {
  if (!specs || typeof specs !== "object") {
    return "";
  }

  const entries = Object.entries(specs)
    .map(([key, rawValue]) => ({
      key: String(key || "").trim(),
      value: normalizeSpecValue(rawValue),
    }))
    .filter((entry) => Boolean(entry.key) && Boolean(entry.value))
    .sort((a, b) => a.key.localeCompare(b.key));

  if (entries.length === 0) {
    return "";
  }

  return entries.map((entry) => `${entry.key} ${entry.value}`).join(", ");
}

export function buildProductDisplayName(
  baseName: string,
  specs?: Record<string, ProductSpecValue> | null,
): string {
  const safeBaseName = String(baseName || "").trim();
  const suffix = buildSpecsSuffix(specs);

  if (!suffix) {
    return safeBaseName;
  }

  return `${safeBaseName} (${suffix})`;
}
