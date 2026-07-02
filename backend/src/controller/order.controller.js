const orderModel = require("../models/order.model");
const sendEmail = require("../utils/sendEmail");
const generateInvoicePDF = require("../utils/generateInvoice");
const fs = require('fs');
const path = require('path');
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function getOrderById(req, res) {
    try {
        const orders = await orderModel
            .find({ user: req.user._id }) // ✅ ab _id milega
            .populate('items.product', 'name price'); // ✅ product hai
        
        res.status(200).json({
            message: "Orders fetched successfully",
            orders
        });
    } catch (error) {
        console.log("message is :", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function getAllOrder(req, res) {
    try {
        const orders = await orderModel
            .find({})
            .populate('user', 'name email') // ✅ 'user' small u, field ka naam
            .populate('items.product', 'name price'); // ✅ product bhi populate kar
        
        res.status(200).json({
            message: "All Orders fetched successfully",
            orders
        });
    } catch (error) {
        console.log("message is All order ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}


// async function createOrder(req, res) {
//     try {
//         const { items, totalAmount, address, paymentId } = req.body; // ✅ user body se mat le
        
//         if (!items || items.length === 0 || !totalAmount || !address) {
//             return res.status(400).json({
//                 message: "Items, totalAmount and address are required"
//             });
//         }

//         const newOrder = new orderModel({ // ✅ newOrder naam
//             user: req.user._id, // ✅ ab _id milega middleware se
//             items,
//             totalAmount,
//             address,
//             paymentId,
//             status: 'pending'
//         });
        
//         await newOrder.save();
        
//         try {
//             const message = `Dear ${req.user.name}, \n\nThank you for your order!\n\nOrder ID: ${newOrder._id}\nTotal Amount: ${totalAmount}\nShipping Address: ${address.street}, ${address.city}\n\nBest regards,\nShopNest Team`;
//             await sendEmail(req.user.email, "Order Created", message);
//         } catch (emailError) {
//             console.log("Email error:", emailError.message);
//         }
        
//         res.status(201).json({
//             message: "Order created successfully",
//             order: newOrder // ✅ ab defined hai
//         });

//     } catch (error) {
//         console.log("Message is :", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// }
async function createOrder(req, res) {
    try {
          
        const { items, totalAmount, address, paymentId, sendOtp } = req.body;
        
        if (!items || items.length === 0 || !totalAmount || !address) {
            return res.status(400).json({
                message: "Items, totalAmount and address are required"
            });
        }

        // Step 1: Agar sendOtp = true hai to sirf OTP bhejo
        if (sendOtp === true) {
            const otp = generateOTP();
            
            // OTP ko temporarily store karne ke liye user ke session ya temp field use kar sakte
            // Ya phir frontend me handle kar
            try {
                const message = `Dear ${req.user.name}, \n\nYour OTP for order confirmation is: ${otp}\n\nThis OTP will expire in 5 minutes.\n\nShopNest Team`;
                await sendEmail(req.user.email, "Order Confirmation OTP", message);
                
                return res.status(200).json({
                    success: true,
                    message: "OTP sent to your email",
                    otp: otp // ✅ Test ke liye bhej raha hu, production me mat bhejna
                });
            } catch (emailError) {
                console.log("Email error:", emailError.message);
                return res.status(500).json({ message: "Error sending OTP" });
            }
        }

        // Step 2: Order create karo
        const newOrder = new orderModel({
            user: req.user._id,
            items,
            totalAmount,
            address,
            paymentId,
            status: 'pending'
        });
        
        await newOrder.save();
        
        try {
            const message = `Dear ${req.user.name}, \n\nThank you for your order!\n\nOrder ID: ${newOrder._id}\nTotal Amount: ${totalAmount}\nShipping Address: ${address.street}, ${address.city}\n\nBest regards,\nShopNest Team`;
            await sendEmail(req.user.email, "Order Created", message);
        } catch (emailError) {
            console.log("Email error:", emailError.message);
        }
        
        res.status(201).json({
            message: "Order created successfully",
            order: newOrder
        });

    } catch (error) {
        console.log("Message is :", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function updateOrderStatus(req, res) {
    try {
        const { status } = req.body;
        
        if (!['pending', 'shipped', 'delivered'].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }
        
        const order = await orderModel.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        
        order.status = status;
        await order.save();
        
        res.status(200).json({
            message: "Order status updated successfully",
            order
        });
    } catch (error) {
        console.log("update order issue is ", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

async function deleteOrder(req,res){
    try{
        const product = await orderModel.findById(req.params.id)
        if(product){
            await product.deleteOne();
            res.status(200).json({
                message:"deleted order sucessfully.."
            })
        }
       
    }catch(error){
        console.log("delete order msg is ",error)
    }
}

async function downloadInvoice(req, res) {
    try {
        const { orderId } = req.params;
        
        console.log("\n📄 === DOWNLOAD INVOICE REQUESTED ===");
        console.log("Order ID:", orderId);
        console.log("User ID:", req.user._id);

        // ✅ Fetch order
        const order = await orderModel
            .findById(orderId)
            .populate('items.product', 'name price')
            .populate('user', 'name email');

        if (!order) {
            console.log("❌ Order not found");
            return res.status(404).json({
                success: false,
                message: "Order not found"
            });
        }

        console.log("✅ Order fetched:", {
            id: order._id,
            itemsCount: order.items?.length,
            totalAmount: order.totalAmount
        });

        // ✅ Verify user owns this order
        if (order.user._id.toString() !== req.user._id.toString()) {
            console.log("❌ Unauthorized - User mismatch");
            return res.status(403).json({
                success: false,
                message: "Unauthorized to download this invoice"
            });
        }

        console.log("✅ Authorization passed, generating PDF...");

        // ✅ Generate PDF
        const pdfResult = await generateInvoicePDF(order, order.user);

        if (!pdfResult.success) {
            console.log("❌ PDF generation failed");
            return res.status(500).json({
                success: false,
                message: "Failed to generate invoice"
            });
        }

        const filePath = pdfResult.filePath;
        console.log("✅ PDF generated at:", filePath);

        // ✅ Check if file exists
        if (!fs.existsSync(filePath)) {
            console.log("❌ PDF file does not exist at:", filePath);
            return res.status(500).json({
                success: false,
                message: "Invoice file not found"
            });
        }

        console.log("✅ PDF file verified, sending to user...");

        // ✅ Set response headers for file download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="invoice_${orderId}.pdf"`);

        // ✅ Send file
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

        // ✅ Clean up after sending
        fileStream.on('end', () => {
            console.log("✅ Invoice sent to user");
            try {
                fs.unlinkSync(filePath);
                console.log("✅ Temporary PDF deleted");
            } catch (err) {
                console.log("⚠️  Could not delete temp file:", err.message);
            }
        });

        fileStream.on('error', (err) => {
            console.log("❌ Stream error:", err.message);
            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Error downloading invoice"
                });
            }
        });

    } catch (error) {
        console.log("❌ Download invoice error:", error.message);
        console.log("Stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Server error: " + error.message,
            error: error.message
        });
    }
}

module.exports = { getOrderById, createOrder, getAllOrder, updateOrderStatus, deleteOrder, downloadInvoice };