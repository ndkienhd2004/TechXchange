import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// Base URL from environment or default
const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      // Get token from state if available
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      
      // Set default headers
      headers.set("Content-Type", "application/json");
      
      return headers;
    },
  }),
  tagTypes: [
    "Auth",
    "User",
    // Add more tag types here for cache invalidation
    // "Product",
    // "Order",
    // etc.
  ],
  endpoints: () => ({}), // Endpoints will be injected in endpoints.ts or feature files
});
