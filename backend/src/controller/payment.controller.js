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

// 2. Payment Verify - Signature check karke DB me save
// async function verifyPayment(req, res) {
//     try {
//         const { 
//             razorpay_order_id, 
//             razorpay_payment_id, 
//             razorpay_signature,
//             orderData // ✅ frontend se order ka data: items, address, totalAmount
//         } = req.body;

//         const sign = razorpay_order_id + "|" + razorpay_payment_id;
//         const expectedSign = crypto
//             .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//             .update(sign.toString())
//             .digest("hex");

//         if (razorpay_signature === expectedSign) {
//             // ✅ Payment verified, ab DB me order save kar
//             const newOrder = new orderModel({
//                 user: req.user._id,
//                 items: orderData.items,
//                 totalAmount: orderData.totalAmount,
//                 address: orderData.address,
//                 paymentId: razorpay_payment_id,
//                 paymentOrderId: razorpay_order_id,
//                 status: 'pending',
//                 paymentStatus: 'paid'
//             });

//             await newOrder.save();

//             return res.status(200).json({
//                 success: true,
//                 message: "Payment verified & Order created",
//                 order: newOrder
//             });
//         } else {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid signature, payment verification failed"
//             });
//         }
//     } catch (error) {
//         console.log("Verify payment error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// }

async function verifyPayment(req, res) {
    try {
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            orderData
        } = req.body;

        console.log("=== VERIFY PAYMENT DEBUG ===");
        console.log("OrderData:", JSON.stringify(orderData, null, 2)); // ✅ Ye add kar
        console.log("User:", req.user._id); // ✅ Ye add kar

        const sign = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest("hex");

        if (razorpay_signature === expectedSign) {
            const newOrder = new orderModel({
                user: req.user._id,
                items: orderData.items,
                totalAmount: orderData.totalAmount,
                address: orderData.address,
                paymentId: razorpay_payment_id,
                paymentOrderId: razorpay_order_id,
                paymentSignature: razorpay_signature,
                status: 'pending',
                paymentStatus: 'paid'
            });

            await newOrder.save(); // ❌ Yaha fail ho raha hai

            return res.status(200).json({
                success: true,
                message: "Payment verified & Order created",
                order: newOrder
            });
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid signature"
            });
        }
    } catch (error) {
        console.log("=== VERIFY PAYMENT ERROR ==="); // ✅ Ye add kar
        console.log(error); // ✅ Full error print karega
        res.status(500).json({ 
            message: "Server error", 
            error: error.message,
            validationErrors: error.errors // ✅ Validation errors bhi bhejo
        });
    }
}

module.exports = { createRazorpayOrder, verifyPayment };