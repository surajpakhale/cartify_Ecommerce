const express = require("express");
const orderController = require("../controller/order.controller");
const authMiddleware = require("../middleware/auth.middleware")
const orderModel = require("../models/order.model");

const router = express.Router();

router.get("/", authMiddleware.authAdmin, orderController.getAllOrder)
router.post("/", authMiddleware.authUser, orderController.createOrder)

// DIAGNOSTIC ROUTES - For debugging
router.get("/test/myorders/", authMiddleware.authUser, async (req, res) => {
    try {
        console.log("📋 Getting orders for user:", req.user._id);
        const orders = await orderModel
            .find({ user: req.user._id })
            .select('_id totalAmount status createdAt items');
        console.log("Found", orders.length, "orders");
        res.status(200).json({
            success: true,
            message: "Orders found",
            count: orders.length,
            orders: orders
        });
    } catch (error) {
        console.error("Error fetching orders:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// INVOICE DOWNLOAD ROUTE - Before parameterized routes
router.get("/invoice/:orderId", authMiddleware.authUser, orderController.downloadInvoice)

// Parameterized routes - AFTER specific routes
router.get("/:id", authMiddleware.authUser, orderController.getOrderById)
router.put("/:id", authMiddleware.authAdmin, orderController.updateOrderStatus)
router.delete("/:id", authMiddleware.authAdmin, orderController.deleteOrder)

module.exports = router;