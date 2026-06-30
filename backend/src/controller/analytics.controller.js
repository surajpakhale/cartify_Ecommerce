
const orderModel = require("../models/order.model");
const productModel = require("../models/product.model");
const userModel = require("../models/user.model");

async function getAdminStat(req, res){
    try{
        const totalUsers = await userModel.countDocuments({role:"user"});
        const totalOrders = await orderModel.countDocuments({});
        const totalProducts = await productModel.countDocuments({});


        const orders = await orderModel.find();
        const totalRevenueData = orders.reduce((acc,order)=>acc +order.totalAmount,0)
        res.json({
            totalUsers,
            totalOrders,
            totalProducts,
            totalRevenue:totalRevenueData
        });

       

    }catch(error){
        console.log("Admin stat error is", error)
    }
}
module.exports = {getAdminStat}