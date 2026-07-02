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

// Sabse upar ye daal - CORS preflight fix
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://cartify-ecommerce-ket4-drab.vercel.app');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Iske baad normal cors bhi rakho backup ke liye
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cartify-ecommerce-ket4-drab.vercel.app'
  ],
  credentials: true
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

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

module.exports = app;