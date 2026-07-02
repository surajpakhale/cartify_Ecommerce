const express = require("express");
const orderController = require("../controller/order.controller");
const authMiddleware = require("../middleware/auth.middleware")
const orderModel = require("../models/order.model");

const router = express.Router();

router.get("/", authMiddleware.authAdmin, orderController.getAllOrder)
router.post("/", authMiddleware.authUser, orderController.createOrder)

// Specific routes BEFORE parameterized routes
router.get("/invoice/:orderId", authMiddleware.authUser, orderController.downloadInvoice)
router.get("/test/myorders", authMiddleware.authUser, async (req, res) => {
    try {
        const orders = await orderModel
            .find({ user: req.user._id })
            .select('_id totalAmount status createdAt');
        res.status(200).json({
            success: true,
            count: orders.length,
            orders: orders
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Parameterized routes
router.get("/:id", authMiddleware.authUser, orderController.getOrderById)
router.put("/:id", authMiddleware.authAdmin, orderController.updateOrderStatus)
router.delete("/:id", authMiddleware.authAdmin, orderController.deleteOrder)

module.exports = router;