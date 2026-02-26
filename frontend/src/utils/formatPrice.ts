/**
 * Format giá tiền theo USD (backend lưu đô).
 * Nếu đã là string có ký hiệu $ thì trả về nguyên.
 */
export const formatPrice = (price: string | number): string => {
  if (price === undefined || price === null) return "$0.00";
  if (typeof price === "string" && price.includes("$")) return price;
  const num = typeof price === "string" ? Number(price) : price;
  if (!Number.isFinite(num)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(num);
};
