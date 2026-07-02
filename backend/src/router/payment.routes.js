const express = require("express");
const { createRazorpayOrder, verifyPayment } = require("../controller/payment.controller");
const { authUser } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/createorder", authUser, createRazorpayOrder);
router.post("/verify", authUser, verifyPayment);

// TEST ENDPOINT
router.get("/test-info", authUser, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Auth working",
        user: {
            id: req.user._id,
            name: req.user.name,
            email: req.user.email
        }
    });
});

module.exports = router;