const orderModel = require("../models/order.model");
const sendEmail = require("../utils/sendEmail");
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

module.exports = { getOrderById, createOrder, getAllOrder, updateOrderStatus ,deleteOrder};