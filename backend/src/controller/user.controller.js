const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken")
const cookie= require("cookie-parser")
const userModel = require("../models/user.model")
const sendEmail= require("../utils/sendEmail");
const { eventNames } = require("../models/product.model");

async function registerUser(req,res){
    const {name , email , password , role="user"}= req.body;

    const isUserAlreadyExist = await userModel.findOne({
        $or:[
            {name},
            {email}
        ]
    })
    if(isUserAlreadyExist){
        return res.status(409).json({
            message:"User is already Exist...."
        })
    }
    const hash = await bcrypt.hash(password , 10);

    const user = await userModel.create({
        name,
        email,
        password:hash,
        role
    }) 
    if(user){
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        const message =`Welcome, to Cartify ${name } ! Thank you for registering. your OTP is registeration ${otp}`;
        await sendEmail(email,"Welcom to cartify -your OTP for registeration",message);
    }
    const token = jwt.sign({
        id:user._id,
         role: user.role 
    }, process.env.JWT_SECRET)

  res.cookie("token",token)

  res.status(201).json({
    message:"User created sucessfully....",
    id:user._id,
    name:user.name,
    email:user.email,
    role:user.role,
    otp:user.otp

  })
}

// async function loginUser(req,res){
//     const{ name ,email , password } = req.body;

//     const user = await userModel.findOne({
//         $or:[
//             {name},
//             {email}

//         ]
        
//     })
//     if(!user){
//         return res.status(406).json({
//             message:"Invalid Credientials"
//         })
//     }

//     const isPasswordValid = await bcrypt.compare(password ,user.password);

//     if(!isPasswordValid){
//         return res.status(406).json({
//             message:"unauthorized"
//         })
//     }
//     const token = jwt.sign({id:user._id,role:user.role},process.env.JWT_SECRET)

//     res.cookie("token",token)
//     res.status(200).json({
//         message:"Login user Sucessfully",
//         user:{
//             id:user._id,
//             name:user.name,
//             email:user.email,
//             role:user.role
//         }
//     })


// }
async function loginUser(req, res) {
    const { email, password } = req.body; // ← name hata de, login email se hi hoga

    // Email se hi user dhoondo
    const user = await userModel.findOne({ email });
    
    if (!user) {
        return res.status(406).json({
            message: "Invalid Credentials"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return res.status(406).json({
            message: "unauthorized"
        })
    }
    
    const token = jwt.sign(
        { id: user._id, role: user.role }, 
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );

    res.cookie("token", token);
    
    // Token ko JSON me bhi bhejo frontend ke liye
    res.status(200).json({
        message: "Login user Sucessfully",
        _id: user._id, // ← _id direct bhejo
        name: user.name,
        email: user.email,
        role: user.role,
        token: token  // ← Ye add karna zaroori hai
    })
}

async function getUser(req, res){
    try {
        // req.user authUser middleware se aa raha
        if (req.user.role === "admin") {
            // Admin hai to saare users
            const users = await userModel.find().select("-password")
            return res.status(200).json({
                message: "All users fetched",
                users: users
            })
        } else {
            // Normal user hai to sirf uska data
            const user = await userModel.findById(req.user.id).select("-password")
            if(!user){
                return res.status(404).json({ message: "User not found" })
            }
            return res.status(200).json({
                message: "User fetched successfully",
                user: user
            })
        }
    } catch (error) {
        res.status(500).json({ message: "Server error" })
    }
}

async function logoutUser(req,res){
    res.clearCookie("token");
    res.status(200).json({
        message:"user logout sucessfully.."
    })
}
module.exports = {registerUser, loginUser ,logoutUser ,getUser}



