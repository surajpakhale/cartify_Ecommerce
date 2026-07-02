const express = require("express");
const { createRazorpayOrder, verifyPayment } = require("../controller/payment.controller");
const { authUser } = require("../middleware/auth.middleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.post("/createorder", authUser, createRazorpayOrder);
router.post("/verify", authUser, verifyPayment);

// ✅ TEST EMAIL ENDPOINT
router.post("/test-email", authUser, async (req, res) => {
    try {
        console.log("📧 TEST EMAIL ENDPOINT CALLED");
        const { testEmail } = req.body;
        const recipient = testEmail || "test@example.com";
        
        const testMessage = `
<div style="font-family: Arial, sans-serif;">
    <h2>🎉 Test Email from Cartify</h2>
    <p>If you received this email, the email configuration is working correctly!</p>
    <p><strong>Test Details:</strong></p>
    <ul>
        <li>Service: Gmail SMTP</li>
        <li>Time: ${new Date().toLocaleString()}</li>
        <li>Status: ✅ Working</li>
    </ul>
</div>
        `;
        
        await sendEmail(recipient, "Test Email - Cartify", testMessage);
        
        return res.status(200).json({
            success: true,
            message: "Test email sent successfully",
            recipient: recipient
        });
    } catch (error) {
        console.log("❌ Test email failed:", error.message);
        return res.status(500).json({
            success: false,
            message: "Test email failed",
            error: error.message
        });
    }
});

module.exports = router;