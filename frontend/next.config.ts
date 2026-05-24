import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qr.sepay.vn",
      },
      {
        protocol: "https",
        hostname: "techxchange-bucket.s3.us-east-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn2.fptshop.com.vn",
      },
      {
        protocol: "https",
        hostname: "cdn.hstatic.net",
      },
      {
        protocol: "http",
        hostname: "cdn.hstatic.net",
      },
      {
        protocol: "https",
        hostname: "ttgshop.vn",
      },
      {
        protocol: "https",
        hostname: "cdn2.cellphones.com.vn",
      },
      {
        protocol: "https",
        hostname: "i.ebayimg.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
