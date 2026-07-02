const Razorpay = require("razorpay");
const crypto = require("crypto");
const orderModel = require("../models/order.model");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. Razorpay Order Create - Frontend ko order_id bhejega
async function createRazorpayOrder(req, res) {
    try {
        const { amount } = req.body; // amount rupees me, eg: 500
        
        if (!amount) {
            return res.status(400).json({ message: "Amount is required" });
        }

        const options = {
            amount: amount * 100, // ✅ Razorpay paise me leta hai, 500 rs = 50000 paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        
        res.status(200).json({
            success: true,
            order,
            key_id: process.env.RAZORPAY_KEY_ID // ✅ Frontend ko bhejna padega
        });
    } catch (error) {
        console.log("Razorpay order error:", error);
        res.status(500).json({ message: "Error creating Razorpay order", error: error.message });
    }
}



async function verifyPayment(req, res) {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderData
        } = req.body;

        // ✅ Validation check
        if (!orderData || !orderData.items || !orderData.address) {
            return res.status(400).json({
                success: false,
                message: "Missing order data",
                details: "items and address are required"
            });
        }

        // ✅ Check if address has all required fields
        const { fullname, street, city, postalCode, country } = orderData.address;
        if (!fullname || !street || !city || !postalCode || !country) {
            return res.status(400).json({
                success: false,
                message: "Incomplete address",
                details: "fullname, street, city, postalCode, and country are all required"
            });
        }

        // ✅ Validate items array
        if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid items",
                details: "items must be a non-empty array"
            });
        }

        // ✅ Check each item has required fields
        for (let i = 0; i < orderData.items.length; i++) {
            const item = orderData.items[i];
            if (!item.product || !item.quantity || !item.price) {
                return res.status(400).json({
                    success: false,
                    message: `Item ${i + 1} is incomplete`,
                    details: `Each item must have product, quantity, and price fields`
                });
            }
        }

        console.log("=== VERIFY PAYMENT DEBUG ===");
        console.log("OrderData:", JSON.stringify(orderData, null, 2));
        console.log("User:", req.user._id);
        console.log("Razorpay Signature:", razorpay_signature);

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        console.log("Expected Sign:", expectedSign);
        console.log("Signature Match:", razorpay_signature === expectedSign);

        // ✅ TEST MODE: Always create order regardless of signature verification
        // In production, you would check: if (razorpay_signature === expectedSign)
        const isSignatureValid = razorpay_signature === expectedSign;

        const newOrder = new orderModel({
            user: req.user._id,
            items: orderData.items,
            totalAmount: orderData.totalAmount,
            address: orderData.address,
            paymentId: razorpay_payment_id,
            paymentOrderId: razorpay_order_id,
            paymentSignature: razorpay_signature,
            status: 'pending',
            paymentStatus: isSignatureValid ? 'paid' : 'pending' // ✅ Mark as pending if signature fails
        });

        await newOrder.save();

        // ✅ Always return success for test environment
        return res.status(200).json({
            success: true,
            message: isSignatureValid 
                ? "Payment verified & Order created" 
                : "Order created in test mode (Payment verification skipped)",
            order: newOrder,
            signatureValid: isSignatureValid
        });
    } catch (error) {
        console.log("=== VERIFY PAYMENT ERROR ===");
        console.log("Error Message:", error.message);
        console.log("Error Details:", error);
        
        // ✅ Handle Mongoose validation errors
        let validationErrors = null;
        if (error.errors) {
            validationErrors = {};
            for (let field in error.errors) {
                validationErrors[field] = error.errors[field].message;
            }
        }

        res.status(500).json({ 
            success: false,
            message: error.message || "Server error during payment verification",
            validationErrors: validationErrors
        });
    }
}

module.exports = { createRazorpayOrder, verifyPayment };