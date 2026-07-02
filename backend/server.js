require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");

const authRoutes = require("./src/router/auth.routes");
const productRoutes = require("./src/router/product.routes");
const orderRoutes = require("./src/router/order.routes");
const paymentRoutes = require("./src/router/payment.routes");
const analyticsRoutes = require("./src/router/analytics.routes");

connectDB();
const app = express();

// CORS - Sabse upar, bina condition ke
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Ab public hai
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

module.exports = app;