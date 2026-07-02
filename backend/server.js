require("dotenv").config();
const express = require("express")
const connectDB = require("./src/config/db")
const cors = require("cors");
// ...baaki imports

connectDB();
const app = express();

// Ye sabse upar daal - Sab Vercel URLs allow ho jayenge
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && origin.endsWith('.vercel.app')) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin,X-Requested-With,Content-Type,Accept,Authorization');
  }
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json())
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