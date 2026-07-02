require("dotenv").config();
const express = require("express")
const connectDB = require("./src/config/db")
const authRoutes = require("./src/router/auth.routes");
const productRoutes = require("./src/router/product.routes");
const orderRoutes = require("./src/router/order.routes")
const cookieParser = require("cookie-parser");
const paymentRoutes = require("./src/router/payment.routes");
const analyticsRoutes = require("./src/router/analytics.routes");
const cors = require("cors");

connectDB();

const app = express();

// CORS - Local + Vercel dono ke liye
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'https://cartify-ecommerce-silk.vercel.app', // Tera frontend URL yahan daal
    'https://cartify-ecommerce-iynrh17c4-suraj-pakhales-projects.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

// Health check route - Vercel 404 fix ke liye zaroori
app.get("/", (req, res) => {
  res.json({ 
    success: true, 
    message: "Cartify API Running...",
    timestamp: new Date().toISOString()
  });
});

app.use("/api/auth", authRoutes)
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/payment", paymentRoutes);
app.use("/api/analytics", analyticsRoutes)

// Vercel ke liye app.listen() hata do - sirf export karo
module.exports = app;