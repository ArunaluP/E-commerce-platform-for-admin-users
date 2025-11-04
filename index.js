import express from "express";
import dotenv from "dotenv";
import session from "express-session";

dotenv.config();

// Import database and models
import sequelize from "./config/db.js";
import "./models/user.js";
import "./models/category.js";
import "./models/product.js";
import "./models/order.js";
import "./models/orderItem.js";
import "./models/setting.js";

// Import routes
import userRoutes from "./routes/userRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import orderItemRoutes from "./routes/orderItemRoutes.js";
import settingRoutes from "./routes/settingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

// Middleware
app.use(express.json());

// Session configuration for AdminJS
app.use(
  session({
    secret: process.env.JWT_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
  })
);

// Database connection
(async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // 🔹 Automatically create tables from models
    await sequelize.sync({ alter: true });
    // use { force: true } to drop and recreate tables (for dev only)

    console.log("✅ All models synchronized with the database");
  } catch (err) {
    console.error("❌ Database connection error:", err.message);
    process.exit(1);
  }
})();


// Health check endpoint (MUST be before AdminJS routes)
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// API Routes (MUST be before AdminJS routes)
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", orderRoutes);
app.use("/api", orderItemRoutes);
app.use("/api", settingRoutes);

// AdminJS Routes (at this path so it doesn't interfere)
app.use(adminRoutes);

// Error handling middleware (MUST be last)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server listening on port ${PORT}`);
  console.log(`📊 AdminJS Dashboard: http://localhost:${PORT}/admin`);
  console.log(`📡 API Endpoints: http://localhost:${PORT}/api`);
});