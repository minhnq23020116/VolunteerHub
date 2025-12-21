require("dotenv").config(); // Load biến môi trường đầu tiên
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");

// --- 1. Configuration & Database ---
const connectDB = require("./config/db");
const swaggerSpec = require("./docs/swagger"); // Import file cấu hình Swagger

// --- 2. Route Imports ---
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/events"); // Route cho public và manager
const eventAdminRoutes = require("./routes/events_admin"); // Route riêng cho Admin quản lý events
const regRoutes = require("./routes/registrations");
const userAdminRoutes = require("./routes/admin_users"); // Route cho Admin quản lý users

const notificationRoutes = require('./routes/notifications'); // Route cho Notification
const adminUsersRoutes = require('./routes/admin_users'); // Route cho admin để UserManager
const postRoutes = require("./routes/posts"); // Thêm dòng này

// --- 3. App Initialization & Middlewares ---
const app = express();

app.use(cors()); // Cấu hình CORS (nên cấu hình cụ thể domain cho production)
app.use(express.json()); // Parse JSON body
app.use(morgan("dev")); // Logger

// --- 4. Base Routes (Health Check & Docs) ---

// Health check endpoint
app.get("/api/health", (req, res) =>
  res.json({
    ok: true,
    time: Date.now(),
    message: "VolunteerHub API is running correctly",
  })
);

// Swagger Documentation Route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- 5. API Route Mounting ---

// Đăng ký route trong server.js
app.use('/api/notifications', notificationRoutes);

// Post
app.use('/api/posts', postRoutes)

// Authentication
app.use("/api/auth", authRoutes);

// Events Operations (Public view & Manager create)
app.use("/api/events", eventRoutes);

// Registrations (Đăng ký tham gia)
app.use("/api/registrations", regRoutes);

// --- ADMIN AREA ---
// Admin Event Operations (Duyệt bài...)
app.use("/api/admin/events", eventAdminRoutes);

// Admin User Operations (Quản lý người dùng...)
app.use("/api/admin/users", userAdminRoutes);

// Admin UserManager
app.use('/api/admin', adminUsersRoutes);

// --- 6. Error Handling Middleware ---
// (Nên thêm vào cuối cùng sau các routes để bắt lỗi tập trung)
app.use((err, req, res, next) => {
  console.error("🔥 Error Stack:", err.stack);
  res.status(500).json({
    ok: false,
    error: "Something went wrong on the server!",
    // Chỉ hiện chi tiết lỗi ở môi trường development để bảo mật
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// --- 7. Server Startup ---
const PORT = process.env.PORT || 4000;

// Kết nối Database trước, sau đó mới start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`=================================`);
      console.log(`✅ Database connected successfully`);
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📑 Swagger Docs at: http://localhost:${PORT}/api-docs`);
      console.log(`💓 Health check at: http://localhost:${PORT}/api/health`);
      console.log(`=================================`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Database. Server shutting down.");
    console.error(err.message);
    process.exit(1); // Thoát ứng dụng nếu không kết nối được DB
  });
