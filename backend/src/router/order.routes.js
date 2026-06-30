const express = require("express");
const orderController = require("../controller/order.controller");
const authMiddleware = require("../middleware/auth.middleware")

const router = express.Router();

router.get("/",authMiddleware.authAdmin, orderController.getAllOrder)
router.post("/",authMiddleware.authUser,orderController.createOrder)
router.get("/:id",authMiddleware.authUser, orderController.getOrderById)
router.put("/:id",authMiddleware.authAdmin,orderController.updateOrderStatus)
router.delete("/:id",authMiddleware.authAdmin,orderController.deleteOrder)

module.exports = router;