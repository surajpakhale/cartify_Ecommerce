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

// CORS Fix - Ye sabse upar rahega
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:5173',
    'https://cartify-ecommerce-silk.vercel.app',
    req.headers.origin // Jo bhi vercel ka preview URL ho
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin) || origin?.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  }

  // Preflight request ka jawab
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
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
app.use("/api/products", productRoutes); 
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes);

module.exports = app;