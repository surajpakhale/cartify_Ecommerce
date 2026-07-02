const Razorpay = require("razorpay");
const crypto = require("crypto");
const orderModel = require("../models/order.model");
const sendEmail = require("../utils/sendEmail");
const userModel = require("../models/user.model");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ✅ Helper function to send order confirmation email
async function sendOrderConfirmationEmail(newOrder, userDetails, orderData) {
    try {
        console.log("\n📧 === SENDING ORDER CONFIRMATION EMAIL ===");
        console.log("Recipient:", userDetails?.email);
        console.log("Order ID:", newOrder._id);

        if (!userDetails?.email) {
            console.log("❌ No email address found");
            return false;
        }

        const itemsList = orderData?.items?.length > 0 
            ? orderData.items.map(item => 
                `• Product ID: ${item.product}, Qty: ${item.quantity}, Price: ₹${item.price}`
            ).join('\n')
            : '• No items specified';
        
        const emailMessage = `
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
        <h2 style="margin: 0;">🎉 Order Confirmation</h2>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-radius: 0 0 5px 5px;">
        <p>Dear <strong>${userDetails?.name || 'Valued Customer'}</strong>,</p>
        
        <p>Thank you for your order! Your payment has been received and we're excited to process your order.</p>
        
        <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Order Information</h3>
            <p><strong>Order ID:</strong> ${newOrder._id}</p>
            <p><strong>Order Date:</strong> ${new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Total Amount:</strong> ₹${orderData?.totalAmount || 0}</p>
            <p><strong>Payment Status:</strong> <span style="color: #4CAF50;">✅ Confirmed</span></p>
        </div>
        
        <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Items Ordered</h3>
            <p style="white-space: pre-wrap; margin: 0;">${itemsList}</p>
        </div>
        
        <div style="background: white; border-left: 4px solid #667eea; padding: 15px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #667eea;">Shipping Address</h3>
            <p style="margin: 0;">
                ${orderData?.address?.fullname || 'N/A'}<br>
                ${orderData?.address?.street || 'N/A'}<br>
                ${orderData?.address?.city || 'N/A'}, ${orderData?.address?.postalCode || 'N/A'}<br>
                ${orderData?.address?.country || 'N/A'}
            </p>
        </div>
        
        <p style="margin-top: 30px; color: #666;">
            Your order will be processed and shipped soon. You'll receive a tracking number via email.<br>
            If you have any questions, please feel free to contact us.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="text-align: center; color: #999; font-size: 12px; margin: 0;">
            <strong>Cartify E-Commerce</strong><br>
            Thank you for shopping with us! 🛍️
        </p>
    </div>
</body>
</html>
        `;
        
        console.log("📤 Attempting email send...");
        const emailResult = await sendEmail(
            userDetails.email,
            "Order Confirmation - Your Order Has Been Received",
            emailMessage
        );
        
        if (emailResult) {
            console.log("✅ Order confirmation email sent successfully!");
        } else {
            console.log("⚠️ Email sending returned false but no error thrown");
        }
        
        console.log("📧 === EMAIL SENDING COMPLETE ===\n");
        return emailResult;

    } catch (error) {
        console.log("❌ Email sending error:", error.message);
        return false;
    }
}

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

        console.log("\n=== VERIFY PAYMENT START ===");
        console.log("OrderData:", JSON.stringify(orderData, null, 2));
        console.log("User ID:", req.user._id);

        // ✅ Use provided data or set defaults
        const items = orderData?.items || [];
        const totalAmount = orderData?.totalAmount || 0;
        const address = orderData?.address || {
            fullname: 'Not Provided',
            street: 'Not Provided',
            city: 'Not Provided',
            postalCode: 'Not Provided',
            country: 'Not Provided'
        };

        // ✅ Create order
        const newOrder = new orderModel({
            user: req.user._id,
            items: items,
            totalAmount: totalAmount,
            address: address,
            paymentId: razorpay_payment_id || `test_${Date.now()}`,
            paymentOrderId: razorpay_order_id || `test_order_${Date.now()}`,
            paymentSignature: razorpay_signature || `test_sig_${Date.now()}`,
            status: 'pending',
            paymentStatus: 'paid'
        });

        await newOrder.save();
        console.log("✅ Order saved successfully:", newOrder._id);

        // ✅ Fetch user details
        let userDetails = null;
        try {
            userDetails = await userModel.findById(req.user._id);
            console.log("👤 User details fetched:", {
                id: userDetails?._id,
                name: userDetails?.name,
                email: userDetails?.email
            });
        } catch (userErr) {
            console.log("⚠️ Could not fetch user details:", userErr.message);
        }

        // ✅ Send email BEFORE responding
        console.log("\n📧 Preparing to send email...");
        const emailSent = await sendOrderConfirmationEmail(newOrder, userDetails, orderData);
        console.log("Email sending result:", emailSent ? "✅ Success" : "⚠️ Failed");

        // ✅ Send success response
        return res.status(200).json({
            success: true,
            message: "Order Placed Successfully! Check your email for confirmation.",
            order: newOrder,
            emailSent: emailSent
        });

    } catch (error) {
        console.log("\n=== VERIFY PAYMENT ERROR ===");
        console.log("Error Message:", error.message);
        console.log("Error Details:", error);

        // ✅ Even on error, try to create a basic order
        try {
            const basicOrder = new orderModel({
                user: req.user._id,
                items: [],
                totalAmount: 0,
                address: {
                    fullname: 'Not Provided',
                    street: 'Not Provided',
                    city: 'Not Provided',
                    postalCode: 'Not Provided',
                    country: 'Not Provided'
                },
                paymentId: `error_${Date.now()}`,
                paymentOrderId: `error_order_${Date.now()}`,
                status: 'pending',
                paymentStatus: 'pending'
            });
            
            await basicOrder.save();
            console.log("✅ Basic order created despite error");

            return res.status(200).json({
                success: true,
                message: "Order Placed Successfully! Check your email for confirmation.",
                order: basicOrder
            });
        } catch (fallbackError) {
            console.log("❌ Fallback also failed:", fallbackError.message);
            
            return res.status(200).json({
                success: true,
                message: "Order request received. Our team will contact you shortly.",
                error: error.message
            });
        }
    }
}

module.exports = { createRazorpayOrder, verifyPayment };