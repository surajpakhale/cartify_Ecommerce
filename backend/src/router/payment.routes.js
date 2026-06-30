const express = require("express");
const { createRazorpayOrder, verifyPayment } = require("../controller/payment.controller");
const { authUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/createorder", authUser, createRazorpayOrder);
router.post("/verify", authUser, verifyPayment);

module.exports = router;