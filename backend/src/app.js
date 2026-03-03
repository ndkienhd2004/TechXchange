const express = require("express");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const storeRoutes = require("./routes/storeRoutes");
const brandRoutes = require("./routes/brandRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const swaggerSpecs = require("./config/swagger");
const { response } = require("./app/utils/response");

const app = express();

// Disable etag to avoid 304 on API responses during development
app.set("etag", false);

app.use(cors());

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Disable caching for API responses
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

// Swagger Documentation
app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(swaggerSpecs, { explorer: true }));

// Swagger JSON
app.get("/docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(swaggerSpecs);
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/reviews", reviewRoutes);

// Global error handler - 500
app.use((err, req, res, next) => {
  console.error("Error:", err);
  const status = err.status || 500;
  if (status === 404) {
    return response.notFound(res, err.message || "Không tìm thấy");
  }
  if (status === 401) {
    return response.unauthorized(res, err.message || "Chưa xác thực");
  }
  if (status === 403) {
    return response.forbidden(res, err.message || "Không có quyền");
  }
  if (status === 400) {
    return response.badRequest(res, err.message || "Dữ liệu không hợp lệ");
  }
  return response.serverError(res, err.message || "Lỗi server");
});

// 404 - Not Found endpoint
app.use((req, res) => {
  response.notFound(res, "Không tìm thấy endpoint");
});

module.exports = app;
