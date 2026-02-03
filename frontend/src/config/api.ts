/**
 * Base URL cho API toàn hệ thống.
 * Ví dụ .env.local: NEXT_PUBLIC_API_URL=http://localhost:3000/api
 */
export const API_BASE_URL =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL)) ||
  "http://localhost:3000/api";
