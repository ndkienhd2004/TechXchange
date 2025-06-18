import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import route from "./routes/index.route.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { sequelize, connectDB } from "./config/sequelize.config.js";
import bodyParser from "body-parser";

dotenv.config();
const { createServer } = require("http");

const app = express();
const server = createServer(app);
const port = process.env.PORT ?? 3000;

// Kết nối Database
connectDB();

// Middleware
app.use(cors()); // Bật CORS
app.use(cookieParser()); // Sử dụng cookie-parser
app.use(express.json()); // Hỗ trợ xử lý JSON
app.use(express.urlencoded({ extended: true })); // Xử lý dữ liệu form
app.use(bodyParser.json({ limit: "50mb" })); // Tăng giới hạn JSON
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Ghi log request bằng Morgan
app.use(morgan("combined"));

// Chia sẻ file tĩnh từ thư mục `public`
app.use("/public", express.static(path.join(__dirname, "public")));

// Routes
route(app);

app.get("/", (req, res) => {
  res.send("Welcome to the backend server!");
});

// Khởi động server
server.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});
