const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {  // ✅ = ki jagah : hoga
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, // ✅ user object yaha close hoga
    items: [ // ✅ products array start
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', // ✅ Model ka naam capital P se rakho agar aisa banaya hai
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: 1
            },
            price:{
                type:Number,
                required:true
            }
        }
    ], // ✅ products array yaha close hoga
    totalAmount: {
        type: Number,
        required: true,
    },
    address:{
        fullname:{type:String, required:true},
        street:{type:String , required:true},
        city:{type:String, required:true},
        postalCode:{type:String, required:true},
        country:{type:String,required:true}
    },
     paymentId: { type: String }, // razorpay_payment_id
    paymentOrderId: { type: String }, // razorpay_order_id
    paymentStatus: { 
        type: String, 
        enum: ['pending', 'paid', 'failed'], 
        default: 'pending' 
    },
    paymentSignature: { type: String },
    status:{ type:String,enum:['pending','shipped','delivered'],default :"pending"}
}, { // ✅ timestamps options object me jata hai, dusre argument me
    timestamps: true
}); 

const orderModel = mongoose.model("Order",orderSchema)
module.exports = orderModel;
