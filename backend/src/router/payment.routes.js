const express = require("express");
const { createRazorpayOrder, verifyPayment } = require("../controller/payment.controller");
const { authUser } = require("../middleware/auth.middleware");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.post("/createorder", authUser, createRazorpayOrder);
router.post("/verify", authUser, verifyPayment);

// ✅ TEST EMAIL ENDPOINT - Simple direct test
router.post("/test-email", authUser, async (req, res) => {
    try {
        console.log("\n📧 === TEST EMAIL ENDPOINT CALLED ===");
        const userEmail = req.user?.email || req.body?.email;
        
        if (!userEmail) {
            return res.status(400).json({
                success: false,
                message: "No email address found"
            });
        }
        
        const testMessage = `
<html>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2 style="color: #667eea;">🎉 Test Email from Cartify</h2>
    <p>If you received this email, the email configuration is working correctly!</p>
    <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
        <p><strong>Test Details:</strong></p>
        <ul>
            <li>Service: Gmail SMTP</li>
            <li>Time: ${new Date().toLocaleString('en-IN')}</li>
            <li>Status: ✅ Working</li>
        </ul>
    </div>
    <p>Thank you for testing!</p>
</body>
</html>
        `;
        
        console.log("Sending test email to:", userEmail);
        const result = await sendEmail(userEmail, "🧪 Test Email - Cartify", testMessage);
        
        console.log("Test email result:", result);
        
        return res.status(200).json({
            success: true,
            message: "Test email sent successfully",
            recipient: userEmail,
            emailSent: result
        });
    } catch (error) {
        console.log("❌ Test email error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Test email failed",
            error: error.message
        });
    }
});

module.exports = router;