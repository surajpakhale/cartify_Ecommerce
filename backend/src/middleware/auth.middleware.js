

// async function authUser(req ,res, next){
//     const token = req.cookies.token;
//     if(!token){
//         return res.status(401).json({
//             message :"unauthorised"
//         })
//     }
//     try{
//         const decoded = jwt.verify(token,process.env.JWT_SECRET)
//         if(decoded.role !=="user" && decoded.role !=="admin"){
//             return res.status(401).json({
//                 message:"unauthorized"
//             })
//         }
//         req.user= decoded;
//         next();

//     }catch(error){
//         console.log("Message is ",error);
//         return res.status(401).json({
//             message:"unauthorized"
//         })
//     }
// }

// async function authAdmin(req,res,next){
//     const token = req.cookies.token;
//     if(!token){
//         return res.status(401).json({
//             message:"unauthorized"
//         })
//     }
//     try{
//         const decoded = jwt.verify(token,process.env.JWT_SECRET)
//         if(decoded.role !=="admin"){
//             return res.status(401).json({
//                 message:"unauthorized"
//             })
//         }
//         req.user = decoded;
//         next();

//     }catch(error){
//         console.log("message is ", error)
//         return res.status(401).json({
//             message:"unauthorized"
//         })
//     }
// }

const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model"); // ✅ ye line add kar

async function authUser(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: "unauthorised - no token" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // ✅ ab userModel defined hai
         const user = await userModel.findById(decoded.id).select("_id name email");
        console.log("DB se user mila:", user);
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }
        
        req.user = user; // ✅ pura user object mil jayega
        next();
    } catch (error) {
        console.log("Message is ", error);
        return res.status(401).json({ message: "unauthorized - invalid token" });
    }
}

async function authAdmin(req, res, next) {
    const token = req.cookies.token;
    
    if (!token) {
        return res.status(401).json({ message: "unauthorized" });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await userModel.findById(decoded.id).select('-password');
        
        if (!user || user.role !== "admin") {
            return res.status(401).json({ message: "unauthorized - admin only" });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.log("message is ", error);
        return res.status(401).json({ message: "unauthorized" });
    }
}



module.exports = {authUser ,authAdmin}