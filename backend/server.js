require("dotenv").config();
const express = require("express");
const connectDB = require("./src/config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const authRoutes = require("./src/router/auth.routes");
const productRoutes = require("./src/router/product.routes");
const orderRoutes = require("./src/router/order.routes");
const paymentRoutes = require("./src/router/payment.routes");
const analyticsRoutes = require("./src/router/analytics.routes");

connectDB();
const app = express();

// Ye sabse upar daal - Sab Vercel URLs allow
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Local + Vercel ke saare URLs allow kar
  if (!origin || origin.includes('localhost') || origin.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Preflight ka jawab
  }
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.json({ success: true, message: "Cartify API Running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes); // Ye public hona chahiye
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

module.exports = app;